import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import "./myOrganizedGames.css"; // Reusing styles for now

export default function MyTeams() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    // New Team Form
    const [newTeamName, setNewTeamName] = useState("");
    const [members, setMembers] = useState([{ name: "", email: "" }]);

    useEffect(() => {
        fetchTeams();
    }, []);

    async function fetchTeams() {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://127.0.0.1:8001/teams/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function handleAddMemberField() {
        setMembers([...members, { name: "", email: "" }]);
    }

    function handleMemberChange(index, field, value) {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    }

    function handleRemoveMemberField(index) {
        const newMembers = [...members];
        newMembers.splice(index, 1);
        setMembers(newMembers);
    }

    async function handleCreateTeam(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        // Filter out empty members
        const validMembers = members.filter(m => m.name.trim() !== "");

        try {
            const res = await fetch("http://127.0.0.1:8001/teams/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newTeamName,
                    members: validMembers
                })
            });

            if (res.ok) {
                showToast("Team created successfully!", "success");
                setIsCreating(false);
                setNewTeamName("");
                setMembers([{ name: "", email: "" }]);
                fetchTeams();
            } else {
                const err = await res.json();
                showToast("Error: " + (err.detail || "Failed to create team"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", "error");
        }
    }

    return (
        <div className="page">
            <h1>My Teams</h1>

            {!isCreating ? (
                <button className="add-btn" onClick={() => setIsCreating(true)} style={{ marginBottom: "20px" }}>
                    + Create New Team
                </button>
            ) : (
                <div className="card" style={{ maxWidth: "600px", margin: "0 auto 20px" }}>
                    <h2>Create Team</h2>
                    <form onSubmit={handleCreateTeam}>
                        <label>
                            Team Name:
                            <input
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                required
                                placeholder="e.g. Red Dragons"
                            />
                        </label>

                        <h3>Members</h3>
                        <p style={{ fontSize: "12px", color: "#666" }}>
                            Add members by Name (required). If they have an app account, add their Email too.
                        </p>

                        {members.map((member, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    placeholder="Name (e.g. Bob)"
                                    value={member.name}
                                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="Email (Optional)"
                                    value={member.email}
                                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                                />
                                {members.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveMemberField(index)} style={{ background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}>
                                        X
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" onClick={handleAddMemberField} style={{ background: "#eee", color: "#333", border: "none", padding: "5px 10px", borderRadius: "4px", marginBottom: "15px" }}>
                            + Add Member
                        </button>

                        <div className="btns">
                            <button type="button" onClick={() => setIsCreating(false)} style={{ background: "#ccc" }}>Cancel</button>
                            <button type="submit">Save Team</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="games-list">
                {teams.length === 0 && !isCreating && <p>You haven't created any teams yet.</p>}

                {teams.map(team => (
                    <div key={team.id} className="game-card">
                        <h2>{team.name}</h2>
                        <p><strong>Captain:</strong> You</p>
                        <p><strong>Members ({team.members.length}):</strong></p>
                        <ul style={{ paddingLeft: "20px" }}>
                            {team.members.map(m => (
                                <li key={m.id}>
                                    {m.name} {m.user_id ? "✅ (App User)" : "(Non-App)"}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
