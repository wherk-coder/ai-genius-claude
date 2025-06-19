import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { biometricAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricStatus, setBiometricStatus] = useState({
    available: false,
    enabled: false,
    displayName: 'Biometric Authentication'
  });

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const status = await biometricAuth.getBiometricStatus();
    setBiometricStatus(status);
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleBiometricToggle = async () => {
    if (biometricStatus.enabled) {
      // Disable biometrics
      Alert.alert(
        'Disable Biometric Login',
        `Are you sure you want to disable ${biometricStatus.displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              await biometricAuth.disableBiometricAuth();
              checkBiometricStatus();
            }
          }
        ]
      );
    } else {
      // Enable biometrics
      const success = await biometricAuth.setupBiometricAuth();
      if (success) {
        checkBiometricStatus();
      }
    }
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Navigate to profile edit screen');
  };

  const handleSubscriptionPress = () => {
    Alert.alert('Subscription', 'Navigate to subscription management');
  };

  const handleSupportPress = () => {
    Alert.alert('Support', 'Contact support options');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive' }
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView className="p-4">
          <ThemedText type="title" className="text-2xl font-bold mb-6">Settings</ThemedText>
          
          {/* Profile Section */}
          <ThemedView className="bg-white rounded-lg mb-6 shadow-sm">
            <TouchableOpacity onPress={handleProfilePress} className="p-4 flex-row items-center">
              <ThemedView className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center mr-4">
                <ThemedText className="text-blue-600 text-xl">👤</ThemedText>
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedText className="font-semibold text-lg">John Doe</ThemedText>
                <ThemedText className="text-gray-600">john@example.com</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Account Settings */}
          <ThemedView className="bg-white rounded-lg mb-6 shadow-sm">
            <ThemedText className="text-gray-600 text-sm font-medium p-4 pb-2">ACCOUNT</ThemedText>
            
            <TouchableOpacity onPress={handleSubscriptionPress} className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">💎</ThemedText>
                <ThemedText className="font-medium">Subscription</ThemedText>
              </ThemedView>
              <ThemedView className="flex-row items-center">
                <ThemedView className="bg-blue-100 px-2 py-1 rounded mr-2">
                  <ThemedText className="text-blue-600 text-xs font-medium">PRO</ThemedText>
                </ThemedView>
                <ThemedText className="text-gray-400">›</ThemedText>
              </ThemedView>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">💰</ThemedText>
                <ThemedText className="font-medium">Betting Limits</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/storage-settings')}
              className="p-4 flex-row items-center justify-between border-b border-gray-100"
            >
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">💾</ThemedText>
                <ThemedText className="font-medium">Storage & Sync</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">📊</ThemedText>
                <ThemedText className="font-medium">Export Data</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Preferences */}
          <ThemedView className="bg-white rounded-lg mb-6 shadow-sm">
            <ThemedText className="text-gray-600 text-sm font-medium p-4 pb-2">PREFERENCES</ThemedText>
            
            <TouchableOpacity 
              onPress={() => router.push('/notification-settings')}
              className="p-4 flex-row items-center justify-between border-b border-gray-100"
            >
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">🔔</ThemedText>
                <ThemedText className="font-medium">Notifications</ThemedText>
              </ThemedView>
              <ThemedView className="flex-row items-center">
                <ThemedView className={`w-12 h-6 rounded-full ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <ThemedView className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${notificationsEnabled ? 'ml-6' : 'ml-0.5'}`} />
                </ThemedView>
                <ThemedText className="text-gray-400 ml-2">›</ThemedText>
              </ThemedView>
            </TouchableOpacity>

            <ThemedView className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <ThemedView className="flex-row items-center flex-1">
                <ThemedText className="text-lg mr-3">🔒</ThemedText>
                <ThemedView className="flex-1">
                  <ThemedText className="font-medium">{biometricStatus.displayName}</ThemedText>
                  {!biometricStatus.available && (
                    <ThemedText className="text-xs text-gray-500">Not available on this device</ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
              <TouchableOpacity 
                onPress={handleBiometricToggle}
                disabled={!biometricStatus.available}
              >
                <ThemedView className={`w-12 h-6 rounded-full ${
                  biometricStatus.enabled ? 'bg-blue-600' : 'bg-gray-300'
                } ${!biometricStatus.available ? 'opacity-50' : ''}`}>
                  <ThemedView className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    biometricStatus.enabled ? 'ml-6' : 'ml-0.5'
                  }`} />
                </ThemedView>
              </TouchableOpacity>
            </ThemedView>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">🌍</ThemedText>
                <ThemedText className="font-medium">Language</ThemedText>
              </ThemedView>
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-gray-600 mr-2">English</ThemedText>
                <ThemedText className="text-gray-400">›</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>

          {/* Support */}
          <ThemedView className="bg-white rounded-lg mb-6 shadow-sm">
            <ThemedText className="text-gray-600 text-sm font-medium p-4 pb-2">SUPPORT</ThemedText>
            
            <TouchableOpacity onPress={handleSupportPress} className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">❓</ThemedText>
                <ThemedText className="font-medium">Help & Support</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-gray-100">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">📝</ThemedText>
                <ThemedText className="font-medium">Terms of Service</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <ThemedView className="flex-row items-center">
                <ThemedText className="text-lg mr-3">🔐</ThemedText>
                <ThemedText className="font-medium">Privacy Policy</ThemedText>
              </ThemedView>
              <ThemedText className="text-gray-400">›</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* App Info */}
          <ThemedView className="bg-white rounded-lg mb-6 shadow-sm">
            <ThemedView className="p-4">
              <ThemedText className="text-gray-600 text-sm">App Version</ThemedText>
              <ThemedText className="font-medium">1.0.0 (Build 1)</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} className="bg-red-50 p-4 rounded-lg">
            <ThemedText className="text-red-600 text-center font-semibold">Logout</ThemedText>
          </TouchableOpacity>
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