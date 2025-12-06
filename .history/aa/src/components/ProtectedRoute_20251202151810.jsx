import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Protège les routes qui nécessitent une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si token existe, afficher le composant enfant
    return children;
};

export default ProtectedRoute;
