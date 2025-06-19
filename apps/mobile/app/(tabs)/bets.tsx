import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function BetsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView className="p-4">
          <ThemedText type="title" className="text-2xl font-bold mb-6">My Bets</ThemedText>
          
          {/* Stats Cards */}
          <ThemedView className="flex-row justify-between mb-6">
            <ThemedView className="bg-blue-50 p-4 rounded-lg flex-1 mr-2">
              <ThemedText className="text-blue-600 text-sm font-medium">Active Bets</ThemedText>
              <ThemedText className="text-2xl font-bold text-blue-800">12</ThemedText>
            </ThemedView>
            <ThemedView className="bg-green-50 p-4 rounded-lg flex-1 mx-1">
              <ThemedText className="text-green-600 text-sm font-medium">Win Rate</ThemedText>
              <ThemedText className="text-2xl font-bold text-green-800">68%</ThemedText>
            </ThemedView>
            <ThemedView className="bg-purple-50 p-4 rounded-lg flex-1 ml-2">
              <ThemedText className="text-purple-600 text-sm font-medium">Profit</ThemedText>
              <ThemedText className="text-2xl font-bold text-purple-800">+$234</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Recent Bets */}
          <ThemedView className="mb-4">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-3">Recent Bets</ThemedText>
            
            {/* Bet Item */}
            <ThemedView className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <ThemedView className="flex-row justify-between items-start mb-2">
                <ThemedText className="font-medium text-gray-900">Chiefs vs Bills</ThemedText>
                <ThemedView className="bg-yellow-100 px-2 py-1 rounded">
                  <ThemedText className="text-yellow-800 text-xs font-medium">PENDING</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText className="text-gray-600 text-sm mb-2">Kansas City Chiefs ML</ThemedText>
              <ThemedView className="flex-row justify-between">
                <ThemedText className="text-sm text-gray-500">$50.00 @ +150</ThemedText>
                <ThemedText className="text-sm text-gray-500">Jan 15, 2024</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Another Bet Item */}
            <ThemedView className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <ThemedView className="flex-row justify-between items-start mb-2">
                <ThemedText className="font-medium text-gray-900">Lakers vs Warriors</ThemedText>
                <ThemedView className="bg-green-100 px-2 py-1 rounded">
                  <ThemedText className="text-green-800 text-xs font-medium">WON</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText className="text-gray-600 text-sm mb-2">Over 225.5 Points</ThemedText>
              <ThemedView className="flex-row justify-between">
                <ThemedText className="text-sm text-gray-500">$25.00 @ -110</ThemedText>
                <ThemedText className="text-sm font-medium text-green-600">+$22.73</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Failed Bet Item */}
            <ThemedView className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <ThemedView className="flex-row justify-between items-start mb-2">
                <ThemedText className="font-medium text-gray-900">Cowboys vs Eagles</ThemedText>
                <ThemedView className="bg-red-100 px-2 py-1 rounded">
                  <ThemedText className="text-red-800 text-xs font-medium">LOST</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText className="text-gray-600 text-sm mb-2">Dallas Cowboys +3.5</ThemedText>
              <ThemedView className="flex-row justify-between">
                <ThemedText className="text-sm text-gray-500">$75.00 @ -110</ThemedText>
                <ThemedText className="text-sm font-medium text-red-600">-$75.00</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Add Bet Button */}
          <ThemedView className="bg-blue-600 p-4 rounded-lg">
            <ThemedText className="text-white text-center font-semibold">Add New Bet</ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});