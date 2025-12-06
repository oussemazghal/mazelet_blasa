import './Header.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';

export default function Header() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="Mazelet Blasa Logo" className="logo-img" />
        <span className="site-title">Mazelet Blasa</span>
      </div>

      <nav className="nav-links">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/games")}>Games</button>
        <button onClick={() => navigate("/aboutus")}>About us</button>

        {token ? (
          <>
            <button onClick={() => navigate("/my-games")}>My Games</button>
            <button onClick={() => navigate("/my-organized-games")}>My Organized Games</button>
            <button onClick={() => navigate("/my-teams")}>My Teams</button>
            <button onClick={() => navigate("/profile")}>
              {user?.full_name || "Profile"}
            </button>
            <button onClick={handleLogout} style={{ color: "#ff6b6b" }}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Log in</button>
        )}
      </nav>
    </header>
  );
}
