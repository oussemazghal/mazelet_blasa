import { useState } from "react";
import "./signin.css";
import signinImg from "../images/signin.jpg";

export default function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Create FormData for OAuth2 password flow
    const loginData = new FormData();
    loginData.append("username", formData.email); // FastAPI expects 'username', we use email
    loginData.append("password", formData.password);

    try {
      const response = await fetch("http://127.0.0.1:8001/auth/login", {
        method: "POST",
        body: loginData, // No Content-Type header needed for FormData
      });

      if (response.ok) {
        const data = await response.json();
        // Store token
        localStorage.setItem("token", data.access_token);
        alert("Login successful!");
        // Redirect to profile
        window.location.href = '/profile';
      } else {
        const errorData = await response.json();
        alert("Erreur : " + errorData.detail);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Impossible de contacter le serveur.");
    }
  }

  return (
    <div className="page">
      <h1>Log In</h1>

      {/* ⭐ LE WRAPPER QUI GÈRE L'ORDRE */}
      <div className="signin-wrapper">

        {/* FORMULAIRE À GAUCHE */}
        <form className="simple-form" onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Log In</button>

          <div className="signup-text">
            Don't have an account? <a href="/signup">Sign up!</a>
          </div>
        </form>

        {/* IMAGE À DROITE (IMPORTANT: APRÈS LE FORM !) */}
        <img src={signinImg} className="login-image" alt="signin" />

      </div>
    </div>
  );
}
