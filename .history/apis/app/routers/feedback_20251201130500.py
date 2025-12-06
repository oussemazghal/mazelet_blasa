from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import models, database

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

class FeedbackCreate(BaseModel):
    name: str
    email: str
    message: str

@router.post("/")
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(database.get_db)):
    new_feedback = models.Feedback(
        name=feedback.name,
        email=feedback.email,
        message=feedback.message
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"message": "Feedback received successfully"}
