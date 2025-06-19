import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AnalyticsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView className="p-4">
          <ThemedText type="title" className="text-2xl font-bold mb-6">Analytics</ThemedText>
          
          {/* Performance Overview */}
          <ThemedView className="bg-white p-4 rounded-lg mb-6 shadow-sm">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-4">Performance Overview</ThemedText>
            
            <ThemedView className="flex-row justify-between mb-4">
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-600 text-sm">Total Bets</ThemedText>
                <ThemedText className="text-2xl font-bold text-gray-900">127</ThemedText>
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-600 text-sm">Win Rate</ThemedText>
                <ThemedText className="text-2xl font-bold text-green-600">68.5%</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView className="flex-row justify-between">
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-600 text-sm">Total Wagered</ThemedText>
                <ThemedText className="text-2xl font-bold text-gray-900">$3,247</ThemedText>
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-600 text-sm">Net Profit</ThemedText>
                <ThemedText className="text-2xl font-bold text-green-600">+$421</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Chart Placeholder */}
          <ThemedView className="bg-white p-4 rounded-lg mb-6 shadow-sm">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-4">Profit Trend (Last 30 Days)</ThemedText>
            <ThemedView className="h-40 bg-gray-50 rounded-lg justify-center items-center">
              <ThemedText className="text-gray-500">📈</ThemedText>
              <ThemedText className="text-gray-500 text-sm mt-2">Chart will be displayed here</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Sport Breakdown */}
          <ThemedView className="bg-white p-4 rounded-lg mb-6 shadow-sm">
            <ThemedText type="subtitle" className="text-lg font-semibold mb-4">Sport Breakdown</ThemedText>
            
            <ThemedView className="space-y-3">
              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-row items-center flex-1">
                  <ThemedText className="text-2xl mr-3">🏈</ThemedText>
                  <ThemedView>
                    <ThemedText className="font-medium">NFL</ThemedText>
                    <ThemedText className="text-sm text-gray-600">42 bets</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView className="items-end">
                  <ThemedText className="font-semibold text-green-600">+$156</ThemedText>
                  <ThemedText className="text-sm text-gray-600">71% win rate</ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-row items-center flex-1">
                  <ThemedText className="text-2xl mr-3">🏀</ThemedText>
                  <ThemedView>
                    <ThemedText className="font-medium">NBA</ThemedText>
                    <ThemedText className="text-sm text-gray-600">31 bets</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView className="items-end">
                  <ThemedText className="font-semibold text-green-600">+$89</ThemedText>
                  <ThemedText className="text-sm text-gray-600">65% win rate</ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-row items-center flex-1">
                  <ThemedText className="text-2xl mr-3">⚽</ThemedText>
                  <ThemedView>
                    <ThemedText className="font-medium">Soccer</ThemedText>
                    <ThemedText className="text-sm text-gray-600">24 bets</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView className="items-end">
                  <ThemedText className="font-semibold text-red-600">-$12</ThemedText>
                  <ThemedText className="text-sm text-gray-600">58% win rate</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* AI Insights */}
          <ThemedView className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <ThemedView className="flex-row items-center mb-3">
              <ThemedText className="text-2xl mr-2">🤖</ThemedText>
              <ThemedText type="subtitle" className="text-lg font-semibold">AI Insights</ThemedText>
            </ThemedView>
            
            <ThemedView className="space-y-2">
              <ThemedText className="text-sm text-gray-700">
                • Your NFL betting has improved 15% this month
              </ThemedText>
              <ThemedText className="text-sm text-gray-700">
                • Consider reducing soccer bet sizes based on recent performance
              </ThemedText>
              <ThemedText className="text-sm text-gray-700">
                • Underdog bets (+200 or higher) have been profitable for you
              </ThemedText>
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