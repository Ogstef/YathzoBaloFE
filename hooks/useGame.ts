import { useState } from 'react';
import { GameState, ScoreCategory, ScoreSheet } from '../game/gameTypes';
import { ScoreCalculator } from '../game/scoreCalculator';

const initialScoreSheet: ScoreSheet = {
  ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
  upperBonus: 0, upperTotal: 0,
  threeOfAKind: null, fourOfAKind: null, fullHouse: null,
  smallStraight: null, largeStraight: null, yahtzee: null, chance: null,
  lowerTotal: 0
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    dice: [1, 1, 1, 1, 1],
    selectedDice: [],
    rollsLeft: 3,
    currentRound: 1,
    scoreSheet: initialScoreSheet,
    gameComplete: false,
    totalScore: 0
  });

  const rollDice = () => {
    if (gameState.rollsLeft <= 0) return;

    const newDice = gameState.dice.map((die, index) => 
      gameState.selectedDice.includes(index) ? die : Math.floor(Math.random() * 6) + 1
    );

    setGameState(prev => ({
      ...prev,
      dice: newDice,
      rollsLeft: prev.rollsLeft - 1
    }));
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

  const scoreCategory = (category: ScoreCategory) => {
    if (gameState.scoreSheet[category] !== null) return; // Already scored

    const score = ScoreCalculator.calculateScore(gameState.dice, category);
    const newScoreSheet = { ...gameState.scoreSheet, [category]: score };
    
    // Calculate bonuses and totals
    newScoreSheet.upperBonus = ScoreCalculator.calculateUpperBonus(newScoreSheet);
    
    const upperCategories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'] as const;
    newScoreSheet.upperTotal = upperCategories.reduce((total, cat) => 
      total + (newScoreSheet[cat] || 0), 0) + newScoreSheet.upperBonus;
    
    const lowerCategories = ['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'] as const;
    newScoreSheet.lowerTotal = lowerCategories.reduce((total, cat) => 
      total + (newScoreSheet[cat] || 0), 0);

    const totalScore = newScoreSheet.upperTotal + newScoreSheet.lowerTotal;
    const gameComplete = gameState.currentRound >= 13;

    setGameState(prev => ({
      ...prev,
      scoreSheet: newScoreSheet,
      totalScore,
      currentRound: prev.currentRound + 1,
      rollsLeft: 3,
      selectedDice: [],
      gameComplete
    }));
  };

  const getPossibleScores = () => {
    const categories: Array<{ category: ScoreCategory; name: string }> = [
      { category: 'ones', name: 'Ones' },
      { category: 'twos', name: 'Twos' },
      { category: 'threes', name: 'Threes' },
      { category: 'fours', name: 'Fours' },
      { category: 'fives', name: 'Fives' },
      { category: 'sixes', name: 'Sixes' },
      { category: 'threeOfAKind', name: 'Three of a Kind' },
      { category: 'fourOfAKind', name: 'Four of a Kind' },
      { category: 'fullHouse', name: 'Full House' },
      { category: 'smallStraight', name: 'Small Straight' },
      { category: 'largeStraight', name: 'Large Straight' },
      { category: 'yahtzee', name: 'YAHTZEE!' },
      { category: 'chance', name: 'Chance' }
    ];

    return categories.map(({ category, name }) => ({
      category,
      name,
      score: ScoreCalculator.calculateScore(gameState.dice, category),
      isAvailable: gameState.scoreSheet[category] === null
    }));
  };

  return {
    gameState,
    rollDice,
    toggleDie,
    scoreCategory,
    getPossibleScores
  };
};