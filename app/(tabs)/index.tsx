import Die from '@/components/objects/Die';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [dice, setDice] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedDice, setSelectedDice] = useState<number[]>([]);

  const rollDice = () => {
    const newDice = dice.map((die, index) => 
      selectedDice.includes(index) ? die : Math.floor(Math.random() * 6) + 1
    );
    setDice(newDice);
  };

  const toggleDie = (index: number) => {
    if (selectedDice.includes(index)) {
      setSelectedDice(selectedDice.filter(i => i !== index));
    } else {
      setSelectedDice([...selectedDice, index]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>YathzoBalo! 🎲</ThemedText>
      
      <View style={styles.diceContainer}>
        {dice.map((value, index) => (
          <Die
            key={index}
            value={value}
            isSelected={selectedDice.includes(index)}
            onPress={() => toggleDie(index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.rollButton} onPress={rollDice}>
        <ThemedText style={styles.rollButtonText}>ROLL DICE</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.instructions}>
        Tap dice to keep them, then roll!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  diceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
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
  rollButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
});