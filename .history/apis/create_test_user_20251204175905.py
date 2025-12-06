from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

# Create a database session
db = SessionLocal()

try:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "test@test.com").first()
    
    if existing_user:
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
