import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./myOrganizedGames.css"; // Import du CSS spécifique
import { useToast } from "../context/ToastContext";

export default function MyOrganizedGames() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [myMatches, setMyMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(function () {
        fetchMyOrganizedGames();
    }, [navigate]);

    async function fetchMyOrganizedGames() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // 1. Fetch User to get ID
            const resUser = await fetch("http://127.0.0.1:8001/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resUser.ok) throw new Error("Unauthorized");
            const user = await resUser.json();

            // 2. Fetch All Matches and Filter by Organizer
            const resMatches = await fetch("http://127.0.0.1:8001/matches/");
            const allMatches = await resMatches.json();

            const organized = allMatches.filter(m => m.organizer_id === user.id);
            setMyMatches(organized);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveParticipant(matchId, userId) {
        if (!window.confirm("Are you sure you want to remove this player?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://127.0.0.1:8001/matches/${matchId}/participants/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                showToast("Player removed successfully", "success");
                fetchMyOrganizedGames(); // Refresh list
            } else {
                const err = await res.json();
                showToast("Error: " + (err.detail || "Failed to remove player"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", "error");
        }
    }

    async function handleRemoveTeamB(matchId) {
        if (!window.confirm("Are you sure you want to remove the opposing team?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://127.0.0.1:8001/matches/${matchId}/team-b`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                showToast("Opposing team removed successfully", "success");
                fetchMyOrganizedGames(); // Refresh list
            } else {
                const err = await res.json();
                showToast("Error: " + (err.detail || "Failed to remove team"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", "error");
        }
    }

    async function handleDeleteMatch(matchId) {
        if (!window.confirm("⚠️ Are you sure you want to DELETE this match? This action cannot be undone and all participants will be notified via email.")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://127.0.0.1:8001/matches/${matchId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                showToast("Match deleted successfully", "success");
                fetchMyOrganizedGames(); // Refresh list
            } else {
                const err = await res.json();
                showToast("Error: " + (err.detail || "Failed to delete match"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", "error");
        }
    }

    if (loading) return <div className="organized-games-page">Loading...</div>;

    return (
        <div className="organized-games-page">
            <h1>My Organized Games</h1>

            {myMatches.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <p>You haven't organized any matches yet.</p>
                    <button onClick={() => navigate("/add")} className="add-btn">
                        Create a Match
                    </button>
                </div>
            ) : (
                <div className="games-list">
                    {myMatches.map((match) => (
                        <div key={match.id} className="game-card" style={{ borderColor: "#2196F3", cursor: "default", position: "relative" }}>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteMatch(match.id)}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    background: "#d32f2f",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "bold"
                                }}
                                title="Delete this match"
                            >
                                🗑️ Delete
                            </button>

                            <h2>{match.title}</h2>
                            <p><strong>Date:</strong> {match.date} at {match.start_time}</p>
                            <p><strong>City:</strong> {match.city}</p>
                            <p><strong>Players:</strong> {match.participants ? match.participants.length : 0} / {match.nb_players}</p>

                            <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                                {match.is_team_match ? (
                                    <div className="team-match-participants">
                                        <div className="team-section">
                                            <h3>Your Team (Team A): {match.team_a?.name}</h3>
                                            <ul style={{ listStyle: "none", paddingLeft: "15px", marginTop: "5px" }}>
                                                {match.team_a?.members?.map(m => (
                                                    <li key={m.id} style={{ fontSize: "14px", color: "#555" }}>
                                                        - {m.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="team-section" style={{ marginTop: "15px" }}>
                                            <h3>Opponent (Team B):</h3>
                                            {match.team_b ? (
                                                <div style={{ background: "#fff3e0", padding: "10px", borderRadius: "5px", border: "1px solid #ffb74d" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>{match.team_b.name}</span>
                                                        <button
                                                            onClick={() => handleRemoveTeamB(match.id)}
                                                            style={{ background: "#ff4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                                                        >
                                                            Remove Team
                                                        </button>
                                                    </div>
                                                    <ul style={{ listStyle: "none", paddingLeft: "15px", marginTop: "5px" }}>
                                                        {match.team_b.members?.map(m => (
                                                            <li key={m.id} style={{ fontSize: "14px", color: "#555" }}>
                                                                - {m.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p style={{ fontStyle: "italic", color: "#888" }}>Waiting for opponent...</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <strong>Participants:</strong>
                                        {match.participants && match.participants.length > 0 ? (
                                            <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                                                {match.participants.map(p => (
                                                    <li key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", background: "#f9f9f9", padding: "5px", borderRadius: "4px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            {p.image_url ? (
                                                                <img
                                                                    src={`${p.image_url}?t=${Date.now()}`}
                                                                    alt={p.full_name}
                                                                    style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                                                                    👤
                                                                </div>
                                                            )}
                                                            <span
                                                                style={{ cursor: "pointer", textDecoration: "underline", color: "#333" }}
                                                                onClick={() => navigate(`/profile/${p.id}`)}
                                                            >
                                                                {p.full_name || p.email}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveParticipant(match.id, p.id)}
                                                            style={{ background: "#ff4444", color: "white", border: "none", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{ fontSize: "14px", color: "#888" }}>No participants yet.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
