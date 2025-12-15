import { create } from 'zustand';
import { secureStorageService } from '../services/secureStorageService';
import { User } from '../types/user';
import { apiService } from '../services/apiService';
import { reset } from '../navigation/NavigationRef';

interface UserState {
  user: User | null;
  authToken: string | null;
  refreshToken: string | null;
  isCheckingAuth: boolean;
  isSetupComplete: boolean;
  setUser: (user: User) => void;
  setAuthToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setSetupComplete: (complete: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  authToken: null,
  refreshToken: null,
  isCheckingAuth: true,
  isSetupComplete: false,
  setUser: (user) => {
    set({ user });
  },
  setAuthToken: (token) => {
    secureStorageService.saveAuthToken(token);
    set({ authToken: token });
  },
  setRefreshToken: (token) => {
    secureStorageService.saveRefreshToken(token);
    set({ refreshToken: token });
  },
  setSetupComplete: (complete) => {
    console.log('🔧 setSetupComplete called with:', complete);
    secureStorageService.saveSetupComplete(complete);
    set({ isSetupComplete: complete });
    console.log('✅ Setup complete flag saved to storage and state');
  },
  logout: async () => {
    const refreshToken = await secureStorageService.getRefreshToken();

    // Call server logout endpoint to invalidate refresh token
    if (refreshToken) {
      try {
        await apiService.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.log('Logout API call failed (non-critical):', error);
        // Continue with client-side logout even if server call fails
      }
    }

    // Clear local storage
    secureStorageService.clearAuthToken();
    secureStorageService.clearRefreshToken();
    set({ user: null, authToken: null, refreshToken: null });

    // Explicitly navigate to Login
    reset('AuthStack');
  },
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    const token = await secureStorageService.getAuthToken();
    const setupComplete = await secureStorageService.getSetupComplete();
    console.log('checkAuth: Retrieved token from secure storage:', token ? 'Exists' : 'Does not exist');
    console.log('checkAuth: Setup complete status:', setupComplete);

    set({ isSetupComplete: setupComplete });

    if (token) {
      set({ authToken: token });
      try {
        const response = await apiService.get('/user');
        console.log('checkAuth: API response for /user:', JSON.stringify(response, null, 2));
        set({ user: response.data.data });
        console.log('checkAuth: User set in store:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('checkAuth: Failed to fetch user on auth check', error);
        // If user fetch fails, we can't be sure the session is valid.
        // Clear the state to force a re-login.
        set({ user: null, authToken: null, refreshToken: null });
        secureStorageService.clearAuthToken();
        secureStorageService.clearRefreshToken();
      }
    }
    set({ isCheckingAuth: false });
  },
}));