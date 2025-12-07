import { useState, useEffect } from "react";
import "./aboutus.css";
import { useToast } from "../context/ToastContext";

export default function Aboutus() {
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://127.0.0.1:8001/users/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    return (
        <div className="about-page">

            <div className="about-container">

                <h1>About Us</h1>

                <p className="subtitle">
                    We help football players find and create local matches easily.
                </p>

                <div className="about-content">
                    <p>
                        Our platform makes it easy to organize football games with friends
                        or join matches happening near you. Whether you're a beginner or
                        an experienced player, we bring the community together through sport.
                    </p>

                    <p>
                        If you ever face a problem, have suggestions, or want to help us
                        improve the experience, feel free to send us a message below.
                    </p>
                </div>

                {/* ⭐ Feedback Form */}
                <div className="feedback-section">
                    <h2>Send Us Your Feedback</h2>

                    {!loading && (
                        <form className="feedback-form" onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);

                            const data = {
                                name: user ? user.full_name : formData.get("name"),
                                email: user ? user.email : formData.get("email"),
                                message: formData.get("message")
                            };

                            try {
                                const token = localStorage.getItem("token");
                                const headers = { "Content-Type": "application/json" };
                                if (token) {
                                    headers["Authorization"] = `Bearer ${token}`;
                                }

                                const res = await fetch("http://127.0.0.1:8001/feedback/", {
                                    method: "POST",
                                    headers: headers,
                                    body: JSON.stringify(data)
                                });
                                if (res.ok) {
                                    showToast("Thank you for your feedback!", "success");
                                    e.target.reset();
                                } else {
                                    showToast("Failed to send feedback.", "error");
                                }
                            } catch (err) {
                                console.error(err);
                                showToast("Error sending feedback.", "error");
                            }
                        }}>
                            {!user && (
                                <>
                                    <label>Your Name
                                        <input name="name" type="text" placeholder="Enter your name" required />
                                    </label>

                                    <label>Your Email
                                        <input name="email" type="email" placeholder="Enter your email" required />
                                    </label>
                                </>
                            )}

                            {user && (
                                <p style={{ background: "#e3f2fd", padding: "10px", borderRadius: "8px", marginBottom: "15px" }}>
                                    📧 Sending as <strong>{user.full_name || user.email}</strong>
                                </p>
                            )}

                            <label>Your Message
                                <textarea name="message" placeholder="Describe your issue or suggestion..." required />
                            </label>

                            <button type="submit" className="feedback-btn">
                                Send Feedback
                            </button>
                        </form>
                    )}
                </div>

            </div>

        </div>
    );
}
