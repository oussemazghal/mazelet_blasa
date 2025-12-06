import requests

def test_login_http():
    url = "http://127.0.0.1:8001/auth/login"
    
    # Simulate FormData (multipart/form-data)
    # In requests, using 'files' forces multipart/form-data, even if values are strings
    # Or we can just use data, but requests usually does urlencoded for data dicts.
    # To force multipart without files, we can do this trick or use a specific tool.
    # Actually, requests sends multipart if 'files' is present.
    
    # Let's try to be as close as possible to browser FormData
    # Browser sends: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
    
    # Using requests with data=... usually sends application/x-www-form-urlencoded
    # To send multipart/form-data with fields:
    from requests_toolbelt.multipart.encoder import MultipartEncoder
    
    try:
        m = MultipartEncoder(
            fields={
                'username': 'test@example.com',
                'password': 'wrongpassword'
            }
        )
        headers = {'Content-Type': m.content_type}
        
        print(f"Sending POST to {url} with multipart/form-data")
        response = requests.post(url, data=m, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
    except ImportError:
        print("requests_toolbelt not installed, trying basic files trick")
        # Fallback if toolbelt not installed
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
