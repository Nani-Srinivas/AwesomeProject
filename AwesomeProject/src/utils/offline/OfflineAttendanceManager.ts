// utils/offline/OfflineAttendanceManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_ATTENDANCE_KEY = 'offline_attendance_data';

export interface OfflineAttendanceData {
  id: string; // unique ID for offline record
  date: string;
  areaId: string;
  attendance: Array<{
    customerId: string;
    products: Array<{
      productId: string;
      quantity: number;
      status: string;
    }>;
  }>;
  createdAt: string;
}

export class OfflineAttendanceManager {
  // Save attendance data for offline submission
  static async saveOfflineAttendance(attendanceData: Omit<OfflineAttendanceData, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Generate a unique ID for this offline record
      const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineRecord: OfflineAttendanceData = {
        ...attendanceData,
        id,
        createdAt: new Date().toISOString(),
      };

      // Get existing offline records
      const existingRecords = await this.getOfflineAttendanceList();
      
      // Add the new record
      existingRecords.push(offlineRecord);
      
      // Save back to storage
      await AsyncStorage.setItem(
        OFFLINE_ATTENDANCE_KEY,
        JSON.stringify(existingRecords)
      );

      return id;
    } catch (error) {
      console.error('Error saving offline attendance:', error);
      throw error;
    }
  }

  // Get all offline attendance records
  static async getOfflineAttendanceList(): Promise<OfflineAttendanceData[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_ATTENDANCE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline attendance list:', error);
      return [];
    }
  }

  // Remove a specific offline record
  static async removeOfflineAttendance(id: string): Promise<void> {
    try {
      const existingRecords = await this.getOfflineAttendanceList();
      const filteredRecords = existingRecords.filter(record => record.id !== id);
      
      await AsyncStorage.setItem(
        OFFLINE_ATTENDANCE_KEY,
        JSON.stringify(filteredRecords)
      );
    } catch (error) {
      console.error('Error removing offline attendance:', error);
      throw error;
    }
  }

  // Clear all offline records
  static async clearOfflineAttendance(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_ATTENDANCE_KEY);
    } catch (error) {
      console.error('Error clearing offline attendance:', error);
      throw error;
    }
  }

  // Check if there are pending offline records
  static async hasPendingRecords(): Promise<boolean> {
    try {
      const records = await this.getOfflineAttendanceList();
      return records.length > 0;
    } catch (error) {
      console.error('Error checking pending records:', error);
      return false;
    }
  }
}