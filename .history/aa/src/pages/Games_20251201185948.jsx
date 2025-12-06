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
    return (
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

  function isUserJoined(match) {
    if (!user) return false;
    if (!match.participants) return false;
    return match.participants.some(p => (p.id === user.id || p === user.id));
  }

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
          // Show recommendations
          recommendations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>Aucune recommandation disponible. Participez à des matchs pour obtenir des recommandations personnalisées !</p>
            </div>
          ) : (
            recommendations.map((rec) => {
              const match = rec.match;
              const joined = isUserJoined(match);
              const spotsLeft = match.nb_players - (match.participants ? match.participants.length : 0);

              return (
                <div key={match.id} className="game-card" style={{ border: "2px solid #667eea", position: "relative" }}>
                  {/* Badge de recommandation */}
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
                    {Math.round(rec.similarity_score * 100)}% match
                  </div>

                  <h2>{match.title}</h2>
                  <p style={{ fontSize: "13px", color: "#667eea", fontStyle: "italic", marginBottom: "8px" }}>
                    💡 {rec.reason}
                  </p>
                  <p>
                    <strong>Organizer:</strong>{" "}
                    <span
                      style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => navigate(`/profile/${match.organizer_id}`)}
                    >
                      {match.organizer_name || "Unknown"}
                    </span>
                  </p>
                  <p><strong>Type:</strong> {match.type_match}</p>
                  <p><strong>City:</strong> {match.city}</p>
                  <p><strong>Date:</strong> {match.date}</p>
                  <p><strong>Price:</strong> {match.price_per_player} DT</p>
                  <p><strong>Age:</strong> {match.min_age} - {match.max_age} years</p>
                  <p><strong>Spots Left:</strong> {spotsLeft >= 0 ? spotsLeft : 0} / {match.nb_players}</p>

                  {joined ? (
                    <button className="join-btn joined" disabled>Joined ✅</button>
                  ) : (
                    <button
                      className="join-btn"
                      onClick={() => handleJoin(match.id)}
                      disabled={spotsLeft <= 0}
                    >
                      {spotsLeft <= 0 ? "Full ❌" : "Join Game"}
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          // Show filtered games (original logic)
          filteredGames.map((match) => {
            const joined = isUserJoined(match);
            // Calculate remaining spots if nb_players and participants exist
            const spotsLeft = match.nb_players - (match.participants ? match.participants.length : 0);

            return (
              <div key={match.id} className="game-card">
                <h2>{match.title}</h2>
                <p>
                  <strong>Organizer:</strong>{" "}
                  <span
                    style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate(`/profile/${match.organizer_id}`)}
                  >
                    {match.organizer_name || "Unknown"}
                  </span>
                </p>
                <p><strong>Type:</strong> {match.type_match}</p>
                <p><strong>City:</strong> {match.city}</p>
                <p><strong>Date:</strong> {match.date}</p>
                <p><strong>Price:</strong> {match.price_per_player} DT</p>
                <p><strong>Age:</strong> {match.min_age} - {match.max_age} years</p>
                <p><strong>Spots Left:</strong> {spotsLeft >= 0 ? spotsLeft : 0} / {match.nb_players}</p>

                {joined ? (
                  <button className="join-btn joined" disabled>Joined ✅</button>
                ) : (
                  <button
                    className="join-btn"
                    onClick={() => handleJoin(match.id)}
                    disabled={spotsLeft <= 0}
                  >
                    {spotsLeft <= 0 ? "Full ❌" : "Join Game"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
