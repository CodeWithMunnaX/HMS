import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('carepulse_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('carepulse_token');
          }
        } catch (error) {
          console.warn('[Auth Initialization]: Token expired or invalid');
          localStorage.removeItem('carepulse_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('carepulse_token', res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data?.token) {
      localStorage.setItem('carepulse_token', res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('carepulse_token');
    setUser(null);
  };

  const switchDemoRole = async (roleName) => {
    const roleCredentials = {
      Admin: { email: 'munna@gmail.com', password: 'munna@gmail.com' },
      Doctor: { email: 'sarah.cardio@carepulse.com', password: 'Doctor@123' },
      Receptionist: { email: 'reception@carepulse.com', password: 'Staff@123' },
      Patient: { email: 'alex.johnson@example.com', password: 'Patient@123' },
    };

    const creds = roleCredentials[roleName];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    switchDemoRole,
    updateUser,
    isAdmin: user?.role === 'Admin',
    isDoctor: user?.role === 'Doctor',
    isStaff: user?.role === 'Receptionist' || user?.role === 'Admin',
    isPatient: user?.role === 'Patient',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
