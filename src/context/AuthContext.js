import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';
import Logger from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (token) {
        const userData = await authAPI.verifyToken();
        setUser(userData.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      Logger.warn('Token verification failed:', error);
      Cookies.remove('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response;
      
      // Store token in httpOnly cookie (recommended for security)
      Cookies.set('auth_token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      Logger.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup(name, email, password);
      const { token, user: userData } = response;
      
      Cookies.set('auth_token', token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      Logger.error('Signup failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      Logger.warn('Logout API call failed:', error);
    }
    
    Cookies.remove('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
