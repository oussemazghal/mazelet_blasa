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

  // Team Mode State
  const [matchMode, setMatchMode] = useState("individual"); // "individual" or "team_vs_team"
  const [isTeamMode, setIsTeamMode] = useState(false); // For "Register my Team" in Individual mode
  const [teammateEmails, setTeammateEmails] = useState("");

  // My Teams for Team vs Team
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

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

  // ⭐ Pre-fill organizer info & Fetch Teams
  useEffect(function () {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Load User
          const resUser = await fetch("http://127.0.0.1:8001/users/me", {
            headers: { "Authorization": "Bearer " + token }
          });
          const user = await resUser.json();
          setFormData(function (prev) {
            return {
              ...prev,
              organizerName: user.full_name || "",
              organizerPhone: user.phone || ""
            };
          });

          // Load Teams
          const resTeams = await fetch("http://127.0.0.1:8001/teams/me", {
            headers: { "Authorization": "Bearer " + token }
          });
          if (resTeams.ok) {
            const teams = await resTeams.json();
            setMyTeams(teams);
          }

        } catch (err) {
          console.error("Failed to fetch data", err);
        }
      }
    }
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "city") {
      setFormData({
        ...formData,
        city: value,
        stadiumName: "" // Reset stadium when city changes
      });
    } else if (name === "typeMatch") {
      // ⭐ Auto-fill nbPlayers based on typeMatch
      let players = "";
      if (value === "5v5") players = "10";
      if (value === "7v7") players = "14";
      if (value === "9v9") players = "18";
      if (value === "11v11") players = "22";

      setFormData({
        ...formData,
        typeMatch: value,
        nbPlayers: players
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

    // Parse emails if in Individual Mode + Register Team
    let emailsList = [];
    if (matchMode === "individual" && isTeamMode && teammateEmails.trim()) {
      emailsList = teammateEmails.split(",").map(e => e.trim()).filter(e => e);
    }

    // Validate Team Size for Team vs Team
    if (matchMode === "team_vs_team") {
      if (!selectedTeamId) {
        showToast("Please select a team", "error");
        return;
      }

      const selectedTeam = myTeams.find(t => t.id === parseInt(selectedTeamId));
      if (!selectedTeam) {
        showToast("Selected team not found", "error");
        return;
      }

      // Parse required players from typeMatch (e.g. "5v5" -> 5)
      const requiredPlayers = parseInt(formData.typeMatch.split('v')[0]);

      // Team size = members.length (since captain is included in members list by backend)
      const teamSize = selectedTeam.members ? selectedTeam.members.length : 0;

      if (teamSize !== requiredPlayers) {
        alert(`Your team must have exactly ${requiredPlayers} members (including you) to create a ${formData.typeMatch} match. Currently you have ${teamSize}.`);
        return;
      }
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
      nb_players: matchMode === "team_vs_team" ? parseInt(formData.typeMatch.split('v')[0]) * 2 : parseInt(formData.nbPlayers), // Total players for team match
      price_per_player: parseInt(formData.pricePerPlayer),
      organizer_phone: formData.organizerPhone,
      min_age: parseInt(formData.min_age),
      max_age: parseInt(formData.max_age),

      // New Logic
      is_team_match: matchMode === "team_vs_team",
      my_team_id: matchMode === "team_vs_team" ? parseInt(selectedTeamId) : null,
      teammate_emails: emailsList
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

              {/* Match Mode Toggle */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Match Mode</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className={matchMode === "individual" ? "mode-btn active" : "mode-btn"}
                    onClick={() => setMatchMode("individual")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: matchMode === "individual" ? "2px solid #2196F3" : "1px solid #000000ff",
                      background: matchMode === "individual" ? "#e3f2fd" : "white",
                      color: "black",
                      cursor: "pointer"
                    }}
                  >
                    Individual / Mix
                  </button>
                  <button
                    className={matchMode === "team_vs_team" ? "mode-btn active" : "mode-btn"}
                    onClick={() => setMatchMode("team_vs_team")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: matchMode === "team_vs_team" ? "2px solid #2196F3" : "1px solid #060303ff",
                      background: matchMode === "team_vs_team" ? "#e3f2fd" : "white",
                      color: "black",
                      cursor: "pointer"
                    }}
                  >
                    Team vs Team
                  </button>
                </div>
              </div>

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
                <button onClick={() => {
                  const selectedDate = new Date(formData.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selectedDate < today) {
                    showToast("Date cannot be in the past!", "error");
                    return;
                  }
                  setStep(4);
                }}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="step-box">
              <h2>Step 4 — Players & Price</h2>

              {matchMode !== "team_vs_team" && (
                <>
                  <label>Total Players
                    <input
                      type="number"
                      name="nbPlayers"
                      onChange={handleChange}
                      value={formData.nbPlayers}
                      required
                    />
                  </label>

                  <label>Already Joined
                    <input type="number" name="alreadyJoined" onChange={handleChange} value={formData.alreadyJoined} required />
                  </label>
                </>
              )}

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
              <h2>Step 5 — Organizer & Team</h2>

              <label>Organizer Name
                <input name="organizerName" onChange={handleChange} value={formData.organizerName} required />
              </label>

              <label>Organizer Phone
                <input name="organizerPhone" onChange={handleChange} value={formData.organizerPhone} required />
              </label>

              {matchMode === "individual" ? (
                <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isTeamMode}
                      onChange={(e) => setIsTeamMode(e.target.checked)}
                      style={{ width: "20px", height: "20px" }}
                    />
                    <strong>Register my Team (Find a Counter)</strong>
                  </label>

                  {isTeamMode && (
                    <div style={{ marginTop: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "5px" }}>
                      <p style={{ fontSize: "13px", color: "#666", marginBottom: "5px" }}>
                        Enter teammate emails separated by commas. They must have an account.
                      </p>
                      <textarea
                        placeholder="player1@example.com, player2@example.com..."
                        value={teammateEmails}
                        onChange={(e) => setTeammateEmails(e.target.value)}
                        style={{ width: "100%", height: "80px", padding: "8px" }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <h3>Select Your Team</h3>
                  {myTeams.length > 0 ? (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                    >
                      <option value="">-- Select a Team --</option>
                      {myTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ color: "red", marginTop: "10px" }}>
                      You don't have any teams yet. <a href="/my-teams">Create one here</a>.
                    </div>
                  )}
                </div>
              )}

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
