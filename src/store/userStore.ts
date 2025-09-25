import { create } from 'zustand';
import { secureStorageService } from '../services/secureStorageService';
import { User } from '../types/user';
import { apiService } from '../services/apiService';

interface UserState {
  user: User | null;
  authToken: string | null;
  setUser: (user: User) => void;
  setAuthToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  authToken: null,
  setUser: (user) => {
    set({ user });
  },
  setAuthToken: (token) => {
    secureStorageService.saveAuthToken(token);
    set({ authToken: token });
  },
  logout: () => {
    secureStorageService.clearAuthToken();
    set({ user: null, authToken: null });
  },
  checkAuth: async () => {
    const token = await secureStorageService.getAuthToken();
    if (token) {
      set({ authToken: token });
      try {
        const response = await apiService.get('/user');
        set({ user: response.user });
      } catch (error) {
        console.error('Failed to fetch user on auth check', error);
        // The axios interceptor will handle logging the user out if the token is invalid
      }
    }
  },
}));