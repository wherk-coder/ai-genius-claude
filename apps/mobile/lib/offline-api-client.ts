import mobileApiClient, { CreateBetData, BetFilters } from './api-client';
import { offlineStorage } from './offline-storage';
import { syncManager } from './sync-manager';
import { notificationManager } from './notification-manager';

/**
 * Offline-aware API client that wraps the base API client
 * Automatically handles offline scenarios and data caching
 */
export class OfflineApiClient {
  private static instance: OfflineApiClient;

  static getInstance(): OfflineApiClient {
    if (!OfflineApiClient.instance) {
      OfflineApiClient.instance = new OfflineApiClient();
    }
    return OfflineApiClient.instance;
  }

  /**
   * Authentication methods (always require online)
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    const result = await mobileApiClient.login(email, password, rememberMe);
    
    // Cache user profile after successful login
    if (result.user) {
      await offlineStorage.saveUserProfile(result.user);
    }
    
    // Trigger initial data sync
    setTimeout(() => syncManager.syncUserData(), 1000);
    
    return result;
  }

  async register(data: any) {
    const result = await mobileApiClient.register(data);
    
    // Cache user profile after successful registration
    if (result.user) {
      await offlineStorage.saveUserProfile(result.user);
    }
    
    return result;
  }

  async logout() {
    await mobileApiClient.logout();
    // Clear offline storage on logout
    await offlineStorage.clear();
  }

  async getProfile() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const profile = await mobileApiClient.getProfile();
        await offlineStorage.saveUserProfile(profile);
        return profile;
      } catch (error) {
        // Fall back to cached data if online request fails
        const cachedProfile = await offlineStorage.getUserProfile();
        if (cachedProfile) {
          return cachedProfile;
        }
        throw error;
      }
    } else {
      // Return cached profile when offline
      const cachedProfile = await offlineStorage.getUserProfile();
      if (cachedProfile) {
        return cachedProfile;
      }
      throw new Error('No profile data available offline');
    }
  }

  /**
   * Bet management with offline support
   */
  async createBet(data: CreateBetData) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const result = await mobileApiClient.createBet(data);
        return result;
      } catch (error) {
        // Save offline if online request fails
        console.log('Online bet creation failed, saving offline');
        const offlineBet = await offlineStorage.saveOfflineBet(data);
        await notificationManager.notifyOfflineBetCreated(data.description || 'Unnamed bet');
        return offlineBet;
      }
    } else {
      // Save offline when not connected
      const offlineBet = await offlineStorage.saveOfflineBet(data);
      await notificationManager.notifyOfflineBetCreated(data.description || 'Unnamed bet');
      return offlineBet;
    }
  }

  async getBets(filters?: BetFilters) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const bets = await mobileApiClient.getBets(filters);
        await offlineStorage.cacheBets(bets, filters);
        
        // Merge with offline bets
        const offlineBets = await offlineStorage.getOfflineBets();
        const allBets = [...bets, ...offlineBets];
        
        // Sort by creation date (newest first)
        allBets.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        
        return allBets;
      } catch (error) {
        // Fall back to cached data
        const cachedBets = await offlineStorage.getCachedBets(filters);
        const offlineBets = await offlineStorage.getOfflineBets();
        return [...cachedBets, ...offlineBets];
      }
    } else {
      // Return cached + offline bets when offline
      const cachedBets = await offlineStorage.getCachedBets(filters);
      const offlineBets = await offlineStorage.getOfflineBets();
      return [...cachedBets, ...offlineBets];
    }
  }

  async getBetStats() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const stats = await mobileApiClient.getBetStats();
        await offlineStorage.cacheBetStats(stats);
        return stats;
      } catch (error) {
        const cachedStats = await offlineStorage.getCachedBetStats();
        if (cachedStats) {
          return cachedStats;
        }
        throw error;
      }
    } else {
      const cachedStats = await offlineStorage.getCachedBetStats();
      if (cachedStats) {
        return cachedStats;
      }
      throw new Error('No bet stats available offline');
    }
  }

  async updateBet(id: string, data: Partial<CreateBetData>) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      return await mobileApiClient.updateBet(id, data);
    } else {
      // Handle offline bet updates
      if (id.startsWith('offline_')) {
        // Update offline bet
        const offlineBets = await offlineStorage.getOfflineBets();
        const updatedBets = offlineBets.map(bet => 
          bet.id === id ? { ...bet, ...data } : bet
        );
        await offlineStorage.setItem('offline_bets', updatedBets);
        return updatedBets.find(bet => bet.id === id);
      } else {
        throw new Error('Cannot update online bets while offline');
      }
    }
  }

  async deleteBet(id: string) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      if (id.startsWith('offline_')) {
        // Delete offline bet
        await offlineStorage.removeOfflineBet(id);
        return { success: true };
      } else {
        return await mobileApiClient.deleteBet(id);
      }
    } else {
      if (id.startsWith('offline_')) {
        await offlineStorage.removeOfflineBet(id);
        return { success: true };
      } else {
        throw new Error('Cannot delete online bets while offline');
      }
    }
  }

  /**
   * Analytics with caching
   */
  async getAnalyticsOverview() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const analytics = await mobileApiClient.getAnalyticsOverview();
        await offlineStorage.cacheAnalyticsOverview(analytics);
        return analytics;
      } catch (error) {
        const cached = await offlineStorage.getCachedAnalyticsOverview();
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedAnalyticsOverview();
      if (cached) return cached;
      throw new Error('No analytics data available offline');
    }
  }

  async getBettingTrends(days?: number) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const trends = await mobileApiClient.getBettingTrends(days);
        await offlineStorage.cacheBettingTrends(trends);
        return trends;
      } catch (error) {
        const cached = await offlineStorage.getCachedBettingTrends();
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedBettingTrends();
      if (cached) return cached;
      throw new Error('No trends data available offline');
    }
  }

  async getSportBreakdown() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const breakdown = await mobileApiClient.getSportBreakdown();
        await offlineStorage.cacheSportBreakdown(breakdown);
        return breakdown;
      } catch (error) {
        const cached = await offlineStorage.getCachedSportBreakdown();
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedSportBreakdown();
      if (cached) return cached;
      throw new Error('No sport breakdown available offline');
    }
  }

  /**
   * Receipt handling with offline queue
   */
  async uploadReceipt(formData: FormData) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        return await mobileApiClient.uploadReceipt(formData);
      } catch (error) {
        // Queue for later upload
        await offlineStorage.addToSyncQueue({
          id: `receipt_${Date.now()}`,
          type: 'receipt',
          data: formData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });
        throw new Error('Receipt queued for upload when online');
      }
    } else {
      // Queue for later upload
      await offlineStorage.addToSyncQueue({
        id: `receipt_${Date.now()}`,
        type: 'receipt',
        data: formData,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      throw new Error('Receipt queued for upload when online');
    }
  }

  /**
   * Sync management
   */
  async syncNow() {
    return await syncManager.syncNow();
  }

  async getSyncStatus() {
    return await syncManager.getSyncStatus();
  }

  async forceFullSync() {
    return await syncManager.fullSync();
  }

  /**
   * Offline data management
   */
  async getOfflineBets() {
    return await offlineStorage.getOfflineBets();
  }

  async getPendingUploads() {
    return await offlineStorage.getSyncQueue();
  }

  async clearOfflineData() {
    await offlineStorage.clear();
  }

  async getStorageInfo() {
    const size = await offlineStorage.getStorageSize();
    const syncStatus = await this.getSyncStatus();
    const offlineBets = await offlineStorage.getOfflineBets();
    
    return {
      storageSize: size,
      storageSizeFormatted: this.formatBytes(size),
      offlineBetsCount: offlineBets.length,
      pendingUploads: syncStatus.pendingUploads,
      lastSync: syncStatus.lastSync,
      isOnline: syncStatus.isOnline,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * AI Services with offline support
   */
  async getBettingInsights() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const insights = await mobileApiClient.getBettingInsights();
        await offlineStorage.setCachedData('ai_insights', insights, 60); // Cache for 1 hour
        return insights;
      } catch (error) {
        const cached = await offlineStorage.getCachedData('ai_insights');
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedData('ai_insights');
      if (cached) return cached;
      throw new Error('No AI insights available offline');
    }
  }

  async parseNaturalLanguageBet(input: string) {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      return await mobileApiClient.parseNaturalLanguageBet(input);
    } else {
      throw new Error('Natural language parsing requires internet connection');
    }
  }

  async getBettingPatterns() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const patterns = await mobileApiClient.getBettingPatterns();
        await offlineStorage.setCachedData('ai_patterns', patterns, 120); // Cache for 2 hours
        return patterns;
      } catch (error) {
        const cached = await offlineStorage.getCachedData('ai_patterns');
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedData('ai_patterns');
      if (cached) return cached;
      throw new Error('No betting patterns available offline');
    }
  }

  async getBettingOpportunities() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const opportunities = await mobileApiClient.getBettingOpportunities();
        await offlineStorage.setCachedData('ai_opportunities', opportunities, 30); // Cache for 30 minutes
        return opportunities;
      } catch (error) {
        const cached = await offlineStorage.getCachedData('ai_opportunities');
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedData('ai_opportunities');
      if (cached) return cached;
      throw new Error('No betting opportunities available offline');
    }
  }

  async getPerformanceAnalysis() {
    const isOnline = syncManager.getNetworkStatus();
    
    if (isOnline) {
      try {
        const analysis = await mobileApiClient.getPerformanceAnalysis();
        await offlineStorage.setCachedData('ai_performance', analysis, 60); // Cache for 1 hour
        return analysis;
      } catch (error) {
        const cached = await offlineStorage.getCachedData('ai_performance');
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = await offlineStorage.getCachedData('ai_performance');
      if (cached) return cached;
      throw new Error('No performance analysis available offline');
    }
  }

  /**
   * Network status
   */
  isOnline(): boolean {
    return syncManager.getNetworkStatus();
  }

  isSyncing(): boolean {
    return syncManager.isSyncInProgress();
  }
}

// Export singleton instance
export const offlineApiClient = OfflineApiClient.getInstance();