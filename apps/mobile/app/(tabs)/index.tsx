import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView className="p-4">
          {/* Header */}
          <ThemedView className="mb-6">
            <ThemedText type="title" className="text-2xl font-bold">Dashboard</ThemedText>
            <ThemedText className="text-gray-600">Welcome back, John! 👋</ThemedText>
          </ThemedView>

          {/* Quick Stats */}
          <ThemedView className="mb-6">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-3">Overview</ThemedText>
            <ThemedView className="flex-row justify-between">
              <ThemedView className="bg-blue-50 p-4 rounded-lg flex-1 mr-2">
                <ThemedText className="text-blue-600 text-sm font-medium">Active Bets</ThemedText>
                <ThemedText className="text-2xl font-bold text-blue-800">12</ThemedText>
                <ThemedText className="text-blue-600 text-xs">+3 this week</ThemedText>
              </ThemedView>
              <ThemedView className="bg-green-50 p-4 rounded-lg flex-1 ml-2">
                <ThemedText className="text-green-600 text-sm font-medium">Profit</ThemedText>
                <ThemedText className="text-2xl font-bold text-green-800">+$234</ThemedText>
                <ThemedText className="text-green-600 text-xs">68% win rate</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Quick Actions */}
          <ThemedView className="mb-6">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-3">Quick Actions</ThemedText>
            <ThemedView className="flex-row justify-between">
              <TouchableOpacity 
                onPress={() => router.push('/receipt-camera')}
                className="bg-blue-600 p-4 rounded-lg flex-1 mr-2"
              >
                <ThemedText className="text-white text-center font-semibold">📸</ThemedText>
                <ThemedText className="text-white text-center font-semibold mt-1">Scan Receipt</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/bet-entry')}
                className="border border-blue-600 p-4 rounded-lg flex-1 ml-2"
              >
                <ThemedText className="text-blue-600 text-center font-semibold">➕</ThemedText>
                <ThemedText className="text-blue-600 text-center font-semibold mt-1">Add Bet</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Receipts Quick Access */}
          <ThemedView className="mb-6">
            <ThemedView className="flex-row items-center justify-between mb-3">
              <ThemedText type="subtitle" className="text-lg font-semibold">Receipts</ThemedText>
              <TouchableOpacity onPress={() => router.push('/receipts')}>
                <ThemedText className="text-blue-600 font-medium">View All</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <TouchableOpacity 
              onPress={() => router.push('/receipts')}
              className="bg-white p-4 rounded-lg shadow-sm"
            >
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-2xl mr-3">📄</ThemedText>
                <ThemedView className="flex-1">
                  <ThemedText className="font-medium">3 Receipts Uploaded</ThemedText>
                  <ThemedText className="text-sm text-gray-600">2 processed, 1 pending</ThemedText>
                </ThemedView>
                <ThemedText className="text-gray-400">›</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>

          {/* Recent Activity */}
          <ThemedView className="mb-6">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-3">Recent Activity</ThemedText>
            
            <ThemedView className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-1">
                  <ThemedText className="font-medium">Chiefs vs Bills</ThemedText>
                  <ThemedText className="text-sm text-gray-600">Kansas City Chiefs ML</ThemedText>
                  <ThemedText className="text-xs text-gray-500">2 hours ago</ThemedText>
                </ThemedView>
                <ThemedView className="bg-yellow-100 px-2 py-1 rounded">
                  <ThemedText className="text-yellow-800 text-xs font-medium">PENDING</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-1">
                  <ThemedText className="font-medium">Lakers vs Warriors</ThemedText>
                  <ThemedText className="text-sm text-gray-600">Over 225.5 Points</ThemedText>
                  <ThemedText className="text-xs text-gray-500">Yesterday</ThemedText>
                </ThemedView>
                <ThemedView className="bg-green-100 px-2 py-1 rounded">
                  <ThemedText className="text-green-800 text-xs font-medium">WON</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* AI Insights */}
          <ThemedView className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6">
            <ThemedView className="flex-row items-center mb-3">
              <ThemedText className="text-2xl mr-2">🤖</ThemedText>
              <ThemedText type="subtitle" className="text-lg font-semibold">AI Insight</ThemedText>
            </ThemedView>
            <ThemedText className="text-gray-700 text-sm">
              Your NFL betting performance has improved 15% this month. Consider increasing your stake size for confidence bets.
            </ThemedText>
          </ThemedView>

          {/* Performance Chart Placeholder */}
          <ThemedView className="bg-white p-4 rounded-lg shadow-sm">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-4">This Week's Performance</ThemedText>
            <ThemedView className="h-32 bg-gray-50 rounded-lg justify-center items-center">
              <ThemedText className="text-gray-500">📈</ThemedText>
              <ThemedText className="text-gray-500 text-sm mt-2">Chart coming soon</ThemedText>
            </ThemedView>
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