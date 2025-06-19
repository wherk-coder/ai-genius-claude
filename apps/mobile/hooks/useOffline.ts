import { useState, useEffect, useCallback } from 'react';
import { syncManager, SyncResult } from '@/lib/sync-manager';
import { offlineApiClient } from '@/lib/offline-api-client';

export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string;
  pendingUploads: number;
  storageInfo: {
    storageSize: number;
    storageSizeFormatted: string;
    offlineBetsCount: number;
    pendingUploads: number;
    lastSync: string;
    isOnline: boolean;
  } | null;
}

export interface OfflineActions {
  syncNow: () => Promise<SyncResult>;
  forceFullSync: () => Promise<SyncResult>;
  clearOfflineData: () => Promise<void>;
  refreshStorageInfo: () => Promise<void>;
}

export function useOffline(): [OfflineState, OfflineActions] {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isSyncing: false,
    lastSync: 'Never',
    pendingUploads: 0,
    storageInfo: null,
  });

  // Update state from sync manager
  const updateState = useCallback(async () => {
    try {
      const syncStatus = await syncManager.getSyncStatus();
      const storageInfo = await offlineApiClient.getStorageInfo();
      
      setState(prev => ({
        ...prev,
        isOnline: syncStatus.isOnline,
        isSyncing: syncStatus.isSyncing,
        lastSync: syncStatus.lastSync,
        pendingUploads: syncStatus.pendingUploads,
        storageInfo,
      }));
    } catch (error) {
      console.error('Failed to update offline state:', error);
    }
  }, []);

  // Sync completion callback
  const onSyncComplete = useCallback((result: SyncResult) => {
    updateState();
  }, [updateState]);

  useEffect(() => {
    // Initial state update
    updateState();

    // Listen for sync completion
    syncManager.onSyncComplete(onSyncComplete);

    // Set up periodic state updates
    const interval = setInterval(updateState, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      syncManager.removeSyncCallback(onSyncComplete);
    };
  }, [updateState, onSyncComplete]);

  const actions: OfflineActions = {
    syncNow: async () => {
      const result = await offlineApiClient.syncNow();
      await updateState();
      return result;
    },

    forceFullSync: async () => {
      const result = await offlineApiClient.forceFullSync();
      await updateState();
      return result;
    },

    clearOfflineData: async () => {
      await offlineApiClient.clearOfflineData();
      await updateState();
    },

    refreshStorageInfo: async () => {
      await updateState();
    },
  };

  return [state, actions];
}

export interface UseBetsOfflineState {
  bets: any[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  hasOfflineBets: boolean;
}

export interface UseBetsOfflineActions {
  refresh: () => Promise<void>;
  createBet: (data: any) => Promise<any>;
  updateBet: (id: string, data: any) => Promise<any>;
  deleteBet: (id: string) => Promise<any>;
}

/**
 * Hook for managing bets with offline support
 */
export function useBetsOffline(filters?: any): [UseBetsOfflineState, UseBetsOfflineActions] {
  const [state, setState] = useState<UseBetsOfflineState>({
    bets: [],
    isLoading: true,
    error: null,
    isOffline: false,
    hasOfflineBets: false,
  });

  const loadBets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const bets = await offlineApiClient.getBets(filters);
      const offlineBets = await offlineApiClient.getOfflineBets();
      const isOffline = !offlineApiClient.isOnline();
      
      setState(prev => ({
        ...prev,
        bets,
        isLoading: false,
        isOffline,
        hasOfflineBets: offlineBets.length > 0,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, [filters]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  const actions: UseBetsOfflineActions = {
    refresh: loadBets,

    createBet: async (data: any) => {
      const result = await offlineApiClient.createBet(data);
      await loadBets(); // Refresh list
      return result;
    },

    updateBet: async (id: string, data: any) => {
      const result = await offlineApiClient.updateBet(id, data);
      await loadBets(); // Refresh list
      return result;
    },

    deleteBet: async (id: string) => {
      const result = await offlineApiClient.deleteBet(id);
      await loadBets(); // Refresh list
      return result;
    },
  };

  return [state, actions];
}

/**
 * Hook for analytics data with offline caching
 */
export function useAnalyticsOffline() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const overview = await offlineApiClient.getAnalyticsOverview();
      const trends = await offlineApiClient.getBettingTrends();
      const sportBreakdown = await offlineApiClient.getSportBreakdown();
      
      setData({
        overview,
        trends,
        sportBreakdown,
      });
      
      setIsOffline(!offlineApiClient.isOnline());
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    data,
    isLoading,
    error,
    isOffline,
    refresh: loadAnalytics,
  };
}