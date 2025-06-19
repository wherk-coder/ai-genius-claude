import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { offlineStorage } from './offline-storage';

export interface NotificationPreferences {
  betReminders: boolean;
  gameUpdates: boolean;
  syncNotifications: boolean;
  promotions: boolean;
  weeklyReports: boolean;
  pushEnabled: boolean;
}

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  trigger: Notifications.NotificationTriggerInput;
  categoryId?: string;
}

// Set global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationManager {
  private static instance: NotificationManager;
  private pushToken: PushToken | null = null;
  private preferences: NotificationPreferences = {
    betReminders: true,
    gameUpdates: true,
    syncNotifications: true,
    promotions: false,
    weeklyReports: true,
    pushEnabled: true,
  };

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  constructor() {
    this.initialize();
  }

  /**
   * Initialize notification system
   */
  private async initialize(): Promise<void> {
    try {
      // Load saved preferences
      const savedPreferences = await offlineStorage.getItem<NotificationPreferences>('notification_preferences');
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...savedPreferences };
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Register for push notifications if enabled
      if (this.preferences.pushEnabled) {
        await this.registerForPushNotifications();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Set up notification categories for interactive notifications
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('BET_REMINDER', [
        {
          identifier: 'VIEW_BET',
          buttonTitle: 'View Bet',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'SNOOZE',
          buttonTitle: 'Remind Later',
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('GAME_UPDATE', [
        {
          identifier: 'VIEW_GAME',
          buttonTitle: 'View Game',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'DISMISS',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('SYNC_STATUS', [
        {
          identifier: 'VIEW_SYNC',
          buttonTitle: 'View Status',
          options: { opensAppToForeground: true },
        },
      ]);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<PushToken | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = {
        token: tokenData.data,
        type: 'expo',
      };

      // Save token for API registration
      await offlineStorage.setItem('push_token', this.pushToken);

      return this.pushToken;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Get current push token
   */
  async getPushToken(): Promise<PushToken | null> {
    if (this.pushToken) {
      return this.pushToken;
    }

    // Try to load from storage
    const savedToken = await offlineStorage.getItem<PushToken>('push_token');
    if (savedToken) {
      this.pushToken = savedToken;
      return savedToken;
    }

    return null;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await offlineStorage.setItem('notification_preferences', this.preferences);

    // Re-register or unregister based on push preference
    if (newPreferences.pushEnabled !== undefined) {
      if (newPreferences.pushEnabled) {
        await this.registerForPushNotifications();
      } else {
        await this.unregisterFromPushNotifications();
      }
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Unregister from push notifications
   */
  async unregisterFromPushNotifications(): Promise<void> {
    try {
      this.pushToken = null;
      await offlineStorage.removeItem('push_token');
      
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to unregister from push notifications:', error);
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleNotification(notification: ScheduledNotification): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
        },
        trigger: notification.trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Send immediate local notification
   */
  async sendLocalNotification(title: string, body: string, data?: any, categoryId?: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          categoryIdentifier: categoryId,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Betting-specific notifications
   */
  async scheduleBetReminder(betId: string, description: string, gameTime: Date): Promise<string | null> {
    if (!this.preferences.betReminders) return null;

    const reminderTime = new Date(gameTime.getTime() - 30 * 60 * 1000); // 30 minutes before
    
    if (reminderTime <= new Date()) return null; // Don't schedule past reminders

    return await this.scheduleNotification({
      id: `bet_reminder_${betId}`,
      title: 'Bet Reminder',
      body: `Your bet "${description}" starts in 30 minutes`,
      data: { type: 'bet_reminder', betId },
      categoryId: 'BET_REMINDER',
      trigger: { date: reminderTime },
    });
  }

  async scheduleGameUpdate(gameId: string, title: string, status: string): Promise<void> {
    if (!this.preferences.gameUpdates) return;

    await this.sendLocalNotification(
      'Game Update',
      `${title}: ${status}`,
      { type: 'game_update', gameId },
      'GAME_UPDATE'
    );
  }

  async notifySyncComplete(syncedCount: number, failedCount: number): Promise<void> {
    if (!this.preferences.syncNotifications || syncedCount === 0) return;

    const title = failedCount > 0 ? 'Sync Completed with Issues' : 'Sync Completed';
    const body = failedCount > 0 
      ? `${syncedCount} items synced, ${failedCount} failed`
      : `${syncedCount} items synced successfully`;

    await this.sendLocalNotification(
      title,
      body,
      { type: 'sync_status', syncedCount, failedCount },
      'SYNC_STATUS'
    );
  }

  async scheduleWeeklyReport(): Promise<string | null> {
    if (!this.preferences.weeklyReports) return null;

    // Schedule for Sunday at 9 AM
    const now = new Date();
    const nextSunday = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(9, 0, 0, 0);

    return await this.scheduleNotification({
      id: 'weekly_report',
      title: 'Weekly Betting Report',
      body: 'Your weekly performance summary is ready!',
      data: { type: 'weekly_report' },
      trigger: {
        weekday: 1, // Sunday
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  async notifyOfflineBetCreated(description: string): Promise<void> {
    await this.sendLocalNotification(
      'Bet Saved Offline',
      `"${description}" will sync when you're back online`,
      { type: 'offline_bet' }
    );
  }

  async notifyBettingOpportunity(opportunity: {
    title: string;
    description: string;
    confidence: number;
    sport: string;
  }): Promise<void> {
    if (!this.preferences.betReminders) return;

    await this.sendLocalNotification(
      `🎯 ${opportunity.title}`,
      `${opportunity.description} (${Math.round(opportunity.confidence * 100)}% confidence)`,
      { 
        type: 'betting_opportunity', 
        sport: opportunity.sport,
        confidence: opportunity.confidence 
      },
      'BET_REMINDER'
    );
  }

  async scheduleSmartNotifications(opportunities: any[]): Promise<void> {
    if (!this.preferences.betReminders || opportunities.length === 0) return;

    // Schedule notifications for high-confidence opportunities
    const highConfidenceOpportunities = opportunities.filter(
      (opp) => opp.confidence >= 0.8 && opp.priority === 'high'
    );

    for (const opportunity of highConfidenceOpportunities.slice(0, 3)) {
      // Schedule for 5 minutes from now to avoid spam
      const notificationTime = new Date(Date.now() + 5 * 60 * 1000);
      
      await this.scheduleNotification({
        id: `opportunity_${Date.now()}_${Math.random()}`,
        title: `🎯 ${opportunity.title}`,
        body: `${opportunity.description} (${Math.round(opportunity.confidence * 100)}% confidence)`,
        data: { 
          type: 'betting_opportunity', 
          sport: opportunity.sport || 'Unknown',
          confidence: opportunity.confidence 
        },
        categoryId: 'BET_REMINDER',
        trigger: { date: notificationTime },
      });
    }
  }

  /**
   * Badge management
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  async incrementBadge(): Promise<void> {
    try {
      const currentCount = await Notifications.getBadgeCountAsync();
      await this.setBadgeCount(currentCount + 1);
    } catch (error) {
      console.error('Failed to increment badge:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Notification history and management
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getNotificationHistory(): Promise<Notifications.Notification[]> {
    try {
      // This would get recent notifications from the system
      // Implementation depends on platform capabilities
      return [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  /**
   * Permission management
   */
  async checkPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  /**
   * Notification listeners
   */
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Testing and debugging
   */
  async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification(
      'Test Notification',
      'This is a test notification from AI Betting Assistant',
      { type: 'test' }
    );
  }

  async getNotificationStats(): Promise<{
    permissionStatus: string;
    pushToken: string | null;
    scheduledCount: number;
    preferences: NotificationPreferences;
  }> {
    const permissions = await this.checkPermissions();
    const scheduled = await this.getAllScheduledNotifications();
    const token = await this.getPushToken();

    return {
      permissionStatus: permissions.status,
      pushToken: token?.token || null,
      scheduledCount: scheduled.length,
      preferences: this.getPreferences(),
    };
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();