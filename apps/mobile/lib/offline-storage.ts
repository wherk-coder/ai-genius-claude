import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateBetData, BetFilters } from './api-client';

// Storage keys
const STORAGE_KEYS = {
  // User data
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  
  // Betting data
  OFFLINE_BETS: 'offline_bets',
  PENDING_BET_UPLOADS: 'pending_bet_uploads',
  CACHED_BETS: 'cached_bets',
  BET_STATS: 'bet_stats',
  
  // Analytics data
  ANALYTICS_OVERVIEW: 'analytics_overview',
  BETTING_TRENDS: 'betting_trends',
  SPORT_BREAKDOWN: 'sport_breakdown',
  
  // App data
  LAST_SYNC: 'last_sync',
  APP_SETTINGS: 'app_settings',
  CACHED_RECEIPTS: 'cached_receipts',
  
  // Sync queue
  SYNC_QUEUE: 'sync_queue',
} as const;

export interface OfflineBet extends CreateBetData {
  id: string;
  createdAt: string;
  synced: boolean;
}

export interface PendingUpload {
  id: string;
  type: 'bet' | 'receipt' | 'profile_update';
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface CachedData<T = any> {
  data: T;
  timestamp: string;
  expiresAt?: string;
}

export interface SyncStatus {
  lastSync: string;
  pendingUploads: number;
  isOnline: boolean;
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  /**
   * Generic storage methods
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Cached data with expiration
   */
  async setCachedData<T>(key: string, data: T, expirationMinutes?: number): Promise<void> {
    const cachedData: CachedData<T> = {
      data,
      timestamp: new Date().toISOString(),
      expiresAt: expirationMinutes 
        ? new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString()
        : undefined,
    };
    await this.setItem(key, cachedData);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cachedData = await this.getItem<CachedData<T>>(key);
    
    if (!cachedData) return null;
    
    // Check if data has expired
    if (cachedData.expiresAt && new Date() > new Date(cachedData.expiresAt)) {
      await this.removeItem(key);
      return null;
    }
    
    return cachedData.data;
  }

  /**
   * Offline bets management
   */
  async saveOfflineBet(bet: CreateBetData): Promise<OfflineBet> {
    const offlineBet: OfflineBet = {
      ...bet,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    const existingBets = await this.getOfflineBets();
    const updatedBets = [...existingBets, offlineBet];
    await this.setItem(STORAGE_KEYS.OFFLINE_BETS, updatedBets);

    // Add to sync queue
    await this.addToSyncQueue({
      id: offlineBet.id,
      type: 'bet',
      data: bet,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });

    return offlineBet;
  }

  async getOfflineBets(): Promise<OfflineBet[]> {
    return (await this.getItem<OfflineBet[]>(STORAGE_KEYS.OFFLINE_BETS)) || [];
  }

  async markBetAsSynced(id: string): Promise<void> {
    const bets = await this.getOfflineBets();
    const updatedBets = bets.map(bet => 
      bet.id === id ? { ...bet, synced: true } : bet
    );
    await this.setItem(STORAGE_KEYS.OFFLINE_BETS, updatedBets);
  }

  async removeOfflineBet(id: string): Promise<void> {
    const bets = await this.getOfflineBets();
    const updatedBets = bets.filter(bet => bet.id !== id);
    await this.setItem(STORAGE_KEYS.OFFLINE_BETS, updatedBets);
  }

  /**
   * Sync queue management
   */
  async addToSyncQueue(upload: PendingUpload): Promise<void> {
    const queue = await this.getSyncQueue();
    const updatedQueue = [...queue, upload];
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);
  }

  async getSyncQueue(): Promise<PendingUpload[]> {
    return (await this.getItem<PendingUpload[]>(STORAGE_KEYS.SYNC_QUEUE)) || [];
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const updatedQueue = queue.filter(item => item.id !== id);
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);
  }

