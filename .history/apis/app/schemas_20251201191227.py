from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    image_url: Optional[str] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MatchBase(BaseModel):
    title: str
    date: str
    start_time: str
    city: str
    nb_players: int
    price_per_player: float
    type_match: str
    min_age: int = 0
    max_age: int = 100

class MatchCreate(MatchBase):
    teammate_emails: List[EmailStr] = []

class MatchResponse(MatchBase):
    id: int
    organizer_id: int
    organizer_name: Optional[str] = None
    participants: List[UserResponse] = []

    class Config:
        orm_mode = True
