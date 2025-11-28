import { apiService } from './apiService';
import { UserRegistration, LoginCredentials } from '../types/user';

const register = (userData: UserRegistration) => {
  return apiService.postWithConfig('/auth/register', userData, {
    headers: { 'X-Suppress-Global-Error-Alert': true },
  });
};

const login = (role: 'Customer' | 'DeliveryPartner' | 'StoreManager', credentials: LoginCredentials) => {
  let endpoint = '';
  switch (role) {
    case 'Customer':
      endpoint = '/customer/login';
      break;
    case 'DeliveryPartner':
      endpoint = '/delivery/login';
      break;
    case 'StoreManager':
      endpoint = '/auth/login/store-manager';
      break;
  }
  return apiService.postWithConfig(endpoint, credentials, {
    headers: { 'X-Suppress-Global-Error-Alert': true },
  });
};

export const authService = {
  register,
  login,
};
