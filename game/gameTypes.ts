export interface GameState {
    dice: number[];
    selectedDice: number[];
    rollsLeft: number;
    currentRound: number;
    scoreSheet: ScoreSheet;
    gameComplete: boolean;
    totalScore: number;
  }
  
  export interface ScoreSheet {
    // Upper Section (Ones through Sixes)
    ones: number | null;
    twos: number | null;
    threes: number | null;
    fours: number | null;
    fives: number | null;
    sixes: number | null;
    upperBonus: number;
    upperTotal: number;
    
    // Lower Section
    threeOfAKind: number | null;
    fourOfAKind: number | null;
    fullHouse: number | null;
    smallStraight: number | null;
    largeStraight: number | null;
    yahtzee: number | null;
    chance: number | null;
    lowerTotal: number;
  }
  
  export type ScoreCategory = keyof Omit<ScoreSheet, 'upperBonus' | 'upperTotal' | 'lowerTotal'>;
  
  export interface ScoreOption {
    category: ScoreCategory;
    name: string;
    score: number;
    description: string;
  }