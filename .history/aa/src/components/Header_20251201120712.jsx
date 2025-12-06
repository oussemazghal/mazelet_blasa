import './Header.css'
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <header className="header">
      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => navigate("/games")}>Games</button>
      <button onClick={() => navigate("/aboutus")}>About us</button>

      {token ? (
        <>
          <button onClick={() => navigate("/my-games")}>My Games</button>
          <button onClick={() => navigate("/my-organized-games")}>My Organized Games</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </>
      ) : (
        <button onClick={() => navigate("/login")}>Log in</button>
      )}

    </header>
  );
}
