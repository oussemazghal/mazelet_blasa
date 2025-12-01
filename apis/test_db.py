import psycopg2
import sys

try:
    print("Attempting to connect to PostgreSQL...")
    conn = psycopg2.connect(
        dbname="football",
        user="postgres",
        password="oussema55",
        host="localhost",
        port="4443",
        connect_timeout=5
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
