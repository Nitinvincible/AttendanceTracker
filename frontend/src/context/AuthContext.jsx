import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('att_token');
        if (!token) {
            setLoading(false);
            return;
        }
        getMe()
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('att_token');
                localStorage.removeItem('att_user');
            })
            .finally(() => setLoading(false));
    }, []);

    const loginUser = (token, userData) => {
        localStorage.setItem('att_token', token);
        localStorage.setItem('att_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('att_token');
        localStorage.removeItem('att_user');
        localStorage.removeItem('att_theme');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
