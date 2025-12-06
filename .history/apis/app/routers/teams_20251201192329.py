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

    # Add Captain as a member (optional, but good for consistency)
    # Let's say captain is implicit, but we can add them to members too if we want.
    # For now, let's just process the submitted members.

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
    teams = db.query(models.Team).filter(models.Team.captain_id == current_user.id).all()
    return teams
