// utils/offline/NetworkManager.ts
import NetInfo from '@react-native-community/netinfo';

export class NetworkManager {
  // Check if device is currently online
  static async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }

  // Add network state listener
  static addNetworkStateListener(listener: (isOnline: boolean) => void) {
    return NetInfo.addEventListener(state => {
      const isOnline = state.isConnected === true && state.isInternetReachable === true;
      listener(isOnline);
    });
  }

  // Get current connection type
  static async getConnectionType() {
    try {
      const state = await NetInfo.fetch();
      return state.type;
    } catch (error) {
      console.error('Error getting connection type:', error);
      return 'unknown';
    }
  }
}