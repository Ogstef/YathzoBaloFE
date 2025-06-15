// services/gameApi.ts
const BASE_URL = 'http://localhost:8085/api/public/games'; // Change to your actual backend URL

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
    threeofkind: number | null;      // Backend uses lowercase
    fourofkind: number | null;       // Backend uses lowercase
    fullhouse: number | null;        // Backend uses lowercase
    smallstraight: number | null;    // Backend uses lowercase
    largestraight: number | null;    // Backend uses lowercase
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
  threeOfKind: number;    // Backend uses lowercase 'threeofkind'
  fourOfKind: number;     // Backend uses lowercase 'fourofkind'
  fullhouse: number;      // Backend uses lowercase 'fullhouse'
  smallStraight: number;  // Backend uses lowercase 'smallstraight'
  largeStraight: number;  // Backend uses lowercase 'largestraight'
  yahtzee: number;
  chance: number;
}

class GameApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createNewGame(playerName: string): Promise<BackendGameState> {
    return this.request<BackendGameState>('/new', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  async rollDice(gameId: number, selectedDice: number[]): Promise<BackendGameState> {
    return this.request<BackendGameState>('/roll', {
      method: 'POST',
      body: JSON.stringify({ gameId, selectedDice }),
    });
  }

  async selectScore(gameId: number, category: string): Promise<BackendGameState> {
    return this.request<BackendGameState>('/score', {
      method: 'POST',
      body: JSON.stringify({ gameId, category }),
    });
  }

  async getGameState(gameId: number): Promise<BackendGameState> {
    return this.request<BackendGameState>(`/${gameId}`);
  }

  async getPossibleScores(gameId: number): Promise<PossibleScores> {
    console.log('🔍 Getting possible scores for game:', gameId);
    console.log('🌐 Request URL:', `${BASE_URL}/${gameId}/possible-scores`);
    return this.request<PossibleScores>(`/${gameId}/possible-scores`);
  }

  async getLeaderboard(): Promise<BackendGameState[]> {
    return this.request<BackendGameState[]>('/leaderboard');
  }

  async getPlayerGames(playerName: string): Promise<BackendGameState[]> {
    return this.request<BackendGameState[]>(`/player/${playerName}`);
  }
}

export const gameApi = new GameApiService();