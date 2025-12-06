import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app import models, auth

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def create_user(email, password="password"):
    response = client.post(
        "/auth/signup",
        json={"email": email, "password": password, "full_name": "Test User"}
    )
    return response.json()

def get_token(email, password="password"):
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]

def test_team_sharing_and_auto_join():
    # 1. Create Users
    user_a = create_user("captain@test.com")
    user_b = create_user("member@test.com")
    
    token_a = get_token("captain@test.com")
    token_b = get_token("member@test.com")
    
    # 2. Captain creates team with Member
    response = client.post(
        "/teams/",
        json={
            "name": "Shared Team",
            "members": [{"email": "member@test.com", "name": "Member Name"}]
        },
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert response.status_code == 200
    team_id = response.json()["id"]
    
    # 3. Verify Member sees the team (Team Sharing)
    response = client.get(
        "/teams/me",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert response.status_code == 200
    teams = response.json()
    assert len(teams) == 1
    assert teams[0]["name"] == "Shared Team"
    print("\n✅ Team Sharing Verified: Member sees the team")

    # 4. Captain creates a Team Match
    response = client.post(
        "/matches/",
        json={
            "title": "Team Match",
            "date": "2025-01-01",
            "start_time": "10:00",
            "city": "Test City",
            "nb_players": 10,
            "price_per_player": 10,
            "type_match": "5v5",
            "is_team_match": True,
            "my_team_id": team_id
        },
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert response.status_code == 200
    match_id = response.json()["id"]
    
    # 5. Verify Member is auto-joined (Auto-Join)
    # Check "My Games" for member
    response = client.get(
        "/matches/?upcoming_only=false", # Assuming endpoint supports filtering or we just get all
        headers={"Authorization": f"Bearer {token_b}"}
    )
    # Note: The read_matches endpoint might not filter by "my games" by default unless we implemented that specific filter or endpoint.
    # Let's check the match details directly to see participants if possible, or check if the user is in participants list of the match.
    
    # Actually, let's check the match participants directly from the response of get matches
    # But read_matches returns all matches. We need to check if the user is in the participants list of the match.
    # Wait, the read_matches endpoint returns MatchResponse which includes participants.
    
    matches = response.json()
    target_match = next((m for m in matches if m["id"] == match_id), None)
    assert target_match is not None
    
    # Check if member@test.com is in participants
    participants_emails = [p["email"] for p in target_match["participants"]]
    assert "member@test.com" in participants_emails
    print("\n✅ Auto-Join Verified: Member is in match participants")

if __name__ == "__main__":
    # Manually run if executed as script
    try:
        test_team_sharing_and_auto_join()
        print("All tests passed!")
    except Exception as e:
        print(f"Test failed: {e}")
