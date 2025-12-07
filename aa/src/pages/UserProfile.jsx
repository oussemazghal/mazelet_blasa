import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./games.css"; // Reuse styling

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [organizedMatches, setOrganizedMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch User Details
                const resUser = await fetch(`http://127.0.0.1:8001/users/${id}`);
                if (!resUser.ok) throw new Error("User not found");
                const userData = await resUser.json();
                setUser(userData);

                // 2. Fetch Organized Matches
                const resMatches = await fetch("http://127.0.0.1:8001/matches/");
                const allMatches = await resMatches.json();
                const organized = allMatches.filter(m => m.organizer_id === parseInt(id));
                setOrganizedMatches(organized);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) return <div className="page">Loading...</div>;
    if (!user) return <div className="page">User not found</div>;

    return (
        <div className="page">
            <div className="step-box" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

                {/* PROFILE HEADER */}
                <div style={{ marginBottom: "20px" }}>
                    {user.image_url ? (
                        <img
                            src={user.image_url}
                            alt="Profile"
                            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid #2196F3" }}
                        />
                    ) : (
                        <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ddd", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                            👤
                        </div>
                    )}
                </div>

                <h1>{user.full_name}</h1>
                <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
                <p><strong>Email:</strong> {user.email}</p>

                <hr style={{ margin: "40px 0" }} />

                {/* ORGANIZED MATCHES */}
                <div style={{ textAlign: "left" }}>
                    <h3>⚽ Matches Organized by {user.full_name}</h3>
                    {organizedMatches.length === 0 ? (
                        <p>No matches organized yet.</p>
                    ) : (
                        <div className="games-list">
                            {organizedMatches.map((match) => (
                                <div key={match.id} className="game-card">
                                    <h2>{match.title}</h2>
                                    <p><strong>Type:</strong> {match.type_match}</p>
                                    <p><strong>City:</strong> {match.city}</p>
                                    <p><strong>Date:</strong> {match.date} at {match.start_time}</p>
                                    <p><strong>Price:</strong> {match.price_per_player} DT</p>
                                    {/* Reuse Join Logic could be complex here without context, so simple view */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
