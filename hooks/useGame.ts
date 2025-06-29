// hooks/useGame.ts - FIXED VERSION
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { GameState, ScoreCategory } from '../game/gameTypes';
import { BackendGameState, gameApi, PossibleScores } from '../services/gameApi';

// Convert backend format to frontend format
const mapBackendToFrontend = (backendState: BackendGameState): GameState => ({
  dice: backendState.dice,
  selectedDice: [], // Frontend manages selected dice
  rollsLeft: backendState.rollsLeft,
  currentRound: backendState.currentRound,
  scoreSheet: backendState.scoreSheet,
  gameComplete: backendState.gameComplete,
  totalScore: backendState.totalScore,
});

export const useGame = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>({
    dice: [1, 1, 1, 1, 1],
    selectedDice: [],
    rollsLeft: 3,
    currentRound: 1,
    scoreSheet: {
      ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
      upperBonus: 0, upperTotal: 0,
      threeofkind: null, fourofkind: null, fullhouse: null,
      smallstraight: null, largestraight: null, yahtzee: null, chance: null,
      lowerTotal: 0
    },
    gameComplete: false,
    totalScore: 0
  });

  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [possibleScores, setPossibleScores] = useState<PossibleScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch possible scores when dice change and user is authenticated
  useEffect(() => {
    if (currentGameId && gameState.rollsLeft < 3 && isAuthenticated) {
      fetchPossibleScores();
    }
  }, [currentGameId, gameState.dice, gameState.rollsLeft, isAuthenticated]);

  // Auto-start game when user logs in
  useEffect(() => {
    if (isAuthenticated && !currentGameId) {
      newGame();
    }
  }, [isAuthenticated]);

  const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    console.log('🔄 handleApiCall started');
    
    if (!isAuthenticated) {
      console.log('❌ handleApiCall: Not authenticated');
      setError('Please log in to play the game');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📡 Making API call...');
      const result = await apiCall();
      console.log('✅ API call successful:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('💥 API call failed:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const newGame = async () => {
    console.log('🎮 New Game button clicked!');
    console.log('🔐 Is authenticated:', isAuthenticated);
    console.log('👤 User object:', user);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated');
      setError('Please log in to start a new game');
      return;
    }

    console.log('🚀 Starting API call for new game...');
    
    // Test backend connectivity first
    console.log('🔍 Testing backend connection...');
    const isBackendReachable = await gameApi.testConnection();
    console.log('🌐 Backend reachable:', isBackendReachable);
    
    if (!isBackendReachable) {
      setError('Cannot connect to game server. Please check your connection.');
      return;
    }
    
    const result = await handleApiCall(() => gameApi.createNewGame());
    console.log('📦 API result:', result);
    
    if (result) {
      console.log('✅ Setting new game state');
      console.log('🎯 New game backend response:', result);
      
      setCurrentGameId(result.gameId);
      setGameState(mapBackendToFrontend(result));
      setPossibleScores(null);
    } else {
      console.log('❌ No result from API');
      console.log('📋 Current error state:', error);
    }
  };

  const rollDice = async () => {
    if (!currentGameId || gameState.rollsLeft <= 0) return;

    const result = await handleApiCall(() => 
      gameApi.rollDice(currentGameId, gameState.selectedDice)
    );
    
    if (result) {
      setGameState(prev => ({
        ...mapBackendToFrontend(result),
        selectedDice: [] // Clear selected dice after roll
      }));
    }
  };

  const toggleDie = (index: number) => {
    if (gameState.rollsLeft === 3) return; // Can't select before first roll

    setGameState(prev => ({
      ...prev,
      selectedDice: prev.selectedDice.includes(index)
        ? prev.selectedDice.filter(i => i !== index)
        : [...prev.selectedDice, index]
    }));
  };

  const scoreCategory = async (category: ScoreCategory) => {
    if (!currentGameId || gameState.scoreSheet[category] !== null) return;

    // Convert frontend category names to backend format
    const categoryMap: { [key in ScoreCategory]: string } = {
      ones: 'ones',
      twos: 'twos', 
      threes: 'threes',
      fours: 'fours',
      fives: 'fives',
      sixes: 'sixes',
      threeofkind: 'threeofkind',
      fourofkind: 'fourofkind',
      fullhouse: 'fullhouse',
      smallstraight: 'smallstraight',
      largestraight: 'largestraight',
      yahtzee: 'yahtzee',
      chance: 'chance'
    };

    const backendCategory = categoryMap[category];
    const result = await handleApiCall(() => 
      gameApi.selectScore(currentGameId, backendCategory)
    );

    if (result) {
      setGameState(prev => ({
        ...mapBackendToFrontend(result),
        selectedDice: [] // Clear selected dice after scoring
      }));
      setPossibleScores(null); // Will be refetched automatically
    }
  };

  const fetchPossibleScores = async () => {
    if (!currentGameId) return;

    const result = await handleApiCall(() => gameApi.getPossibleScores(currentGameId));
    if (result) {
      setPossibleScores(result);
    }
  };

  // 🔧 FIXED: This function was the main issue!
  const getPossibleScores = () => {
    const categories: Array<{ category: ScoreCategory; name: string }> = [
      { category: 'ones', name: 'Ones' },
      { category: 'twos', name: 'Twos' },
      { category: 'threes', name: 'Threes' },
      { category: 'fours', name: 'Fours' },
      { category: 'fives', name: 'Fives' },
      { category: 'sixes', name: 'Sixes' },
      { category: 'threeofkind', name: 'Three of a Kind' },
      { category: 'fourofkind', name: 'Four of a Kind' },
      { category: 'fullhouse', name: 'Full House' },
      { category: 'smallstraight', name: 'Small Straight' },
      { category: 'largestraight', name: 'Large Straight' },
      { category: 'yahtzee', name: 'YAHTZEE!' },
      { category: 'chance', name: 'Chance' }
    ];

    // Map backend possible scores to frontend format
    const scoreMap: { [key in ScoreCategory]: keyof PossibleScores } = {
      ones: 'ones',
      twos: 'twos',
      threes: 'threes', 
      fours: 'fours',
      fives: 'fives',
      sixes: 'sixes',
      threeofkind: 'threeofkind',
      fourofkind: 'fourofkind',
      fullhouse: 'fullhouse',
      smallstraight: 'smallstraight',
      largestraight: 'largestraight',
      yahtzee: 'yahtzee',
      chance: 'chance'
    };

    // 🔧 FIXED: Proper score calculation function with correct logic
    const calculateLocalScore = (dice: number[], category: ScoreCategory): number => {
      const counts = dice.reduce((acc, die) => {
        acc[die] = (acc[die] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });
      
      const sorted = [...dice].sort((a, b) => a - b);
      const sum = dice.reduce((a, b) => a + b, 0);

      switch (category) {
        case 'ones': return dice.filter(d => d === 1).length * 1;
        case 'twos': return dice.filter(d => d === 2).length * 2;
        case 'threes': return dice.filter(d => d === 3).length * 3;
        case 'fours': return dice.filter(d => d === 4).length * 4;
        case 'fives': return dice.filter(d => d === 5).length * 5;
        case 'sixes': return dice.filter(d => d === 6).length * 6;
        case 'threeofkind': return Object.values(counts).some(c => c >= 3) ? sum : 0;
        case 'fourofkind': return Object.values(counts).some(c => c >= 4) ? sum : 0;
        case 'fullhouse': {
          const values = Object.values(counts).sort();
          return (values.length === 2 && values[0] === 2 && values[1] === 3) ? 25 : 0;
        }
        case 'smallstraight': {
          const unique = [...new Set(sorted)];
          const straights = ['1234', '2345', '3456'];
          const diceString = unique.join('');
          return straights.some(straight => diceString.includes(straight)) ? 30 : 0;
        }
        case 'largestraight': {
          const unique = [...new Set(sorted)];
          return (unique.length === 5 && (unique.join('') === '12345' || unique.join('') === '23456')) ? 40 : 0;
        }
        case 'yahtzee': return Object.values(counts).some(c => c === 5) ? 50 : 0;
        case 'chance': return sum;
        default: return 0;
      }
    };

    return categories.map(({ category, name }) => {
      // 🔧 FIXED: Proper check for availability
      // A category is available if its value in the scoreSheet is null or undefined
      const isAvailable = gameState.scoreSheet[category] === null || gameState.scoreSheet[category] === undefined;
      
      let score = 0;
      
      // Only calculate score if category is available
      if (isAvailable) {
        if (possibleScores && possibleScores[scoreMap[category]] !== undefined) {
          score = possibleScores[scoreMap[category]];
          console.log(`🌐 Using API score for ${name}:`, score);
        } else {
          // Fallback to local calculation
          score = calculateLocalScore(gameState.dice, category);
          console.log(`🔄 Using local calculation for ${name}:`, score);
        }
      } else {
        // If not available, show the actual scored value
        score = gameState.scoreSheet[category] || 0;
        console.log(`📋 Category ${name} already used with score:`, score);
      }
      
      console.log(`Final result for ${name} (${category}):`, {
        score,
        isAvailable,
        actualScoreSheetValue: gameState.scoreSheet[category]
      });
      
      return {
        category,
        name,
        score: score,
        isAvailable
      };
    });
  };

  return {
    gameState,
    currentGameId,
    loading,
    error,
    possibleScores,
    rollDice,
    toggleDie,
    scoreCategory,
    getPossibleScores,
    newGame,
    fetchPossibleScores,
    isAuthenticated,
  };
};