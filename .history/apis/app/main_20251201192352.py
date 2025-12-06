from fastapi import FastAPI
from .database import engine, Base
from .routers import users, auth, matches, feedback, recommendations
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Create tables
print("Creating tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")

app = FastAPI(
    title="Football Match Organizer API",
    description="API for managing football matches and users",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
from fastapi import FastAPI
from .database import engine, Base
from .routers import users, auth, matches, feedback, recommendations, teams
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Create tables
print("Creating tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")

app = FastAPI(
    title="Football Match Organizer API",
    description="API for managing football matches and users",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
os.makedirs("static/images/profiles", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(matches.router)
app.include_router(feedback.router)
app.include_router(recommendations.router)
app.include_router(teams.router)

@app.get("/")
def root():
    print("Root endpoint hit!")
    return {"message": "Welcome to the Football Match Organizer API"}
