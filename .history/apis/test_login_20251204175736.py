import requests
import sys

def test_login():
    url = "http://127.0.0.1:8001/auth/login"
    data = {
        "username": "test@test.com",
        "password": "test123"
    }
    
    print(f"Testing login at {url}...")
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")

if __name__ == "__main__":
    test_login()
