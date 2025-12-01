from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/matches",
    tags=["matches"]
)

@router.post("/", response_model=schemas.MatchResponse)
def create_match(match: schemas.MatchCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    match_data = match.dict()
    # organizer_phone is no longer in MatchBase, so we don't need to set it manually if it's not in the model
    # But wait, Match model DOES NOT have organizer_phone column anymore in my previous edit?
    # Let me check models.py content again. 
    # Ah, I replaced the whole Match model. The new Match model DOES NOT have organizer_phone.
    # So I should remove this line.

    new_match = models.Match(
        **match_data,
        organizer_id=current_user.id
    )
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
    
    matches = query.offset(skip).limit(limit).all()

    # Map organizer_name
    for match in matches:
        if match.organizer:
            match.organizer_name = match.organizer.full_name
    return matches

@router.post("/{match_id}/join")
def join_match(match_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
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
