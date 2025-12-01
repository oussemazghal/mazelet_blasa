import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        age: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetch("http://127.0.0.1:8001/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFormData({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    age: data.age || ""
                });
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
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
                alert("Profile updated!");
                const updated = await res.json();
                setUser(updated);
            } else {
                alert("Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating profile");
        }
    };

    if (!user) return <div className="profile-page"><p>Loading...</p></div>;

    return (
        <div className="profile-page">
            <h2>My Profile</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
                <label>Full Name
                    <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                </label>
                <label>Email
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>Phone
                    <input name="phone" value={formData.phone} onChange={handleChange} required />
                </label>
                <label>Age
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                </label>
                <button type="submit" className="btn-save">Save Changes</button>
            </form>
        </div>
    );
}
