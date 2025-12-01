from sqlalchemy import create_engine, text, inspect

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:oussema55@localhost:4443/football"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

def add_column():
    try:
        with engine.connect() as connection:
            # Check if column exists
            result = connection.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='image_url';"))
            if result.fetchone():
                print("Column image_url already exists.")
                return

            print("Adding column image_url...")
            with connection.begin():
                connection.execute(text("ALTER TABLE users ADD COLUMN image_url VARCHAR;"))
            print("Column image_url added successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
