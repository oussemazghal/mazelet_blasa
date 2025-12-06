import requests

BASE_URL = "http://127.0.0.1:8001"

def check_matches():
    print("Checking matches...")
    try:
        response = requests.get(f"{BASE_URL}/matches/?upcoming_only=true")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error checking matches: {e}")

def check_signup():
    print("\nChecking signup...")
    # Test case 1: All fields valid
    data = {
        "email": "test_user_1@example.com",
        "password": "password123",
        "full_name": "Test User 1",
        "phone": "12345678",
        "age": 25
    }
    try:
        response = requests.post(f"{BASE_URL}/users/", data=data)
        print(f"Signup (valid): {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error checking signup (valid): {e}")

    # Test case 2: Empty age (simulating empty string from form)
    data_empty_age = {
        "email": "test_user_2@example.com",
        "password": "password123",
        "full_name": "Test User 2",
        "phone": "12345678",
        "age": "" 
    }
    try:
        response = requests.post(f"{BASE_URL}/users/", data=data_empty_age)
        print(f"Signup (empty age): {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error checking signup (empty age): {e}")

if __name__ == "__main__":
    check_matches()
    check_signup()
