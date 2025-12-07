import "./Home.css";
import findPlayersImg from "../images/find_players.jpg";
import findGameImg from "../images/find_a_game.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate(); // ⭐ OBLIGATOIRE

  return (
    <div className="home">
      <h1>Welcome to Mazelet blasa!</h1>

      <div className="types">

        <div className="card">
          <img src={findGameImg} alt="find a game" />
          <button onClick={() => navigate("/games")}>
            Find a Game Now!
          </button>
        </div>

        <div className="card">
          <img src={findPlayersImg} alt="find players" />
          <button onClick={() => navigate("/add")}>
            Find Players!
          </button>
        </div>

      </div>
    </div>
  );
}
