import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
GMAIL_USER = "oussemainstagram@gmail.com"
GMAIL_PASSWORD = "fdei mfzh wptu loep"  # App Password

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_html: str):
    """
    Envoie un email HTML via Gmail SMTP.
    """
    try:
        # Création du message
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # Ajout du corps HTML
        msg.attach(MIMEText(body_html, 'html'))

        # Connexion au serveur SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Sécurisation de la connexion
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        
        # Envoi
        text = msg.as_string()
        server.sendmail(GMAIL_USER, to_email, text)
        server.quit()
        
        logger.info(f"✅ Email envoyé à {to_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'envoi de l'email à {to_email}: {e}")
        return False

def create_match_reminder_email(match, user):
    """
    Crée le contenu HTML pour un rappel de match.
    """
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2196F3; text-align: center;">⚽ Rappel de Match !</h2>
            
            <p>Bonjour <strong>{user.full_name or user.email}</strong>,</p>
            
            <p>C'est le grand jour ! Vous avez un match prévu aujourd'hui.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{match.title}</h3>
                <p><strong>📅 Date:</strong> {match.date}</p>
                <p><strong>⏰ Heure:</strong> {match.start_time} - {match.end_time}</p>
                <p><strong>📍 Lieu:</strong> {match.stadium}, {match.city}</p>
                <p><strong>⚽ Type:</strong> {match.type_match}</p>
            </div>
            
            <p>N'oubliez pas vos équipements ! Bon match !</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #888; text-align: center;">
                Mazelet Blasa - Votre plateforme de matchs de football<br>
                Ceci est un email automatique, merci de ne pas répondre.
            </p>
        </div>
    </body>
    </html>
    """
    return html_content
