import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Die from '@/components/objects/Die';
import { useGame } from '@/hooks/useGame';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { gameState, rollDice, toggleDie, getPossibleScores, scoreCategory } = useGame();

  const handleScoreSelect = (category: any) => {
    scoreCategory(category);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>YathzoBalo! 🎲</ThemedText>
        
        {/* Game Info */}
        <View style={styles.gameInfo}>
          <ThemedText>Round: {gameState.currentRound}/13</ThemedText>
          <ThemedText>Rolls Left: {gameState.rollsLeft}</ThemedText>
          <ThemedText>Score: {gameState.totalScore}</ThemedText>
        </View>

        {/* Dice */}
        <View style={styles.diceContainer}>
          {gameState.dice.map((value, index) => (
            <Die
              key={index}
              value={value}
              isSelected={gameState.selectedDice.includes(index)}
              onPress={() => toggleDie(index)}
            />
          ))}
        </View>

        {/* Roll Button */}
        <TouchableOpacity 
          style={[
            styles.rollButton, 
            gameState.rollsLeft === 0 && styles.disabledButton
          ]} 
          onPress={rollDice}
          disabled={gameState.rollsLeft === 0}
        >
          <Text style={styles.rollButtonText}>
            {gameState.rollsLeft === 0 ? 'CHOOSE A SCORE BELOW' : `ROLL DICE (${gameState.rollsLeft} left)`}
          </Text>
        </TouchableOpacity>

        {/* Current Dice Values */}
        <View style={styles.diceInfo}>
          <Text style={styles.diceInfoText}>Dice: [{gameState.dice.join(', ')}]</Text>
        </View>

        {/* Clickable Scores */}
        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>📊 Choose Your Score:</Text>
          
          {/* Upper Section */}
          <View style={styles.scoreGroup}>
            <Text style={styles.groupTitle}>Numbers (Upper Section):</Text>
            {getPossibleScores().slice(0, 6).map(({ category, name, score, isAvailable }) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.scoreButton, 
                  !isAvailable && styles.usedScoreButton,
                  gameState.rollsLeft > 0 && styles.disabledScoreButton
                ]}
                onPress={() => handleScoreSelect(category)}
                disabled={!isAvailable || gameState.rollsLeft > 0}
              >
                <View style={styles.scoreButtonContent}>
                  <Text style={[styles.scoreName, !isAvailable && styles.usedScoreText]}>
                    {name}
                  </Text>
                  <Text style={[styles.scoreValue, !isAvailable && styles.usedScoreText]}>
                    {!isAvailable ? `${gameState.scoreSheet[category]} pts` : `${score} pts`}
                  </Text>
                </View>
                {!isAvailable && <Text style={styles.usedLabel}>USED</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Lower Section */}
          <View style={styles.scoreGroup}>
            <Text style={styles.groupTitle}>Special Combinations:</Text>
            {getPossibleScores().slice(6).map(({ category, name, score, isAvailable }) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.scoreButton, 
                  !isAvailable && styles.usedScoreButton,
                  gameState.rollsLeft > 0 && styles.disabledScoreButton,
                  category === 'yahtzee' && score > 0 && styles.yahtzeeButton
                ]}
                onPress={() => handleScoreSelect(category)}
                disabled={!isAvailable || gameState.rollsLeft > 0}
              >
                <View style={styles.scoreButtonContent}>
                  <Text style={[
                    styles.scoreName, 
                    !isAvailable && styles.usedScoreText,
                    category === 'yahtzee' && score > 0 && styles.yahtzeeText
                  ]}>
                    {name}
                  </Text>
                  <Text style={[
                    styles.scoreValue, 
                    !isAvailable && styles.usedScoreText,
                    category === 'yahtzee' && score > 0 && styles.yahtzeeText
                  ]}>
                    {!isAvailable ? `${gameState.scoreSheet[category]} pts` : `${score} pts`}
                  </Text>
                </View>
                {!isAvailable && <Text style={styles.usedLabel}>USED</Text>}
                {category === 'yahtzee' && score > 0 && <Text style={styles.yahtzeeLabel}>🎯 YAHTZEE!</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Game Complete */}
        {gameState.gameComplete && (
          <View style={styles.gameComplete}>
            <Text style={styles.gameCompleteTitle}>🎉 Game Complete!</Text>
            <Text style={styles.finalScore}>Final Score: {gameState.totalScore}</Text>
            <Text style={styles.breakdown}>
              Upper: {gameState.scoreSheet.upperTotal} | Lower: {gameState.scoreSheet.lowerTotal}
            </Text>
            {gameState.scoreSheet.upperBonus > 0 && (
              <Text style={styles.bonus}>🎁 Upper Bonus: +35 points!</Text>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 15,
  },
  diceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rollButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  rollButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diceInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  diceInfoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    color: '#333',
  },
  scoresSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  scoreGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  scoreButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  usedScoreButton: {
    backgroundColor: '#e0e0e0',
    borderColor: '#999999',
  },
  disabledScoreButton: {
    opacity: 0.6,
  },
  yahtzeeButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FF6B00',
  },
  scoreButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  usedScoreText: {
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  yahtzeeText: {
    color: '#FF6B00',
  },
  usedLabel: {
    position: 'absolute',
    right: 10,
    top: -5,
    fontSize: 10,
    color: '#999999',
    fontWeight: 'bold',
  },
  yahtzeeLabel: {
    position: 'absolute',
    right: 10,
    top: -5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  gameComplete: {
    marginTop: 30,
    padding: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  gameCompleteTitle: {
    color: 'white',
    fontSize: 28,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  finalScore: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breakdown: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  bonus: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});