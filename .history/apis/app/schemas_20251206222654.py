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

class TeamMemberCreate(BaseModel):
    email: Optional[str] = None
    name: str # Required for non-app users, or as fallback

class TeamMemberResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    
    class Config:
        orm_mode = True

class TeamCreate(BaseModel):
    name: str
    members: List[TeamMemberCreate] = []

class TeamResponse(BaseModel):
    id: int
    name: str
    captain_id: int
    members: List[TeamMemberResponse] = []

    class Config:
        orm_mode = True

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
    # already_joined: int = 0  # Removed from DB
    is_team_match: bool = False

class MatchCreate(MatchBase):
    teammate_emails: List[EmailStr] = []
    my_team_id: Optional[int] = None # For Team Match

class MatchResponse(MatchBase):
    id: int
    organizer_id: int
    organizer_name: Optional[str] = None
    participants: List[UserResponse] = []
    
    team_a: Optional[TeamResponse] = None
    team_b: Optional[TeamResponse] = None

    class Config:
        orm_mode = True
