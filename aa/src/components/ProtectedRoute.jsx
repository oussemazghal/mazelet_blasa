import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Composant qui protège les routes nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        // Pas de token = pas connecté, rediriger vers login
        return <Navigate to="/login" replace />;
    }

    // Token présent, afficher le contenu protégé
    return children;
}
