import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { offlineApiClient } from '@/lib/offline-api-client';

const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'Soccer', 'Tennis', 'Golf', 'MMA', 'Boxing', 'Other'];
const BET_TYPES = ['STRAIGHT', 'PARLAY', 'PROP'];

export default function BetEntryScreen() {
  const [formData, setFormData] = useState({
    type: 'STRAIGHT',
    sport: '',
    amount: '',
    odds: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.sport) {
      Alert.alert('Error', 'Please select a sport');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount');
      return false;
    }
    if (!formData.odds) {
      Alert.alert('Error', 'Please enter the odds');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a bet description');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await offlineApiClient.createBet({
        type: formData.type as 'STRAIGHT' | 'PARLAY' | 'PROP',
        sport: formData.sport,
        amount: parseFloat(formData.amount),
        odds: formData.odds,
        description: formData.description,
        status: 'PENDING',
      });
      
      const isOffline = !offlineApiClient.isOnline();
      const message = isOffline 
        ? 'Bet saved offline! It will sync when you\'re back online.'
        : 'Bet added successfully!';
      
      Alert.alert(
        'Success',
        message,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add bet');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayout = () => {
    const amount = parseFloat(formData.amount);
    const odds = formData.odds;
    
    if (!amount || !odds) return 0;

    try {
      if (odds.startsWith('+')) {
        const oddsValue = parseInt(odds.substring(1));
        return amount + (amount * (oddsValue / 100));
      } else if (odds.startsWith('-')) {
        const oddsValue = parseInt(odds.substring(1));
        return amount + (amount * (100 / oddsValue));
      } else {
        const oddsValue = parseFloat(odds);
        return amount * oddsValue;
      }
    } catch {
      return 0;
    }
  };

  const potentialPayout = calculatePayout();

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView className="flex-1 p-6">
          {/* Header */}
          <ThemedView className="mb-6">
            <ThemedView className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <ThemedText className="text-blue-600 text-lg">← Back</ThemedText>
              </TouchableOpacity>
              <ThemedText type="title" className="text-2xl font-bold">Quick Bet Entry</ThemedText>
            </ThemedView>
            <ThemedText className="text-gray-600">
              Add a new bet to your tracking
            </ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView className="space-y-6">
            {/* Bet Type */}
            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-3">Bet Type</ThemedText>
              <ThemedView className="flex-row">
                {BET_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleInputChange('type', type)}
                    className={`flex-1 p-3 mr-2 rounded-lg border ${
                      formData.type === type
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <ThemedText className={`text-center font-medium ${
                      formData.type === type ? 'text-white' : 'text-gray-700'
                    }`}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            {/* Sport */}
            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-3">Sport</ThemedText>
              <ThemedView className="flex-row flex-wrap">
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => handleInputChange('sport', sport)}
                    className={`p-2 m-1 rounded-lg border ${
                      formData.sport === sport
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <ThemedText className={`text-sm font-medium ${
                      formData.sport === sport ? 'text-white' : 'text-gray-700'
                    }`}>
                      {sport}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            {/* Description */}
            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-2">Bet Description</ThemedText>
              <ThemedView className="border border-gray-300 rounded-lg p-4">
                <ThemedText 
                  style={{ fontSize: 16, minHeight: 60 }}
                  onChangeText={(value) => handleInputChange('description', value)}
                  value={formData.description}
                  placeholder="e.g., Chiefs ML, Lakers +5.5, Over 47.5 points"
                  multiline
                  textAlignVertical="top"
                />
              </ThemedView>
            </ThemedView>

            {/* Amount and Odds */}
            <ThemedView className="flex-row space-x-4">
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-700 font-medium mb-2">Bet Amount ($)</ThemedText>
                <ThemedView className="border border-gray-300 rounded-lg p-4">
                  <ThemedText 
                    style={{ fontSize: 16 }}
                    onChangeText={(value) => handleInputChange('amount', value)}
                    value={formData.amount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView className="flex-1">
                <ThemedText className="text-gray-700 font-medium mb-2">Odds</ThemedText>
                <ThemedView className="border border-gray-300 rounded-lg p-4">
                  <ThemedText 
                    style={{ fontSize: 16 }}
                    onChangeText={(value) => handleInputChange('odds', value)}
                    value={formData.odds}
                    placeholder="+150, -110, 2.5"
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Potential Payout */}
            {potentialPayout > 0 && (
              <ThemedView className="bg-green-50 p-4 rounded-lg">
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedText className="text-green-700 font-medium">Potential Payout:</ThemedText>
                  <ThemedText className="text-green-800 text-xl font-bold">
                    ${potentialPayout.toFixed(2)}
                  </ThemedText>
                </ThemedView>
                <ThemedView className="flex-row justify-between items-center mt-1">
                  <ThemedText className="text-green-600 text-sm">Potential Profit:</ThemedText>
                  <ThemedText className="text-green-700 font-semibold">
                    +${(potentialPayout - parseFloat(formData.amount || '0')).toFixed(2)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isLoading}
              className={`bg-blue-600 p-4 rounded-lg items-center mt-6 ${
                isLoading ? 'opacity-50' : ''
              }`}
            >
              <ThemedText className="text-white text-lg font-semibold">
                {isLoading ? 'Adding Bet...' : 'Add Bet'}
              </ThemedText>
            </TouchableOpacity>

            {/* Quick Tips */}
            <ThemedView className="bg-blue-50 p-4 rounded-lg mt-4">
              <ThemedText className="text-blue-800 font-medium mb-2">💡 Quick Tips</ThemedText>
              <ThemedView className="space-y-1">
                <ThemedText className="text-blue-700 text-sm">
                  • Use + for positive odds (e.g., +150)
                </ThemedText>
                <ThemedText className="text-blue-700 text-sm">
                  • Use - for negative odds (e.g., -110)
                </ThemedText>
                <ThemedText className="text-blue-700 text-sm">
                  • Include team names and bet type in description
                </ThemedText>
                <ThemedText className="text-blue-700 text-sm">
                  • Be specific: "Chiefs ML" not just "Chiefs"
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
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