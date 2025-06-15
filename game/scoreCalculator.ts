export class ScoreCalculator {
    static calculateScore(dice: number[], category: string): number {
      const counts = this.getDiceCounts(dice);
      const sorted = [...dice].sort((a, b) => a - b);
  
      switch (category) {
        case 'ones': return this.sumOfNumber(dice, 1);
        case 'twos': return this.sumOfNumber(dice, 2);
        case 'threes': return this.sumOfNumber(dice, 3);
        case 'fours': return this.sumOfNumber(dice, 4);
        case 'fives': return this.sumOfNumber(dice, 5);
        case 'sixes': return this.sumOfNumber(dice, 6);
        case 'threeOfAKind': return this.isOfAKind(counts, 3) ? this.sumAll(dice) : 0;
        case 'fourOfAKind': return this.isOfAKind(counts, 4) ? this.sumAll(dice) : 0;
        case 'fullHouse': return this.isFullHouse(counts) ? 25 : 0;
        case 'smallStraight': return this.isSmallStraight(sorted) ? 30 : 0;
        case 'largeStraight': return this.isLargeStraight(sorted) ? 40 : 0;
        case 'yahtzee': return this.isYahtzee(counts) ? 50 : 0;
        case 'chance': return this.sumAll(dice);
        default: return 0;
      }
    }
  
    private static getDiceCounts(dice: number[]): { [key: number]: number } {
      const counts: { [key: number]: number } = {};
      dice.forEach(die => {
        counts[die] = (counts[die] || 0) + 1;
      });
      return counts;
    }
  
    private static sumOfNumber(dice: number[], number: number): number {
      return dice.filter(die => die === number).reduce((sum, die) => sum + die, 0);
    }
  
    private static sumAll(dice: number[]): number {
      return dice.reduce((sum, die) => sum + die, 0);
    }
  
    private static isOfAKind(counts: { [key: number]: number }, kind: number): boolean {
      return Object.values(counts).some(count => count >= kind);
    }
  
    private static isFullHouse(counts: { [key: number]: number }): boolean {
      const values = Object.values(counts).sort();
      return (values.length === 2 && values[0] === 2 && values[1] === 3);
    }
  
    private static isSmallStraight(sorted: number[]): boolean {
      const unique = [...new Set(sorted)];
      const straights = ['1234', '2345', '3456'];
      const diceString = unique.join('');
      return straights.some(straight => diceString.includes(straight));
    }
  
    private static isLargeStraight(sorted: number[]): boolean {
      const unique = [...new Set(sorted)].sort();
      return unique.length === 5 && (
        unique.join('') === '12345' || unique.join('') === '23456'
      );
    }
  
    private static isYahtzee(counts: { [key: number]: number }): boolean {
      return Object.values(counts).some(count => count === 5);
    }
  
    static calculateUpperBonus(scoreSheet: any): number {
      const upperSection = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
      const upperTotal = upperSection.reduce((total, category) => {
        return total + (scoreSheet[category] || 0);
      }, 0);
      return upperTotal >= 63 ? 35 : 0;
    }
  }