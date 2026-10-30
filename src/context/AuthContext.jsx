'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartfix_session_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Session load notice:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserSession = (userData) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('smartfix_session_user', JSON.stringify(userData));
        // Also set a cookie so Next.js middleware can inspect it
        document.cookie = `smartfix_session_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=604800`;
      } else {
        localStorage.removeItem('smartfix_session_user');
        document.cookie = 'smartfix_session_user=; path=/; max-age=0';
      }
    }
  };

  // 1. Login with email & password
  const login = async (email, password) => {
    setLoading(true);
    try {
      const authenticatedUser = await supabaseService.login(email, password);
      saveUserSession(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  // 2. Register new account
  const register = async (userData) => {
    setLoading(true);
    try {
      const registeredUser = await supabaseService.register(userData);
      saveUserSession(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  // 3. Logout
  const logout = () => {
    saveUserSession(null);
  };

  const value = {
    user,
    role: user?.role || 'GUEST',
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
