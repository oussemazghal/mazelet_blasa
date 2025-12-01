from sqlalchemy import Column, Integer, String, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from .database import Base

# Association Table for Many-to-Many
match_participants = Table(
    "match_participants",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("match_id", Integer, ForeignKey("matches.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    age = Column(Integer, nullable=True)

    matches = relationship("Match", back_populates="organizer")
    joined_matches = relationship("Match", secondary=match_participants, back_populates="participants")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    type_match = Column(String)  # 5v5, 7v7, etc.
    city = Column(String)
    stadium = Column(String)
    date = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    nb_players = Column(Integer)
    price_per_player = Column(Float)
    organizer_phone = Column(String)
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=100)
    
    organizer_id = Column(Integer, ForeignKey("users.id"))
    organizer = relationship("User", back_populates="matches")
    
    participants = relationship("User", secondary=match_participants, back_populates="joined_matches")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(String)
    
    # Optional: Link to user if logged in
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")
    
    # Optional: Link to specific match
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    match = relationship("Match")

