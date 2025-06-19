import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

export interface CameraResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

export class CameraManager {
  private static instance: CameraManager;

  static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  /**
   * Check and request camera permissions
   */
  async requestPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Permission request failed:', error);
      return {
        camera: false,
        mediaLibrary: false,
      };
    }
  }

  /**
   * Check current permissions without requesting
   */
  async checkPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        camera: false,
        mediaLibrary: false,
      };
    }
  }

  /**
   * Launch camera to take a photo
   */
  async takePhoto(): Promise<CameraResult> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.camera) {
        return {
          success: false,
          error: 'Camera permission is required to take photos',
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Photo capture was cancelled',
        };
      }

      return {
        success: true,
        uri: result.assets[0].uri,
      };
    } catch (error: any) {
      console.error('Camera error:', error);
      return {
        success: false,
        error: error.message || 'Failed to take photo',
      };
    }
  }

  /**
   * Pick an image from photo library
   */
  async pickImage(): Promise<CameraResult> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        return {
          success: false,
          error: 'Media library permission is required to select photos',
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Image selection was cancelled',
        };
      }

      return {
        success: true,
        uri: result.assets[0].uri,
      };
    } catch (error: any) {
      console.error('Image picker error:', error);
      return {
        success: false,
        error: error.message || 'Failed to select image',
      };
    }
  }

  /**
   * Show photo options (camera or gallery)
   */
  async showPhotoOptions(): Promise<CameraResult> {
    return new Promise((resolve) => {
      Alert.alert(
        'Add Receipt Photo',
        'Choose how you want to add your receipt photo',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({
              success: false,
              error: 'Photo selection cancelled',
            }),
          },
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.takePhoto();
              resolve(result);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await this.pickImage();
              resolve(result);
            },
          },
        ],
        { cancelable: true }
      );
    });
  }

  /**
   * Save image to device photo library
   */
  async saveToLibrary(uri: string): Promise<boolean> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        throw new Error('Media library permission is required to save photos');
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (error: any) {
      console.error('Save to library error:', error);
      return false;
    }
  }

  /**
   * Get image info including dimensions
   */
  async getImageInfo(uri: string) {
    try {
      // Use fetch to get basic info instead of deprecated getImageInfoAsync
      const response = await fetch(uri);
      const blob = await response.blob();
      return {
        uri,
        width: 0, // Would need native implementation for actual dimensions
        height: 0,
        size: blob.size,
      };
    } catch (error) {
      console.error('Get image info error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cameraManager = CameraManager.getInstance();