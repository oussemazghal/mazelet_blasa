import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./myOrganizedGames.css";

export default function MyOrganizedGames() {
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        fetch("http://127.0.0.1:8001/users/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                // Filter matches where organizer_id matches user id
                // Note: In a real app, we might want a specific endpoint for this
                fetch("http://127.0.0.1:8001/matches/", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(allMatches => {
                        const myMatches = allMatches.filter(m => m.organizer_id === user.id);
                        setMatches(myMatches);
                    });
            })
            .catch(err => console.error(err));
    }, [navigate]);

    const handleDelete = async (matchId) => {
        if (!window.confirm("Are you sure you want to delete this match?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://127.0.0.1:8001/matches/${matchId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setMatches(matches.filter(m => m.id !== matchId));
                alert("Match deleted successfully");
            } else {
                alert("Failed to delete match");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting match");
        }
    };

    return (
        <div className="organized-games-page">
            <h1>My Organized Games</h1>
            {matches.length === 0 ? (
                <p>You haven't organized any matches yet.</p>
            ) : (
                <div className="games-grid">
                    {matches.map(match => (
                        <div key={match.id} className="game-card">
                            <h3>{match.title}</h3>
                            <p><strong>Date:</strong> {match.date}</p>
                            <p><strong>Location:</strong> {match.city} - {match.stadium}</p>
                            <p><strong>Players:</strong> {match.participants ? match.participants.length : 0} / {match.nb_players}</p>
                            <div className="card-actions">
                                <button className="delete-btn" onClick={() => handleDelete(match.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
