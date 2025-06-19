import { StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import mobileApiClient from '@/lib/api-client';

interface Receipt {
  id: string;
  imageUrl: string;
  uploadDate: string;
  processed: boolean;
  betId?: string;
  extractedData?: any;
}

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      // This would call a real API endpoint to get receipts
      // For now, we'll show some demo data
      const demoReceipts: Receipt[] = [
        {
          id: '1',
          imageUrl: 'https://via.placeholder.com/200x300/e5e7eb/6b7280?text=Receipt+1',
          uploadDate: '2024-01-15T10:30:00Z',
          processed: true,
          betId: 'bet_1',
        },
        {
          id: '2',
          imageUrl: 'https://via.placeholder.com/200x300/e5e7eb/6b7280?text=Receipt+2',
          uploadDate: '2024-01-14T15:45:00Z',
          processed: true,
          betId: 'bet_2',
        },
        {
          id: '3',
          imageUrl: 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Processing...',
          uploadDate: '2024-01-14T12:20:00Z',
          processed: false,
        },
      ];
      
      setReceipts(demoReceipts);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      Alert.alert('Error', 'Failed to load receipts');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReceiptPress = (receipt: Receipt) => {
    if (receipt.processed && receipt.betId) {
      Alert.alert(
        'Receipt Processed',
        'This receipt has been processed and converted to a bet.',
        [
          { text: 'OK' },
          { text: 'View Bet', onPress: () => router.push('/(tabs)') },
        ]
      );
    } else {
      Alert.alert(
        'Receipt Processing',
        receipt.processed ? 
          'This receipt has been processed but no bet was extracted.' :
          'This receipt is still being processed. Please check back later.'
      );
    }
  };

  const renderReceipt = ({ item }: { item: Receipt }) => (
    <TouchableOpacity 
      onPress={() => handleReceiptPress(item)}
      className="bg-white rounded-lg shadow-sm mr-4 mb-4"
      style={{ width: 150 }}
    >
      <ThemedView className="relative">
        <Image 
          source={{ uri: item.imageUrl }}
          style={{ width: 150, height: 200, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          contentFit="cover"
        />
        
        {/* Status Badge */}
        <ThemedView className={`absolute top-2 right-2 px-2 py-1 rounded ${
          item.processed ? 'bg-green-500' : 'bg-yellow-500'
        }`}>
          <ThemedText className="text-white text-xs font-medium">
            {item.processed ? '✓' : '⏳'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView className="p-3">
        <ThemedText className="text-sm font-medium mb-1">
          {formatDate(item.uploadDate)}
        </ThemedText>
        <ThemedText className={`text-xs ${
          item.processed ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {item.processed ? 'Processed' : 'Processing...'}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <ThemedView className="flex-1 items-center justify-center py-12">
      <ThemedText className="text-6xl mb-4">📷</ThemedText>
      <ThemedText className="text-xl font-semibold mb-2">No Receipts Yet</ThemedText>
      <ThemedText className="text-gray-600 text-center mb-6 px-6">
        Start by scanning your betting receipts to automatically track your bets
      </ThemedText>
      <TouchableOpacity 
        onPress={() => router.push('/receipt-camera')}
        className="bg-blue-600 px-6 py-3 rounded-lg"
      >
        <ThemedText className="text-white font-semibold">Scan First Receipt</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView className="flex-row items-center justify-between p-4 pb-2">
        <ThemedView className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ThemedText className="text-blue-600 text-lg">← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" className="text-2xl font-bold">Receipt Gallery</ThemedText>
        </ThemedView>
        <TouchableOpacity onPress={() => router.push('/receipt-camera')}>
          <ThemedText className="text-blue-600 text-2xl">📷</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Content */}
      {isLoading ? (
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText className="text-gray-600">Loading receipts...</ThemedText>
        </ThemedView>
      ) : receipts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.receiptList}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      {receipts.length > 0 && (
        <TouchableOpacity 
          onPress={() => router.push('/receipt-camera')}
          className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ elevation: 8 }}
        >
          <ThemedText className="text-white text-2xl">📷</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiptList: {
    padding: 16,
    paddingBottom: 100,
  },
});