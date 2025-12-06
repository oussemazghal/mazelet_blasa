import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tunisianCities } from "../constants";
import "./games.css";
import { useToast } from "../context/ToastContext";

export default function Games() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommended, setShowRecommended] = useState(false);
  const [myTeams, setMyTeams] = useState([]);

  // ⭐ State to track which matches have participants view expanded
  const [expandedMatches, setExpandedMatches] = useState({});

  // Join Team Match Modal
  const [showTeamJoinModal, setShowTeamJoinModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(function () {
    async function loadData() {
      try {
        // 1. Fetch Matches with upcoming_only=true
        const resMatches = await fetch("http://127.0.0.1:8001/matches/?upcoming_only=true");
        const dataMatches = await resMatches.json();

        // 2. Fetch Current User (if logged in)
        const token = localStorage.getItem("token");
        let currentUser = null;
        if (token) {
          const resUser = await fetch("http://127.0.0.1:8001/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resUser.ok) {
            currentUser = await resUser.json();
          }

          // 3. Fetch My Teams
          const resTeams = await fetch("http://127.0.0.1:8001/teams/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resTeams.ok) {
            setMyTeams(await resTeams.json());
          }
        }

        if (Array.isArray(dataMatches)) {
          setGames(dataMatches);
        } else {
          console.error("Expected array of matches, got:", dataMatches);
          setGames([]);
        }
        setUser(currentUser);

      } catch (err) {
        console.error("Error loading data:", err);
      }
    }

    loadData();
  }, []);

  // Fetch recommendations
  async function loadRecommendations() {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Vous devez être connecté pour voir les recommandations !", "info");
      navigate("/signin");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8001/recommendations/?limit=10", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
        setShowRecommended(true);
      } else {
        showToast("Erreur lors du chargement des recommandations", "error");
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      showToast("Erreur de connexion", "error");
    }
  }

  // ⭐ États des filtres
  const [filters, setFilters] = useState({
    typeMatch: "",
    matchMode: "", // New Filter
    city: "",
    maxPrice: "",
    date: ""
  });

  // ⭐ Fonction pour mettre à jour un filtre
  function handleFilter(e) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  }

  // ⭐ Appliquer les filtres
  const filteredGames = games.filter((g) => {
    // Match Mode Logic
    const modeMatch = filters.matchMode === ""
      ? true
      : filters.matchMode === "team"
        ? g.is_team_match
        : !g.is_team_match;

    return (
      modeMatch &&
      (filters.typeMatch === "" || g.type_match === filters.typeMatch) &&
      (filters.city === "" || g.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (filters.maxPrice === "" || g.price_per_player <= Number(filters.maxPrice)) &&
      (filters.date === "" || g.date === filters.date)
    );
  });

  // ⭐ Handle Join/Leave
  async function handleJoin(matchId) {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to join a game!", "info");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8001/matches/${matchId}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast("Successfully joined the match!", "success");
        // Reload data to update UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const err = await res.json();
        showToast("Error: " + (err.detail || "Could not join match"), "error");
      }
    } catch (error) {
      console.error("Join error:", error);
      showToast("Failed to join match", "error");
    }
  }

  // Handle Team Join
  function openTeamJoinModal(matchId) {
    if (myTeams.length === 0) {
      showToast("You need to create a team first!", "info");
      navigate("/my-teams");
      return;
    }
    setSelectedMatchId(matchId);
    setShowTeamJoinModal(true);
  }

  async function handleJoinAsTeam() {
    if (!selectedTeamId) {
      showToast("Please select a team", "error");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8001/matches/${selectedMatchId}/join?team_id=${selectedTeamId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast("Successfully joined as Team B!", "success");
        setShowTeamJoinModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const err = await res.json();
        showToast("Error: " + (err.detail || "Could not join match"), "error");
      }
    } catch (error) {
      console.error("Join error:", error);
      showToast("Failed to join match", "error");
    }
  }

  function isUserJoined(match) {
    if (!user) return false;
    // Individual check
    if (match.participants && match.participants.some(p => (p.id === user.id || p === user.id))) return true;

    // Team check (if user is captain of team A or B)
    if (match.is_team_match) {
      if (match.team_a && match.team_a.captain_id === user.id) return true;
      if (match.team_b && match.team_b.captain_id === user.id) return true;
    }
    return false;
  }

  function toggleParticipants(matchId) {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  }

  const renderMatchCard = (match, isRecommendation = false, recData = null) => {
    const joined = isUserJoined(match);
    const spotsLeft = match.nb_players - (match.participants ? match.participants.length : 0);
    const isExpanded = expandedMatches[match.id];

    return (
      <div key={match.id} className="game-card" style={isRecommendation ? { border: "2px solid #667eea", position: "relative" } : {}}>
        {isRecommendation && (
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {Math.round(recData.similarity_score * 100)}% match
          </div>
        )}

        {match.is_team_match && (
          <div style={{
            background: "#ff9800",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "4px",
            display: "inline-block",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            Team Match 🛡️
          </div>
        )}

        <h2>{match.title}</h2>
        {isRecommendation && (
          <p style={{ fontSize: "13px", color: "#667eea", fontStyle: "italic", marginBottom: "8px" }}>
            style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate(`/profile/${match.organizer_id}`)}
            >
            {match.organizer_name || "Unknown"}
          </span>
          </p>
    )
  }

        <p><strong>Type:</strong> {match.type_match}</p>
        <p><strong>City:</strong> {match.city}</p>
        <p><strong>Date:</strong> {match.date}</p>
        <p><strong>Price:</strong> {match.price_per_player} DT</p>
        <p><strong>Age:</strong> {match.min_age} - {match.max_age} years</p>

  {
    !match.is_team_match && (
      <p><strong>Spots Left:</strong> {spotsLeft >= 0 ? spotsLeft : 0} / {match.nb_players}</p>
    )
  }

  {/* ⭐ Participants Toggle */ }
  <div style={{ margin: "10px 0" }}>
    <button
      onClick={() => toggleParticipants(match.id)}
      style={{
        background: "none",
        border: "none",
        color: "#2196F3",
        cursor: "pointer",
        fontSize: "14px",
        textDecoration: "underline",
        padding: 0
      }}
    >
      {isExpanded ? "Hide Players ▲" : `View Players/Teams ▼`}
    </button>

    {isExpanded && (
      <div style={{ marginTop: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "5px" }}>
        {match.is_team_match ? (
          <>
            <h4>{match.team_a?.name} Roster:</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px 0" }}>
              {match.team_a?.members.map(m => (
                <li key={m.id}>- {m.name}</li>
              ))}
            </ul>
            {match.team_b && (
              <>
                <h4>{match.team_b.name} Roster:</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {match.team_b.members.map(m => (
                    <li key={m.id}>- {m.name}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          match.participants && match.participants.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {match.participants.map(p => (
                <li key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {p.image_url ? (
                    <img
                      src={`${p.image_url}?t=${Date.now()}`}
                      alt={p.full_name}
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                      👤
                    </div>
                  )}
                  <span
                    style={{ fontSize: "14px", cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${p.id}`)}
                  >
                    {p.full_name || p.email}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>No players yet.</p>
          )
        )}
      </div>
    )}
  </div>

  {
    joined ? (
      <button className="join-btn joined" disabled>Joined ✅</button>
    ) : (
      match.is_team_match ? (
        <button
          className="join-btn"
          onClick={() => openTeamJoinModal(match.id)}
          disabled={!!match.team_b_id} // Disable if Team B already exists
          style={{ background: match.team_b_id ? "#ccc" : "#ff9800" }}
        >
          {match.team_b_id ? "Match Full ❌" : "Join with Team 🛡️"}
        </button>
      ) : (
        <button
          className="join-btn"
          onClick={() => handleJoin(match.id)}
          disabled={spotsLeft <= 0}
        >
          {spotsLeft <= 0 ? "Full ❌" : "Join Game"}
        </button>
      )
    )
  }
      </div >
    );
};

return (
  <div className="games-page">

    {/* HEADER */}
    <div className="games-header">
      <h1>{showRecommended ? "Recommandé pour vous ⭐" : "Available Games"}</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className={showRecommended ? "add-btn" : "recommend-btn"}
          onClick={() => {
            if (showRecommended) {
              setShowRecommended(false);
            } else {
              loadRecommendations();
            }
          }}
          style={{
            background: showRecommended ? "#9c27b0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.3s ease"
          }}
        >
          {showRecommended ? "← Tous les matchs" : "⭐ Recommandé pour vous"}
        </button>
        <button className="add-btn" onClick={() => navigate("/add")}>
          + Add Game
        </button>
      </div>
    </div>

    {/* ⭐ ZONE FILTRES */}
    <div className="filters-box">
      {/* New Match Mode Filter */}
      <select name="matchMode" onChange={handleFilter}>
        <option value="">All Modes</option>
        <option value="individual">Individual / Mix</option>
        <option value="team">Team vs Team</option>
      </select>

      <select name="typeMatch" onChange={handleFilter}>
        <option value="">All Types</option>
        <option value="5v5">5v5</option>
        <option value="7v7">7v7</option>
        <option value="9v9">9v9</option>
        <option value="11v11">11v11</option>
      </select>

      {/* ⭐ CITY SELECT */}
      <select name="city" onChange={handleFilter}>
        <option value="">All Cities</option>
        {Object.keys(tunisianCities).map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      <input
        type="number"
        name="maxPrice"
        placeholder="Max price (DT)"
        onChange={handleFilter}
      />

      <input
        type="date"
        name="date"
        onChange={handleFilter}
      />
    </div>

    {/* LISTE FILTRÉE OU RECOMMANDÉE */}
    <div className="games-list">
      {showRecommended ? (
        recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>Aucune recommandation disponible. Participez à des matchs pour obtenir des recommandations personnalisées !</p>
          </div>
        ) : (
          recommendations.map((rec) => renderMatchCard(rec.match, true, rec))
        )
      ) : (
        filteredGames.map((match) => renderMatchCard(match))
      )}
    </div>

    {/* TEAM JOIN MODAL */}
    {showTeamJoinModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Join as a Team</h3>
          <p>Select which team you want to bring to this match:</p>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
          >
            <option value="">-- Select Team --</option>
            {myTeams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <div className="btns" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowTeamJoinModal(false)} style={{ background: "#ccc" }}>Cancel</button>
            <button onClick={handleJoinAsTeam} style={{ background: "#ff9800", color: "white" }}>Join Match</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
