import NetInfo from '@react-native-community/netinfo';
import { offlineStorage, PendingUpload } from './offline-storage';
import mobileApiClient from './api-client';
import { notificationManager } from './notification-manager';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export class SyncManager {
  private static instance: SyncManager;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncCallbacks: ((result: SyncResult) => void)[] = [];

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  constructor() {
    this.initializeNetworkListener();
  }

  /**
   * Initialize network status monitoring
   */
  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // If we just came back online and have pending data, sync it
      if (wasOffline && this.isOnline) {
        this.syncPendingData();
      }
    });
  }

  /**
   * Check if device is online
   */
  async checkConnectionStatus(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  /**
   * Add callback for sync completion
   */
  onSyncComplete(callback: (result: SyncResult) => void): void {
    this.syncCallbacks.push(callback);
  }

  /**
   * Remove sync callback
   */
  removeSyncCallback(callback: (result: SyncResult) => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<SyncResult> {
    return await this.syncPendingData();
  }

  /**
   * Sync all pending data
   */
  private async syncPendingData(): Promise<SyncResult> {
    if (this.isSyncing || !this.isOnline) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['Already syncing or offline'],
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      const queue = await offlineStorage.getSyncQueue();
      
      for (const item of queue) {
        try {
          const success = await this.syncItem(item);
          if (success) {
            result.syncedCount++;
            await offlineStorage.removeFromSyncQueue(item.id);
            
            // Mark offline bet as synced if applicable
            if (item.type === 'bet') {
              await offlineStorage.markBetAsSynced(item.id);
            }
          } else {
            result.failedCount++;
            await offlineStorage.incrementRetryCount(item.id);
            
            // Remove items that have failed too many times
            if (item.retryCount >= 3) {
              await offlineStorage.removeFromSyncQueue(item.id);
              result.errors.push(`Item ${item.id} failed after 3 retries`);
            }
          }
        } catch (error: any) {
          result.failedCount++;
          result.errors.push(`Error syncing ${item.id}: ${error.message}`);
          await offlineStorage.incrementRetryCount(item.id);
        }
      }

      // Update last sync time
      await offlineStorage.updateLastSync();
      
      // Clear expired cached data
      await offlineStorage.clearExpiredData();

      if (result.failedCount > 0) {
        result.success = false;
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }

    // Notify callbacks
    this.syncCallbacks.forEach(callback => callback(result));

    // Send notification if there were items to sync
    if (result.syncedCount > 0 || result.failedCount > 0) {
      await notificationManager.notifySyncComplete(result.syncedCount, result.failedCount);
    }

    return result;
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: PendingUpload): Promise<boolean> {
    try {
      switch (item.type) {
        case 'bet':
          await mobileApiClient.createBet(item.data);
          return true;

        case 'receipt':
          await mobileApiClient.uploadReceipt(item.data);
          return true;

        case 'profile_update':
          // Assuming there's a profile update endpoint
          // await mobileApiClient.updateProfile(item.data);
          return true;

        default:
          console.warn(`Unknown sync item type: ${item.type}`);
          return false;
      }
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Sync specific data types
   */
  async syncUserData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Fetch and cache user profile
      const profile = await mobileApiClient.getProfile();
      await offlineStorage.saveUserProfile(profile);

      // Fetch and cache fresh analytics data
      const analytics = await mobileApiClient.getAnalyticsOverview();
      await offlineStorage.cacheAnalyticsOverview(analytics);

      const trends = await mobileApiClient.getBettingTrends();
      await offlineStorage.cacheBettingTrends(trends);

      const sportBreakdown = await mobileApiClient.getSportBreakdown();
      await offlineStorage.cacheSportBreakdown(sportBreakdown);

      // Fetch and cache bet stats
      const betStats = await mobileApiClient.getBetStats();
      await offlineStorage.cacheBetStats(betStats);

    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  }

  /**
   * Sync bets data
   */
  async syncBetsData(filters?: any): Promise<void> {
    if (!this.isOnline) return;

    try {
      const bets = await mobileApiClient.getBets(filters);
      await offlineStorage.cacheBets(bets, filters);
    } catch (error) {
      console.error('Failed to sync bets data:', error);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus() {
    const status = await offlineStorage.getSyncStatus();
    return {
      ...status,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Force full data refresh
   */
  async fullSync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['Device is offline'],
      };
    }

    // Sync pending uploads first
    const uploadResult = await this.syncPendingData();

    // Then sync fresh data from server
    await this.syncUserData();
    await this.syncBetsData();

    return uploadResult;
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(): Promise<void> {
    try {
      // Remove offline bets that are synced and older than 30 days
      const offlineBets = await offlineStorage.getOfflineBets();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      for (const bet of offlineBets) {
        if (bet.synced && new Date(bet.createdAt) < thirtyDaysAgo) {
          await offlineStorage.removeOfflineBet(bet.id);
        }
      }

      // Clear expired cached data
      await offlineStorage.clearExpiredData();

      // Remove failed sync items older than 7 days
      const queue = await offlineStorage.getSyncQueue();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      for (const item of queue) {
        if (item.retryCount >= 3 && new Date(item.timestamp) < sevenDaysAgo) {
          await offlineStorage.removeFromSyncQueue(item.id);
        }
      }

    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();