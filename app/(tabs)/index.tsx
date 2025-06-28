// app/(tabs)/index.tsx - Updated with debug mode toggle
import { DebugApiComponent } from '@/components/DebugApiComponent';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Die from '@/components/objects/Die';
import { useGame } from '@/hooks/useGame';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { 
    gameState, 
    currentGameId, 
    loading, 
    error,
    possibleScores,
    rollDice, 
    toggleDie, 
    getPossibleScores, 
    scoreCategory, 
    newGame 
  } = useGame();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [showDebug, setShowDebug] = useState(false); // Show debug in development mode

  const handleScoreSelect = async (category: any) => {
    await scoreCategory(category);
  };

  const handleNewGame = () => {
    Alert.alert(
      'New Game',
      'Start a new game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: async () => {
            await newGame();
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
          }
        }
      ]
    );
  };

  const handlePlayAgain = async () => {
    await newGame();
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // Show debug component if enabled
  if (showDebug) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugTitle}>🔧 Debug Mode</Text>
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setShowDebug(false)}
          >
            <Text style={styles.toggleButtonText}>Hide Debug</Text>
          </TouchableOpacity>
        </View>
        <DebugApiComponent />
      </ThemedView>
    );
  }

  // Show error if API calls fail
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Connection Error</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={() => newGame()}>
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
            {__DEV__ && (
              <TouchableOpacity 
                style={[styles.retryButton, styles.debugToggleButton]} 
                onPress={() => setShowDebug(true)}
              >
                <Text style={styles.retryText}>🔧 Debug</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>YathzoBalo! 🎲</ThemedText>
          <View style={styles.headerButtons}>
            {__DEV__ && (
              <TouchableOpacity 
                style={[styles.newGameButton, styles.debugButton]} 
                onPress={() => setShowDebug(true)}
              >
                <Text style={styles.newGameText}>🔧</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.newGameButton, loading && styles.disabledButton]} 
              onPress={handleNewGame}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.newGameText}>
                {loading ? '...' : 'New Game'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {currentGameId ? `🎮 Game #${currentGameId}` : '🔄 Connecting...'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#2196F3" />}
        </View>
        
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
              key={`die-${index}-${value}`}
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
            (gameState.rollsLeft === 0 || loading) && styles.disabledButton
          ]} 
          onPress={rollDice}
          disabled={gameState.rollsLeft === 0 || loading}
        >
          <Text style={styles.rollButtonText}>
            {loading ? 'Rolling...' : 
             gameState.rollsLeft === 0 ? 'CHOOSE A SCORE BELOW' : 
             `ROLL DICE (${gameState.rollsLeft} left)`}
          </Text>
        </TouchableOpacity>

        {/* Current Dice Values */}
        <View style={styles.diceInfo}>
          <Text style={styles.diceInfoText}>Dice: [{gameState.dice.join(', ')}]</Text>
        </View>

        {/* Clickable Scores */}
        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>📊 Choose Your Score:</Text>
          
          {/* Debug info */}
          {__DEV__ && (
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10 }}>
              Debug: Dice=[{gameState.dice.join(',')}] GameId={currentGameId} PossibleScores={possibleScores ? 'loaded' : 'null'}
            </Text>
          )}
          
          {/* Upper Section */}
          <View style={styles.scoreGroup}>
            <Text style={styles.groupTitle}>Numbers (Upper Section):</Text>
            {getPossibleScores().slice(0, 6).map(({ category, name, score, isAvailable }) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.scoreButton, 
                  !isAvailable && styles.usedScoreButton,
                  (gameState.rollsLeft > 0 || loading) && styles.disabledScoreButton
                ]}
                onPress={() => handleScoreSelect(category)}
                disabled={!isAvailable || gameState.rollsLeft > 0 || loading}
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
                  (gameState.rollsLeft > 0 || loading) && styles.disabledScoreButton,
                  category === 'yahtzee' && score > 0 && styles.yahtzeeButton
                ]}
                onPress={() => handleScoreSelect(category)}
                disabled={!isAvailable || gameState.rollsLeft > 0 || loading}
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
            <TouchableOpacity 
              style={[styles.playAgainButton, loading && styles.disabledButton]} 
              onPress={handlePlayAgain}
              disabled={loading}
            >
              <Text style={styles.playAgainText}>
                {loading ? 'Starting...' : '🎮 Play Again'}
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FF6B35',
  },
  debugTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
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
    opacity: 0.6,
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
  playAgainButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 3,
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  debugButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
  },
  newGameText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  debugToggleButton: {
    backgroundColor: '#9C27B0',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});