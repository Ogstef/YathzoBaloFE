// components/JwtTestComponent.tsx - Focused JWT authentication test
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const JwtTestComponent: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFullAuthFlow = async () => {
    if (!testUsername || !testPassword) {
      addResult('❌ Please enter username and password');
      return;
    }

    try {
      addResult('🔄 Starting full authentication flow test...');
      
      // Step 1: Login
      addResult('1️⃣ Attempting login...');
      const loginResponse = await fetch('http://192.168.3.115:8085/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername,
          password: testPassword,
        }),
      });

      addResult(`📥 Login response: ${loginResponse.status} ${loginResponse.statusText}`);
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        addResult(`❌ Login failed: ${errorText}`);
        return;
      }

      const loginData = await loginResponse.json();
      addResult(`✅ Login successful! Token received: ${loginData.token.substring(0, 30)}...`);

      // Step 2: Test token validation
      addResult('2️⃣ Testing token validation...');
      const validateResponse = await fetch('http://192.168.3.115:8085/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Validation response: ${validateResponse.status} ${validateResponse.statusText}`);
      
      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        addResult(`✅ Token validation successful: ${JSON.stringify(validateData)}`);
      } else {
        const errorText = await validateResponse.text();
        addResult(`❌ Token validation failed: ${errorText}`);
      }

      // Step 3: Test profile endpoint
      addResult('3️⃣ Testing profile endpoint...');
      const profileResponse = await fetch('http://192.168.3.115:8085/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Profile response: ${profileResponse.status} ${profileResponse.statusText}`);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        addResult(`✅ Profile request successful: ${JSON.stringify(profileData)}`);
      } else {
        const errorText = await profileResponse.text();
        addResult(`❌ Profile request failed: ${errorText}`);
      }

      // Step 4: Test game creation
      addResult('4️⃣ Testing game creation...');
      const gameResponse = await fetch('http://192.168.3.115:8085/api/game/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Game creation response: ${gameResponse.status} ${gameResponse.statusText}`);
      
      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        addResult(`✅ Game creation successful: Game ID ${gameData.gameId}`);
      } else {
        const errorText = await gameResponse.text();
        addResult(`❌ Game creation failed: ${errorText}`);
      }

    } catch (error) {
      addResult(`❌ Full auth flow test failed: ${error}`);
    }
  };

  const testStoredToken = async () => {
    try {
      addResult('🔍 Testing stored token...');
      const storedToken = await AsyncStorage.getItem('auth_token');
      
      if (!storedToken) {
        addResult('❌ No stored token found');
        return;
      }

      addResult(`📱 Found stored token: ${storedToken.substring(0, 30)}...`);

      // Test the stored token
      const response = await fetch('http://192.168.3.115:8085/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      addResult(`📥 Stored token validation: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Stored token is valid: ${JSON.stringify(data)}`);
      } else {
        const errorText = await response.text();
        addResult(`❌ Stored token is invalid: ${errorText}`);
      }

    } catch (error) {
      addResult(`❌ Stored token test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 JWT Authentication Test</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test Credentials:</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={testUsername}
          onChangeText={setTestUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={testPassword}
          onChangeText={setTestPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testFullAuthFlow}>
          <Text style={styles.buttonText}>🔄 Full Auth Flow Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testStoredToken}>
          <Text style={styles.buttonText}>📱 Test Stored Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>🧹 Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>🔍 Test Results:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResultsText}>No tests run yet. Enter credentials and run a test.</Text>
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
  inputContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
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