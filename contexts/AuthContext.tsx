// contexts/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const BASE_URL = 'http://192.168.3.115:8085'; // Updated to match your debug logs

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 Initializing auth...');
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 Found stored user data:', parsedUser.username);
        
        // Validate token with backend
        const isValid = await validateToken(token);
        if (isValid) {
          console.log('✅ Token is valid, user logged in');
          setUser({ ...parsedUser, token });
        } else {
          console.log('❌ Token is invalid, clearing storage');
          await clearAuthData();
        }
      } else {
        console.log('ℹ️ No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      console.log('🔍 Validating token...');
      const response = await fetch(`${BASE_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const isValid = response.ok;
      console.log(isValid ? '✅ Token valid' : '❌ Token invalid');
      return isValid;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  };

  const saveAuthData = async (userData: User) => {
    try {
      console.log('💾 Saving auth data for:', userData.username);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, userData.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
      }));
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      throw error;
    }
  };

  const clearAuthData = async () => {
    try {
      console.log('🗑️ Clearing auth data');
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', username);
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.userId,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        token: data.token,
      };

      await saveAuthData(userData);
      setUser(userData);
      console.log('✅ Login successful for:', username);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    try {
      console.log('📝 Attempting registration for:', username);
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          displayName: displayName || username 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Registration failed`);
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.userId,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        token: data.token,
      };

      await saveAuthData(userData);
      setUser(userData);
      console.log('✅ Registration successful for:', username);
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      // Optional: Call backend logout endpoint
      if (user?.token) {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(error => console.warn('Logout API call failed:', error));
      }
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
    } finally {
      await clearAuthData();
      setUser(null);
      console.log('✅ Logout complete');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};