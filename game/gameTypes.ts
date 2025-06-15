// game/gameTypes.ts
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
    
    // Lower Section - Match backend format (lowercase)
    threeofkind: number | null;     // Changed from threeOfAKind
    fourofkind: number | null;      // Changed from fourOfAKind
    fullhouse: number | null;       // Changed from fullHouse
    smallstraight: number | null;   // Changed from smallStraight
    largestraight: number | null;   // Changed from largeStraight
    yahtzee: number | null;
    chance: number | null;
    lowerTotal: number;
  }
  
  // Update ScoreCategory to match new property names
  export type ScoreCategory = 
    | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
    | 'threeofkind' | 'fourofkind' | 'fullhouse' 
    | 'smallstraight' | 'largestraight' | 'yahtzee' | 'chance';
  
  export interface ScoreOption {
    category: ScoreCategory;
    name: string;
    score: number;
    description: string;
  }