import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
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
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch profile");
                return res.json();
            })
            .then(data => {
                setUser(data);
                setFormData({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    age: data.age || "",
                    image_url: data.image_url || ""
                });
            })
            .catch(err => {
                console.error(err);
                navigate("/signin");
            });
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://127.0.0.1:8001/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating profile");
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <img
                        src={user.image_url || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="profile-img"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                    />
                    <h1>{user.full_name}</h1>
                    <p>{user.email}</p>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn">Save Changes</button>
                            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-details">
                        <div className="detail-item">
                            <strong>Phone:</strong> {user.phone || "Not set"}
                        </div>
                        <div className="detail-item">
                            <strong>Age:</strong> {user.age || "Not set"}
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    </div>
                )}
            </div>
        </div>
    );
}
