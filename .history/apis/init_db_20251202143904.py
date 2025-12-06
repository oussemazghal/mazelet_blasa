"""
Script Python pour initialiser la base de données PostgreSQL
et créer toutes les tables nécessaires
"""

from app.database import engine, Base
from app import models

def init_db():
    """
    Crée toutes les tables dans la base de données
    en utilisant les modèles SQLAlchemy définis dans app.models
    """
    print("🚀 Initialisation de la base de données...")
    print(f"📊 Base de données: {engine.url}")
    
    try:
        # Créer toutes les tables définies dans Base.metadata
        Base.metadata.create_all(bind=engine)
        print("✅ Toutes les tables ont été créées avec succès!")
        print("\n📋 Tables créées:")
        print("  - users")
        print("  - teams")
        print("  - team_members")
        print("  - matches")
        print("  - match_participants (table d'association)")
        print("  - feedbacks")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables: {e}")
        raise

if __name__ == "__main__":
    init_db()
