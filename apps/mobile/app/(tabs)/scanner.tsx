import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleCameraPress = () => {
    setIsScanning(true);
    // Simulate camera capture
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert('Receipt Scanned!', 'Bet information extracted successfully');
    }, 2000);
  };

  const handleGalleryPress = () => {
    Alert.alert('Select from Gallery', 'Gallery picker would open here');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView className="flex-1 justify-center items-center p-6">
        <ThemedText type="title" className="text-2xl font-bold mb-2 text-center">
          Receipt Scanner
        </ThemedText>
        <ThemedText className="text-gray-600 text-center mb-8">
          Scan your betting receipts to automatically track your bets
        </ThemedText>

        {/* Camera Preview Area */}
        <ThemedView className="w-full aspect-square bg-gray-100 rounded-xl mb-8 justify-center items-center">
          {isScanning ? (
            <ThemedView className="justify-center items-center">
              <ThemedView className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin mb-4" />
              <ThemedText className="text-blue-600 font-medium">Scanning...</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView className="justify-center items-center">
              <ThemedView className="w-20 h-20 bg-gray-300 rounded-full justify-center items-center mb-4">
                <ThemedText className="text-4xl">📷</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-500">Camera preview</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView className="w-full space-y-4">
          <TouchableOpacity 
            onPress={handleCameraPress}
            disabled={isScanning}
            className={`bg-blue-600 p-4 rounded-lg ${isScanning ? 'opacity-50' : ''}`}
          >
            <ThemedText className="text-white text-center font-semibold text-lg">
              {isScanning ? 'Scanning...' : 'Take Photo'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGalleryPress}
            disabled={isScanning}
            className={`border border-blue-600 p-4 rounded-lg ${isScanning ? 'opacity-50' : ''}`}
          >
            <ThemedText className="text-blue-600 text-center font-semibold text-lg">
              Choose from Gallery
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tips */}
        <ThemedView className="w-full mt-8 bg-blue-50 p-4 rounded-lg">
          <ThemedText className="text-blue-800 font-medium mb-2">💡 Scanning Tips</ThemedText>
          <ThemedText className="text-blue-700 text-sm leading-5">
            • Ensure good lighting{'\n'}
            • Keep receipt flat and straight{'\n'}
            • Include sportsbook name and bet details{'\n'}
            • Avoid shadows and glare
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});