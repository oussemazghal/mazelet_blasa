from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from .email_service import EmailService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MatchReminderScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.email_service = EmailService()
        
    def send_daily_reminders(self):
        """
        Fonction appelée chaque jour pour envoyer les rappels
        """
        logger.info("🔔 Vérification des matchs du jour...")
        
        db = SessionLocal()
        try:
            # Obtenir la date d'aujourd'hui
            today = date.today().isoformat()
            
            # Trouver tous les matchs d'aujourd'hui
            today_matches = db.query(models.Match).filter(
                models.Match.date == today
            ).all()
            
            if not today_matches:
                logger.info(f"Aucun match prévu pour aujourd'hui ({today})")
                return
            
            logger.info(f"📅 {len(today_matches)} match(s) trouvé(s) pour aujourd'hui")
            
            # Pour chaque match, envoyer des emails aux participants
            for match in today_matches:
                logger.info(f"⚽ Traitement du match: {match.title}")
                
                # Préparer les données du match
                match_data = {
                    'title': match.title,
                    'date': match.date,
                    'start_time': match.start_time,
                    'end_time': match.end_time,
                    'stadium': match.stadium,
                    'city': match.city,
                    'type_match': match.type_match,
                    'organizer_name': match.organizer.full_name if match.organizer else "Organisateur"
                }
                
                # Préparer la liste des destinataires
                recipients = []
                
                if match.participants:
                    for participant in match.participants:
                        if participant.email:
                            recipients.append({
                                'email': participant.email,
                                'name': participant.full_name or participant.email.split('@')[0]
                            })
                
                if recipients:
                    logger.info(f"📧 Envoi de {len(recipients)} email(s) pour '{match.title}'")
                    self.email_service.send_bulk_match_reminders(recipients, match_data)
                else:
                    logger.info(f"⚠️ Aucun participant avec email pour '{match.title}'")
                    
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'envoi des rappels: {str(e)}")
        finally:
            db.close()
    
    def start(self):
        """
        Démarre le scheduler
        Envoie les rappels chaque jour à 8h00
        """
        # Planifier l'envoi quotidien à 8h00
        self.scheduler.add_job(
            self.send_daily_reminders,
            'cron',
            hour=8,
            minute=0,
            id='daily_match_reminders',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("✅ Scheduler de rappels de matchs démarré (envoi quotidien à 8h00)")
        
    def stop(self):
        """
        Arrête le scheduler
        """
        self.scheduler.shutdown()
        logger.info("🛑 Scheduler de rappels de matchs arrêté")
    
    def send_test_reminder(self):
        """
        Fonction de test pour envoyer immédiatement les rappels
        (utile pour tester sans attendre 8h00)
        """
        logger.info("🧪 Test: Envoi immédiat des rappels")
        self.send_daily_reminders()

# Instance globale du scheduler
reminder_scheduler = MatchReminderScheduler()
