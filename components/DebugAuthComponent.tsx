// components/DebugAuthComponent.tsx - Fixed TypeScript errors
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const DebugAuthComponent: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const { user } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkStoredToken = async () => {
    try {
      addResult('🔍 Checking stored token...');
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token) {
        addResult(`✅ Token found: ${token.substring(0, 20)}...`);
        addResult(`📄 Token length: ${token.length}`);
        
        // Check if it's a JWT
        const parts = token.split('.');
        if (parts.length === 3) {
          addResult(`✅ Token is JWT format (3 parts)`);
          try {
            const payload = JSON.parse(atob(parts[1]));
            addResult(`📋 Token payload: ${JSON.stringify(payload, null, 2)}`);
          } catch (e) {
            addResult(`❌ Could not decode JWT payload`);
          }
        } else {
          addResult(`❌ Token is NOT JWT format (${parts.length} parts)`);
        }
      } else {
        addResult(`❌ No token found in storage`);
      }
      
      if (userData) {
        addResult(`✅ User data found: ${userData}`);
      } else {
        addResult(`❌ No user data found`);
      }
      
      addResult(`🎭 Current user context: ${user ? user.username : 'null'}`);
    } catch (error) {
      addResult(`❌ Error checking storage: ${error}`);
    }
  };

  const testRawRequest = async () => {
    try {
      addResult('🌐 Testing raw request with manual headers...');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        addResult('❌ No token available for test');
        return;
      }

      addResult(`📤 Sending Authorization header: Bearer ${token.substring(0, 30)}...`);

      const response = await fetch('http://192.168.3.115:8085/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'User-Agent': 'YathzoBalo-Mobile-App',
        },
      });

      addResult(`📥 Raw response status: ${response.status} ${response.statusText}`);
      
      // Simple way to get headers without TypeScript issues
      const responseHeaders: string[] = [];
      try {
        for (const [key, value] of response.headers.entries()) {
          responseHeaders.push(`${key}: ${value}`);
        }
        addResult(`📋 Response headers:\n${responseHeaders.join('\n')}`);
      } catch (e) {
        addResult('📋 Could not read response headers');
      }
      
      const responseText = await response.text();
      const truncatedResponse = responseText.length > 500 
        ? responseText.substring(0, 500) + '...' 
        : responseText;
      addResult(`📄 Response body: ${truncatedResponse}`);
      
    } catch (error) {
      addResult(`❌ Raw request failed: ${error}`);
    }
  };

  const testPublicEndpoint = async () => {
    try {
      addResult('🌍 Testing public endpoint (should work without auth)...');
      
      // Try a truly public endpoint first
      const response = await fetch('http://192.168.3.115:8085/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'wrongpassword'
        }),
      });

      addResult(`📥 Public endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.status === 401 || response.status === 400) {
        addResult('✅ Public endpoint is reachable (expected auth failure)');
      } else {
        const responseText = await response.text();
        addResult(`📄 Unexpected response: ${responseText}`);
      }
      
    } catch (error) {
      addResult(`❌ Public endpoint test failed: ${error}`);
    }
  };

  const testJwtFilterPath = async () => {
    try {
      addResult('🔍 Testing if JWT filter is triggered...');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        addResult('❌ No token available');
        return;
      }

      // Test with malformed token to see if JWT filter catches it
      const malformedToken = 'clearly-not-a-valid-jwt-token';
      
      const response = await fetch('http://192.168.3.115:8085/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${malformedToken}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Malformed token response: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      addResult(`📄 Malformed token response body: ${responseText}`);
      
      // If we get the same "authentication is null" error, JWT filter isn't working
      if (responseText.includes('authentication') && responseText.includes('null')) {
        addResult('❌ JWT filter is NOT processing tokens - same error as before');
        addResult('🔧 Your JWT filter configuration needs to be checked');
      } else if (response.status === 401) {
        addResult('✅ JWT filter is working - it rejected the malformed token');
      } else {
        addResult('❓ Unexpected response - JWT filter behavior unclear');
      }
      
    } catch (error) {
      addResult(`❌ JWT filter test failed: ${error}`);
    }
  };

  const testTokenValidation = async () => {
    try {
      addResult('🔐 Testing token validation endpoint...');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        addResult('❌ No token available for validation');
        return;
      }

      const response = await fetch('http://192.168.3.115:8085/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Validation response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        addResult(`✅ Token validation successful: ${data}`);
      } else {
        const errorData = await response.text();
        addResult(`❌ Token validation failed: ${errorData}`);
      }
      
    } catch (error) {
      addResult(`❌ Token validation error: ${error}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      addResult('🗑️ Auth data cleared from storage');
    } catch (error) {
      addResult(`❌ Error clearing auth data: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Authentication Debug</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkStoredToken}>
          <Text style={styles.buttonText}>🔍 Check Stored Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPublicEndpoint}>
          <Text style={styles.buttonText}>🌍 Test Public Endpoint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testJwtFilterPath}>
          <Text style={styles.buttonText}>🔍 Test JWT Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testTokenValidation}>
          <Text style={styles.buttonText}>🔐 Test Token Validation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testRawRequest}>
          <Text style={styles.buttonText}>🌐 Test Raw Request</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAuthData}>
          <Text style={styles.buttonText}>🗑️ Clear Auth Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>🧹 Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>🔍 Debug Results:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResultsText}>No debug info yet. Run a test above.</Text>
        ) : (
          results.map((result, index) => (
            <Text key={index} style={styles.resultText} selectable>
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
    marginBottom: 20,
    color: '#333',
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
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
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
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 14,
  },
});