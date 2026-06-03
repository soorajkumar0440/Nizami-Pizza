import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token and validate
        const checkAuth = async () => {
            const token = localStorage.getItem('nizami_token');
            const savedUser = localStorage.getItem('nizami_user');

            if (token && savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setIsAdmin(parsedUser.role === 'admin' || parsedUser.isAdmin || false);

                    // Validate token with backend
                    const { data } = await authAPI.getMe();
                    setUser(data);
                    setIsAdmin(data.role === 'admin' || data.isAdmin || false);
                    localStorage.setItem('nizami_user', JSON.stringify(data));
                } catch (error) {
                    if (error.response?.status === 401) {
                        localStorage.removeItem('nizami_token');
                        localStorage.removeItem('nizami_user');
                        setUser(null);
                        setIsAdmin(false);
                    } else {
                        console.error('Auth check failed:', error);
                    }
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await authAPI.login(email, password);

            // Save token and user
            localStorage.setItem('nizami_token', data.token);
            localStorage.setItem('nizami_user', JSON.stringify(data));

            setUser(data);
            setIsAdmin(data.role === 'admin' || data.isAdmin || false);

            return { success: true, isAdmin: data.role === 'admin' || data.isAdmin };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await authAPI.signup(name, email, password);

            return { success: true, user: data };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('nizami_token');
        localStorage.removeItem('nizami_user');
    };

    const value = {
        user,
        isAdmin,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
