import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css"; // Import du CSS de profil
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { showToast } = useToast();
    const { token, user: authUser, logout, refreshUser } = useAuth();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: "",
        phone: "",
        age: "",
        file: null
    });
    const navigate = useNavigate();

    const [myMatches, setMyMatches] = useState([]);
    const [joinedMatches, setJoinedMatches] = useState([]);

    useEffect(function () {
        if (authUser) {
            setUser(authUser);
            setEditData({
                full_name: authUser.full_name || "",
                phone: authUser.phone || "",
                age: authUser.age || "",
                file: null
            });
            fetchMatches(authUser.id);
        }
    }, [authUser]);

    async function fetchMatches(userId) {
        try {
            const resMatches = await fetch("http://127.0.0.1:8001/matches/");
            if (resMatches.ok) {
                const allMatches = await resMatches.json();

                // Filter Organized Matches
                const organized = allMatches.filter(m => m.organizer_id === userId);
                setMyMatches(organized);

                // Filter Joined Matches
                const joined = allMatches.filter(m =>
                    m.participants && m.participants.some(p => (p.id === userId || p === userId))
                );
                setJoinedMatches(joined);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function handleEditChange(e) {
        const { name, value, files } = e.target;
        if (name === "file") {
            setEditData({ ...editData, file: files[0] });
        } else {
            setEditData({ ...editData, [name]: value });
        }
    }

    async function handleSave() {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("full_name", editData.full_name);
        formData.append("phone", editData.phone);
        if (editData.age) {
            formData.append("age", editData.age);
        }
        if (editData.file) {
            formData.append("file", editData.file);
        }

        try {
            const res = await fetch("http://127.0.0.1:8001/users/me", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                showToast("Profile updated!", "success");
                setIsEditing(false);
                refreshUser(); // Refresh user data from AuthContext
            } else {
                showToast("Failed to update profile", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error updating profile", "error");
        }
    }

    if (!user) return <div className="page">Loading...</div>;

    return (
        <div className="page">
            <h1>My Profile</h1>
            <div className="step-box" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

                {/* PROFILE IMAGE */}
                <div style={{ marginBottom: "20px" }}>
                    {user.image_url ? (
                        <img
                            src={`${user.image_url}?t=${Date.now()}`}
                            alt="Profile"
                            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid #4CAF50" }}
                        />
                    ) : (
                        <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ddd", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                            👤
                        </div>
                    )}
                </div>

                <h2>User Information</h2>

                {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
                        <label>
                            Full Name:
                            <input name="full_name" value={editData.full_name} onChange={handleEditChange} />
                        </label>
                        <label>
                            Phone:
                            <input name="phone" value={editData.phone} onChange={handleEditChange} />
                        </label>
                        <label>
                            Age:
                            <input type="number" name="age" value={editData.age} onChange={handleEditChange} />
                        </label>
                        <label>
                            Profile Picture:
                            <input type="file" name="file" onChange={handleEditChange} accept="image/*" />
                        </label>

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            <button onClick={handleSave} style={{ backgroundColor: "#4CAF50", flex: 1 }}>Save</button>
                            <button onClick={() => setIsEditing(false)} style={{ backgroundColor: "#888", flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p><strong>Full Name:</strong> {user.full_name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Age:</strong> {user.age || "Not set"}</p>

                        <button onClick={() => setIsEditing(true)} style={{ marginTop: "20px", backgroundColor: "#2196F3", marginRight: "10px" }}>
                            Edit Profile
                        </button>
                        <button onClick={handleLogout} style={{ marginTop: "10px", backgroundColor: "#ff4444" }}>
                            Logout
                        </button>
                    </>
                )}

                <hr style={{ margin: "40px 0" }} />

                {/* MATCHES SECTION */}
                <div style={{ textAlign: "left" }}>
                    <h3>📅 My Organized Matches</h3>
                    {myMatches.length === 0 ? (
                        <p>You haven't organized any matches yet.</p>
                    ) : (
                        <ul className="match-list">
                            {myMatches.map(m => (
                                <li key={m.id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
                                    <strong>{m.title}</strong> - {m.date} at {m.start_time} ({m.city})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
