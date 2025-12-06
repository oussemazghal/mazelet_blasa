import requests

def test_login_http():
    url = "http://127.0.0.1:8001/auth/login"
    
    print(f"Sending POST to {url} with multipart/form-data (simulated via files)")
    try:
        # Using files parameter with tuple (None, value) sends it as a field part of multipart
        response = requests.post(url, files={
            'username': (None, 'test@example.com'),
            'password': (None, 'wrongpassword')
        })
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_login_http()
