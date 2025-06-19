import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPreferences } from '@/lib/notification-manager';

export default function NotificationSettingsScreen() {
  const [notificationState, notificationActions] = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const success = await notificationActions.requestPermissions();
      if (success) {
        Alert.alert('Success', 'Notifications enabled successfully!');
      } else {
        Alert.alert(
          'Permission Denied', 
          'Please enable notifications in your device settings to receive betting alerts.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await notificationActions.updatePreferences({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationActions.sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications to see if it worked!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const getPermissionStatusColor = () => {
    switch (notificationState.permissionStatus) {
      case 'granted': return '#10b981';
      case 'denied': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getPermissionStatusText = () => {
    switch (notificationState.permissionStatus) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Denied';
      case 'undetermined': return 'Not Set';
      default: return 'Unknown';
    }
  };

  const NotificationToggle = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    disabled = false 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <ThemedView style={styles.toggleRow}>
      <ThemedView style={styles.toggleContent}>
        <ThemedText style={styles.toggleTitle}>{title}</ThemedText>
        <ThemedText style={styles.toggleDescription}>{description}</ThemedText>
      </ThemedView>
      <TouchableOpacity 
        onPress={() => !disabled && onToggle(!value)}
        disabled={disabled}
        style={[
          styles.toggle,
          value ? styles.toggleOn : styles.toggleOff,
          disabled && styles.toggleDisabled
        ]}
      >
        <ThemedView style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff
        ]} />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Notifications</ThemedText>
        <ThemedView style={{ width: 60 }} />
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Permission Status */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Permission Status</ThemedText>
          
          <ThemedView style={styles.statusCard}>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.label}>Status:</ThemedText>
              <ThemedView style={styles.statusIndicator}>
                <ThemedView 
                  style={[
                    styles.statusDot,
                    { backgroundColor: getPermissionStatusColor() }
                  ]} 
                />
                <ThemedText style={[
                  styles.statusText,
                  { color: getPermissionStatusColor() }
                ]}>
                  {getPermissionStatusText()}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {notificationState.pushToken && (
              <ThemedView style={styles.statusRow}>
                <ThemedText style={styles.label}>Push Token:</ThemedText>
                <ThemedText style={styles.tokenText}>
                  {notificationState.pushToken.substring(0, 20)}...
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.label}>Scheduled:</ThemedText>
              <ThemedText style={styles.value}>
                {notificationState.scheduledCount} notifications
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Permission Button */}
          {!notificationState.isEnabled && (
            <TouchableOpacity 
              onPress={handlePermissionRequest}
              disabled={isLoading}
              style={[styles.permissionButton, isLoading && styles.permissionButtonDisabled]}
            >
              <ThemedText style={styles.permissionButtonText}>
                {isLoading ? 'Requesting...' : 'Enable Notifications'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Notification Preferences */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notification Types</ThemedText>
          
          <ThemedView style={styles.preferencesCard}>
            <NotificationToggle
              title="Push Notifications"
              description="Enable all push notifications"
              value={notificationState.preferences.pushEnabled}
              onToggle={(value) => handlePreferenceToggle('pushEnabled', value)}
              disabled={!notificationState.isEnabled}
            />

            <ThemedView style={styles.separator} />

            <NotificationToggle
              title="Bet Reminders"
              description="Get notified before your bets start"
              value={notificationState.preferences.betReminders}
              onToggle={(value) => handlePreferenceToggle('betReminders', value)}
              disabled={!notificationState.preferences.pushEnabled}
            />

            <ThemedView style={styles.separator} />

            <NotificationToggle
              title="Game Updates"
              description="Live updates for your active bets"
              value={notificationState.preferences.gameUpdates}
              onToggle={(value) => handlePreferenceToggle('gameUpdates', value)}
              disabled={!notificationState.preferences.pushEnabled}
            />

            <ThemedView style={styles.separator} />

            <NotificationToggle
              title="Sync Notifications"
              description="Alerts when offline data syncs"
              value={notificationState.preferences.syncNotifications}
              onToggle={(value) => handlePreferenceToggle('syncNotifications', value)}
              disabled={!notificationState.preferences.pushEnabled}
            />

            <ThemedView style={styles.separator} />

            <NotificationToggle
              title="Weekly Reports"
              description="Weekly performance summaries"
              value={notificationState.preferences.weeklyReports}
              onToggle={(value) => handlePreferenceToggle('weeklyReports', value)}
              disabled={!notificationState.preferences.pushEnabled}
            />

            <ThemedView style={styles.separator} />

            <NotificationToggle
              title="Promotions"
              description="Special offers and promotions"
              value={notificationState.preferences.promotions}
              onToggle={(value) => handlePreferenceToggle('promotions', value)}
              disabled={!notificationState.preferences.pushEnabled}
            />
          </ThemedView>
        </ThemedView>

        {/* Actions */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
          
          <TouchableOpacity 
            onPress={handleTestNotification}
            disabled={!notificationState.isEnabled}
            style={[
              styles.actionButton,
              !notificationState.isEnabled && styles.actionButtonDisabled
            ]}
          >
            <ThemedText style={[
              styles.actionButtonText,
              !notificationState.isEnabled && styles.actionButtonTextDisabled
            ]}>
              Send Test Notification
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => notificationActions.clearBadge()}
            style={styles.actionButton}
          >
            <ThemedText style={styles.actionButtonText}>
              Clear Badge Count
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About Notifications</ThemedText>
          
          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              • Bet reminders are sent 30 minutes before game time{'\n'}
              • Game updates include score changes and bet settlements{'\n'}
              • Sync notifications help track offline data uploads{'\n'}
              • Weekly reports are sent every Sunday morning{'\n'}
              • All notifications respect your device's quiet hours
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    color: '#3b82f6',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  permissionButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  preferencesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#3b82f6',
  },
  toggleOff: {
    backgroundColor: '#d1d5db',
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});