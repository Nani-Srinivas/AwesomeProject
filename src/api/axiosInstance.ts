import axios, { AxiosError } from 'axios';
import * as Sentry from '@sentry/react-native';
import axiosRetry from 'axios-retry';
import { Alert, Platform } from 'react-native';
import { API_URL } from '@env';

import { secureStorageService } from '../services/secureStorageService';
import { useUserStore } from '../store/userStore';

// Define a type for our API error response
interface ApiErrorData {
  message?: string;
  // Add other potential error properties here
}

const baseURL = Platform.OS === 'ios' ? 'http://localhost:3000/api' : API_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure axios-retry
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await secureStorageService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorData>) => {
    Sentry.captureException(error);

    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      Alert.alert('Network Error', 'Please check your internet connection.');
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = 'An unexpected error occurred.';

      // Now `data` is typed, so we can safely access `data.message`
      const apiMessage = data?.message;

      switch (status) {
        case 400:
          errorMessage = apiMessage || 'Bad Request.';
          break;
        case 401:
          const { authToken } = useUserStore.getState();
          if (authToken) {
            Alert.alert('Session Expired', 'You have been logged out. Please log in again.');
            useUserStore.getState().logout();
          } else {
            errorMessage = 'Unauthorized. Please log in.';
          }
          break;
        case 403:
          errorMessage = apiMessage || 'Forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = apiMessage || 'Resource not found.';
          break;
        case 500:
          errorMessage = apiMessage || 'Internal Server Error. Please try again later.';
          break;
        default:
          errorMessage = apiMessage || `Error: ${status}`;
      }
      Alert.alert('Error', errorMessage);
    } else {
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;