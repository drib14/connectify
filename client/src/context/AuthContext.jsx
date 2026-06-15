import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        try {
          const response = await API.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load profile:', error.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, refreshToken, ...userData } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', { username, email, password });
      const { token, refreshToken, ...userData } = response.data;
      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refreshToken', refreshToken);
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/users/canvas', profileData);
      setUser((prev) => ({ ...prev, ...response.data }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
