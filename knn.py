import numpy as np
from sklearn.neighbors import NearestNeighbors
from sqlalchemy.orm import Session
from .models import Match, User

# -----------------------------
# Helpers for encoding strings
# -----------------------------

def encode_type(type_match: str):
    mapping = {"5v5": 0, "7v7": 1, "9v9": 2, "11v11": 3}
    return mapping.get(type_match, -1)

def encode_city(city: str):
    unique_cities = {
        "Tunis": 0, "Sfax": 1, "Sousse": 2, "Monastir": 3,
        "Gabes": 4, "Bizerte": 5, "Nabeul": 6, "Kairouan": 7
    }
    return unique_cities.get(city, -1)

# ------------------------------------------------------
# Convert SQLAlchemy Match object → Vector of features
# ------------------------------------------------------

def match_to_vector(match: Match):
    return np.array([
        match.min_age,
        match.max_age,
        encode_type(match.type_match),
        encode_city(match.city),
        match.price_per_player,
        match.nb_players
    ], dtype=float)

# ------------------------------------------------------
# Convert user → preference vector
# (simplest version = only age, city, type)
# ------------------------------------------------------

def user_to_vector(user: User, preferred_type: str = None):
    return np.array([
        user.age or 0,
        encode_type(preferred_type or "5v5"),
        encode_city("Tunis"),  # TODO: if you add user.city later
        0  # placeholder for budget
    ], dtype=float)


# ------------------------------------------------------
# Main function : recommend matches for a user
# ------------------------------------------------------

def recommend_matches(db: Session, user_id: int, top_k: int = 5):
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # Get all matches
    matches = db.query(Match).all()
    if not matches:
        return []

    # Build feature matrix
    X = np.vstack([match_to_vector(m) for m in matches])

    # Create KNN model
    knn = NearestNeighbors(n_neighbors=min(top_k, len(matches)), metric="euclidean")
    knn.fit(X)

    # Build user feature vector
    user_vec = np.array([user.age, 0, 0, 0, 0, 0])   # simplest version

    # Query KNN
    distances, indices = knn.kneighbors([user_vec])

    # Return recommended match IDs
    recommended_matches = [matches[i].id for i in indices[0]]
    return recommended_matches
