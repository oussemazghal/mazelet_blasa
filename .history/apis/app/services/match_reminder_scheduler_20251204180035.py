from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import date
import logging
from .. import models, database
from .email_service import send_email, create_match_reminder_email

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_send_reminders():
    """
    Vérifie les matchs du jour et envoie des emails aux participants.
    """
    logger.info("🔍 Vérification des matchs du jour pour envoi d'emails...")
    
    db = database.SessionLocal()
    try:
        today = date.today().isoformat() # Format YYYY-MM-DD
        
        # Trouver les matchs d'aujourd'hui
        matches_today = db.query(models.Match).filter(models.Match.date == today).all()
        
        if not matches_today:
            logger.info("Aucun match prévu pour aujourd'hui.")
            return

        logger.info(f"📅 {len(matches_today)} matchs trouvés pour aujourd'hui.")

        count_emails = 0
        
        for match in matches_today:
            # Récupérer tous les participants
            participants = match.participants
            
            # Si c'est un match par équipe, s'assurer qu'on a bien tous les membres
            # (Normalement ils sont déjà dans participants via la logique de join/create)
            
            for participant in participants:
                if participant.email:
                    subject = f"⚽ Rappel: Match aujourd'hui - {match.title}"
                    html_content = create_match_reminder_email(match, participant)
                    
                    if send_email(participant.email, subject, html_content):
                        count_emails += 1
        
        logger.info(f"✅ Terminé : {count_emails} emails de rappel envoyés.")
        
    except Exception as e:
        logger.error(f"❌ Erreur dans le scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    """
    Démarre le planificateur.
    """
    scheduler = BackgroundScheduler()
    
    # Exécuter tous les jours à 8h00
    # scheduler.add_job(check_and_send_reminders, 'cron', hour=8, minute=0)
    
    # POUR TESTER : Exécuter toutes les 10 secondes (A COMMENTER EN PROD)
    # scheduler.add_job(check_and_send_reminders, 'interval', seconds=60)
    
    # Configuration finale : Tous les jours à 08:00
    scheduler.add_job(check_and_send_reminders, 'cron', hour=8, minute=0)
    
    scheduler.start()
    logger.info("🚀 Scheduler de rappels d'emails démarré (tous les jours à 08:00).")
