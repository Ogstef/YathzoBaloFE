// components/AuthWrapper.tsx
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen, RegisterScreen } from '@/screens/AuthScreens';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  console.log('🔐 AuthWrapper state:', { 
    hasUser: !!user, 
    isAuthenticated, 
    loading, 
    showRegister 
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading YathzoBalo...</Text>
        <Text style={styles.subText}>🎲 Checking authentication</Text>
      </View>
    );
  }

  // Show auth screens if user is not logged in
  if (!isAuthenticated) {
    console.log('🔓 User not authenticated, showing auth screens');
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  // User is authenticated, show the main app
  console.log('✅ User authenticated, showing main app');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});