import { create } from 'zustand';
import { secureStorageService } from '../services/secureStorageService';
import { User } from '../types/user';
import { apiService } from '../services/apiService';

interface UserState {
  user: User | null;
  authToken: string | null;
  refreshToken: string | null;
  setUser: (user: User) => void;
  setAuthToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  authToken: null,
  refreshToken: null,
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
  logout: () => {
    secureStorageService.clearAuthToken();
    secureStorageService.clearRefreshToken();
    set({ user: null, authToken: null, refreshToken: null });
  },
  checkAuth: async () => {
    const token = await secureStorageService.getAuthToken();
    console.log('checkAuth: Retrieved token from secure storage:', token ? 'Exists' : 'Does not exist');
    if (token) {
      set({ authToken: token });
      try {
        const response = await apiService.get('/user');
        console.log('checkAuth: API response for /user:', JSON.stringify(response, null, 2));
        set({ user: response.data.data });
        console.log('checkAuth: User set in store:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('checkAuth: Failed to fetch user on auth check', error);
        // The axios interceptor will handle logging the user out if the token is invalid
      }
    }
  },
}));