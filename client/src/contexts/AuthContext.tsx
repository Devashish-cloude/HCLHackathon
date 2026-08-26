import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  onboardingCompleted: boolean;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: any) => void;
  logout: () => Promise<void>;
  updateOnboardingCompleted: (name: string) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/users/me');
          if (res.data.success && res.data.profile) {
            setUser({
              id: res.data.profile.userId,
              email: res.data.profile.user.email,
              onboardingCompleted: res.data.profile.onboardingCompleted,
              name: res.data.profile.name,
            });
          }
        } catch (err) {
          console.error('Failed to load user profile during initialization', err);
          // Silent failure: api interceptor will handle token refresh if possible, otherwise we logout.
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for global logout events triggered by Axios interceptors on token refresh failure
    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser({
      id: userData.id,
      email: userData.email,
      onboardingCompleted: userData.onboardingCompleted,
      name: userData.name || '',
    });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateOnboardingCompleted = (name: string) => {
    if (user) {
      setUser({
        ...user,
        name,
        onboardingCompleted: true
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateOnboardingCompleted,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
