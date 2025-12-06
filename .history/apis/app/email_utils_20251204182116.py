import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "oussemainstagram@gmail.com"
SENDER_PASSWORD = "txja efml ceyt ggqy"

def send_match_reminder(to_email: str, player_name: str, match_title: str, time: str, city: str, stadium: str):
    """
    Sends a match reminder email to a player.
    """
    try:
        subject = f"⚽ Match Reminder: {match_title} Today!"
        
        body = f"""
        <html>
          <body>
            <h2>Hello {player_name},</h2>
            <p>This is a reminder that you have a football match scheduled for today!</p>
            
            <div style="background-color: #f0f4c3; padding: 15px; border-radius: 5px; border-left: 5px solid #afb42b;">
                <h3>{match_title}</h3>
                <p><strong>🕒 Time:</strong> {time}</p>
                <p><strong>📍 Location:</strong> {stadium}, {city}</p>
            </div>
            
            <p>Don't be late! Good luck and have fun! 🏃‍♂️💨</p>
            
            <p>Best regards,<br>
            <strong>Mazelet Blasa Team</strong></p>
          </body>
        </html>
        """

        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html"))

        # Connect to server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Send email
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False
