from app.database import SessionLocal
from app import models

def test_query():
    db = SessionLocal()
    try:
        print("Querying matches...")
        matches = db.query(models.Match).all()
        print(f"Found {len(matches)} matches.")
        for m in matches:
            print(f"Match: {m.title}, Team Match: {m.is_team_match}")
            # Access relationships to trigger lazy load
            if m.is_team_match:
                print(f"  Team A: {m.team_a.name if m.team_a else 'None'}")
                print(f"  Team B: {m.team_b.name if m.team_b else 'None'}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_query()
