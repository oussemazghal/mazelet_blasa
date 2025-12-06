import requests

def test_login_http():
    url = "http://127.0.0.1:8001/auth/login"
    # OAuth2PasswordRequestForm expects form data, not JSON
    data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    
    print(f"Sending POST to {url} with data: {data}")
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_login_http()
