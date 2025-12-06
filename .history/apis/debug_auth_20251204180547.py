from app.database import SessionLocal
from app import models, auth
from app.auth import verify_password, get_password_hash, create_access_token

def test_auth():
    print("Testing DB Connection...")
    db = SessionLocal()
    try:
        # 1. Fetch ALL users
        print("1. Fetching ALL users...")
        users = db.query(models.User).all()
        print(f"Found {len(users)} users.")
        
        for user in users:
            print(f"--- User: {user.email} ---")
            print(f"  ID: {user.id}")
            print(f"  Hashed Password: {user.hashed_password}")
            
            if not user.hashed_password:
                print("  ⚠️ WARNING: Password is None or Empty!")
                continue
                
            if not user.hashed_password.startswith("$2b$"):
                print("  ⚠️ WARNING: Password does not look like a bcrypt hash!")

            # Test verify with dummy
            try:
                verify_password("test", user.hashed_password)
                print("  verify_password: OK (no crash)")
            except Exception as e:
                print(f"  ❌ CRASH in verify_password: {e}")

    except Exception as e:
        print(f"General Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth()
