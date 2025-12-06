import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validate token and fetch user on mount or token change
    useEffect(() => {
        async function validateAndFetchUser() {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://127.0.0.1:8001/users/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    // Token expired or invalid
                    console.log("Token expired or invalid, logging out...");
                    logout();
                }
            } catch (error) {
                console.error("Auth validation error:", error);
                // On network error, keep token but set user to null
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        validateAndFetchUser();
    }, [token]);

    function login(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    // Refresh user data (useful after profile updates)
    async function refreshUser() {
        if (!token) return null;

        try {
            const res = await fetch("http://127.0.0.1:8001/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
        return null;
    }

    const value = {
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
