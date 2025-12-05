import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config'; // <--- The only "new" thing

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Check session from server
            const response = await axios.get(
                `${API_URL}/auth/check.php`, // <--- Dynamic URL
                { withCredentials: true }
            );

            if (response.data.authenticated && response.data.user) {
                const userData = response.data.user;
                setUser({
                    id: userData.id,
                    email: userData.email,
                    full_name: userData.name,
                    role: userData.role,
                    avatar: userData.avatar
                });
                localStorage.setItem('user', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    full_name: userData.name,
                    role: userData.role,
                    avatar: userData.avatar
                }));
            } else {
                // Clear localStorage if not authenticated
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error) {
            // If API fails (e.g. Docker is down), try localStorage
            console.warn("Auth check failed (using cache):", error.message);
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/login.php`, // <--- Dynamic URL
                { email, password },
                { withCredentials: true }
            );

            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Đăng nhập thất bại'
            };
        }
    };

    const register = async (data) => {
        try {
            await axios.post(`${API_URL}/auth/register.php`, data); // <--- Dynamic URL
            return { success: true };
        } catch (error) {
            return {
                success: false,
                errors: error.response?.data?.errors || { general: 'Đăng ký thất bại' }
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(
                `${API_URL}/auth/logout.php`, // <--- Dynamic URL
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/'; // Added redirect to be safe
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};