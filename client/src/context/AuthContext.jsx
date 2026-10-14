import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUserData } from '../services/mockData';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devpulse_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return initialUserData;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('devpulse_token') || localStorage.getItem('devpulse_user'));
  });

  const [loading, setLoading] = useState(true);

  // Initialize and verify session on initial load
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('devpulse_token');
      if (token) {
        try {
          const res = await api.auth.getMe(token);
          if (res?.user) {
            setUser(res.user);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.warn('Failed to verify stored auth token:', err);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  // Sync user state changes to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('devpulse_user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.user) {
      if (res.token) {
        localStorage.setItem('devpulse_token', res.token);
      }
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    if (res.user) {
      if (res.token) {
        localStorage.setItem('devpulse_token', res.token);
      }
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const loginWithToken = async (token) => {
    localStorage.setItem('devpulse_token', token);
    const res = await api.auth.getMe(token);
    if (res?.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      return res.user;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('devpulse_token');
    localStorage.removeItem('devpulse_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (updatedFields) => {
    const res = await api.user.updateProfile(updatedFields);
    if (res?.user) {
      setUser(res.user);
    } else {
      setUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const connectPlatform = async (platform, handle) => {
    const res = await api.user.connectPlatform(platform, handle);
    if (res?.user) {
      setUser(res.user);
      return res;
    }

    const pKey = platform.toLowerCase();
    setUser(prev => {
      const nextPlatforms = {
        ...prev.connectedPlatforms,
        [pKey]: {
          ...(prev.connectedPlatforms[pKey] || {}),
          connected: true,
          handle,
          verified: true
        }
      };
      return {
        ...prev,
        connectedPlatforms: nextPlatforms,
        stats: {
          ...prev.stats,
          problemsSolved: prev.stats.problemsSolved + 25,
          totalContributions: prev.stats.totalContributions + 50
        }
      };
    });
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        register,
        loginWithToken,
        logout,
        updateUser,
        connectPlatform
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
