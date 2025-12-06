from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def migrate():
    print(f"Connecting to: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.begin() as connection:
        print("Migrating database...")
        
        # Add age to users
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN age INTEGER;"))
            print("Added age column to users.")
        except Exception as e:
            print(f"User age column issue: {e}")

        # Add min_age to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN min_age INTEGER DEFAULT 0;"))
            print("Added min_age column to matches.")
        except Exception as e:
            print(f"Match min_age column issue: {e}")

        # Add max_age to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN max_age INTEGER DEFAULT 100;"))
            print("Added max_age column to matches.")
        except Exception as e:
            print(f"Match max_age column issue: {e}")

        # Add is_team_match to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN is_team_match BOOLEAN DEFAULT FALSE;"))
            print("Added is_team_match column to matches.")
        except Exception as e:
            print(f"Match is_team_match column issue: {e}")

        # Add team_a_id to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN team_a_id INTEGER REFERENCES teams(id);"))
            print("Added team_a_id column to matches.")
        except Exception as e:
            print(f"Match team_a_id column issue: {e}")

        # Add team_b_id to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN team_b_id INTEGER REFERENCES teams(id);"))
            print("Added team_b_id column to matches.")
        except Exception as e:
            print(f"Match team_b_id column issue: {e}")
            
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
