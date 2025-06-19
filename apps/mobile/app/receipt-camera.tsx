import { StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { cameraManager } from '@/lib/camera';
import mobileApiClient from '@/lib/api-client';

export default function ReceiptCameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const permissions = await cameraManager.requestPermissions();
    setHasPermission(permissions.camera);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const selectFromLibrary = async () => {
    const result = await cameraManager.pickImage();
    if (result.success && result.uri) {
      setCapturedImage(result.uri);
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const processReceipt = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Create file object for React Native
      const file = new (window as any).File(
        [await fetch(capturedImage).then(r => r.blob())],
        'receipt.jpg',
        { type: 'image/jpeg' }
      );
      
      formData.append('receipt', file);

      // Upload and process receipt
      const result = await mobileApiClient.uploadReceipt(formData);
      
      Alert.alert(
        'Success',
        'Receipt processed successfully! The bet has been added to your tracking.',
        [
          {
            text: 'View Bets',
            onPress: () => router.push('/(tabs)'),
          },
          {
            text: 'Take Another',
            onPress: retakePicture,
          },
        ]
      );
    } catch (error: any) {
      console.error('Receipt processing error:', error);
      Alert.alert(
        'Processing Failed', 
        error.message || 'Failed to process receipt. You can try again or add the bet manually.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={{ marginTop: 16, color: '#6b7280' }}>
            Requesting camera permission...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centered}>
          <ThemedText className="text-xl font-bold mb-4">
            📷 Camera Access Required
          </ThemedText>
          <ThemedText className="text-gray-600 text-center mb-6">
            To scan betting receipts, we need access to your camera. 
            Please enable camera permissions in your device settings.
          </ThemedText>
          <TouchableOpacity 
            onPress={requestPermissions}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <ThemedText className="text-white font-semibold">
              Try Again
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-4"
          >
            <ThemedText className="text-blue-600">
              Go Back
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  if (capturedImage) {
    return (
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText className="text-blue-600 text-lg">← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold">Receipt Preview</ThemedText>
          <View style={{ width: 60 }} />
        </ThemedView>

        {/* Image Preview */}
        <ThemedView style={styles.imageContainer}>
          <Image 
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            contentFit="contain"
          />
        </ThemedView>

        {/* Processing Status */}
        {isUploading && (
          <ThemedView className="absolute inset-0 bg-black/50 items-center justify-center">
            <ThemedView className="bg-white p-6 rounded-lg items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <ThemedText className="mt-4 font-semibold">Processing Receipt...</ThemedText>
              <ThemedText className="text-gray-600 text-center mt-2">
                Extracting bet information using AI
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={retakePicture}
            disabled={isUploading}
            className="flex-1 bg-gray-100 p-4 rounded-lg mr-2"
          >
            <ThemedText className="text-gray-700 text-center font-semibold">
              Retake
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={processReceipt}
            disabled={isUploading}
            className="flex-1 bg-blue-600 p-4 rounded-lg ml-2"
          >
            <ThemedText className="text-white text-center font-semibold">
              {isUploading ? 'Processing...' : 'Process Receipt'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tips */}
        <ThemedView className="bg-blue-50 p-4 rounded-lg mx-4 mb-4">
          <ThemedText className="text-blue-800 font-medium mb-2">
            💡 Tips for best results:
          </ThemedText>
          <ThemedText className="text-blue-700 text-sm">
            • Ensure all text is clearly visible and not blurred{'\n'}
            • Make sure the entire receipt is in frame{'\n'}
            • Avoid shadows or glare on the receipt
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText className="text-white text-lg">← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText className="text-white text-lg font-semibold">
          Scan Receipt
        </ThemedText>
        <TouchableOpacity onPress={toggleFlash}>
          <ThemedText className="text-white text-xl">
            {flashMode === FlashMode.off ? '🔦' : '💡'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Camera View */}
      <Camera 
        style={styles.camera}
        type={type}
        flashMode={flashMode}
        ref={cameraRef}
      >
        {/* Camera Overlay */}
        <ThemedView style={styles.overlay}>
          {/* Viewfinder */}
          <ThemedView style={styles.viewfinder}>
            <ThemedView style={styles.viewfinderBorder} />
          </ThemedView>
          
          {/* Instructions */}
          <ThemedView style={styles.instructions}>
            <ThemedText className="text-white text-center font-medium">
              Position your betting receipt within the frame
            </ThemedText>
            <ThemedText className="text-white/80 text-center text-sm mt-1">
              Make sure all text is clearly visible
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Camera>

      {/* Controls */}
      <ThemedView style={styles.controls}>
        <TouchableOpacity 
          onPress={selectFromLibrary}
          className="bg-gray-800/80 p-4 rounded-full"
        >
          <ThemedText className="text-white text-xl">📷</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={takePicture}
          disabled={isProcessing}
          style={styles.captureButton}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedView style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setType(
            type === CameraType.back ? CameraType.front : CameraType.back
          )}
          className="bg-gray-800/80 p-4 rounded-full"
        >
          <ThemedText className="text-white text-xl">🔄</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderBorder: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    margin: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
  },
});