from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .. import models, database, auth
from ..ml_service import MatchRecommender

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"]
)

@router.get("/", response_model=List[Dict[str, Any]])
def get_recommendations(
    limit: int = 5,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Get personalized match recommendations for the current user
    
    Args:
        limit: Number of recommendations to return (default: 5)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of recommended matches with similarity scores and reasons
    """
    recommender = MatchRecommender(n_neighbors=limit)
    recommendations = recommender.recommend_matches(
        user_id=current_user.id,
        db=db,
        limit=limit
    )
    
    # Format response
    result = []
    for rec in recommendations:
        match = rec["match"]
        result.append({
            "match": {
                "id": match.id,
                "title": match.title,
                "description": match.description,
                "type_match": match.type_match,
                "city": match.city,
                "stadium": match.stadium,
                "date": match.date,
                "start_time": match.start_time,
                "end_time": match.end_time,
                "nb_players": match.nb_players,
                "price_per_player": match.price_per_player,
                "min_age": match.min_age,
                "max_age": match.max_age,
                "organizer_id": match.organizer_id,
                "organizer_name": match.organizer_name if hasattr(match, 'organizer_name') else None,
                "participants": [
                    {
                        "id": p.id,
                        "email": p.email,
                        "full_name": p.full_name,
                        "phone": p.phone,
                        "image_url": p.image_url,
                        "age": p.age
                    } for p in match.participants
                ]
            },
            "similarity_score": rec["similarity_score"],
            "reason": rec["reason"]
        })
    
    return result
