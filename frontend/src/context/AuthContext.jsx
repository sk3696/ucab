import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Localization & Theming states
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Set default auth header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync language setting
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadUser = async (userToken) => {
    const activeToken = userToken || token;
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
      const response = await axios.get(`${API_URL}/me`);
      setUser(response.data);
    } catch (err) {
      console.error('Error loading user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);
    try {
      // Explicitly lowercase and trim email on client side for maximum compatibility
      const sanitizedEmail = email.toLowerCase().trim();
      const response = await axios.post(`${API_URL}/login`, { email: sanitizedEmail, password });
      const { token: userToken, ...userData } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('token', userToken);
      } else {
        sessionStorage.setItem('token', userToken);
        localStorage.removeItem('token');
      }
      setToken(userToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Explicitly lowercase and trim email on client side before registering
      const sanitizedData = {
        ...userData,
        email: userData.email.toLowerCase().trim()
      };
      const response = await axios.post(`${API_URL}/register`, sanitizedData);
      const { token: userToken, ...registeredData } = response.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(registeredData);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        loadUser,
        language,
        toggleLanguage,
        theme,
        toggleTheme,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