  async incrementRetryCount(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const updatedQueue = queue.map(item => 
      item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
    );
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);
  }

  /**
   * User data management
   */
  async saveUserProfile(profile: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.USER_PROFILE);
  }

  async saveUserPreferences(preferences: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async getUserPreferences(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Analytics data caching
   */
  async cacheAnalyticsOverview(data: any): Promise<void> {
    await this.setCachedData(STORAGE_KEYS.ANALYTICS_OVERVIEW, data, 30); // 30 minutes
  }

  async getCachedAnalyticsOverview(): Promise<any> {
    return await this.getCachedData(STORAGE_KEYS.ANALYTICS_OVERVIEW);
  }

  async cacheBettingTrends(data: any): Promise<void> {
    await this.setCachedData(STORAGE_KEYS.BETTING_TRENDS, data, 60); // 1 hour
  }

  async getCachedBettingTrends(): Promise<any> {
    return await this.getCachedData(STORAGE_KEYS.BETTING_TRENDS);
  }

  async cacheSportBreakdown(data: any): Promise<void> {
    await this.setCachedData(STORAGE_KEYS.SPORT_BREAKDOWN, data, 60); // 1 hour
  }

  async getCachedSportBreakdown(): Promise<any> {
    return await this.getCachedData(STORAGE_KEYS.SPORT_BREAKDOWN);
  }

  /**
   * Bets caching
   */
  async cacheBets(bets: any[], filters?: BetFilters): Promise<void> {
    const cacheKey = filters 
      ? `${STORAGE_KEYS.CACHED_BETS}_${JSON.stringify(filters)}`
      : STORAGE_KEYS.CACHED_BETS;
    await this.setCachedData(cacheKey, bets, 15); // 15 minutes
  }

  async getCachedBets(filters?: BetFilters): Promise<any[]> {
    const cacheKey = filters 
      ? `${STORAGE_KEYS.CACHED_BETS}_${JSON.stringify(filters)}`
      : STORAGE_KEYS.CACHED_BETS;
    return (await this.getCachedData<any[]>(cacheKey)) || [];
  }

  async cacheBetStats(stats: any): Promise<void> {
    await this.setCachedData(STORAGE_KEYS.BET_STATS, stats, 30); // 30 minutes
  }

  async getCachedBetStats(): Promise<any> {
    return await this.getCachedData(STORAGE_KEYS.BET_STATS);
  }

  /**
   * App settings and sync status
   */
  async updateLastSync(): Promise<void> {
    await this.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  async getLastSync(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.LAST_SYNC);
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const lastSync = await this.getLastSync();
    const queue = await this.getSyncQueue();
    
    return {
      lastSync: lastSync || 'Never',
      pendingUploads: queue.length,
      isOnline: true, // This would be determined by network status
    };
  }

  async saveAppSettings(settings: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  async getAppSettings(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.APP_SETTINGS);
  }

  /**
   * Receipt caching
   */
  async cacheReceipt(receiptId: string, data: any): Promise<void> {
    const receipts = await this.getCachedReceipts();
    receipts[receiptId] = {
      data,
      timestamp: new Date().toISOString(),
    };
    await this.setItem(STORAGE_KEYS.CACHED_RECEIPTS, receipts);
  }

  async getCachedReceipts(): Promise<{ [key: string]: any }> {
    return (await this.getItem(STORAGE_KEYS.CACHED_RECEIPTS)) || {};
  }

  async removeCachedReceipt(receiptId: string): Promise<void> {
    const receipts = await this.getCachedReceipts();
    delete receipts[receiptId];
    await this.setItem(STORAGE_KEYS.CACHED_RECEIPTS, receipts);
  }

  /**
   * Utility methods
   */
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  async clearExpiredData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      for (const key of keys) {
        const data = await this.getItem<CachedData>(key);
        if (data && data.expiresAt && new Date() > new Date(data.expiresAt)) {
          await this.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing expired data:', error);
    }
  }

  async exportData(): Promise<{ [key: string]: any }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: { [key: string]: any } = {};
      
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return {};
    }
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorageManager.getInstance();