import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';

// Define types for the Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Define types for the Main App Stack
export type MainStackParamList = {
  // Core Screens (Active)
  Home: undefined;
  CustomerList: { filter?: string };
  DeliveryBoyList: { filter?: string };
  AreaList: { filter?: string };
  AddStock: { vendorId?: string };
  Products: undefined;
  AddAttendance: undefined;
  DispatchSummary: undefined;

  // Billing & Payables (Active)
  Bills: undefined;
  StatementPeriodSelection?: { customerId?: string };
  Invoice: undefined;
  InvoiceHistory: undefined; // Added
  PaymentStatus: { customerId: string };
  ReceivePayment: { customerId: string };
  Payables: { source?: 'addStock' | 'default' };
  PayablesDashboard: undefined;
  VendorDetails: { vendorId: string };
  RecordPaymentToVendor: { vendorId: string };
  VendorSelectionForInventory: undefined; // Added
  InventoryReceipt: { vendorId: string };
  VendorSelection: undefined;

  // Store Onboarding Screens
  StoreCreation: undefined;
  SelectCategory: undefined;
  SelectSubcategory: { selectedCategories: string[] };
  SelectProduct: { selectedCategories: string[]; selectedSubcategories?: string[]; selectedProducts?: string[] };
  PricingConfig: {
    selectedCategories: string[];
    selectedProducts: {
      productId: string;
      categoryId: string;
      name: string;
      price: number;
    }[]
  };

  // Product Management Screens
  ManageProducts: undefined;
  AddEditProduct: {
    product?: {
      _id: string;
      name: string;
      description?: string;
      price: number;
      stock: number;
      storeCategoryId?: string | { _id: string; name: string };
      storeSubcategoryId?: string | { _id: string; name: string };
      images?: string[];
    };
  };

  // Disconnected Screens (Commented out in MainStack)
  // Dashboard: undefined;
  Details: { customer: any };
  // Calendar: undefined;
  // SideMenu: undefined;
  // PayableTemp: undefined;
  // Order: undefined;
  // Cards: undefined;
  // PaymentHistory: { customerId: string };
};

// Define the Root Stack which can navigate between Auth and Main stacks
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  SetupWizard: undefined;
  Main: undefined;
  MainStack: NavigatorScreenParams<MainStackParamList>;
};

// Props for individual screens within AuthStack
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// Props for individual screens within MainStack (existing props, adjusted to MainStackParamList)
// export type DashboardScreenProps = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'> & { setIsLoggedIn: (isLoggedIn: boolean) => void };
export type DetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'Details'>;
export type CustomerListScreenProps = NativeStackScreenProps<MainStackParamList, 'CustomerList'>;
export type DeliveryBoyListScreenProps = NativeStackScreenProps<MainStackParamList, 'DeliveryBoyList'>;
export type AreaListScreenProps = NativeStackScreenProps<MainStackParamList, 'AreaList'>;
// export type CalendarScreenProps = NativeStackScreenProps<MainStackParamList, 'Calendar'>;
export type ProductsScreenProps = NativeStackScreenProps<MainStackParamList, 'Products'>;
export type AddStockScreenProps = NativeStackScreenProps<MainStackParamList, 'AddStock'>;
export type AddAttendanceProps = NativeStackScreenProps<MainStackParamList, 'AddAttendance'>;

// Setup Wizard Screen Props
export type SetupWizardProps = NativeStackScreenProps<RootStackParamList, 'SetupWizard'>;

export interface MainStackScreenProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}