// components/DebugApiComponent.tsx
import { gameApi } from '@/services/gameApi';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DebugAuthComponent } from './DebugAuthComponent';
import { JwtTestComponent } from './JwtTestComponent';

export const DebugApiComponent: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [showJwtTest, setShowJwtTest] = useState(false);

  if (showJwtTest) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => setShowJwtTest(false)}
        >
          <Text style={styles.buttonText}>← Back to API Tests</Text>
        </TouchableOpacity>
        <JwtTestComponent />
      </View>
    );
  }

  if (showAuthDebug) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => setShowAuthDebug(false)}
        >
          <Text style={styles.buttonText}>← Back to API Tests</Text>
        </TouchableOpacity>
        <DebugAuthComponent />
      </View>
    );
  }

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPublicEndpoint = async () => {
    try {
      addResult('🔍 Testing public endpoint...');
      const stats = await gameApi.getGlobalStats();
      addResult(`✅ Public endpoint works: ${JSON.stringify(stats)}`);
    } catch (error) {
      addResult(`❌ Public endpoint failed: ${error}`);
    }
  };

  const testCreateGame = async () => {
    try {
      addResult('🎮 Testing create new game...');
      const game = await gameApi.createNewGame();
      addResult(`✅ Create game works: Game ID ${game.gameId}`);
    } catch (error) {
      addResult(`❌ Create game failed: ${error}`);
    }
  };

  const testUserProfile = async () => {
    try {
      addResult('👤 Testing user profile...');
      const profile = await gameApi.getUserProfile();
      addResult(`✅ Profile works: ${profile.username}`);
    } catch (error) {
      addResult(`❌ Profile failed: ${error}`);
    }
  };

  const testMyGames = async () => {
    try {
      addResult('📋 Testing my games...');
      const games = await gameApi.getMyGames();
      addResult(`✅ My games works: ${games.length} games found`);
    } catch (error) {
      addResult(`❌ My games failed: ${error}`);
    }
  };

  const testConnectivity = async () => {
    try {
      addResult('🌐 Testing backend connectivity...');
      const isConnected = await gameApi.testConnection();
      addResult(isConnected ? '✅ Backend is reachable' : '❌ Backend is not reachable');
    } catch (error) {
      addResult(`❌ Connectivity test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 API Debug Panel</Text>
      <Text style={styles.subtitle}>Backend URL: http://192.168.3.115:8085</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.jwtButton]} onPress={() => setShowJwtTest(true)}>
          <Text style={styles.buttonText}>🧪 JWT Flow Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.authButton]} onPress={() => setShowAuthDebug(true)}>
          <Text style={styles.buttonText}>🔐 Debug Authentication</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testConnectivity}>
          <Text style={styles.buttonText}>🌐 Test Connectivity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPublicEndpoint}>
          <Text style={styles.buttonText}>🌍 Test Public Endpoint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUserProfile}>
          <Text style={styles.buttonText}>👤 Test User Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testMyGames}>
          <Text style={styles.buttonText}>📋 Test My Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testCreateGame}>
          <Text style={styles.buttonText}>🎮 Test Create Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>📊 Test Results:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResultsText}>No tests run yet. Tap a button above to test an endpoint.</Text>
        ) : (
          results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  authButton: {
    backgroundColor: '#9C27B0',
  },
  jwtButton: {
    backgroundColor: '#4CAF50',
  },
  backButton: {
    backgroundColor: '#607D8B',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  resultsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noResultsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  resultText: {
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});