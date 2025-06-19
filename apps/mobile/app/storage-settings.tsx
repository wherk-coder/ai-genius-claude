import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOffline } from '@/hooks/useOffline';

export default function StorageSettingsScreen() {
  const [offlineState, offlineActions] = useOffline();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    offlineActions.refreshStorageInfo();
  }, []);

  const handleClearOfflineData = () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all offline bets and cached data. Pending uploads will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await offlineActions.clearOfflineData();
              Alert.alert('Success', 'Offline data cleared successfully');
            } catch (error: any) {
              Alert.alert('Error', `Failed to clear data: ${error.message}`);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleForceSync = async () => {
    if (!offlineState.isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      return;
    }

    try {
      const result = await offlineActions.forceFullSync();
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.syncedCount} items.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Issues',
          `Synced ${result.syncedCount} items, ${result.failedCount} failed.\n\nErrors:\n${result.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message);
    }
  };

  const formatLastSync = (lastSync: string) => {
    if (lastSync === 'Never') return 'Never';
    
    const syncDate = new Date(lastSync);
    return syncDate.toLocaleDateString() + ' ' + syncDate.toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (!offlineState.isOnline) return '#f59e0b';
    if (offlineState.pendingUploads > 0) return '#3b82f6';
    return '#10b981';
  };

  const getStatusText = () => {
    if (!offlineState.isOnline) return 'Offline';
    if (offlineState.isSyncing) return 'Syncing...';
    if (offlineState.pendingUploads > 0) return 'Pending Sync';
    return 'Up to Date';
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Storage & Sync</ThemedText>
        <ThemedView style={{ width: 60 }} />
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sync Status */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sync Status</ThemedText>
          
          <ThemedView style={styles.statusCard}>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.label}>Connection:</ThemedText>
              <ThemedView style={styles.statusIndicator}>
                <ThemedView 
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor() }
                  ]} 
                />
                <ThemedText style={[
                  styles.statusText,
                  { color: getStatusColor() }
                ]}>
                  {getStatusText()}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.label}>Last Sync:</ThemedText>
              <ThemedText style={styles.value}>
                {formatLastSync(offlineState.lastSync)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.label}>Pending Uploads:</ThemedText>
              <ThemedText style={[
                styles.value,
                offlineState.pendingUploads > 0 && { color: '#f59e0b', fontWeight: '600' }
              ]}>
                {offlineState.pendingUploads} items
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Sync Button */}
          <TouchableOpacity 
            onPress={handleForceSync}
            disabled={!offlineState.isOnline || offlineState.isSyncing}
            style={[
              styles.syncButton,
              (!offlineState.isOnline || offlineState.isSyncing) && styles.syncButtonDisabled
            ]}
          >
            <ThemedText style={styles.syncButtonText}>
              {offlineState.isSyncing ? 'Syncing...' : 'Force Full Sync'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Storage Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Storage Information</ThemedText>
          
          {offlineState.storageInfo && (
            <ThemedView style={styles.storageCard}>
              <ThemedView style={styles.storageRow}>
                <ThemedText style={styles.label}>Total Storage Used:</ThemedText>
                <ThemedText style={styles.value}>
                  {offlineState.storageInfo.storageSizeFormatted}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.storageRow}>
                <ThemedText style={styles.label}>Offline Bets:</ThemedText>
                <ThemedText style={styles.value}>
                  {offlineState.storageInfo.offlineBetsCount} bets
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.storageRow}>
                <ThemedText style={styles.label}>Cached Data:</ThemedText>
                <ThemedText style={styles.value}>
                  Analytics, trends, and bet history
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
          
          <TouchableOpacity 
            onPress={handleClearOfflineData}
            disabled={isClearing}
            style={[
              styles.clearButton,
              isClearing && styles.clearButtonDisabled
            ]}
          >
            <ThemedText style={styles.clearButtonText}>
              {isClearing ? 'Clearing...' : 'Clear All Offline Data'}
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.warningText}>
            ⚠️ This will permanently delete all offline bets and cached data. 
            Pending uploads will be lost.
          </ThemedText>
        </ThemedView>

        {/* Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About Offline Mode</ThemedText>
          
          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              • Bets created offline are saved locally and synced when online{'\n'}
              • Analytics data is cached for offline viewing{'\n'}
              • Photos are queued for upload when connection is restored{'\n'}
              • All data is encrypted and stored securely on your device
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
  syncButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  storageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    lineHeight: 16,
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