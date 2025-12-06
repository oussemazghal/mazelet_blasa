import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import "./MyTeams.css"; // ⭐ Use new CSS

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
        <div className="my-teams-page">
            <div className="my-teams-header">
                <h1>My Teams</h1>
                {!isCreating && (
                    <button className="create-team-btn" onClick={() => setIsCreating(true)}>
                        + Create New Team
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="create-team-card">
                    <h2>Create Team</h2>
                    <form onSubmit={handleCreateTeam}>
                        <div className="form-group">
                            <label>Team Name</label>
                            <input
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                required
                                placeholder="e.g. Red Dragons"
                            />
                        </div>

                        <h3>Members</h3>
                        <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
                            Add members by Name (required). If they have an app account, add their Email too.
                        </p>

                        {members.map((member, index) => (
                            <div key={index} className="member-row">
                                <input
                                    placeholder="Name (e.g. Bob)"
                                    value={member.name}
                                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                                    required
                                    style={{ flex: 1 }}
                                />
                                <input
                                    placeholder="Email (Optional)"
                                    value={member.email}
                                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                {members.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => handleRemoveMemberField(index)}>
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" className="add-member-btn" onClick={handleAddMemberField}>
                            + Add Member
                        </button>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button type="submit" className="save-btn">Save Team</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="teams-grid">
                {teams.length === 0 && !isCreating && (
                    <div style={{ background: "white", padding: "20px", borderRadius: "10px", textAlign: "center", gridColumn: "1 / -1" }}>
                        <p>You haven't created any teams yet.</p>
                    </div>
                )}

                {teams.map(team => (
                    <div key={team.id} className="team-card">
                        <h2>{team.name}</h2>
                        <div className="team-info">
                            <p><strong>Captain:</strong> You</p>
                            <p><strong>Members:</strong> {team.members.length}</p>
                        </div>
                        <ul className="members-list">
                            {team.members.map(m => (
                                <li key={m.id}>
                                    {m.user_id ? (
                                        <a href={`/profile/${m.user_id}`} className="member-profile-link">
                                            {m.name}
                                        </a>
                                    ) : (
                                        <span>{m.name}</span>
                                    )}
                                    {m.user_id && <span className="app-user-badge">App User</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
