from sqlalchemy.orm import Session
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder
import numpy as np
from datetime import date
from . import models

class MatchRecommender:
    """KNN-based match recommendation system using sklearn"""
    
    def __init__(self, n_neighbors=5):
        self.n_neighbors = n_neighbors
        self.knn_model = None
    
    def _encode_features(self, matches, all_cities, all_stadiums, all_types):
        """
        Encode matches into feature vectors
        
        Args:
            matches: List of match objects
            all_cities, all_stadiums, all_types: Lists of unique values for encoding
            
        Returns:
            numpy array of feature vectors
        """
        features = []
        
        for match in matches:
            # Encode city
            try:
                city_idx = all_cities.index(match.city) if match.city in all_cities else -1
            except:
                city_idx = -1
            
            # Encode stadium
            try:
                stadium_idx = all_stadiums.index(match.stadium) if match.stadium in all_stadiums else -1
            except:
                stadium_idx = -1
            
            # Encode type
            try:
                type_idx = all_types.index(match.type_match) if match.type_match in all_types else -1
            except:
                type_idx = -1
            
            # Feature vector: [city, stadium, nb_players, type, is_team_match]
            feature_vector = [
                city_idx,
                stadium_idx,
                match.nb_players if match.nb_players else 10,
                type_idx,
                1 if match.is_team_match else 0  # ⭐ New feature
            ]
            features.append(feature_vector)
        
        return np.array(features)
    
    def recommend_matches(self, user_id: int, db: Session, limit: int = 5):
        """
        Recommend matches to a user based on their participation history using KNN
        
        Args:
            user_id: ID of the user
            db: Database session
            limit: Number of recommendations to return
            
        Returns:
            List of recommended matches with similarity scores
        """
        # Get user
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return []
        
        # Get user's participation history
        user_matches = user.joined_matches
        
        # If user has no history, return upcoming matches
        if not user_matches or len(user_matches) == 0:
            today = date.today().isoformat()
            upcoming = db.query(models.Match).filter(
                models.Match.date >= today
            ).filter(
                # ⭐ Exclude full team matches
                (models.Match.is_team_match == False) | (models.Match.team_b_id == None)
            ).limit(limit).all()
            
            result = []
            for match in upcoming:
                if match.organizer:
                    match.organizer_name = match.organizer.full_name
                result.append({
                    "match": match,
                    "similarity_score": 0.5,
                    "reason": "Popular match (no history)"
                })
            return result
        
        # Get all upcoming matches (exclude past and matches user already joined)
        today = date.today().isoformat()
        all_upcoming = db.query(models.Match).filter(
            models.Match.date >= today
        ).filter(
            # ⭐ Exclude full team matches
            (models.Match.is_team_match == False) | (models.Match.team_b_id == None)
        ).all()
        
        # Filter out matches user already joined
        user_match_ids = {m.id for m in user_matches}
        candidate_matches = [m for m in all_upcoming if m.id not in user_match_ids]
        
        if not candidate_matches:
            return []
        
        # Prepare unique values for encoding
        all_matches = user_matches + candidate_matches
        all_cities = list(set([m.city for m in all_matches if m.city]))
        all_stadiums = list(set([m.stadium for m in all_matches if m.stadium]))
        all_types = list(set([m.type_match for m in all_matches if m.type_match]))
        
        # Encode user's participation history
        user_features = self._encode_features(user_matches, all_cities, all_stadiums, all_types)
        
        # Encode candidate matches
        candidate_features = self._encode_features(candidate_matches, all_cities, all_stadiums, all_types)
        
        # Train KNN model on user's history
        n_neighbors = min(self.n_neighbors, len(user_matches))  # Can't have more neighbors than samples
        self.knn_model = NearestNeighbors(n_neighbors=n_neighbors, metric='euclidean')
        self.knn_model.fit(user_features)
        
        # Find distances from each candidate to user's history
        # For each candidate, find distance to nearest matches in user's history
        distances, indices = self.knn_model.kneighbors(candidate_features)
        
        # Calculate average distance for each candidate (lower = more similar)
        avg_distances = distances.mean(axis=1)
        
        # Convert distances to similarity scores (0-1, higher = more similar)
        max_dist = avg_distances.max() if len(avg_distances) > 0 and avg_distances.max() > 0 else 1
        similarities = 1 - (avg_distances / max_dist)
        
        # Combine matches with their similarity scores
        match_scores = list(zip(candidate_matches, similarities))
        
        # Sort by similarity (highest first)
        match_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return top N recommendations
        recommendations = []
        for match, score in match_scores[:limit]:
            # Generate explanation
            reason = self._generate_reason(match, user_matches)
            
            # Add organizer name
            if match.organizer:
                match.organizer_name = match.organizer.full_name
            
            recommendations.append({
                "match": match,
                "similarity_score": round(float(score), 2),
                "reason": reason
            })
        
        return recommendations
    
    def _generate_reason(self, match, user_matches):
        """Generate a simple explanation for why this match was recommended"""
        reasons = []
        
        # Check if team match
        if match.is_team_match:
            reasons.append("team match")
        
        # Check city match
        user_cities = [m.city for m in user_matches if m.city]
        if match.city in user_cities:
            reasons.append(f"same city ({match.city})")
        
        # Check stadium match
        user_stadiums = [m.stadium for m in user_matches if m.stadium]
        if match.stadium in user_stadiums:
            reasons.append(f"same stadium ({match.stadium})")
        
        # Check type match
        user_types = [m.type_match for m in user_matches if m.type_match]
        if match.type_match in user_types:
            reasons.append(f"same type ({match.type_match})")
        
        # Check similar player count (skip for team matches)
        if not match.is_team_match:
            user_player_counts = [m.nb_players for m in user_matches if m.nb_players and not m.is_team_match]
            if user_player_counts:
                avg_players = np.mean(user_player_counts)
                if match.nb_players and abs(match.nb_players - avg_players) <= 2:
                    reasons.append(f"similar player count")
        
        if reasons:
            return "Recommended: " + ", ".join(reasons)
        else:
            return "Similar to your preferences"
