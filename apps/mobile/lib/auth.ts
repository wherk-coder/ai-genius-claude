import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType[];
}

class BiometricAuth {
  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.log('Error checking biometric availability:', error);
      return false;
    }
  }

  // Get available biometric types
  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.log('Error getting supported auth types:', error);
      return [];
    }
  }

  // Get human-readable biometric type name
  getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID / Fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
    return 'Biometric Authentication';
  }

  // Check if biometric login is enabled by user
  async isBiometricLoginEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.log('Error checking biometric login status:', error);
      return false;
    }
  }

  // Enable/disable biometric login
  async setBiometricLoginEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync('biometric_enabled', enabled.toString());
    } catch (error) {
      console.log('Error setting biometric login status:', error);
      throw new Error('Failed to update biometric settings');
    }
  }

  // Authenticate with biometrics
  async authenticate(reason?: string): Promise<BiometricAuthResult> {
    try {
      // Check if biometrics are available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Get supported types for better user messaging
      const supportedTypes = await this.getSupportedTypes();
      const biometricName = this.getBiometricTypeName(supportedTypes);

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || `Use ${biometricName} to access your account`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
          biometricType: supportedTypes
        };
      } else {
        let errorMessage = 'Authentication failed';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication was cancelled by user';
        } else if (result.error === 'system_cancel') {
          errorMessage = 'Authentication was cancelled by system';
        } else if (result.error === 'lockout') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (result.error === 'not_available') {
          errorMessage = 'Biometric authentication is not available';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'No biometric data is enrolled on this device';
        }

        return {
          success: false,
          error: errorMessage,
          biometricType: supportedTypes
        };
      }
    } catch (error) {
      console.log('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during authentication'
      };
    }
  }

  // Setup biometric authentication (first time setup)
  async setupBiometricAuth(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (!hasHardware) {
          Alert.alert(
            'Not Supported',
            'Biometric authentication is not supported on this device.'
          );
          return false;
        }
        
        if (!isEnrolled) {
          Alert.alert(
            'Setup Required',
            'Please set up biometric authentication in your device settings first.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => LocalAuthentication.authenticateAsync() }
            ]
          );
          return false;
        }
      }

      // Test authentication
      const supportedTypes = await this.getSupportedTypes();
      const biometricName = this.getBiometricTypeName(supportedTypes);
      
      const result = await this.authenticate(`Enable ${biometricName} for quick access`);
      
      if (result.success) {
        await this.setBiometricLoginEnabled(true);
        Alert.alert(
          'Success',
          `${biometricName} has been enabled for your account.`
        );
        return true;
      } else {
        Alert.alert(
          'Setup Failed',
          result.error || 'Failed to enable biometric authentication'
        );
        return false;
      }
    } catch (error) {
      console.log('Error setting up biometric auth:', error);
      Alert.alert(
        'Error',
        'An error occurred while setting up biometric authentication'
      );
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometricAuth(): Promise<void> {
    try {
      await this.setBiometricLoginEnabled(false);
      Alert.alert(
        'Disabled',
        'Biometric authentication has been disabled for your account.'
      );
    } catch (error) {
      console.log('Error disabling biometric auth:', error);
      Alert.alert(
        'Error',
        'Failed to disable biometric authentication'
      );
    }
  }

  // Quick login with biometrics (for app launch)
  async quickLogin(): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricLoginEnabled();
      if (!isEnabled) {
        return false;
      }

      const result = await this.authenticate('Use biometrics to sign in');
      return result.success;
    } catch (error) {
      console.log('Quick login error:', error);
      return false;
    }
  }

  // Get biometric status info for UI display
  async getBiometricStatus(): Promise<{
    available: boolean;
    enabled: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
    displayName: string;
  }> {
    try {
      const available = await this.isAvailable();
      const enabled = await this.isBiometricLoginEnabled();
      const supportedTypes = await this.getSupportedTypes();
      const displayName = this.getBiometricTypeName(supportedTypes);

      return {
        available,
        enabled,
        supportedTypes,
        displayName
      };
    } catch (error) {
      console.log('Error getting biometric status:', error);
      return {
        available: false,
        enabled: false,
        supportedTypes: [],
        displayName: 'Biometric Authentication'
      };
    }
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuth();
export default biometricAuth;