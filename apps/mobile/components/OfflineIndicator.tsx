import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOffline } from '@/hooks/useOffline';

export default function OfflineIndicator() {
  const [offlineState, offlineActions] = useOffline();
  const [isManualSync, setIsManualSync] = useState(false);

  const handleSyncPress = async () => {
    if (isManualSync) return;
    
    setIsManualSync(true);
    try {
      const result = await offlineActions.syncNow();
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.syncedCount} items.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Issues',
          `Synced ${result.syncedCount} items, ${result.failedCount} failed.\n\n${result.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message);
    } finally {
      setIsManualSync(false);
    }
  };

  const formatLastSync = (lastSync: string) => {
    if (lastSync === 'Never') return 'Never synced';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (offlineState.isOnline && offlineState.pendingUploads === 0) {
    return null; // Don't show indicator when online and no pending data
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[
        styles.indicator,
        offlineState.isOnline ? styles.onlineWithPending : styles.offline
      ]}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.statusIcon}>
            <ThemedText style={[
              styles.icon,
              offlineState.isOnline ? styles.onlineIcon : styles.offlineIcon
            ]}>
              {offlineState.isOnline ? '🔄' : '📱'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.textContent}>
            <ThemedText style={[
              styles.statusText,
              offlineState.isOnline ? styles.onlineText : styles.offlineText
            ]}>
              {offlineState.isOnline ? 'Sync Available' : 'Offline Mode'}
            </ThemedText>
            
            {offlineState.pendingUploads > 0 && (
              <ThemedText style={styles.pendingText}>
                {offlineState.pendingUploads} item{offlineState.pendingUploads !== 1 ? 's' : ''} pending
              </ThemedText>
            )}
            
            <ThemedText style={styles.lastSyncText}>
              Last sync: {formatLastSync(offlineState.lastSync)}
            </ThemedText>
          </ThemedView>
          
          {offlineState.isOnline && offlineState.pendingUploads > 0 && (
            <TouchableOpacity
              onPress={handleSyncPress}
              disabled={isManualSync || offlineState.isSyncing}
              style={[
                styles.syncButton,
                (isManualSync || offlineState.isSyncing) && styles.syncButtonDisabled
              ]}
            >
              <ThemedText style={styles.syncButtonText}>
                {isManualSync || offlineState.isSyncing ? 'Syncing...' : 'Sync Now'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  indicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offline: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  onlineWithPending: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  onlineIcon: {
    color: '#3b82f6',
  },
  offlineIcon: {
    color: '#f59e0b',
  },
  textContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  onlineText: {
    color: '#1e40af',
  },
  offlineText: {
    color: '#d97706',
  },
  pendingText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 1,
  },
  lastSyncText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});