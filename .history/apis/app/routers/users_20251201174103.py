from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(None),
    phone: str = Form(None),
    age: int = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(password)
    new_user = models.User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        phone=phone,
        age=age
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if file:
        file_location = f"static/images/profiles/{new_user.id}.jpg"
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Update image_url
        new_user.image_url = f"http://127.0.0.1:8001/{file_location}"
        db.commit()
        db.refresh(new_user)

    return new_user

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    full_name: str = Form(None),
    phone: str = Form(None),
    age: int = Form(None),
    file: UploadFile = File(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if full_name:
        current_user.full_name = full_name
    if phone:
        current_user.phone = phone
    if age is not None:
        current_user.age = age
    
    if file:
        file_location = f"static/images/profiles/{current_user.id}.jpg"
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Update image_url with the accessible URL
        current_user.image_url = f"http://127.0.0.1:8001/{file_location}"

    db.commit()
    db.refresh(current_user)
    return current_user
