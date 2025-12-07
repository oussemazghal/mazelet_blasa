from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def fix_schema():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("🔧 Checking and fixing schema...")
        
        # 1. Add already_joined
        try:
            conn.execute(text("ALTER TABLE matches ADD COLUMN already_joined INTEGER DEFAULT 0"))
            print("✅ Added 'already_joined' column.")
        except Exception as e:
            if "already exists" in str(e):
                print("ℹ️ 'already_joined' already exists.")
            else:
                print(f"❌ Error adding 'already_joined': {e}")
        
        # 2. Add is_team_match
        try:
            conn.execute(text("ALTER TABLE matches ADD COLUMN is_team_match BOOLEAN DEFAULT FALSE"))
            print("✅ Added 'is_team_match' column.")
        except Exception as e:
             if "already exists" in str(e):
                print("ℹ️ 'is_team_match' already exists.")
             else:
                print(f"❌ Error adding 'is_team_match': {e}")

        # 3. Add team_a_id
        try:
            conn.execute(text("ALTER TABLE matches ADD COLUMN team_a_id INTEGER REFERENCES teams(id)"))
            print("✅ Added 'team_a_id' column.")
        except Exception as e:
             if "already exists" in str(e):
                print("ℹ️ 'team_a_id' already exists.")
             else:
                print(f"❌ Error adding 'team_a_id': {e}")

        # 4. Add team_b_id
        try:
            conn.execute(text("ALTER TABLE matches ADD COLUMN team_b_id INTEGER REFERENCES teams(id)"))
            print("✅ Added 'team_b_id' column.")
        except Exception as e:
             if "already exists" in str(e):
                print("ℹ️ 'team_b_id' already exists.")
             else:
                print(f"❌ Error adding 'team_b_id': {e}")

        conn.commit()
        print("🏁 Schema fix completed.")

if __name__ == "__main__":
    fix_schema()
