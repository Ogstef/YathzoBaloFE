import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Mock leaderboard data - replace with your actual data source
const mockLeaderboardData = [
  { id: 1, name: "Sarah Chen", score: 485, gamesPlayed: 23, avgScore: 312, bestCategory: "Yahtzee!", date: "2024-06-14" },
  { id: 2, name: "Mike Johnson", score: 467, gamesPlayed: 18, avgScore: 298, bestCategory: "Full House", date: "2024-06-13" },
  { id: 3, name: "Emma Wilson", score: 445, gamesPlayed: 31, avgScore: 285, bestCategory: "Large Straight", date: "2024-06-12" },
  { id: 4, name: "Alex Rodriguez", score: 423, gamesPlayed: 15, avgScore: 276, bestCategory: "Four of a Kind", date: "2024-06-11" },
  { id: 5, name: "Jordan Kim", score: 398, gamesPlayed: 27, avgScore: 261, bestCategory: "Small Straight", date: "2024-06-10" },
  { id: 6, name: "Taylor Brown", score: 387, gamesPlayed: 12, avgScore: 245, bestCategory: "Three of a Kind", date: "2024-06-09" },
  { id: 7, name: "Casey Davis", score: 372, gamesPlayed: 19, avgScore: 232, bestCategory: "Chance", date: "2024-06-08" },
  { id: 8, name: "Riley Martinez", score: 356, gamesPlayed: 8, avgScore: 218, bestCategory: "Sixes", date: "2024-06-07" },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return "trophy.fill";
    case 2: return "2.circle.fill";
    case 3: return "3.circle.fill";
    default: return "circle.fill";
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "#FFD700"; // Gold
    case 2: return "#C0C0C0"; // Silver
    case 3: return "#CD7F32"; // Bronze
    default: return "#808080";
  }
};

interface LeaderboardItemProps {
  player: typeof mockLeaderboardData[0];
  rank: number;
}

const LeaderboardItem = ({ player, rank }: LeaderboardItemProps) => (
  <ThemedView style={[styles.leaderboardItem, rank <= 3 ? styles.topThree : {}]}>
    <ThemedView style={styles.rankContainer}>
      <IconSymbol 
        name={getRankIcon(rank)} 
        size={24} 
        color={getRankColor(rank)} 
      />
      <ThemedText style={styles.rankText}>#{rank}</ThemedText>
    </ThemedView>
    
    <ThemedView style={styles.playerInfo}>
      <ThemedText type="defaultSemiBold" style={styles.playerName}>
        {player.name}
      </ThemedText>
      <ThemedText style={styles.playerStats}>
        {player.gamesPlayed} games • Avg: {player.avgScore}
      </ThemedText>
      <ThemedText style={styles.bestCategory}>
        Best: {player.bestCategory}
      </ThemedText>
    </ThemedView>
    
    <ThemedView style={styles.scoreContainer}>
      <ThemedText type="title" style={styles.score}>
        {player.score}
      </ThemedText>
      <ThemedText style={styles.scoreLabel}>HIGH SCORE</ThemedText>
    </ThemedView>
  </ThemedView>
);

export default function TabTwoScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F4FD', dark: '#1a2b3d' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <IconSymbol
            size={80}
            color="#4A90E2"
            name="trophy.fill"
            style={styles.headerIcon}
          />
          <ThemedView style={styles.diceContainer}>
            <IconSymbol name="dice.fill" size={30} color="#E74C3C" style={styles.dice} />
            <IconSymbol name="dice.fill" size={30} color="#E74C3C" style={styles.dice} />
            <IconSymbol name="dice.fill" size={30} color="#E74C3C" style={styles.dice} />
            <IconSymbol name="dice.fill" size={30} color="#E74C3C" style={styles.dice} />
            <IconSymbol name="dice.fill" size={30} color="#E74C3C" style={styles.dice} />
          </ThemedView>
        </ThemedView>
      }>
      
      <ThemedView style={styles.titleContainer}>
        <IconSymbol name="chart.bar.fill" size={28} color="#4A90E2" />
        <ThemedText type="title">Yahtzee Leaderboard</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.subtitle}>
        Roll your way to the top! Track your highest scores and compete with friends.
      </ThemedText>

      {/* Period Selector */}
      <ThemedView style={styles.periodSelector}>
        {(['all', 'week', 'month'] as const).map((period) => (
          <ThemedView 
            key={period} 
            style={[
              styles.periodButton, 
              selectedPeriod === period ? styles.periodButtonActive : {}
            ]}
          >
            <ThemedText 
              style={[
                styles.periodButtonText,
                selectedPeriod === period ? styles.periodButtonTextActive : {}
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'This Month'}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Leaderboard */}
      <ThemedView style={styles.leaderboardContainer}>
        {mockLeaderboardData.map((player, index) => (
          <LeaderboardItem 
            key={player.id} 
            player={player} 
            rank={index + 1} 
          />
        ))}
      </ThemedView>

      {/* Stats Sections */}
      <Collapsible title="Game Statistics">
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <IconSymbol name="gamecontroller.fill" size={24} color="#4A90E2" />
            <ThemedText type="defaultSemiBold">Total Games</ThemedText>
            <ThemedText type="title">1,247</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <IconSymbol name="star.fill" size={24} color="#FFD700" />
            <ThemedText type="defaultSemiBold">Yahtzees Rolled</ThemedText>
            <ThemedText type="title">89</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <IconSymbol name="chart.bar.fill" size={24} color="#27AE60" />
            <ThemedText type="defaultSemiBold">Avg Score</ThemedText>
            <ThemedText type="title">287</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <IconSymbol name="flame.fill" size={24} color="#E74C3C" />
            <ThemedText type="defaultSemiBold">Win Streak</ThemedText>
            <ThemedText type="title">12</ThemedText>
          </ThemedView>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Yahtzee Categories">
        <ThemedText>
          Track your performance across all Yahtzee scoring categories:
        </ThemedText>
        <ThemedView style={styles.categoriesGrid}>
          {[
            { name: "Yahtzee!", icon: "star.fill", color: "#FFD700" },
            { name: "Full House", icon: "house.fill", color: "#9B59B6" },
            { name: "Large Straight", icon: "arrow.right", color: "#3498DB" },
            { name: "Small Straight", icon: "arrow.right.circle", color: "#2ECC71" },
            { name: "Four of a Kind", icon: "4.circle.fill", color: "#E74C3C" },
            { name: "Three of a Kind", icon: "3.circle.fill", color: "#F39C12" },
          ].map((category) => (
            <ThemedView key={category.name} style={styles.categoryItem}>
              <IconSymbol name={category.icon} size={20} color={category.color} />
              <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="How Scoring Works">
        <ThemedText>
          Yahtzee scoring is based on dice combinations. The maximum possible score is 1575 points!
        </ThemedText>
        <ThemedText style={styles.tipText}>
          💡 <ThemedText type="defaultSemiBold">Pro tip:</ThemedText> Focus on the upper section bonus (35 points) by scoring at least 63 points in the number categories.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  headerIcon: {
    marginBottom: 10,
  },
  diceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dice: {
    transform: [{ rotate: `${Math.random() * 20 - 10}deg` }],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4A90E2',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  leaderboardContainer: {
    gap: 12,
    marginBottom: 24,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topThree: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  rankContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  rankText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    marginBottom: 2,
  },
  playerStats: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  bestCategory: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
  },
  tipText: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#2ECC71',
  },
});