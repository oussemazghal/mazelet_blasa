import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * ProtectedRoute Component
 * Protège les routes qui nécessitent une authentification
 * Vérifie la validité du token auprès du backend
 * Redirige vers /login si le token est invalide ou expiré
 */
const ProtectedRoute = ({ children }) => {
    const [isValid, setIsValid] = useState(null); // null = loading, true = valid, false = invalid
    const token = localStorage.getItem("token");

    useEffect(() => {
        async function validateToken() {
            if (!token) {
                setIsValid(false);
                return;
            }

            try {
                const res = await fetch("http://127.0.0.1:8001/users/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    setIsValid(true);
                } else {
                    // Token expired or invalid - clear it
                    console.log("Token expired or invalid, logging out...");
                    localStorage.removeItem("token");
                    setIsValid(false);
                }
            } catch (error) {
                console.error("Token validation error:", error);
                // Network error - allow access but don't clear token
                setIsValid(true);
            }
        }

        validateToken();
    }, [token]);

    // Loading state
    if (isValid === null) {
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

    // Invalid token - redirect to login
    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    // Valid token - show protected content
    return children;
};

export default ProtectedRoute;
