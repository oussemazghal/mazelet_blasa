from app.email_utils import send_match_reminder

# Replace with your email to test
TEST_EMAIL = "oussemainstagram@gmail.com" 

print(f"📧 Attempting to send test email to {TEST_EMAIL}...")

success = send_match_reminder(
    to_email=TEST_EMAIL,
    player_name="Test User",
    match_title="Test Match 2025",
    time="20:00",
    city="Tunis",
    stadium="Rades"
)

if success:
    print("\n✅ Test email sent successfully! Check your inbox.")
else:
    print("\n❌ Failed to send test email. Check your credentials in app/email_utils.py")
