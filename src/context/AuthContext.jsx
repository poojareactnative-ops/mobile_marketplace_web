'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage and sync with Supabase
  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem('smartfix_session_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.role === 'SELLER' && parsed?.email) {
            const pwdInfo = await supabaseService.getSellerPasswordInfo(parsed.email);
            parsed.isDefaultPassword = pwdInfo.isDefault;
          }
          if (parsed?.role === 'ADMIN' && (parsed?.id || parsed?.email)) {
            const freshStatus = await supabaseService.getProfileStatus(parsed.id || parsed.email);
            if (freshStatus && freshStatus !== parsed.status) {
              parsed.status = freshStatus;
              saveUserSession(parsed);
            }
          }
          setUser(parsed);
        }
      } catch (e) {
        console.warn('Session load notice:', e);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
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

  // Re-sync current session from Supabase
  const refreshSession = async () => {
    try {
      const saved = localStorage.getItem('smartfix_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id || parsed?.email) {
          const freshStatus = await supabaseService.getProfileStatus(parsed.id || parsed.email);
          if (freshStatus) {
            parsed.status = freshStatus;
            saveUserSession(parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('refreshSession notice:', e);
    }
    return user;
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

  // 1b. Dedicated Super Admin Login
  const superAdminLogin = async (email, password) => {
    setLoading(true);
    try {
      const authenticatedUser = await supabaseService.superAdminLogin(email, password);
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

  // 3. Update / Reset Password (for Sellers with default password)
  const updatePassword = async (currentPassword, newPassword) => {
    if (!user || !user.email) {
      throw new Error('No authenticated user session found.');
    }
    const res = await supabaseService.updateSellerPassword(user.email, currentPassword, newPassword);
    const updatedUser = {
      ...user,
      isDefaultPassword: false,
    };
    saveUserSession(updatedUser);
    return res;
  };

  // 4. Logout (Clears user session and redirects to home screen)
  const logout = (redirectPath = '/') => {
    saveUserSession(null);
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  };

  const value = {
    user,
    role: user?.role || 'GUEST',
    isAuthenticated: !!user,
    isDefaultPassword: !!user?.isDefaultPassword,
    loading,
    login,
    superAdminLogin,
    register,
    updatePassword,
    logout,
    refreshSession,
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
