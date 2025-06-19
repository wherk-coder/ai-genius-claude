import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import mobileApiClient from '@/lib/api-client';
import { biometricAuth } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState({
    available: false,
    enabled: false,
    displayName: 'Biometric Authentication'
  });

  useEffect(() => {
    checkBiometricStatus();
    attemptBiometricLogin();
  }, []);

  const checkBiometricStatus = async () => {
    const status = await biometricAuth.getBiometricStatus();
    setBiometricStatus(status);
  };

  const attemptBiometricLogin = async () => {
    const success = await biometricAuth.quickLogin();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await mobileApiClient.login(email, password, rememberMe);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const result = await biometricAuth.authenticate('Sign in to your account');
    if (result.success) {
      router.replace('/(tabs)');
    } else if (result.error) {
      Alert.alert('Authentication Failed', result.error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView className="flex-1 justify-center p-6">
        {/* Header */}
        <ThemedView className="mb-10 items-center">
          <ThemedView className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <ThemedText className="text-white text-3xl">🎯</ThemedText>
          </ThemedView>
          <ThemedText type="title" className="text-3xl font-bold text-center mb-2">
            Welcome Back
          </ThemedText>
          <ThemedText className="text-gray-600 text-center">
            Sign in to your AI Betting Assistant account
          </ThemedText>
        </ThemedView>

        {/* Biometric Login */}
        {biometricStatus.available && biometricStatus.enabled && (
          <ThemedView className="mb-6">
            <TouchableOpacity 
              onPress={handleBiometricLogin}
              className="bg-blue-50 border border-blue-200 p-4 rounded-lg items-center"
            >
              <ThemedText className="text-blue-600 text-lg font-semibold mb-1">
                🔒 Use {biometricStatus.displayName}
              </ThemedText>
              <ThemedText className="text-blue-500 text-sm">
                Quick and secure authentication
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedView className="flex-row items-center my-6">
              <ThemedView className="flex-1 h-px bg-gray-300" />
              <ThemedText className="mx-4 text-gray-500">or</ThemedText>
              <ThemedView className="flex-1 h-px bg-gray-300" />
            </ThemedView>
          </ThemedView>
        )}

        {/* Email Login Form */}
        <ThemedView className="space-y-4 mb-6">
          <ThemedView>
            <ThemedText className="text-gray-700 font-medium mb-2">Email</ThemedText>
            <ThemedView className="border border-gray-300 rounded-lg p-4">
              <ThemedText 
                style={{ fontSize: 16 }}
                onChangeText={setEmail}
                value={email}
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
                  onChangeText={setPassword}
                  value={password}
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
          </ThemedView>

          {/* Remember Me */}
          <ThemedView className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <ThemedView className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {rememberMe && (
                  <ThemedText className="text-white text-xs">✓</ThemedText>
                )}
              </ThemedView>
              <ThemedText className="text-gray-700">Remember me</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <ThemedText className="text-blue-600 font-medium">
                Forgot Password?
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleEmailLogin}
          disabled={isLoading}
          className={`bg-blue-600 p-4 rounded-lg items-center mb-6 ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          <ThemedText className="text-white text-lg font-semibold">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </ThemedText>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <ThemedView className="flex-row justify-center">
          <ThemedText className="text-gray-600">Don't have an account? </ThemedText>
          <TouchableOpacity onPress={handleSignUp}>
            <ThemedText className="text-blue-600 font-semibold">Sign Up</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Demo Credentials */}
        <ThemedView className="mt-8 p-4 bg-gray-50 rounded-lg">
          <ThemedText className="text-gray-600 text-sm text-center mb-2">
            Demo Credentials:
          </ThemedText>
          <ThemedText className="text-gray-700 text-sm text-center">
            Email: demo@example.com{'\n'}
            Password: demo123!
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});