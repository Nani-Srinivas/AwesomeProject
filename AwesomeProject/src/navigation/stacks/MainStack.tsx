import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { HomeScreen } from '../../screens/Home/HomeScreen';
import { DetailsScreen } from '../../screens/Details/DetailsScreen';
import { DashboardScreen } from '../../screens/Dashboard/DashboardScreen';
import { CustomerListScreen } from '../../screens/Customer/CustomerListScreen';
import { CalendarScreen } from '../../screens/Calendar/CalendarScreen';
import { DeliveryBoyListScreen } from '../../screens/DeliveryBoy/DeliveryBoyListScreen';
import { AreaListScreen } from '../../screens/Area/AreaListScreen';
import { SideMenu } from '../../components/common/SideMenu';
import { AddStockScreen } from '../../screens/AddStock/AddStockScreen';
import { ProductsScreen } from '../../screens/Products/ProductsScreen';
import { AddAttendance } from '../../screens/Attendance/AddAttendance';
import { BillsScreen } from '../../screens/Bills/BillsScreen'; // New basic BillsScreen
import { PayableTempScreen } from '../../screens/PayableTemp/PayableTempScreen'; // Renamed BillsScreen
import { StatementPeriodSelection } from '../../screens/Bills/StatementPeriodSelectionScreen';
import { InvoiceScreen } from '../../screens/Bills/InvoiceScreen';
import { OrderScreen } from '../../screens/Order/OrderScreen';
import { StoreCreationScreen } from '../../screens/StoreManagement/StoreCreationScreen';
import { SelectBrandsScreen, SelectSubcategoriesScreen, SelectProductsScreen } from '../../screens/Onboarding';
import { PricingConfigScreen } from '../../screens/StoreManagement/PricingConfigScreen';
import { CardsScreen } from '../../screens/Cards/CardsScreen';
import { InvoiceHistoryScreen } from '../../screens/Bills/InvoiceHistoryScreen';
import { PaymentStatusScreen } from '../../screens/Bills/PaymentStatusScreen';
import { ReceivePaymentScreen } from '../../screens/Bills/ReceivePaymentScreen';
import PayablesScreen from '../../screens/Payables/PayablesScreen';
import PayablesDashboardScreen from '../../screens/Payables/PayablesDashboardScreen';
import VendorDetailsScreen from '../../screens/VendorDetails/VendorDetailsScreen';
import RecordPaymentToVendorScreen from '../../screens/RecordPaymentToVendor/RecordPaymentToVendorScreen';
import VendorSelectionForInventoryScreen from '../../screens/VendorSelectionForInventory/VendorSelectionForInventoryScreen';
import InventoryReceiptScreen from '../../screens/InventoryReceipt/InventoryReceiptScreen';
import NotesScreen from '../../screens/Notes/NotesScreen';
import VendorSelectionScreen from '../../screens/VendorSelection/VendorSelectionScreen';
import { DispatchSummaryScreen } from '../../screens/Delivery/DispatchSummaryScreen';
import { ManageProductsScreen } from '../../screens/Products/ManageProductsScreen';
import { AddEditProductScreen } from '../../screens/Products/AddEditProductScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

import { useUserStore } from '../../store/userStore';

export const MainStack = () => {
  const { user } = useUserStore();
  const initialRoute = !user?.storeId ? 'StoreCreation' : 'Home';

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {/* ===== CORE SCREENS (KEEP) ===== */}
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {(props) => <HomeScreen setIsLoggedIn={function (isLoggedIn: boolean): void {
          throw new Error('Function not implemented.');
        }} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="DeliveryBoyList" component={DeliveryBoyListScreen} options={{ title: 'Delivery Boys' }} />
      <Stack.Screen name="AreaList" component={AreaListScreen} options={{ title: 'Areas' }} />
      <Stack.Screen name="AddStock" component={AddStockScreen} options={{ title: 'Add Stock' }} />
      <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="AddAttendance" component={AddAttendance} options={{ title: 'Add Attendance' }} />
      <Stack.Screen name="DispatchSummary" component={DispatchSummaryScreen} options={{ headerShown: false }} />

      {/* ===== BILLING & PAYABLES (KEEP FOR NOW) ===== */}
      {/* <Stack.Screen name="Bills" component={BillsScreen} options={{ title: 'Customer Bills' }} /> */}
      <Stack.Screen name="StatementPeriodSelection" component={StatementPeriodSelection} options={{ title: 'Bills' }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Invoice' }} />
      <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} options={{ title: 'Invoice History' }} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ title: 'Payment Status' }} />
      <Stack.Screen name="ReceivePayment" component={ReceivePaymentScreen} options={{ title: 'Record Payment' }} />
      <Stack.Screen name="Payables" component={PayablesScreen} options={{ title: 'Payables' }} />
      {/* <Stack.Screen name="PayablesDashboard" component={PayablesDashboardScreen} options={{ title: 'Vendor Payables' }} /> */}
      <Stack.Screen name="VendorDetails" component={VendorDetailsScreen} options={{ title: 'Vendor Details' }} />
      <Stack.Screen name="RecordPaymentToVendor" component={RecordPaymentToVendorScreen} options={{ title: 'Record Payment to Vendor' }} />
      {/* <Stack.Screen name="VendorSelectionForInventory" component={VendorSelectionForInventoryScreen} options={{ title: 'Select Vendor for Inventory' }} /> */}
      <Stack.Screen name="InventoryReceipt" component={InventoryReceiptScreen} options={{ title: 'Record Inventory Receipt' }} />
      <Stack.Screen name="VendorSelection" component={VendorSelectionScreen} options={{ title: 'Select Vendor' }} />

      {/* ===== Store Onboarding Screens ===== */}
      <Stack.Screen name="StoreCreation" component={StoreCreationScreen} options={{ title: 'Create Store' }} />
      <Stack.Screen name="SelectBrands" component={SelectBrandsScreen} options={{ title: 'Select Brands' }} />
      <Stack.Screen name="SelectSubcategories" component={SelectSubcategoriesScreen} options={{ title: 'Select Subcategories' }} />
      <Stack.Screen name="SelectProducts" component={SelectProductsScreen} options={{ title: 'Select Products' }} />
      <Stack.Screen name="PricingConfig" component={PricingConfigScreen} options={{ title: 'Configure Pricing' }} />

      {/* ===== Product Management Screens ===== */}
      <Stack.Screen name="ManageProducts" component={ManageProductsScreen} options={{ title: 'Manage Products' }} />
      <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} options={{ title: 'Product Details' }} />

      {/* ===== DISCONNECTED SCREENS (COMMENTED OUT) ===== */}
      {/* <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} /> */}
      <Stack.Screen name="Details" component={DetailsScreen} />
      {/* <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} /> */}
      {/* <Stack.Screen name="SideMenu" component={SideMenu} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="PayableTemp" component={PayableTempScreen} options={{ title: 'Payable Temp' }} /> */}
      {/* <Stack.Screen name="Order" component={OrderScreen} options={{ title: 'Orders' }} /> */}
      {/* <Stack.Screen name="Cards" component={CardsScreen} options={{ title: 'Cards' }} /> */}
      {/* <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} /> */}
    </Stack.Navigator>
  );
};