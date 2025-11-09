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
  Dashboard: undefined;
  Home: undefined;
  Details: { customer: any };
  CustomerList: { filter?: string };
  DeliveryBoyList: { filter?: string };
  AreaList: { filter?: string };
  Calendar: undefined;
  SideMenu: undefined;
  AddStock: undefined;
  VendorSelection: undefined;
  Products: undefined;
  AddAttendance: undefined;
  CustomerList: undefined;
  Bills: undefined;
  PayableTemp: undefined;
  Payables: undefined;
  PayablesDashboard: undefined;
  VendorDetails: { vendorId: string };
  RecordPaymentToVendor: { vendorId: string };
  VendorSelectionForInventory: undefined;
  InventoryReceipt: { vendorId: string };
  StatementPeriodSelection?: { customerId?: string }; // customerId is now optional
  Invoice: undefined;
  Order: undefined;
  StoreCreation: undefined;
  SelectCategory: undefined;
  SelectProduct: { selectedCategories: string[] };
  Cards: undefined;
  PaymentHistory: { customerId: string };
  PaymentStatus: { customerId: string };
  ReceivePayment: { customerId: string };
};

// Define the Root Stack which can navigate between Auth and Main stacks
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
};

// Props for individual screens within AuthStack
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// Props for individual screens within MainStack (existing props, adjusted to MainStackParamList)
export type DashboardScreenProps = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'> & { setIsLoggedIn: (isLoggedIn: boolean) => void };
export type DetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'Details'>;
export type CustomerListScreenProps = NativeStackScreenProps<MainStackParamList, 'CustomerList'>;
export type DeliveryBoyListScreenProps = NativeStackScreenProps<MainStackParamList, 'DeliveryBoyList'>;
export type AreaListScreenProps = NativeStackScreenProps<MainStackParamList, 'AreaList'>;
export type CalendarScreenProps = NativeStackScreenProps<MainStackParamList, 'Calendar'>;
export type ProductsScreenProps = NativeStackScreenProps<MainStackParamList, 'Products'>;
export type AddStockScreenProps = NativeStackScreenProps<MainStackParamList, 'AddStock'>;
export type AddAttendanceProps = NativeStackScreenProps<MainStackParamList, 'AddAttendance'>;


export interface MainStackScreenProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}