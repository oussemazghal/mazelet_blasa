import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./myOrganizedGames.css";

export default function MyOrganizedGames() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetch("http://127.0.0.1:8001/matches/organizer/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch organized matches");
                return res.json();
            })
            .then(data => {
                setMatches(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="my-organized-games"><p>Loading...</p></div>;
    if (error) return <div className="my-organized-games"><p>Error: {error}</p></div>;

    return (
        <div className="my-organized-games">
            <h2>Matches I Organized</h2>
            {matches.length === 0 ? (
                <p>No matches organized yet.</p>
            ) : (
                <div className="matches-grid">
                    {matches.map(match => (
                        <div key={match.id} className="match-card">
                            <h3>{match.title}</h3>
                            <p>{match.city} - {match.stadium}</p>
                            <p>{match.date} {match.start_time} - {match.end_time}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
