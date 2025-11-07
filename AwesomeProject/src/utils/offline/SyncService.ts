// utils/offline/SyncService.ts
import { apiService } from '../../services/apiService';
import { OfflineAttendanceManager, OfflineAttendanceData } from './OfflineAttendanceManager';
import { NetworkManager } from './NetworkManager';

export class SyncService {
  private static syncInProgress = false;

  // Attempt to sync all pending offline records
  static async syncOfflineData(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('Starting sync of offline data');

      const isOnline = await NetworkManager.isOnline();
      if (!isOnline) {
        console.log('Device is offline, cannot sync');
        return;
      }

      const offlineRecords = await OfflineAttendanceManager.getOfflineAttendanceList();
      console.log(`Found ${offlineRecords.length} offline records to sync`);

      for (const record of offlineRecords) {
        try {
          console.log(`Attempting to sync record: ${record.id}`);
          
          // Send the attendance data to the server
          await apiService.post('/attendance', {
            date: record.date,
            areaId: record.areaId,
            attendance: record.attendance,
          }, {
            headers: { 'X-Suppress-Global-Error-Alert': true },
          });

          // Remove successfully synced record
          await OfflineAttendanceManager.removeOfflineAttendance(record.id);
          console.log(`Successfully synced record: ${record.id}`);
        } catch (error: any) {
          console.error(`Failed to sync record ${record.id}:`, error);
          
          // If it's a client error (4xx), remove from queue as it's likely not recoverable
          if (error.response && error.response.status >= 400 && error.response.status < 500) {
            console.log(`Removing record ${record.id} from sync queue due to client error`);
            await OfflineAttendanceManager.removeOfflineAttendance(record.id);
          }
          // For server errors (5xx) or network errors, keep the record for retry
        }
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Start auto-sync when network becomes available
  static startAutoSync(): () => void {
    // Sync immediately when service starts
    this.syncOfflineData();

    // Listen for network state changes
    return NetworkManager.addNetworkStateListener(async (isOnline) => {
      if (isOnline) {
        console.log('Network available, starting sync...');
        await this.syncOfflineData();
      }
    });
  }

  // Check if there are pending records to sync
  static async hasPendingSync(): Promise<boolean> {
    return await OfflineAttendanceManager.hasPendingRecords();
  }
}