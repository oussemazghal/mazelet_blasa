"""
Script to populate the database with test data
Run with: python populate_db.py
"""

from app.database import SessionLocal, engine
from app.models import User, Match, Base
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def clear_database():
    """Clear all data from tables"""
    db = SessionLocal()
    try:
        # Delete in correct order (foreign key constraints)
        db.query(Match).delete()
        db.query(User).delete()
        db.commit()
        print("✅ Base de données vidée")
    except Exception as e:
        print(f"❌ Erreur lors du vidage: {e}")
        db.rollback()
    finally:
        db.close()

def create_users():
    """Create test users"""
    db = SessionLocal()
    
    users_data = [
        {"email": "ahmed@test.com", "password": "password123", "full_name": "Ahmed Ben Ali", "phone": "20123456", "age": 25},
        {"email": "mohamed@test.com", "password": "password123", "full_name": "Mohamed Trabelsi", "phone": "22345678", "age": 28},
        {"email": "youssef@test.com", "password": "password123", "full_name": "Youssef Gharbi", "phone": "24567890", "age": 22},
        {"email": "karim@test.com", "password": "password123", "full_name": "Karim Bouazizi", "phone": "26789012", "age": 30},
        {"email": "amine@test.com", "password": "password123", "full_name": "Amine Khaled", "phone": "28901234", "age": 26},
        {"email": "salah@test.com", "password": "password123", "full_name": "Salah Mansour", "phone": "29012345", "age": 24},
        {"email": "nabil@test.com", "password": "password123", "full_name": "Nabil Jebali", "phone": "21234567", "age": 27},
        {"email": "riadh@test.com", "password": "password123", "full_name": "Riadh Msakni", "phone": "23456789", "age": 29},
    ]
    
    users = []
    try:
        for user_data in users_data:
            user = User(
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                phone=user_data["phone"],
                age=user_data["age"]
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ {len(users)} utilisateurs créés")
        
        # Refresh to get IDs
        for user in users:
            db.refresh(user)
        
        return users
    except Exception as e:
        print(f"❌ Erreur lors de la création des utilisateurs: {e}")
        db.rollback()
        return []
    finally:
        db.close()

def create_matches(users):
    """Create test matches"""
    db = SessionLocal()
    
    # Tunisian cities and stadiums
    locations = [
        {"city": "Tunis", "stadiums": ["Stade Olympique", "Stade El Menzah", "Stade Chedli Zouiten"]},
        {"city": "Sfax", "stadiums": ["Stade Taïeb Mhiri", "Stade de Sfax", "Complex Sportif"]},
        {"city": "Sousse", "stadiums": ["Stade Olympique", "Stade Municipal", "Terrain Synthétique"]},
        {"city": "Bizerte", "stadiums": ["Stade 15 Octobre", "Stade Bizerte", "Terrain Municipal"]},
        {"city": "Nabeul", "stadiums": ["Stade de Nabeul", "Complex Sportif", "Terrain Hammamet"]},
    ]
    
    match_types = ["5v5", "7v7", "9v9", "11v11"]
    
    matches = []
    today = datetime.now()
    
    # Create 20 matches
    for i in range(20):
        location = random.choice(locations)
        city = location["city"]
        stadium = random.choice(location["stadiums"])
        match_type = random.choice(match_types)
        
        # Random date between today and 30 days from now
        days_ahead = random.randint(0, 30)
        match_date = today + timedelta(days=days_ahead)
        
        # Random time
        hour = random.randint(16, 21)  # Between 4 PM and 9 PM
        start_time = f"{hour:02d}:00"
        end_time = f"{hour+2:02d}:00"
        
        # Number of players based on match type
        nb_players_map = {"5v5": 10, "7v7": 14, "9v9": 18, "11v11": 22}
        nb_players = nb_players_map.get(match_type, 10)
        
        # Random organizer
        organizer = random.choice(users)
        
        match = Match(
            title=f"Match {match_type} - {city}",
            description=f"Match amical de football {match_type} à {stadium}",
            type_match=match_type,
            city=city,
            stadium=stadium,
            date=match_date.date().isoformat(),
            start_time=start_time,
            end_time=end_time,
            nb_players=nb_players,
            price_per_player=random.choice([5, 7, 10, 12, 15]),
            organizer_phone=organizer.phone,
            min_age=random.choice([16, 18, 20]),
            max_age=random.choice([35, 40, 45, 50]),
            organizer_id=organizer.id
        )
        
        db.add(match)
        matches.append(match)
    
    try:
        db.commit()
        print(f"✅ {len(matches)} matchs créés")
        
        # Refresh to get IDs
        for match in matches:
            db.refresh(match)
        
        return matches
    except Exception as e:
        print(f"❌ Erreur lors de la création des matchs: {e}")
        db.rollback()
        return []
    finally:
        db.close()

def add_participants(users, matches):
    """Add random participants to matches"""
    db = SessionLocal()
    
    total_participations = 0
    
    try:
        for match in matches:
            # Each match gets 2-8 random participants
            num_participants = random.randint(2, min(8, match.nb_players - 1))
            
            # Choose random users (excluding organizer)
            available_users = [u for u in users if u.id != match.organizer_id]
            participants = random.sample(available_users, min(num_participants, len(available_users)))
            
            for participant in participants:
                match.participants.append(participant)
                total_participations += 1
        
        db.commit()
        print(f"✅ {total_participations} participations ajoutées")
    except Exception as e:
        print(f"❌ Erreur lors de l'ajout des participants: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function to populate database"""
    print("\n🚀 Démarrage du peuplement de la base de données...\n")
    
    # Ask for confirmation
    response = input("⚠️  Cela va effacer toutes les données existantes. Continuer? (o/n): ")
    if response.lower() != 'o':
        print("❌ Opération annulée")
        return
    
    # Clear existing data
    clear_database()
    
    # Create test data
    print("\n📝 Création des données de test...\n")
    users = create_users()
    
    if users:
        matches = create_matches(users)
        
        if matches:
            add_participants(users, matches)
    
    print("\n✅ Peuplement terminé avec succès!")
    print("\n📊 Résumé:")
    print(f"   - {len(users)} utilisateurs créés")
    print(f"   - {len(matches) if matches else 0} matchs créés")
    print("\n💡 Identifiants de test:")
    print("   Email: ahmed@test.com")
    print("   Password: password123")
    print("\n   (Tous les utilisateurs ont le même mot de passe: password123)\n")

if __name__ == "__main__":
    main()
