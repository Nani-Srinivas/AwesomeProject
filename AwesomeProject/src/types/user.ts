export interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles: ('Customer' | 'DeliveryPartner' | 'StoreManager' | 'Admin')[];
  isActivated?: boolean;
  isVerified?: boolean;
  refreshToken?: string;
  liveLocation?: {
    latitude?: number;
    longitude?: number;
  };
  address?: string;
  // Role-specific fields directly on User interface for convenience
  branch?: string; // For DeliveryPartner/StoreManager
  storeId?: string; // For StoreManager
  aadhar?: number; // For DeliveryPartner
  hasSelectedCategories?: boolean; // For StoreManager
  selectedCategoryIds?: string[]; // For StoreManager
  hasSelectedSubcategories?: boolean; // For StoreManager
  selectedSubcategoryIds?: string[]; // For StoreManager
  hasSelectedProducts?: boolean; // For StoreManager
  selectedProductIds?: string[]; // For StoreManager
  hasAddedProductPricing?: boolean; // For StoreManager
  additionalDetailsCompleted?: boolean; // For StoreManager
  upiId?: string; // UPI ID for receiving payments (For StoreManager)
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserRegistration {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'Customer' | 'DeliveryPartner' | 'StoreManager' | 'Admin';
  latitude?: number;
  longitude?: number;
  aadhar?: number; // For DeliveryPartner
  storeName?: string; // For StoreManager
}

export type LoginCredentials =
  | { email: string; password: string }
  | { phone: string };
