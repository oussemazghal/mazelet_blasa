from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/matches",
    tags=["matches"]
)

def add_team_members_to_match(match: models.Match, team_id: int, db: Session):
    """
    Ajoute tous les membres d'une équipe (avec user_id) aux participants du match.
    Cela permet aux membres de voir le match dans "My Games".
    """
    team_members = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.user_id.isnot(None)  # Seulement les membres avec compte utilisateur
    ).all()
    
    for member in team_members:
        user = db.query(models.User).filter(models.User.id == member.user_id).first()
        if user and user not in match.participants:
            match.participants.append(user)


@router.post("/", response_model=schemas.MatchResponse)
def create_match(match: schemas.MatchCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    match_data = match.dict()
    teammate_emails = match_data.pop("teammate_emails", [])
    my_team_id = match_data.pop("my_team_id", None)

    new_match = models.Match(
        **match_data,
        organizer_id=current_user.id
    )
    
    if new_match.is_team_match:
        if not my_team_id:
            raise HTTPException(status_code=400, detail="Team ID is required for Team Matches")
        
        # Verify ownership
        team = db.query(models.Team).filter(models.Team.id == my_team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        if team.captain_id != current_user.id:
            raise HTTPException(status_code=403, detail="You are not the captain of this team")
        
        new_match.team_a_id = team.id
        
        # Auto-ajouter tous les membres de l'équipe aux participants
        # Cela permet à tous les membres de voir le match dans "My Games"
        add_team_members_to_match(new_match, team.id, db)
    else:
        # Normal Match Logic
        # Add organizer as participant
        new_match.participants.append(current_user)

        # Add teammates
        for email in teammate_emails:
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                raise HTTPException(status_code=400, detail=f"User with email {email} not found")
            if user.id == current_user.id:
                continue # Already added
            if user in new_match.participants:
                continue # Already added
            new_match.participants.append(user)

    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    # Manually set organizer_name for response since it's not in DB yet
    new_match.organizer_name = current_user.full_name
    return new_match

@router.get("/", response_model=List[schemas.MatchResponse])
def read_matches(
    skip: int = 0, 
    limit: int = 100, 
    upcoming_only: bool = False,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme_optional)
):
    current_user = None
    if token:
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            email: str = payload.get("sub")
            if email:
                current_user = db.query(models.User).filter(models.User.email == email).first()
        except:
            pass # Invalid token

    query = db.query(models.Match)

    if upcoming_only:
        from datetime import date
        today = date.today().isoformat()
        query = query.filter(models.Match.date >= today)

    if current_user and current_user.age is not None:
        # Filter: match.min_age <= user.age <= match.max_age
        query = query.filter(
            models.Match.min_age <= current_user.age,
            models.Match.max_age >= current_user.age
        )
    
    # Ne pas afficher les matchs team vs team qui sont déjà complets (team_b_id existe)
    # On montre seulement les matchs individuels OU les matchs team qui cherchent encore un adversaire
    query = query.filter(
        (models.Match.is_team_match == False) | (models.Match.team_b_id == None)
    )
    
    matches = query.offset(skip).limit(limit).all()

    # Map organizer_name
    for match in matches:
        if match.organizer:
            match.organizer_name = match.organizer.full_name
    return matches

@router.post("/{match_id}/join")
def join_match(
    match_id: int, 
    team_id: int = None, # Optional, for team matches
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.is_team_match:
        # Team Match Join Logic
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID is required to join a Team Match")
        
        if match.team_b_id:
            raise HTTPException(status_code=400, detail="Match is already full (Team B already joined)")
        
        if match.team_a_id == team_id:
             raise HTTPException(status_code=400, detail="Your team is already in this match")

        team = db.query(models.Team).filter(models.Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        if team.captain_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the team captain can join a match")
        
        match.team_b_id = team.id
        
        # Auto-ajouter tous les membres de Team B aux participants
        add_team_members_to_match(match, team.id, db)
        
        db.commit()
        return {"message": "Successfully joined match as Team B"}

    else:
        # Individual Match Join Logic
        # Check if already joined
        if current_user in match.participants:
            raise HTTPException(status_code=400, detail="Already joined this match")
        
        # Check if full
        if len(match.participants) >= match.nb_players:
            raise HTTPException(status_code=400, detail="Match is full")

        match.participants.append(current_user)
        db.commit()
        return {"message": "Successfully joined match"}

@router.delete("/{match_id}/participants/{user_id}")
def remove_participant(
    match_id: int, 
    user_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Check if current user is the organizer
    if match.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the organizer can remove participants")
    
    # Find participant to remove
    participant_to_remove = None
    for p in match.participants:
        if p.id == user_id:
            participant_to_remove = p
            break
    
    if not participant_to_remove:
        raise HTTPException(status_code=404, detail="Participant not found in this match")
    
    match.participants.remove(participant_to_remove)
    db.commit()
    
    return {"message": "Participant removed successfully"}
