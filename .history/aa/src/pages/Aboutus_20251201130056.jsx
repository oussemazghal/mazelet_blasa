import "./Aboutus.css";

export default function Aboutus() {
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

                    <form className="feedback-form" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = {
                            name: formData.get("name"),
                            email: formData.get("email"),
                            message: formData.get("message")
                        };

                        try {
                            const res = await fetch("http://127.0.0.1:8001/feedback/", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(data)
                            });
                            if (res.ok) {
                                alert("Thank you for your feedback!");
                                e.target.reset();
                            } else {
                                alert("Failed to send feedback.");
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Error sending feedback.");
                        }
                    }}>
                        <label>Your Name
                            <input name="name" type="text" placeholder="Enter your name" required />
                        </label>

                        <label>Your Email
                            <input name="email" type="email" placeholder="Enter your email" required />
                        </label>

                        <label>Your Message
                            <textarea name="message" placeholder="Describe your issue or suggestion..." required />
                        </label>

                        <button type="submit" className="feedback-btn">
                            Send Feedback
                        </button>
                    </form>
                </div>

            </div>

        </div>
    );
}
