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
            
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
