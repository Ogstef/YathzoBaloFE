// services/gameApi.ts - Fixed to match your backend endpoints exactly
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.3.115:8085'; // Updated to match your debug logs
const AUTH_TOKEN_KEY = 'auth_token';

export interface BackendGameState {
  gameId: number;
  playerName: string;
  currentRound: number;
  rollsLeft: number;
  dice: number[];
  scoreSheet: {
    ones: number | null;
    twos: number | null;
    threes: number | null;
    fours: number | null;
    fives: number | null;
    sixes: number | null;
    upperBonus: number;
    upperTotal: number;
    threeofkind: number | null;
    fourofkind: number | null;
    fullhouse: number | null;
    smallstraight: number | null;
    largestraight: number | null;
    yahtzee: number | null;
    chance: number | null;
    lowerTotal: number;
  };
  totalScore: number;
  gameComplete: boolean;
}

export interface PossibleScores {
  ones: number;
  twos: number;
  threes: number;
  fours: number;
  fives: number;
  sixes: number;
  threeofkind: number;
  fourofkind: number;
  fullhouse: number;
  smallstraight: number;
  largestraight: number;
  yahtzee: number;
  chance: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string;
  gamesPlayed: number;
  gamesWon: number;
  highestScore: number;
  totalScore: number;
  yahtzeesRolled: number;
  averageScore: number;
  winRate: number;
  createdAt: string;
}

class GameApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('🔑 Retrieved token:', token ? 'Token exists' : 'No token found');
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log(`🌐 Making request to: ${fullUrl}`);
    
    try {
      const token = await this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add other headers from options
      if (options?.headers) {
        const optionHeaders = options.headers as Record<string, string>;
        Object.assign(headers, optionHeaders);
      }

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Adding auth header with token');
      } else {
        console.log('⚠️ No token available for request');
      }

      console.log('📡 Request details:', {
        url: fullUrl,
        method: options?.method || 'GET',
        hasAuth: !!token,
        headers: Object.keys(headers),
        body: options?.body ? 'Present' : 'None'
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('🔒 Authentication failed - token may be expired');
          throw new Error('Authentication required. Please log in again.');
        }
        
        if (response.status === 404) {
          console.error('🔍 Endpoint not found - check URL and backend routes');
          throw new Error(`API endpoint not found: ${endpoint}`);
        }
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        
        console.error('❌ API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Request successful, response received');
      return responseData;
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`Network error: Cannot reach server at ${BASE_URL}. Check your backend is running and IP address is correct.`);
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      
      throw error;
    }
  }

  // Test connectivity method - try a simple health check or public endpoint
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing connection to backend...');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Try the public stats endpoint first as it doesn't require auth
      const response = await fetch(`${BASE_URL}/api/public/games/stats/global`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const isHealthy = response.ok;
      console.log(isHealthy ? '✅ Backend is reachable' : '❌ Backend health check failed');
      return isHealthy;
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      return false;
    }
  }

  // PROTECTED GAME ENDPOINTS - These match your GameController exactly
  async createNewGame(): Promise<BackendGameState> {
    console.log('🎮 Creating new game...');
    return this.request<BackendGameState>('/api/game/new', {
      method: 'POST',
    });
  }

  async rollDice(gameId: number, selectedDice: number[]): Promise<BackendGameState> {
    console.log(`🎲 Rolling dice for game ${gameId}, selected:`, selectedDice);
    return this.request<BackendGameState>('/api/game/roll', {
      method: 'POST',
      body: JSON.stringify({ 
        gameId: gameId, // Ensure it's sent as number (backend expects Long)
        selectedDice: selectedDice 
      }),
    });
  }

  async selectScore(gameId: number, category: string): Promise<BackendGameState> {
    console.log(`📊 Selecting score for game ${gameId}, category: ${category}`);
    return this.request<BackendGameState>('/api/game/score', {
      method: 'POST',
      body: JSON.stringify({ 
        gameId: gameId, // Ensure it's sent as number (backend expects Long)
        category: category 
      }),
    });
  }

  async getGameState(gameId: number): Promise<BackendGameState> {
    console.log(`📋 Getting game state for game ${gameId}`);
    return this.request<BackendGameState>(`/api/game/${gameId}`);
  }

  async getPossibleScores(gameId: number): Promise<PossibleScores> {
    console.log(`🔍 Getting possible scores for game ${gameId}`);
    return this.request<PossibleScores>(`/api/game/${gameId}/possible-scores`);
  }

  async getMyGames(): Promise<BackendGameState[]> {
    console.log('📋 Getting my games...');
    return this.request<BackendGameState[]>('/api/game/my-games');
  }

  async getMyActiveGames(): Promise<BackendGameState[]> {
    console.log('🎮 Getting my active games...');
    return this.request<BackendGameState[]>('/api/game/my-games/active');
  }

  async getMyCompletedGames(): Promise<BackendGameState[]> {
    console.log('✅ Getting my completed games...');
    return this.request<BackendGameState[]>('/api/game/my-games/completed');
  }

  async deleteGame(gameId: number): Promise<{ message: string }> {
    console.log(`🗑️ Deleting game ${gameId}`);
    return this.request<{ message: string }>(`/api/game/${gameId}`, {
      method: 'DELETE',
    });
  }

  // PUBLIC ENDPOINTS - These match your PublicGameController exactly
  async getLeaderboard(): Promise<BackendGameState[]> {
    console.log('🏆 Getting leaderboard...');
    return this.request<BackendGameState[]>('/api/public/games/leaderboard');
  }

  async getHighestScoresLeaderboard(): Promise<BackendGameState[]> {
    console.log('🎯 Getting highest scores leaderboard...');
    return this.request<BackendGameState[]>('/api/public/games/leaderboard/highest-scores');
  }

  async getGlobalStats(): Promise<{
    totalCompletedGames: number;
    activeGames: number;
    totalUsers: number;
    averageScore: number;
    highestScore: number;
  }> {
    console.log('📊 Getting global stats...');
    return this.request('/api/public/games/stats/global');
  }

  // USER PROFILE ENDPOINTS - These should match your AuthController
  async getUserProfile(): Promise<UserProfile> {
    console.log('👤 Getting user profile...');
    return this.request<UserProfile>('/api/auth/profile');
  }

  async updateProfile(data: { displayName?: string; email?: string }): Promise<UserProfile> {
    console.log('✏️ Updating profile...');
    return this.request<UserProfile>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    console.log('🔐 Changing password...');
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export const gameApi = new GameApiService();