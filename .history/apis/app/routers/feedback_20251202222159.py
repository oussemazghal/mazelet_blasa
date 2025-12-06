from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import models, database, auth

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

class FeedbackCreate(BaseModel):
    name: str
    email: str
    message: str

@router.post("/")
def create_feedback(
    feedback: FeedbackCreate, 
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme_optional)
):
    # Try to get current user if token provided
    user_id = None
    if token:
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            email: str = payload.get("sub")
            if email:
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    user_id = user.id
        except:
            pass  # Invalid token, treat as anonymous
    
    new_feedback = models.Feedback(
        name=feedback.name,
        email=feedback.email,
        message=feedback.message,
        user_id=user_id  # Link to user if authenticated
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"message": "Feedback received successfully"}
