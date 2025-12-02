"""
Script pour réinitialiser complètement la base de données
Supprime toutes les tables et les recrée
"""

from app.database import engine, Base, SessionLocal
from app import models
from app.auth import get_password_hash

def reset_database():
    """
    Supprime toutes les tables et les recrée
    """
    print("⚠️  ATTENTION: Suppression de toutes les tables...")
    
    try:
        # Supprimer toutes les tables
        Base.metadata.drop_all(bind=engine)
        print("✅ Toutes les tables ont été supprimées")
        
        # Recréer toutes les tables
        Base.metadata.create_all(bind=engine)
        print("✅ Toutes les tables ont été recréées")
        
        print("\n📋 Tables créées:")
        print("  - users")
        print("  - teams")
        print("  - team_members")
        print("  - matches")
        print("  - match_participants (table d'association)")
        print("  - feedbacks")
        
        # Créer un utilisateur de test
        create_test_user()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise

def create_test_user():
    """
    Crée un utilisateur de test pour vérifier que tout fonctionne
    """
    db = SessionLocal()
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(models.User).filter(models.User.email == "test@test.com").first()
        if existing_user:
            print("\n⚠️  L'utilisateur test existe déjà")
            return
        
        # Créer un utilisateur de test
        test_user = models.User(
            email="test@test.com",
            hashed_password=get_password_hash("test123"),
            full_name="Test User",
            phone="0600000000",
            age=25
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("\n✅ Utilisateur de test créé:")
        print(f"   Email: test@test.com")
        print(f"   Password: test123")
        print(f"   ID: {test_user.id}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur de test: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Réinitialisation de la base de données...\n")
    reset_database()
    print("\n🎉 Base de données réinitialisée avec succès!")
