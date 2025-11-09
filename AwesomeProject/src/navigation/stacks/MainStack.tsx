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
import { InvoiceScreen }  from '../../screens/Bills/InvoiceScreen';
import { OrderScreen } from '../../screens/Order/OrderScreen';
import { StoreCreationScreen } from '../../screens/StoreManagement/StoreCreationScreen';
import { SelectCategoryScreen } from '../../screens/StoreManagement/SelectCategoryScreen';
import { SelectProductScreen } from '../../screens/StoreManagement/SelectProductScreen';
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

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {(props) => <HomeScreen setIsLoggedIn={function (isLoggedIn: boolean): void {
          throw new Error('Function not implemented.');
        } } {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="DeliveryBoyList" component={DeliveryBoyListScreen} options={{ title: 'Delivery Boys' }} />
      <Stack.Screen name="AreaList" component={AreaListScreen} options={{ title: 'Areas' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Stack.Screen name="SideMenu" component={SideMenu} options={ { headerShown: false }} />
      <Stack.Screen name="AddStock" component={AddStockScreen} options={{ title: 'Add Stock' }} />
      <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="AddAttendance" component={AddAttendance} options={{ title: 'Add Attendance' }} />
      <Stack.Screen name="Bills" component={BillsScreen} options={{ title: 'Customer Bills' }} />
      <Stack.Screen name="PayableTemp" component={PayableTempScreen} options={{ title: 'Payable Temp' }} />
      <Stack.Screen name="StatementPeriodSelection" component={StatementPeriodSelection} options={{ title: 'Bills' }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Invoice' }} />
      <Stack.Screen name="Order" component={OrderScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="StoreCreation" component={StoreCreationScreen} options={{ title: 'Create Store' }} />
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} options={{ title: 'Select Category' }} />
      <Stack.Screen name="SelectProduct" component={SelectProductScreen} options={{ title: 'Select Product' }} />
      <Stack.Screen name="Cards" component={CardsScreen} options={{ title: 'Cards' }} />
      <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} options={{ title: 'Invoice History' }} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ title: 'Payment Status' }} />
      <Stack.Screen name="ReceivePayment" component={ReceivePaymentScreen} options={{ title: 'Record Payment' }} />
      <Stack.Screen name="Payables" component={PayablesScreen} options={{ title: 'Payables' }} />
      <Stack.Screen name="PayablesDashboard" component={PayablesDashboardScreen} options={{ title: 'Vendor Payables' }} />
      <Stack.Screen name="VendorDetails" component={VendorDetailsScreen} options={{ title: 'Vendor Details' }} />
      <Stack.Screen name="RecordPaymentToVendor" component={RecordPaymentToVendorScreen} options={{ title: 'Record Payment to Vendor' }} />
      <Stack.Screen name="VendorSelectionForInventory" component={VendorSelectionForInventoryScreen} options={{ title: 'Select Vendor for Inventory' }} />
      <Stack.Screen name="InventoryReceipt" component={InventoryReceiptScreen} options={{ title: 'Record Inventory Receipt' }} />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} />
      <Stack.Screen name="VendorSelection" component={VendorSelectionScreen} options={{ title: 'Select Vendor' }} />
    </Stack.Navigator>
  );
};