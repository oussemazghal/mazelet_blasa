import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protège les routes qui nécessitent une authentification
 * Utilise AuthContext pour vérifier l'état d'authentification
 */
const ProtectedRoute = ({ children }) => {
    const { token, loading, isAuthenticated } = useAuth();

    // Loading state - auth is being validated
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                paddingTop: '80px'
            }}>
                Loading...
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated - show protected content
    return children;
};

export default ProtectedRoute;
