import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiService from '../services/api';

export interface UserProfile {
  id: number;
  name: string;
  bio: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  streak: number;
}

export interface User {
  id: number;
  username: string;
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore auth state on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Try to retrieve stored token
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        apiService.setAuthToken(token);
        // Verify token is still valid
        try {
          const userData = await apiService.verifyToken();
          setUser(userData);
        } catch (error) {
          // Token is invalid, clear it
          await AsyncStorage.removeItem('authToken');
          apiService.setAuthToken(null);
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password });
      
      // Store token for future sessions
      await AsyncStorage.setItem('authToken', response.token);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, name: string) => {
    try {
      setLoading(true);
      const response = await apiService.register({ email, password, username, name });
      
      // Store token for future sessions
      await AsyncStorage.setItem('authToken', response.token);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear stored token and auth state
      await AsyncStorage.removeItem('authToken');
      apiService.setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await apiService.updateProfile(updates);
      setUser(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: user !== null,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
