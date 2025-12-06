import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("GMAIL_USER")
        self.sender_password = os.getenv("GMAIL_APP_PASSWORD")
        
    def send_match_reminder(self, recipient_email: str, recipient_name: str, match_data: dict):
        """
        Envoie un email de rappel pour un match
        
        Args:
            recipient_email: Email du destinataire
            recipient_name: Nom du destinataire
            match_data: Dictionnaire contenant les infos du match
                - title: Titre du match
                - date: Date du match
                - start_time: Heure de début
                - end_time: Heure de fin
                - stadium: Nom du stade
                - city: Ville
                - type_match: Type (5v5, 7v7, etc.)
                - organizer_name: Nom de l'organisateur
        """
        try:
            # Créer le message
            message = MIMEMultipart("alternative")
            message["Subject"] = f"⚽ Rappel: Match aujourd'hui - {match_data['title']}"
            message["From"] = f"Mazelet Blasa <{self.sender_email}>"
            message["To"] = recipient_email
            
            # Créer le contenu HTML
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .match-info {{
                        background: #f0f4f8;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }}
                    .info-row {{
                        padding: 10px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }}
                    .info-row:last-child {{
                        border-bottom: none;
                    }}
                    .icon {{
                        display: inline-block;
                        width: 30px;
                        font-size: 18px;
                    }}
                    .footer {{
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        margin-top: 20px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #646cff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚽ Rappel de Match</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>{recipient_name}</strong>,</p>
                        <p>Rappel de votre match aujourd'hui :</p>
                        
                        <div class="match-info">
                            <h2 style="margin-top: 0; color: #667eea;">{match_data['title']}</h2>
                            
                            <div class="info-row">
                                <span class="icon">📅</span>
                                <strong>Date:</strong> {match_data['date']}
                            </div>
                            
                            <div class="info-row">
                                <span class="icon">⏰</span>
                                <strong>Heure:</strong> {match_data['start_time']} - {match_data['end_time']}
                            </div>
                            
                            <div class="info-row">
                                <span class="icon">📍</span>
                                <strong>Lieu:</strong> {match_data['stadium']}, {match_data['city']}
                            </div>
                            
                            <div class="info-row">
                                <span class="icon">⚽</span>
                                <strong>Type:</strong> {match_data['type_match']}
                            </div>
                            
                            <div class="info-row">
                                <span class="icon">👤</span>
                                <strong>Organisateur:</strong> {match_data['organizer_name']}
                            </div>
                        </div>
                        
                        <p style="text-align: center; font-size: 18px; color: #667eea;">
                            <strong>À tout à l'heure sur le terrain! 🎉</strong>
                        </p>
                        
                        <div class="footer">
                            <p>---</p>
                            <p><strong>Mazelet Blasa</strong></p>
                            <p>Votre plateforme de matchs de football</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Créer la version texte simple
            text_content = f"""
Bonjour {recipient_name},

Rappel de votre match aujourd'hui:

📅 Date: {match_data['date']}
⏰ Heure: {match_data['start_time']} - {match_data['end_time']}
📍 Lieu: {match_data['stadium']}, {match_data['city']}
⚽ Type: {match_data['type_match']}
👤 Organisateur: {match_data['organizer_name']}

À tout à l'heure sur le terrain!

---
Mazelet Blasa - Votre plateforme de matchs de football
            """
            
            # Attacher les deux versions
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Envoyer l'email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
                
            print(f"✅ Email envoyé à {recipient_email} pour le match '{match_data['title']}'")
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email à {recipient_email}: {str(e)}")
            return False
    
    def send_bulk_match_reminders(self, recipients: List[dict], match_data: dict):
        """
        Envoie des emails de rappel à plusieurs destinataires
        
        Args:
            recipients: Liste de dictionnaires avec 'email' et 'name'
            match_data: Données du match
        """
        success_count = 0
        for recipient in recipients:
            if self.send_match_reminder(
                recipient['email'], 
                recipient['name'], 
                match_data
            ):
                success_count += 1
        
        print(f"📧 {success_count}/{len(recipients)} emails envoyés avec succès")
        return success_count
