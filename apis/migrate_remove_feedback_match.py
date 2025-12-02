"""
Migration: Remove match_id from feedbacks table

This script removes the match_id column from the feedbacks table
since feedback is now site-wide only, not match-specific.
"""

from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='feedbacks' AND column_name='match_id'
        """))
        
        if result.fetchone():
            print("Removing match_id column from feedbacks table...")
            conn.execute(text("ALTER TABLE feedbacks DROP COLUMN IF EXISTS match_id"))
            conn.commit()
            print("✅ Migration completed: match_id removed from feedbacks")
        else:
            print("ℹ️  Column match_id does not exist, nothing to do")

if __name__ == "__main__":
    migrate()
