import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

// Extend request config to include our custom retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = Platform.OS === 'ios' ? 'http://localhost:3000/api' : API_URL;
console.log('Axios Base URL:', baseURL);
// IMPORTANT: For Android emulators, if your Fastify server is on localhost, you might need to set API_URL in your .env to 'http://10.0.2.2:3000/api'


const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure axios-retry for network errors, but not for auth errors
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
    const token = useUserStore.getState().authToken || (await secureStorageService.getAuthToken());
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
  (response) => {
    console.log('Axios Interceptor - Successful Response:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error: AxiosError<ApiErrorData>) => {
    console.log('Axios Interceptor - Error Response:', JSON.stringify(error.response?.data, null, 2));
    console.log('Axios Interceptor - Error Status:', error.response?.status);
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      const apiMessage = data?.message;

      // If status is 401 and it's not a retry request
      if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true; // Mark as retry

        try {
          const refreshToken = await secureStorageService.getRefreshToken();
          if (!refreshToken) {
            // No refresh token, logout immediately
            useUserStore.getState().logout();
            return Promise.reject(error);
          }

          // Request a new access token
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await axiosInstance.post('/refresh-token', { refreshToken });

          // Update the store with the new token
          useUserStore.getState().setAuthToken(newAccessToken);
          useUserStore.getState().setRefreshToken(newRefreshToken);

          // Update the header for the original request and retry
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, logout user
          useUserStore.getState().logout();
          Alert.alert('Session Expired', 'You have been logged out. Please log in again.');
          return Promise.reject(refreshError);
        }
      }

      // For other errors, display a generic message
      let errorMessage = 'An unexpected error occurred.';
      switch (status) {
        case 400:
          errorMessage = apiMessage || 'Bad Request.';
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
          if (status !== 401) { // Don't show alert for 401, as it's handled above
            errorMessage = apiMessage || `Error: ${status}`;
          }
      }
      if (status !== 401 && !error.config?.headers?.['X-Suppress-Global-Error-Alert']) {
        Alert.alert('Error', errorMessage);
      }

    } else if ((error.message === 'Network Error' || error.code === 'ERR_NETWORK') && !error.config?.headers?.['X-Suppress-Global-Error-Alert']) {
      Alert.alert('Connection Error', 'Could not connect to the server. Please check your internet connection and ensure the server is running.');
    } else if (error.response?.status !== 401 && !error.config?.headers?.['X-Suppress-Global-Error-Alert']) {
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    }

    Sentry.captureException(error);
    return Promise.reject(error);
  },
);

export default axiosInstance;