from sqlalchemy import Column, Integer, String, ForeignKey, Table, Float, Boolean
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

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    captain_id = Column(Integer, ForeignKey("users.id"))

    captain = relationship("User", backref="owned_teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional if they have an account
    name = Column(String) # For non-app users (or cache of user name)

    team = relationship("Team", back_populates="members")
    user = relationship("User")

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

    # Team Match Fields
    is_team_match = Column(Boolean, default=False)
    team_a_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team_b_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    team_a = relationship("Team", foreign_keys=[team_a_id])
    team_b = relationship("Team", foreign_keys=[team_b_id])

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(String)
    
    # Optional: Link to user if logged in
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")


