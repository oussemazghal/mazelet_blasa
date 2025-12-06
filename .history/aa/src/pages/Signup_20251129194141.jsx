import { useState } from "react";
import "./Signup.css";
import loginImg from "../images/login.jpg";

export default function Signup() {

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
    age: "",
    file: null
  });

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.cpassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("full_name", formData.username);
    data.append("phone", formData.phone);
    data.append("age", formData.age);
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/users/", {
        method: "POST",
        body: data, // FormData sets Content-Type automatically
      });

      if (response.ok) {
        alert("Compte créé avec succès !");
        window.location.href = '/login';
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
      <h1>Sign Up</h1>

      {/* ⭐ Wrapper contenant formulaire + image */}
      <div className="form-wrapper">

        <form className="simple-form" onSubmit={handleSubmit}>

          <label>
            Username:
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>

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
              placeholder="Enter a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Confirm Password:
            <input
              type="password"
              name="cpassword"
              placeholder="Confirm your password"
              value={formData.cpassword}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone Number:
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Age:
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              required
              min="10"
              max="100"
            />
          </label>

          <label>
            Profile Picture:
            <input
              type="file"
              name="file"
              onChange={handleChange}
              accept="image/*"
            />
          </label>

          <button type="submit">Create Account</button>

          <div className="login-text">
            Already have an account? <a href="/login">Log in</a>
          </div>
        </form>


        <img src={loginImg} className="login-image" alt="login visual" />

      </div>
    </div >
  );
}
