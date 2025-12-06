from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

# Create a database session
db = SessionLocal()

try:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "test@test.com").first()
    
    if existing_user:
        print("User test@test.com already exists! Deleting to recreate with new hash...")
        db.delete(existing_user)
        db.commit()
    
    # Create a test user
    test_user = User(
            email="test@test.com",
            name="Test User",
            phone="1234567890",
            hashed_password=get_password_hash("test123")
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"✅ Test user created successfully!")
        print(f"   Email: test@test.com")
        print(f"   Password: test123")
        print(f"   Name: {test_user.name}")
        print(f"   ID: {test_user.id}")
    
    # Show all users
    all_users = db.query(User).all()
    print(f"\n📊 Total users in database: {len(all_users)}")
    for user in all_users:
        print(f"   - {user.email} (ID: {user.id})")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
