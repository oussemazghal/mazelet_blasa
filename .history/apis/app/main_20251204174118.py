from fastapi import FastAPI
from .database import engine, Base
from .routers import users, auth, matches, feedback, recommendations, teams
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Try to import scheduler (optional)
try:
    from .services.match_reminder_scheduler import reminder_scheduler
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("⚠️ APScheduler not installed - Email reminders disabled")
    print("   Install with: pip install apscheduler python-dotenv")

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

@app.get("/test-email-reminder")
def test_email_reminder():
    """
    Endpoint de test pour envoyer immédiatement les rappels de matchs
    Utile pour tester sans attendre 8h00
    """
    print("🧪 Test manuel des rappels d'emails...")
    reminder_scheduler.send_test_reminder()
    return {
        "message": "Test des rappels envoyé! Vérifiez les logs du serveur et les boîtes email.",
        "info": "Les emails sont envoyés pour tous les matchs d'aujourd'hui"
    }

# Événements de démarrage et arrêt
@app.on_event("startup")
async def startup_event():
    """Démarre le scheduler au lancement de l'application"""
    print("🚀 Démarrage de l'application...")
    reminder_scheduler.start()
    print("✅ Scheduler de rappels de matchs activé")

@app.on_event("shutdown")
async def shutdown_event():
    """Arrête le scheduler à l'arrêt de l'application"""
    print("🛑 Arrêt de l'application...")
    reminder_scheduler.stop()
    print("✅ Scheduler de rappels de matchs désactivé")

