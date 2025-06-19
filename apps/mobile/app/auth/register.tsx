import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import mobileApiClient from '@/lib/api-client';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await mobileApiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      Alert.alert(
        'Success',
        'Account created successfully! Welcome to AI Betting Assistant.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView className="flex-1 justify-center p-6">
          {/* Header */}
          <ThemedView className="mb-8 items-center">
            <ThemedView className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
              <ThemedText className="text-white text-3xl">🎯</ThemedText>
            </ThemedView>
            <ThemedText type="title" className="text-3xl font-bold text-center mb-2">
              Join AI Betting
            </ThemedText>
            <ThemedText className="text-gray-600 text-center">
              Create your account to start tracking your bets
            </ThemedText>
          </ThemedView>

          {/* Registration Form */}
          <ThemedView className="space-y-4 mb-6">
            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-2">Full Name</ThemedText>
              <ThemedView className="border border-gray-300 rounded-lg p-4">
                <ThemedText 
                  style={{ fontSize: 16 }}
                  onChangeText={(value) => handleInputChange('name', value)}
                  value={formData.name}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </ThemedView>
            </ThemedView>

            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-2">Email</ThemedText>
              <ThemedView className="border border-gray-300 rounded-lg p-4">
                <ThemedText 
                  style={{ fontSize: 16 }}
                  onChangeText={(value) => handleInputChange('email', value)}
                  value={formData.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-2">Password</ThemedText>
              <ThemedView className="border border-gray-300 rounded-lg p-4 flex-row items-center">
                <ThemedView className="flex-1">
                  <ThemedText 
                    style={{ fontSize: 16 }}
                    onChangeText={(value) => handleInputChange('password', value)}
                    value={formData.password}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                  />
                </ThemedView>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <ThemedText className="text-gray-500 ml-2">
                    {showPassword ? '🙈' : '👁️'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <ThemedText className="text-gray-500 text-sm mt-1">
                Must be at least 8 characters long
              </ThemedText>
            </ThemedView>

            <ThemedView>
              <ThemedText className="text-gray-700 font-medium mb-2">Confirm Password</ThemedText>
              <ThemedView className="border border-gray-300 rounded-lg p-4 flex-row items-center">
                <ThemedView className="flex-1">
                  <ThemedText 
                    style={{ fontSize: 16 }}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    value={formData.confirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                  />
                </ThemedView>
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <ThemedText className="text-gray-500 ml-2">
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* Terms Acceptance */}
            <ThemedView className="flex-row items-start mt-4">
              <TouchableOpacity 
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="mr-3 mt-1"
              >
                <ThemedView className={`w-5 h-5 rounded border-2 items-center justify-center ${
                  acceptedTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {acceptedTerms && (
                    <ThemedText className="text-white text-xs">✓</ThemedText>
                  )}
                </ThemedView>
              </TouchableOpacity>
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-700 text-sm leading-5">
                  I agree to the{' '}
                  <ThemedText className="text-blue-600 font-medium">
                    Terms of Service
                  </ThemedText>
                  {' '}and{' '}
                  <ThemedText className="text-blue-600 font-medium">
                    Privacy Policy
                  </ThemedText>
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Register Button */}
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={isLoading}
            className={`bg-blue-600 p-4 rounded-lg items-center mb-6 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            <ThemedText className="text-white text-lg font-semibold">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </ThemedText>
          </TouchableOpacity>

          {/* Sign In Link */}
          <ThemedView className="flex-row justify-center">
            <ThemedText className="text-gray-600">Already have an account? </ThemedText>
            <TouchableOpacity onPress={handleSignIn}>
              <ThemedText className="text-blue-600 font-semibold">Sign In</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Benefits */}
          <ThemedView className="mt-8 p-4 bg-gray-50 rounded-lg">
            <ThemedText className="text-gray-700 font-medium mb-3 text-center">
              What you'll get:
            </ThemedText>
            <ThemedView className="space-y-2">
              <ThemedText className="text-gray-600 text-sm">
                ✓ Track unlimited bets across all sports
              </ThemedText>
              <ThemedText className="text-gray-600 text-sm">
                ✓ AI-powered insights and recommendations
              </ThemedText>
              <ThemedText className="text-gray-600 text-sm">
                ✓ Receipt scanning with automatic data entry
              </ThemedText>
              <ThemedText className="text-gray-600 text-sm">
                ✓ Advanced analytics and performance tracking
              </ThemedText>
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