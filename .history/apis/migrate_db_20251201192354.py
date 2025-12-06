from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.begin() as connection:
        print("Migrating database...")
        
        # Add age to users
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN age INTEGER;"))
            print("Added age column to users.")
        except Exception as e:
            print(f"Could not add age to users (might already exist): {e}")

        # Add min_age to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN min_age INTEGER DEFAULT 0;"))
            print("Added min_age column to matches.")
        except Exception as e:
            print(f"Could not add min_age to matches (might already exist): {e}")

        # Add max_age to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN max_age INTEGER DEFAULT 100;"))
            print("Added max_age column to matches.")
        except Exception as e:
            print(f"Could not add max_age to matches (might already exist): {e}")

        # Add is_team_match to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN is_team_match BOOLEAN DEFAULT 0;"))
            print("Added is_team_match column to matches.")
        except Exception as e:
            print(f"Could not add is_team_match to matches: {e}")

        # Add team_a_id to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN team_a_id INTEGER REFERENCES teams(id);"))
            print("Added team_a_id column to matches.")
        except Exception as e:
            print(f"Could not add team_a_id to matches: {e}")

        # Add team_b_id to matches
        try:
            connection.execute(text("ALTER TABLE matches ADD COLUMN team_b_id INTEGER REFERENCES teams(id);"))
            print("Added team_b_id column to matches.")
        except Exception as e:
            print(f"Could not add team_b_id to matches: {e}")
            
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
