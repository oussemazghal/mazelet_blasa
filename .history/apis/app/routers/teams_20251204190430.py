from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)

@router.post("/", response_model=schemas.TeamResponse)
def create_team(team: schemas.TeamCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Create Team
    new_team = models.Team(
        name=team.name,
        captain_id=current_user.id
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Ajouter le capitaine comme premier membre de l'équipe
    # Cela permet au capitaine d'être auto-inscrit aux matchs aussi
    captain_member = models.TeamMember(
        team_id=new_team.id,
        user_id=current_user.id,
        name=current_user.full_name or current_user.email
    )
    db.add(captain_member)

    # Ajouter les autres membres soumis
    for member_data in team.members:
        user_id = None
        name = member_data.name
        
        # If email provided, try to find user
        if member_data.email:
            user = db.query(models.User).filter(models.User.email == member_data.email).first()
            if user:
                user_id = user.id
                name = user.full_name or user.email # Use their actual name if available
        
        new_member = models.TeamMember(
            team_id=new_team.id,
            user_id=user_id,
            name=name
        )
        db.add(new_member)
    
    db.commit()
    db.refresh(new_team)
    return new_team

@router.get("/me", response_model=List[schemas.TeamResponse])
def read_my_teams(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Teams où l'utilisateur est capitaine
    teams_as_captain = db.query(models.Team).filter(models.Team.captain_id == current_user.id).all()
    
    # Teams où l'utilisateur est membre (via team_members avec user_id)
    teams_as_member = db.query(models.Team).join(models.TeamMember).filter(
        models.TeamMember.user_id == current_user.id
    ).all()
    
    # Combiner et dédupliquer (au cas où le capitaine est aussi dans les membres)
    all_teams_dict = {team.id: team for team in teams_as_captain + teams_as_member}
    
    return list(all_teams_dict.values())

@router.delete("/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Only captain can delete team
    if team.captain_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the team captain can delete the team")
    
    # Check if team is in any active match
    active_matches = db.query(models.Match).filter(
        (models.Match.team_a_id == team_id) | (models.Match.team_b_id == team_id)
    ).all()
    
    if active_matches:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete team. It is registered in {len(active_matches)} match(es). Remove the team from matches first."
        )
    
    # Delete all team members first
    db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id).delete()
    
    # Delete the team
    db.delete(team)
    db.commit()
    
    return {"message": "Team deleted successfully"}
