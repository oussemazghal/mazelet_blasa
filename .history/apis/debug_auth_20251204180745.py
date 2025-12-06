from app.database import SessionLocal
from app import models, auth
from app.auth import verify_password, get_password_hash, create_access_token

def test_auth():
    print("Testing DB Connection...")
    db = SessionLocal()
    try:
        # 1. Test User Retrieval
        print("1. Fetching first user...")
        user = db.query(models.User).first()
        if not user:
            print("No users found in DB!")
            return

        print(f"User found: {user.email}")
        print(f"Hashed Password: {user.hashed_password}")

        # 2. Test Password Verification (if we knew the password, but we don't, so we'll just test the function with a dummy)
        print("2. Testing verify_password function...")
        try:
            # Just testing if the function crashes, not if it returns True
            verify_password("test", user.hashed_password) 
            print("verify_password executed without crashing.")
        except Exception as e:
            print(f"CRASH in verify_password: {e}")
            import traceback
            traceback.print_exc()

        # 3. Test Token Creation
        print("3. Testing create_access_token...")
        try:
            token = create_access_token(data={"sub": user.email})
            print(f"Token created: {token}")
        except Exception as e:
            print(f"CRASH in create_access_token: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"General Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth()
