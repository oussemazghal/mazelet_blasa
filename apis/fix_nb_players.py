from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models

# Database credentials
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:oussema55@127.0.0.1:4443/football"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def fix_nb_players():
    matches = db.query(models.Match).filter(models.Match.nb_players == 0).all()
    print(f"🔧 Found {len(matches)} matches with nb_players = 0")
    
    count = 0
    for m in matches:
        old_val = m.nb_players
        new_val = 0
        
        if m.type_match == "5v5":
            new_val = 10
        elif m.type_match == "7v7":
            new_val = 14
        elif m.type_match == "9v9":
            new_val = 18
        elif m.type_match == "11v11":
            new_val = 22
            
        if new_val > 0:
            m.nb_players = new_val
            count += 1
            print(f"✅ Fixed Match ID {m.id}: {m.title} ({m.type_match}) -> nb_players = {new_val}")
            
    db.commit()
    print(f"🏁 Fixed {count} matches.")

if __name__ == "__main__":
    fix_nb_players()
