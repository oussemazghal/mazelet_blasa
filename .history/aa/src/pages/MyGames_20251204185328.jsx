import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./myGames.css"; // Import du CSS spécifique
import myGamesBg from "../images/my_games.jpg"; // ⭐ Import Image

export default function MyGames() {
    const navigate = useNavigate();
    const [joinedMatches, setJoinedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // ⭐ Add User State

    useEffect(function () {
        async function fetchMyGames() {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                // 1. Fetch User Profile to get ID
                const resUser = await fetch("http://127.0.0.1:8001/users/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!resUser.ok) throw new Error("Unauthorized");
                const currentUser = await resUser.json();
                setUser(currentUser); // ⭐ Save user to state

                // 2. Fetch All Matches and Filter
                // Ideally backend should have /matches/joined endpoint
                const resMatches = await fetch("http://127.0.0.1:8001/matches/");
                const allMatches = await resMatches.json();

                const joined = allMatches.filter(m =>
                    m.participants && m.participants.some(p => (p.id === currentUser.id || p === currentUser.id))
                );
                setJoinedMatches(joined);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchMyGames();
    }, [navigate]);

    if (loading) return <div className="page">Loading...</div>;

    return (
        <div className="page" style={{
            backgroundImage: `url(${myGamesBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed"
        }}>
            <h1>My Joined Games</h1>

            {joinedMatches.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "50px", background: "rgba(255,255,255,0.9)" }}>
                    <p>You haven't joined any games yet.</p>
                    <button onClick={() => navigate("/games")} className="add-btn">
                        Find a Game
                    </button>
                </div>
            ) : (
                <div className="games-list">
                    {joinedMatches.map((match) => {
                        // Determine Opposing Team
                        let opposingTeam = null;
                        let opposingCaptain = null;

                        if (match.is_team_match && user) {
                            // Check if user is in Team A (by ID or Captain ID)
                            const inTeamA = match.team_a?.members?.some(m => m.user_id === user.id) || match.team_a?.captain_id === user.id;
                            opposingTeam = inTeamA ? match.team_b : match.team_a;

                            if (opposingTeam) {
                                opposingCaptain = opposingTeam.members?.find(m => m.user_id === opposingTeam.captain_id);
                            }
                        }

                        return (
                            <div key={match.id} className="game-card" style={{ borderColor: "#4CAF50" }}>
                                <h2>{match.title}</h2>

                                {match.is_team_match ? (
                                    <div style={{ marginBottom: "15px", background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                                        {opposingTeam ? (
                                            <>
                                                <h3 style={{ margin: "0 0 10px 0", color: "#d32f2f" }}>VS {opposingTeam.name}</h3>
                                                <p style={{ marginBottom: "5px" }}>
                                                    <strong>Captain:</strong>{" "}
                                                    <span
                                                        style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
                                                        onClick={() => navigate(`/profile/${opposingTeam.captain_id}`)}
                                                    >
                                                        {opposingCaptain?.name || "Unknown"}
                                                    </span>
                                                </p>
                                                <div style={{ fontSize: "14px" }}>
                                                    <strong>Members:</strong>
                                                    <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                                                        {opposingTeam.members.map(m => (
                                                            <li key={m.id}>
                                                                {m.user_id ? (
                                                                    <span
                                                                        style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
                                                                        onClick={() => navigate(`/profile/${m.user_id}`)}
                                                                    >
                                                                        {m.name}
                                                                    </span>
                                                                ) : (
                                                                    <span>{m.name}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </>
                                        ) : (
                                            <p style={{ fontStyle: "italic", color: "#666" }}>Waiting for an opponent...</p>
                                        )}
                                    </div>
                                ) : (
                                    <p>
                                        <strong>Organizer:</strong>{" "}
                                        <span
                                            style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => navigate(`/profile/${match.organizer_id}`)}
                                        >
                                            {match.organizer_name || "Unknown"}
                                        </span>
                                    </p>
                                )}

                                <p><strong>Type:</strong> {match.type_match}</p>
                                <p><strong>City:</strong> {match.city}</p>
                                <p><strong>Date:</strong> {match.date} at {match.start_time}</p>
                                <p><strong>Price:</strong> {match.price_per_player} DT</p>
                                <button className="join-btn joined" disabled>Joined ✅</button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
