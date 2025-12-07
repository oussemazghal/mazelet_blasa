from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:oussema55@127.0.0.1:4443/football"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

matches = db.query(models.Match).all()
print(f"{'ID':<5} {'Title':<20} {'Type':<10} {'NbPlayers':<10} {'IsTeam':<10} {'Participants':<12}")
print("-" * 70)
for m in matches:
    print(f"{m.id:<5} {m.title[:20]:<20} {m.type_match:<10} {m.nb_players:<10} {str(m.is_team_match):<10} {len(m.participants):<12}")
