import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface DieProps {
  value: number;
  isSelected: boolean;
  onPress: () => void;
}

const Die: React.FC<DieProps> = ({ value, isSelected, onPress }) => {
  const renderDots = () => {
    const dotSize = 14;
    const dotStyle = {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: isSelected ? '#FFFFFF' : '#333333',
    };

    switch (value) {
      case 1:
        return (
          <View style={styles.center}>
            <View style={dotStyle} />
          </View>
        );
      
      case 2:
        return (
          <View style={styles.diagonal}>
            <View style={dotStyle} />
            <View style={dotStyle} />
          </View>
        );
      
      case 3:
        return (
          <View style={styles.diagonal}>
            <View style={dotStyle} />
            <View style={dotStyle} />
            <View style={dotStyle} />
          </View>
        );
      
      case 4:
        return (
          <View style={styles.fourCorners}>
            <View style={styles.topRow}>
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
            <View style={styles.bottomRow}>
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
          </View>
        );
      
      case 5:
        return (
          <View style={styles.fivePattern}>
            <View style={styles.topRow}>
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
            <View style={styles.middleRow}>
              <View style={dotStyle} />
            </View>
            <View style={styles.bottomRow}>
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
          </View>
        );
      
      case 6:
        return (
          <View style={styles.sixPattern}>
            <View style={styles.leftColumn}>
              <View style={dotStyle} />
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
            <View style={styles.rightColumn}>
              <View style={dotStyle} />
              <View style={dotStyle} />
              <View style={dotStyle} />
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.die,
        isSelected ? styles.selectedDie : styles.unselectedDie
      ]}
      onPress={onPress}
    >
      <View style={styles.dotContainer}>
        {renderDots()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  die: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDie: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  unselectedDie: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
  },
  dotContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  diagonal: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    transform: [{ rotate: '45deg' }],
    width: '100%',
    paddingHorizontal: 10,
  },
  fourCorners: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  fivePattern: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  sixPattern: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  leftColumn: {
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 4,
  },
  rightColumn: {
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 4,
  },
});

export default Die;