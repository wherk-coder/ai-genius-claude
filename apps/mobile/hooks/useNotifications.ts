import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationManager, NotificationPreferences, PushToken } from '@/lib/notification-manager';

export interface NotificationState {
  isEnabled: boolean;
  permissionStatus: string;
  pushToken: string | null;
  preferences: NotificationPreferences;
  scheduledCount: number;
  lastNotification: Notifications.Notification | null;
}

export interface NotificationActions {
  requestPermissions: () => Promise<boolean>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  clearBadge: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useNotifications(): [NotificationState, NotificationActions] {
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    permissionStatus: 'undetermined',
    pushToken: null,
    preferences: {
      betReminders: true,
      gameUpdates: true,
      syncNotifications: true,
      promotions: false,
      weeklyReports: true,
      pushEnabled: true,
    },
    scheduledCount: 0,
    lastNotification: null,
  });

  // Update state from notification manager
  const updateState = useCallback(async () => {
    try {
      const stats = await notificationManager.getNotificationStats();
      const token = await notificationManager.getPushToken();
      
      setState(prev => ({
        ...prev,
        isEnabled: stats.permissionStatus === 'granted',
        permissionStatus: stats.permissionStatus,
        pushToken: stats.pushToken,
        preferences: stats.preferences,
        scheduledCount: stats.scheduledCount,
      }));
    } catch (error) {
      console.error('Failed to update notification state:', error);
    }
  }, []);

  // Notification received listener
  const onNotificationReceived = useCallback((notification: Notifications.Notification) => {
    setState(prev => ({
      ...prev,
      lastNotification: notification,
    }));
  }, []);

  // Notification response listener
  const onNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data;

    // Handle different notification actions
    switch (actionIdentifier) {
      case 'VIEW_BET':
        if (data.betId) {
          // Navigate to bet details
          console.log('Navigate to bet:', data.betId);
        }
        break;
      
      case 'VIEW_GAME':
        if (data.gameId) {
          // Navigate to game details
          console.log('Navigate to game:', data.gameId);
        }
        break;
      
      case 'VIEW_SYNC':
        // Navigate to sync status
        console.log('Navigate to sync status');
        break;
      
      case 'SNOOZE':
        // Reschedule notification for later
        if (data.betId) {
          console.log('Snooze bet reminder:', data.betId);
        }
        break;
      
      default:
        // Default action (tap notification)
        console.log('Notification tapped:', data);
        break;
    }
  }, []);

  useEffect(() => {
    // Initial state update
    updateState();

    // Set up notification listeners
    const receivedSubscription = notificationManager.addNotificationReceivedListener(onNotificationReceived);
    const responseSubscription = notificationManager.addNotificationResponseReceivedListener(onNotificationResponse);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [updateState, onNotificationReceived, onNotificationResponse]);

  const actions: NotificationActions = {
    requestPermissions: async () => {
      try {
        const token = await notificationManager.registerForPushNotifications();
        await updateState();
        return token !== null;
      } catch (error) {
        console.error('Failed to request permissions:', error);
        return false;
      }
    },

    updatePreferences: async (newPreferences: Partial<NotificationPreferences>) => {
      try {
        await notificationManager.updatePreferences(newPreferences);
        await updateState();
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    },

    sendTestNotification: async () => {
      try {
        await notificationManager.sendTestNotification();
      } catch (error) {
        console.error('Failed to send test notification:', error);
      }
    },

    clearBadge: async () => {
      try {
        await notificationManager.clearBadge();
      } catch (error) {
        console.error('Failed to clear badge:', error);
      }
    },

    refreshStats: updateState,
  };

  return [state, actions];
}

/**
 * Hook for bet-specific notifications
 */
export function useBetNotifications() {
  const scheduleBetReminder = useCallback(async (betId: string, description: string, gameTime: Date) => {
    try {
      return await notificationManager.scheduleBetReminder(betId, description, gameTime);
    } catch (error) {
      console.error('Failed to schedule bet reminder:', error);
      return null;
    }
  }, []);

  const notifyOfflineBet = useCallback(async (description: string) => {
    try {
      await notificationManager.notifyOfflineBetCreated(description);
    } catch (error) {
      console.error('Failed to notify offline bet:', error);
    }
  }, []);

  const notifyGameUpdate = useCallback(async (gameId: string, title: string, status: string) => {
    try {
      await notificationManager.scheduleGameUpdate(gameId, title, status);
    } catch (error) {
      console.error('Failed to notify game update:', error);
    }
  }, []);

  return {
    scheduleBetReminder,
    notifyOfflineBet,
    notifyGameUpdate,
  };
}

/**
 * Hook for sync notifications
 */
export function useSyncNotifications() {
  const notifySyncComplete = useCallback(async (syncedCount: number, failedCount: number) => {
    try {
      await notificationManager.notifySyncComplete(syncedCount, failedCount);
    } catch (error) {
      console.error('Failed to notify sync complete:', error);
    }
  }, []);

  return {
    notifySyncComplete,
  };
}