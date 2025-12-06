import { useState, useEffect } from "react";
import "./add.css";
import addImage from "../images/addgame.png"; // ⭐ IMPORT IMAGE
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useToast } from "../context/ToastContext";

import { tunisianCities } from "../constants";

export default function CreateMatch() {
  const { showToast } = useToast();
  const navigate = useNavigate(); // Hook for navigation

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    typeMatch: "",
    stadiumName: "",
    city: "",
    date: "",
    startTime: "",
    endTime: "",
    nbPlayers: "",
    alreadyJoined: "",
    pricePerPlayer: "",
    min_age: "",
    max_age: "",
    organizerName: "",
    organizerPhone: ""
  });

  // ⭐ Pre-fill organizer info
  useEffect(function () {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://127.0.0.1:8001/users/me", {
            headers: {
              "Authorization": "Bearer " + token
            }
          });

          const user = await res.json();

          setFormData(function (prev) {
            return {
              ...prev,
              organizerName: user.full_name || "",
              organizerPhone: user.phone || ""
            };
          });
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      }
    }
    loadUser();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "city") {
      setFormData({
        ...formData,
        city: value,
        stadiumName: "" // Reset stadium when city changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  }

  async function handleCreateMatch() {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to create a match!", "info");
      navigate("/login");
      return;
    }

    // Prepare data for API (snake_case)
    const matchData = {
      title: formData.title,
      description: formData.description,
      type_match: formData.typeMatch,
      city: formData.city,
      stadium: formData.stadiumName,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      nb_players: parseInt(formData.nbPlayers),
      price_per_player: parseInt(formData.pricePerPlayer),
      organizer_phone: formData.organizerPhone,
      min_age: parseInt(formData.min_age),
      max_age: parseInt(formData.max_age)
    };

    try {
      const response = await fetch("http://127.0.0.1:8001/matches/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        showToast("Match created successfully!", "success");
        navigate("/games"); // Redirect to games list
      } else {
        const errorData = await response.json();
        showToast("Error: " + JSON.stringify(errorData.detail), "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      showToast("Failed to connect to server.", "error");
    }
  }

  return (
    <div className="page">

      <h1>Create a Football Match</h1>

      {/* ⭐ NEW: IMAGE + FORM SIDE BY SIDE */}
      <div className="form-layout">

        {/* LEFT IMAGE */}
        <div className="image-box">
          <img src={addImage} alt="Create Match" />
        </div>

        {/* RIGHT FORM */}
        <div className="wizard">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="step-box">
              <h2>Step 1 — Match Info</h2>

              <label>Title
                <input name="title" onChange={handleChange} value={formData.title} required />
              </label>

              <label>Description
                <textarea name="description" onChange={handleChange} value={formData.description} required />
              </label>

              <label>Type of Match
                <select name="typeMatch" onChange={handleChange} value={formData.typeMatch} required>
                  <option value="">Select</option>
                  <option value="5v5">5v5</option>
                  <option value="7v7">7v7</option>
                  <option value="9v9">9v9</option>
                  <option value="11v11">11v11</option>
                </select>
              </label>

              <button onClick={() => setStep(2)}>Next</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="step-box">
              <h2>Step 2 — Stadium & Location</h2>

              <label>City
                <select name="city" onChange={handleChange} value={formData.city} required>
                  <option value="">Select City</option>
                  {Object.keys(tunisianCities).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>

              <label>Stadium Name
                <select
                  name="stadiumName"
                  onChange={handleChange}
                  value={formData.stadiumName}
                  disabled={!formData.city}
                  required
                >
                  <option value="">Select Stadium</option>
                  {formData.city && tunisianCities[formData.city]?.map((stadium) => (
                    <option key={stadium} value={stadium}>{stadium}</option>
                  ))}
                </select>
              </label>

              <div className="btns">
                <button onClick={() => setStep(1)}>Back</button>
                <button onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="step-box">
              <h2>Step 3 — Date & Time</h2>

              <label>Date
                <input type="date" name="date" onChange={handleChange} value={formData.date} required />
              </label>

              <label>Start Time
                <input type="time" name="startTime" onChange={handleChange} value={formData.startTime} required />
              </label>

              <label>End Time
                <input type="time" name="endTime" onChange={handleChange} value={formData.endTime} required />
              </label>

              <div className="btns">
                <button onClick={() => setStep(2)}>Back</button>
                <button onClick={() => setStep(4)}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="step-box">
              <h2>Step 4 — Players & Price</h2>

              <label>Total Players
                <input type="number" name="nbPlayers" onChange={handleChange} value={formData.nbPlayers} required />
              </label>

              <label>Already Joined
                <input type="number" name="alreadyJoined" onChange={handleChange} value={formData.alreadyJoined} required />
              </label>

              <label>Price per Player (DT)
                <input type="number" name="pricePerPlayer" onChange={handleChange} value={formData.pricePerPlayer} required />
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1 }}>
                  Min Age:
                  <input
                    type="number"
                    name="min_age"
                    placeholder="e.g. 18"
                    value={formData.min_age}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Max Age:
                  <input
                    type="number"
                    name="max_age"
                    placeholder="e.g. 40"
                    value={formData.max_age}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="btns">
                <button onClick={() => setStep(3)}>Back</button>
                <button onClick={() => setStep(5)}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="step-box">
              <h2>Step 5 — Organizer</h2>

              <label>Organizer Name
                <input name="organizerName" onChange={handleChange} value={formData.organizerName} required />
              </label>

              <label>Organizer Phone
                <input name="organizerPhone" onChange={handleChange} value={formData.organizerPhone} required />
              </label>

              <div className="btns">
                <button onClick={() => setStep(4)}>Back</button>
                <button onClick={handleCreateMatch}>Create Match</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
