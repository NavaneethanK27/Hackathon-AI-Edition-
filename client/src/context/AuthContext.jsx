import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
          try {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } catch (e) {
            console.warn('Failed to persist user to localStorage:', e.message);
          }
        } else {
          // Token is invalid, wipe storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token, user: loggedUser } = response.data;
        localStorage.setItem('token', token);
        setUser(loggedUser);
        try {
          localStorage.setItem('user', JSON.stringify(loggedUser));
        } catch (e) {
          console.warn('Failed to persist user to localStorage:', e.message);
        }
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Check your inputs.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      if (response.data && response.data.success) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        setUser(newUser);
        try {
          localStorage.setItem('user', JSON.stringify(newUser));
        } catch (e) {
          console.warn('Failed to persist user to localStorage:', e.message);
        }
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Check inputs.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Complete onboarding
  const completeOnboarding = async (onboardingData) => {
    setError(null);
    try {
      const response = await API.put('/auth/onboarding', onboardingData);
      if (response.data && response.data.success) {
        setUser(response.data.user);
        try {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (e) {
          console.warn('Failed to persist user to localStorage:', e.message);
        }
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save onboarding selections.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Gain XP locally (e.g. from Pomodoro focus finishes or quiz score returns)
  const addExperiencePoints = (amount) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const newXP = prev.totalXP + amount;
      const currentLevel = prev.level;
      const xpNeeded = currentLevel * 500;
      
      let newLevel = currentLevel;
      let finalXP = newXP;

      if (newXP >= xpNeeded) {
        newLevel += 1;
        finalXP = newXP - xpNeeded; // overflow
      }

      return {
        ...prev,
        totalXP: finalXP,
        level: newLevel
      };
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    completeOnboarding,
    logout,
    addExperiencePoints,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within an AuthProvider');
  }
  return context;
};
