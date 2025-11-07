import { Alert } from 'react-native';

// Map error codes to user-friendly messages
const ERROR_MESSAGES = {
  400: "Bad request. Please check your input and try again.",
  401: "Unauthorized. Please log in and try again.",
  403: "Access denied. You don't have permission to perform this action.",
  404: "Resource not found.",
  409: "Conflict. This resource already exists.",
  500: "Server error. Please try again later.",
};

export const handleApiError = (error, customMessages = {}) => {
  let message = "An unexpected error occurred. Please try again.";
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    message = customMessages[status] || 
              ERROR_MESSAGES[status] || 
              error.response.data?.message || 
              `Server error (${status}). Please try again.`;
  } else if (error.request) {
    // Request was made but no response received (network error)
    message = "No internet connection. Please check your network settings and try again.";
  } else {
    // Something else happened
    message = error.message || message;
  }
  
  console.error('API Error:', error);
  Alert.alert('Error', message);
  return message;
};

// Generic retry mechanism
export const withRetry = async (operation, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error; // Last attempt, throw the error
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};