import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signin.css";
import signinImg from "../images/signin.jpg";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

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
    console.log("Form submitted", formData);
    setIsLoading(true);

    // Create FormData for OAuth2 password flow
    const loginData = new FormData();
    loginData.append("username", formData.email); // FastAPI expects 'username', we use email
    loginData.append("password", formData.password);

    try {
      console.log("Sending request to http://127.0.0.1:8001/auth/login");
      const response = await fetch("http://127.0.0.1:8001/auth/login", {
        method: "POST",
        body: loginData, // No Content-Type header needed for FormData
      });
      console.log("Response received", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful", data);
        // Use AuthContext login
        login(data.access_token);
        showToast("Login successful!", "success");
        // Redirect to profile
        setTimeout(() => {
          navigate('/profile');
        }, 500);
      } else {
        const errorData = await response.json();
        console.error("Login failed", errorData);
        showToast("Erreur : " + errorData.detail, "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      showToast("Impossible de contacter le serveur.", "error");
      setIsLoading(false);
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

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>

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
