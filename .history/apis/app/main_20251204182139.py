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

# --- Email Notification Scheduler ---
import asyncio
from datetime import date
from .database import SessionLocal
from . import models
from .email_utils import send_match_reminder

async def check_matches_and_send_emails():
    """
    Background task to check for matches scheduled for TODAY and send emails to participants.
    """
    print("📧 Starting email notification service...")
    while True:
        try:
            today_str = date.today().isoformat() # YYYY-MM-DD
            print(f"🔍 Checking matches for date: {today_str}")
            
            db = SessionLocal()
            try:
                # Find matches for today
                matches = db.query(models.Match).filter(models.Match.date == today_str).all()
                
                if matches:
                    print(f"⚽ Found {len(matches)} matches for today.")
                    for match in matches:
                        # Collect all participants
                        participants = []
                        
                        # 1. Individual participants
                        if match.participants:
                            participants.extend(match.participants)
                            
                        # 2. Team A members (if team match)
                        if match.is_team_match and match.team_a:
                            for member in match.team_a.members:
                                if member.user: # Only if they have a user account
                                    participants.append(member.user)
                                    
                        # 3. Team B members (if team match)
                        if match.is_team_match and match.team_b:
                            for member in match.team_b.members:
                                if member.user:
                                    participants.append(member.user)
                        
                        # Deduplicate participants
                        unique_participants = {p.id: p for p in participants}.values()
                        
                        for player in unique_participants:
                            if player.email:
                                print(f"   📨 Sending email to {player.email} for match '{match.title}'")
                                send_match_reminder(
                                    to_email=player.email,
                                    player_name=player.full_name or "Player",
                                    match_title=match.title,
                                    time=match.start_time,
                                    city=match.city,
                                    stadium=match.stadium
                                )
                else:
                    print("✅ No matches found for today.")
                    
            finally:
                db.close()
                
            # Wait for 24 hours before checking again (or check every hour)
            # For demonstration, we check every 24 hours. 
            # In a real app, you might want to run this at a specific time (e.g., 8 AM).
            # Here we just sleep for a long time to avoid spamming in dev.
            await asyncio.sleep(24 * 3600) 
            
        except Exception as e:
            print(f"❌ Error in email service: {e}")
            await asyncio.sleep(3600) # Retry in 1 hour on error

@app.on_event("startup")
async def startup_event():
    # Start the email checker in the background
    asyncio.create_task(check_matches_and_send_emails())
