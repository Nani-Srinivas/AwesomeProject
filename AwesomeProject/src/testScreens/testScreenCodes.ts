import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Modal, TouchableWithoutFeedback, Animated, Dimensions, FlatList } from 'react-native';
import { apiService } from '../../services/apiService';
import { Vendor } from '../../types/Vendor';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

type VendorDetailsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'VendorDetails'>;
type VendorDetailsScreenRouteProp = RouteProp<MainStackParamList, 'VendorDetails'>;

interface VendorDetails {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  contactPerson?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  paymentTerms?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  payableAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  assignedCategories?: string[]; // This is now part of the vendor model
  createdAt: string;
  updatedAt: string;
}

interface InventoryReceipt {
  _id: string;
  receiptNumber: string;
  receivedDate: string;
  items: Array<{
    storeProductId: {
      name: string;
    };
    receivedQuantity: number;
    unitPrice: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  amountPaid: number;
}

interface PaymentRecord {
  _id: string;
  amount: number;
  date: string;
  method: string;
  transactionId?: string;
  notes?: string;
}

const VendorDetailsScreen = () => {
  const navigation = useNavigation<VendorDetailsScreenNavigationProp>();
  const route = useRoute<VendorDetailsScreenRouteProp>();
  const { vendorId } = route.params;

  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [inventoryReceipts, setInventoryReceipts] = useState<InventoryReceipt[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVendorDetails = async () => {
    try {
      setLoading(true);

      // Fetch vendor details
      const vendorResponse = await apiService.get(`/vendors/${vendorId}`);
      if (vendorResponse.data.success) {
        setVendor(vendorResponse.data.data);
      }

      // Fetch related inventory receipts for this store
      const receiptResponse = await apiService.get(`/inventory/receipts`);
      if (receiptResponse.data.success) {
        // Filter receipts for this vendor
        const vendorReceipts = receiptResponse.data.data.filter(
          (receipt: any) => receipt.vendorId && receipt.vendorId._id === vendorId
        );
        setInventoryReceipts(vendorReceipts);
      }

      // Fetch payment records for this vendor
      // This might require a specific endpoint or we can simulate it with a placeholder
      // For now, we'll use a placeholder
      const samplePayments: PaymentRecord[] = [
        {
          _id: 'pay1',
          amount: 15000,
          date: '2025-01-15',
          method: 'Bank Transfer',
          transactionId: 'TXN001',
          notes: 'Payment for January delivery'
        },
        {
          _id: 'pay2',
          amount: 12500,
          date: '2025-02-15',
          method: 'Cash',
          notes: 'February installment'
        }
      ];
      setPayments(samplePayments);

    } catch (error) {
      console.error('Error loading vendor details:', error);
      Alert.alert('Error', 'Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorDetails();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendorDetails();
    setRefreshing(false);
  };

  const handleMakePayment = () => {
    // Navigate to payment screen
    navigation.navigate('RecordPaymentToVendor', { vendorId: vendor._id });
  };

  const handleEditVendor = () => {
    // Navigate to edit vendor screen
    Alert.alert('Edit', `Navigate to edit vendor screen for: ${vendor?.name}`);
    // In a real app: navigation.navigate('EditVendor', { vendorId: vendor._id });
  };

  if (loading) {
    return (
      <View style= { styles.loadingContainer } >
      <ActivityIndicator size="large" color = { COLORS.primary } />
        <Text>Loading vendor details...</Text>
          </View>
    );
  }

if (!vendor) {
  return (
    <View style= { styles.errorContainer } >
    <Text>Vendor not found </Text>
      < TouchableOpacity onPress = { loadVendorDetails } >
        <Text style={ styles.retryText }> Retry </Text>
          </TouchableOpacity>
          </View>
    );
}

return (
  <ScrollView style= { styles.container } refreshControl = {< RefreshControl refreshing = { refreshing } onRefresh = { onRefresh } />}>
    {/* Vendor Header */ }
    < View style = { styles.header } >
      <View style={ styles.headerContent }>
        <Text style={ styles.vendorName }> { vendor.name } </Text>
          < Text style = { styles.vendorId } > ID: { vendor._id } </Text>
            < View style = {
              [styles.statusBadge, {
                backgroundColor:
                  vendor.status === 'active' ? 'rgba(76, 175, 80, 0.1)' :
                    vendor.status === 'inactive' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
              }]} >
              <Text style={
  [styles.statusText, {
    color:
      vendor.status === 'active' ? COLORS.success :
        vendor.status === 'inactive' ? COLORS.warning : COLORS.error
  }]
}>
  { vendor.status.toUpperCase() }
  </Text>
  </View>
  </View>
  </View>

{/* Payable Amount Card */ }
<View style={ styles.payableCard }>
  <View style={ styles.payableInfo }>
    <Text style={ styles.payableLabel }> Current Payable </Text>
      < Text style = { styles.payableAmount } >₹{ vendor.payableAmount?.toFixed(2) || '0.00' } </Text>
        </View>
        < View style = {
          [styles.paymentStatusBadge, {
            backgroundColor:
              vendor.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
                vendor.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
          }]} >
          <Text style={
  [styles.statusText, {
    color:
      vendor.paymentStatus === 'paid' ? COLORS.success :
        vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
  }]
}>
  { vendor.paymentStatus?.toUpperCase() }
  </Text>
  </View>
  </View>

{/* Action Buttons */ }
<View style={ styles.actionButtonsContainer }>
  <TouchableOpacity style={ styles.actionButton } onPress = { handleMakePayment } >
    <Feather name="dollar-sign" size = { 20} color = { COLORS.white } />
      <Text style={ styles.actionButtonText }> Make Payment </Text>
        </TouchableOpacity>
        < TouchableOpacity
style = { [styles.actionButton, styles.secondaryButton]}
onPress = { handleEditVendor }
  >
  <Feather name="edit" size = { 20} color = { COLORS.primary } />
    <Text style={ [styles.actionButtonText, { color: COLORS.primary }] }> Edit Vendor </Text>
      </TouchableOpacity>
      </View>

{/* Vendor Details Section */ }
<View style={ styles.section }>
  <Text style={ styles.sectionTitle }> Contact Information </Text>
    < View style = { styles.detailRow } >
      <Text style={ styles.detailLabel }> Phone </Text>
        < Text style = { styles.detailValue } > { vendor.phone } </Text>
          </View>
{
  vendor.email && (
    <View style={ styles.detailRow }>
      <Text style={ styles.detailLabel }> Email </Text>
        < Text style = { styles.detailValue } > { vendor.email } </Text>
          </View>
        )
}
{
  vendor.address && (
    <>
    <Text style={ styles.detailLabel }> Address </Text>
  { vendor.address.street && <Text style={ styles.detailValue }> { vendor.address.street } </Text> }
  <Text style={ styles.detailValue }>
    { vendor.address.city }, { vendor.address.state } { vendor.address.zip }
  </Text>
  { vendor.address.country && <Text style={ styles.detailValue }> { vendor.address.country } </Text> }
  </>
        )
}
{
  vendor.contactPerson && (
    <>
    <Text style={ styles.detailLabel }> Contact Person </Text>
  { vendor.contactPerson.name && <Text style={ styles.detailValue }> { vendor.contactPerson.name } </Text> }
  { vendor.contactPerson.phone && <Text style={ styles.detailValue }> { vendor.contactPerson.phone } </Text> }
  { vendor.contactPerson.email && <Text style={ styles.detailValue }> { vendor.contactPerson.email } </Text> }
  </>
        )
}
</View>

{/* Assigned Categories */ }
{
  vendor.assignedCategories && vendor.assignedCategories.length > 0 && (
    <View style={ styles.section }>
      <Text style={ styles.sectionTitle }> Assigned Categories </Text>
  {
    vendor.assignedCategories.map((categoryId, index) => (
      <View key= { index } style = { styles.detailRow } >
      <Text style={ styles.detailLabel } > Category { index + 1} </Text>
        < Text style = { styles.detailValue } > { categoryId.toString() } </Text>
          </View>
          ))
}
</View>
      )}

{/* Recent Inventory Receipts */ }
{
  inventoryReceipts.length > 0 && (
    <View style={ styles.section }>
      <View style={ styles.sectionHeader }>
        <Text style={ styles.sectionTitle }> Recent Inventory Receipts </Text>
          < TouchableOpacity >
          <Text style={ styles.viewAllText }> View All </Text>
            </TouchableOpacity>
            </View>
  {
    inventoryReceipts.slice(0, 3).map((receipt) => (
      <View key= { receipt._id } style = { styles.receiptCard } >
      <View style={ styles.receiptHeader } >
    <Text style={ styles.receiptNumber } > { receipt.receiptNumber } </Text>
    < Text style = { styles.receiptDate } > { new Date(receipt.receivedDate).toLocaleDateString() } </Text>
    </View>
    < Text style = { styles.receiptTotal } > Total: ₹{ receipt.totalAmount?.toFixed(2) || '0.00' } </Text>
    < Text style = { styles.receiptStatus } >
    Payment: { receipt.paymentStatus?.toUpperCase() }(Paid: ₹{ receipt.amountPaid?.toFixed(2) || '0.00' })
    </Text>
    </View>
    ))
  }
  </View>
      )
}

{/* Payment History */ }
{
  payments.length > 0 && (
    <View style={ styles.section }>
      <View style={ styles.sectionHeader }>
        <Text style={ styles.sectionTitle }> Payment History </Text>
          < TouchableOpacity >
          <Text style={ styles.viewAllText }> View All </Text>
            </TouchableOpacity>
            </View>
  {
    payments.slice(0, 3).map((payment) => (
      <View key= { payment._id } style = { styles.paymentCard } >
      <View style={ styles.paymentHeader } >
    <Text style={ styles.paymentAmount } >₹{ payment.amount.toFixed(2) } </Text>
    < Text style = { styles.paymentDate } > { new Date(payment.date).toLocaleDateString() } </Text>
    </View>
    < Text style = { styles.paymentMethod } > Method: { payment.method } </Text>
              {
        payment.transactionId && (
          <Text style={ styles.paymentId } > Transaction: { payment.transactionId } </Text>
    )
  }
  {
    payment.notes && (
      <Text style={ styles.paymentNotes }> Note: { payment.notes } </Text>
              )
  }
  </View>
          ))
}
</View>
      )}
</ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryText: {
    color: COLORS.primary,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  vendorId: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payableCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  payableInfo: {
    flex: 1,
  },
  payableLabel: {
    fontSize: 14,
    color: COLORS.grey,
  },
  payableAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.grey,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  receiptCard: {
    backgroundColor: 'rgba(30, 115, 184, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptNumber: {
    fontWeight: '600',
    color: COLORS.text,
  },
  receiptDate: {
    fontSize: 12,
    color: COLORS.grey,
  },
  receiptTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  receiptStatus: {
    fontSize: 12,
    color: COLORS.grey,
  },
  paymentCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentAmount: {
    fontWeight: '600',
    color: COLORS.success,
  },
  paymentDate: {
    fontSize: 12,
    color: COLORS.grey,
  },
  paymentMethod: {
    fontSize: 12,
    color: COLORS.text,
  },
  paymentId: {
    fontSize: 12,
    color: COLORS.grey,
  },
  paymentNotes: {
    fontSize: 12,
    color: COLORS.grey,
    fontStyle: 'italic',
  },
});

export default VendorDetailsScreen;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/types';
import Feather from 'react-native-vector-icons/Feather';

type RecordPaymentToVendorScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'RecordPaymentToVendor'>;
type RecordPaymentToVendorScreenRouteProp = RouteProp<MainStackParamList, 'RecordPaymentToVendor'>;

interface Vendor {
  _id: string;
  name: string;
  phone: string;
  payableAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
}

interface OutstandingReceipt {
  _id: string;
  receiptNumber: string;
  receivedDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
}

const RecordPaymentToVendorScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList, 'RecordPaymentToVendor'>>();
  const route = useRoute<RouteProp<MainStackParamList, 'RecordPaymentToVendor'>>();
  const { vendorId } = route.params as { vendorId: string };

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [outstandingReceipts, setOutstandingReceipts] = useState<OutstandingReceipt[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadVendorAndOutstandingReceipts();
  }, []);

  const loadVendorAndOutstandingReceipts = async () => {
    try {
      setLoading(true);

      // Fetch vendor details
      const vendorResponse = await apiService.get(`/vendors/${vendorId}`);
      if (vendorResponse.data.success) {
        setVendor(vendorResponse.data.data);
      } else {
        Alert.alert('Error', 'Failed to load vendor details');
        return;
      }

      // Fetch outstanding receipts for this vendor (receipts that are not fully paid)
      const receiptResponse = await apiService.get(`/inventory/receipts`);
      if (receiptResponse.data.success) {
        const vendorReceipts = receiptResponse.data.data.filter(
          (receipt: any) =>
            receipt.vendorId &&
            receipt.vendorId._id === vendorId &&
            receipt.paymentStatus !== 'paid' // Only show receipts that are not fully paid
        );
        setOutstandingReceipts(vendorReceipts);
      }
    } catch (error: any) {
      console.error('Error loading vendor/payment data:', error);
      Alert.alert('Error', 'Failed to load vendor payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentAmount) > (vendor?.payableAmount || 0)) {
      Alert.alert('Error', 'Payment amount cannot exceed the payable amount');
      return;
    }

    // Payment methods that require transaction ID
    if (['bank_transfer', 'digital', 'cheque'].includes(paymentMethod) && !transactionId) {
      Alert.alert('Error', 'Transaction ID is required for this payment method');
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare payment data
      const paymentData = {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        transactionId: transactionId || undefined,
        notes: notes || undefined
      };

      // Make API call to record the payment
      const response = await apiService.post(`/vendors/${vendorId}/payment`, paymentData);

      if (response.data.success) {
        Alert.alert(
          'Success',
          `Payment of ₹${paymentAmount} has been recorded for vendor ${vendor?.name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to the vendor details or payables screen
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to record payment');
      }
    } catch (error: any) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style= { styles.loadingContainer } >
      <ActivityIndicator size="large" color = { COLORS.primary } />
        <Text>Loading vendor payment details...</Text>
          </View>
    );
  }

if (!vendor) {
  return (
    <View style= { styles.errorContainer } >
    <Text>Vendor not found </Text>
      < TouchableOpacity onPress = { loadVendorAndOutstandingReceipts } >
        <Text style={ styles.retryText }> Retry </Text>
          </TouchableOpacity>
          </View>
    );
}

return (
  <ScrollView style= { styles.container } >
  {/* Header */ }
  < View style = { styles.header } >
    <Text style={ styles.vendorName }> { vendor.name } </Text>
      < Text style = { styles.vendorId } > ID: { vendor._id } </Text>
        < Text style = { styles.vendorContact } > Contact: { vendor.phone } </Text>
          </View>

{/* Current Payable Amount */ }
<View style={ styles.summaryCard }>
  <Text style={ styles.summaryLabel }> Current Payable Amount </Text>
    < Text style = { styles.payableAmount } >₹{ vendor.payableAmount?.toFixed(2) || '0.00' } </Text>
      < View style = {
        [styles.paymentStatusBadge, {
          backgroundColor:
            vendor.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
              vendor.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }]} >
        <Text style={
  [styles.statusText, {
    color:
      vendor.paymentStatus === 'paid' ? COLORS.success :
        vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
  }]
}>
  { vendor.paymentStatus?.toUpperCase() }
  </Text>
  </View>
  </View>

{/* Outstanding Receipts */ }
{
  outstandingReceipts.length > 0 && (
    <View style={ styles.section }>
      <Text style={ styles.sectionTitle }> Outstanding Receipts </Text>
  {
    outstandingReceipts.map((receipt) => (
      <View key= { receipt._id } style = { styles.outstandingReceiptCard } >
      <View style={ styles.receiptHeader } >
    <Text style={ styles.receiptNumber } > { receipt.receiptNumber } </Text>
    < Text style = { styles.receiptDate } > { new Date(receipt.receivedDate).toLocaleDateString() } </Text>
    </View>
    < View style = { styles.receiptDetails } >
    <Text style={ styles.receiptDetail } > Total: ₹{ receipt.totalAmount?.toFixed(2) || '0.00' } </Text>
    < Text style = { styles.receiptDetail } > Paid: ₹{ receipt.amountPaid?.toFixed(2) || '0.00' } </Text>
    < Text style = { styles.receiptDetail } > Due: ₹{(receipt.totalAmount - receipt.amountPaid).toFixed(2)} </Text>
      </View>
      < View style = {
        [styles.receiptStatus, {
          backgroundColor:
            receipt.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
              receipt.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }]} >
        <Text style={
    [styles.receiptStatusText, {
      color:
        receipt.paymentStatus === 'paid' ? COLORS.success :
          receipt.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
    }]
  }>
    { receipt.paymentStatus?.toUpperCase() }
    </Text>
    </View>
    </View>
          ))
}
</View>
      )}

{/* Payment Form */ }
<View style={ styles.section }>
  <Text style={ styles.sectionTitle }> Record Payment </Text>

    < View style = { styles.inputGroup } >
      <Text style={ styles.label }> Payment Amount * </Text>
        < TextInput
style = { styles.input }
value = { paymentAmount }
onChangeText = { setPaymentAmount }
placeholder = "Enter payment amount"
keyboardType = "decimal-pad"
  />
  </View>

  < View style = { styles.inputGroup } >
    <Text style={ styles.label }> Payment Method </Text>
      < View style = { styles.paymentMethodContainer } >
      {
        ['cash', 'bank_transfer', 'digital', 'cheque'].map((method) => (
          <TouchableOpacity
                key= { method }
                style = { [styles.paymentMethodOption, paymentMethod === method && styles.paymentMethodOptionSelected]}
                onPress = {() => setPaymentMethod(method)}
        >
        <Text style={ [styles.paymentMethodText, paymentMethod === method && styles.paymentMethodTextSelected] }>
          { method.replace('_', ' ').toUpperCase() }
          </Text>
          </TouchableOpacity>
            ))}
</View>
  </View>

{
  ['bank_transfer', 'digital', 'cheque'].includes(paymentMethod) && (
    <View style={ styles.inputGroup }>
      <Text style={ styles.label }> Transaction ID * </Text>
        < TextInput
  style = { styles.input }
  value = { transactionId }
  onChangeText = { setTransactionId }
  placeholder = "Enter transaction ID"
    />
    </View>
        )
}

<View style={ styles.inputGroup }>
  <Text style={ styles.label }> Notes </Text>
    < TextInput
style = { [styles.input, styles.textArea]}
value = { notes }
onChangeText = { setNotes }
placeholder = "Additional notes (optional)"
multiline
numberOfLines = { 3}
  />
  </View>

  < TouchableOpacity
style = { styles.submitButton }
onPress = { handlePaymentSubmit }
disabled = { isProcessing }
  >
  <Feather name="check-circle" size = { 20} color = { COLORS.white } />
    <Text style={ styles.submitButtonText }>
      { isProcessing? 'Processing Payment...': 'Record Payment' }
      </Text>
      </TouchableOpacity>
      </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryText: {
    color: COLORS.primary,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  vendorId: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 4,
  },
  vendorContact: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.grey,
  },
  payableAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 8,
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  outstandingReceiptCard: {
    backgroundColor: 'rgba(30, 115, 184, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptNumber: {
    fontWeight: '600',
    color: COLORS.text,
  },
  receiptDate: {
    fontSize: 12,
    color: COLORS.grey,
  },
  receiptDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptDetail: {
    fontSize: 12,
    color: COLORS.text,
  },
  receiptStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receiptStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  paymentMethodOption: {
    flex: 0.48, // Two options per row with spacing
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodOptionSelected: {
    backgroundColor: 'rgba(30, 115, 184, 0.1)',
    borderColor: COLORS.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLORS.text,
  },
  paymentMethodTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  receiptStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RecordPaymentToVendorScreen;


import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';

const agendaItems = {
  '2025-11-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-11-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Payment data structure
const paymentData = {
  brandName: 'Brand Name',
  date: '09-11-2025',
  paymentRef: '0123456789',
  amount: 17000,
  due: 0,
  isPaid: true, // Toggle this to see different states
  subcategories: [
    {
      name: 'Milk',
      products: [{ name: 'Product', status: 'Out of office TH' }]
    },
    {
      name: 'Vegetables',
      products: [{ name: 'Product', status: 'Out of office Total' }]
    }
  ]
};

export const AddStockScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const onDateChanged = (date: string) => {
    setSelectedDate(date);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const renderCustomHeader = (date: any) => {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');

    return (
      <View style= { styles.header } >
      <View style={ styles.headerLeft }>
        <Feather name="calendar" size = { 24} color = "#1E73B8" />
          <Text style={ styles.monthText }> {`${month} ${year}`
  }</Text>
    </View>
    < View style = { styles.headerRight } >
      <TouchableOpacity onPress={ goToPreviousMonth }>
        <Feather name="chevron-left" size = { 24} color = "#1E73B8" />
          </TouchableOpacity>
          < TouchableOpacity onPress = { goToNextMonth } >
            <Feather name="chevron-right" size = { 24} color = "#1E73B8" />
              </TouchableOpacity>
              </View>
              </View>
    );
  };

return (
  <View style= { styles.container } >
  <CalendarProvider date={ selectedDate } onDateChanged = { onDateChanged } >
    <ExpandableCalendar
          renderHeader={ renderCustomHeader }
hideArrows = { true}
markedDates = {{
  [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
            ...Object.keys(agendaItems).reduce((acc, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {}),
          }}
        />
  < ScrollView style = { styles.scrollContent } >
    <View style={ styles.agendaContainer }>
      <Text style={ styles.agendaTitle }> Agenda for { selectedDate } </Text>
            {
    agendaItems[selectedDate]?(
      agendaItems[selectedDate].map((item, index) => (
        <View key= { index } style = { styles.agendaItem } >
        <Text style={ styles.agendaTime } > { item.time } </Text>
      < Text style = { styles.agendaItemTitle } > { item.title } </Text>
      </View>
      ))
            ) : (
        <Text style={ styles.noItemsText } > No items for this day </Text>
            )}
</View>

{/* Payment Receipt Section */ }
<View style={ styles.paymentReceiptContainer }>
  <View style={ styles.receiptHeader }>
    <Text style={ styles.brandNameHeader }> { paymentData.brandName } </Text>
      < View style = { styles.paymentStatusBadge } >
        <Text style={ [styles.statusText, paymentData.isPaid ? styles.paidText : styles.dueText] }>
          { paymentData.isPaid ? '1st Payment Due' : '1st Not Paid' }
          </Text>
          </View>
          </View>

          < View style = { styles.receiptCard } >
            <View style={ styles.receiptRow }>
              <Text style={ styles.receiptLabel }> Date </Text>
                < Text style = { styles.receiptValue } > { paymentData.date } </Text>
                  </View>

                  < View style = { styles.receiptRow } >
                    <Text style={ styles.receiptLabel }> Payment Ref </Text>
                      < Text style = { styles.receiptValue } > { paymentData.paymentRef } </Text>
                        </View>

                        < View style = { styles.receiptRow } >
                          <Text style={ styles.receiptLabel }> Amount </Text>
                            < Text style = { styles.receiptValue } >₹ { paymentData.amount.toLocaleString() } </Text>
                              </View>

                              < View style = { styles.receiptRow } >
                                <Text style={ styles.receiptLabel }> Due </Text>
                                  < Text style = { styles.receiptValue } >₹ { paymentData.due } </Text>
                                    </View>

                                    < View style = { styles.divider } />

                                      {/* Subcategories Section */ }
{
  paymentData.subcategories.map((subcategory, index) => (
    <View key= { index } style = { styles.subcategorySection } >
    <Text style={ styles.subcategoryTitle } > { subcategory.name }(subcategory) </Text>
                  {
      subcategory.products.map((product, prodIndex) => (
        <View key= { prodIndex } style = { styles.productRow } >
        <Text style={ styles.productName } > Product </Text>
      < Text style = { styles.productStatus } > { product.status } </Text>
      </View>
      ))
}
</View>
              ))}
</View>
  </View>
  </ScrollView>
  </CalendarProvider>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollContent: {
    flex: 1,
  },
  agendaContainer: {
    padding: 16,
  },
  agendaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaTime: {
    fontSize: 16,
    marginRight: 8,
  },
  agendaItemTitle: {
    fontSize: 16,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    color: '#999',
  },
  paymentReceiptContainer: {
    padding: 16,
    paddingTop: 0,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandNameHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#4CAF50',
  },
  dueText: {
    color: '#F44336',
  },
  receiptCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  subcategorySection: {
    marginBottom: 16,
  },
  subcategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 12,
  },
  productName: {
    fontSize: 14,
    color: '#666',
  },
  productStatus: {
    fontSize: 13,
    color: '#1E73B8',
    fontWeight: '500',
  },
});



// Add Attendance Clean UI
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { apiService } from '../../services/apiService';
import { EditAttendanceBottomSheet } from './components/EditAttendanceModal';
import { AddExtraProductBottomSheet } from './components/AddExtraProductModal';
import { COLORS } from '../../constants/colors';
import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useAttendanceStore } from '../../store/attendanceStore';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Interfaces
interface Area {
  _id: string;
  name: string;
  totalSubscribedItems: number;
}

interface Product {
  product: { // Changed from productId to product to match existing usage
    _id: string;
    name: string;
    price?: number; // Price might be optional
  };
  quantity: number;
  status?: 'delivered' | 'not_delivered' | 'skipped' | 'out_of_stock'; // Status is often added later
  _id?: string; // For requiredProduct array items
}

interface Customer {
  _id: string;
  name: string;
  requiredProduct: Product[]; // Changed from products to requiredProduct to match existing usage
  submitted?: boolean;
}

interface AttendanceState {
  [customerId: string]: {
    [productId: string]: {
      status: string;
      quantity: number;
    };
  };
}

export const AddAttendance = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Section Structure: { title: "Apartment 1", data: [Customer1, Customer2] }
  // We will maintain the ORDER of Titles separately or just iterate sections
  // sectionsData is the Map/Object. orderedSectionTitles is the Array.
  const [sectionsMap, setSectionsMap] = useState<Record<string, Customer[]>>({});
  const [orderedSectionTitles, setOrderedSectionTitles] = useState<string[]>([]);

  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [expandedSections, setExpandedSections] = useState<{ [apartment: string]: boolean }>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddExtraProductModalVisible, setIsAddExtraProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  // States for Reconciliation
  const [totalDispatched, setTotalDispatched] = useState<string>('');
  const [returnedExpression, setReturnedExpression] = useState<string>('');
  const [returnedQuantity, setReturnedQuantity] = useState(0);

  // --- Calculations ---

  // 1. Calculate Returned Quantity from Expression
  useEffect(() => {
    if (!returnedExpression) {
      setReturnedQuantity(0);
      return;
    }

    const parseExpression = (expr: string) => {
      if (!expr) return 0;
      try {
        const sanitized = expr.replace(/[^0-9+\-.]/g, ''); // Allow .
        if (!sanitized) return 0;
        const result = sanitized.split('+').reduce((acc, part) => {
          const subParts = part.split('-');
          let subSum = parseFloat(subParts[0] || '0');
          for (let i = 1; i < subParts.length; i++) {
            subSum -= parseFloat(subParts[i] || '0');
          }
          return acc + subSum;
        }, 0);
        return isNaN(result) ? 0 : result;
      } catch (e) {
        return 0;
      }
    };

    setReturnedQuantity(parseExpression(returnedExpression));
  }, [returnedExpression]);

  // 2. Calculate Total Given Quantity from Expression
  const totalGivenQuantity = useMemo(() => {
    const expr = totalDispatched;
    if (!expr) return 0;
    try {
      const sanitized = expr.replace(/[^0-9+\-.]/g, '');
      if (!sanitized) return 0;
      const result = sanitized.split('+').reduce((acc, part) => {
        const subParts = part.split('-');
        let subSum = parseFloat(subParts[0] || '0');
        for (let i = 1; i < subParts.length; i++) {
          subSum -= parseFloat(subParts[i] || '0');
        }
        return acc + subSum;
      }, 0);
      return isNaN(result) ? 0 : result;
    } catch (e) {
      return 0;
    }
  }, [totalDispatched]);

  // 3. Calculate Total Delivered
  const totalDelivered = useMemo(() => {
    let total = 0;
    Object.values(attendance).forEach(customerAttendance => {
      Object.values(customerAttendance).forEach((prod: any) => {
        if (prod.status === 'delivered') {
          total += (parseInt(prod.quantity, 10) || 0);
        }
      });
    });
    return total;
  }, [attendance]);

  const balance = (totalGivenQuantity + returnedQuantity) - totalDelivered;

  // --- Persistence Logic ---
  const { setDraft, getDraft, clearDraft } = useAttendanceStore();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Load Draft
  const loadDraft = useCallback(() => {
    if (!selectedDate || !selectedArea) return;

    const draft = getDraft(selectedDate, selectedArea);
    if (draft) {
      console.log('Loading draft for:', selectedDate, selectedArea);
      if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
      if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
      if (draft.attendance !== undefined && Object.keys(draft.attendance).length > 0) {
        setAttendance(draft.attendance);
      }
    }
    setIsDraftLoaded(true);
  }, [selectedDate, selectedArea, getDraft]);

  // Save Draft (Auto-save)
  useEffect(() => {
    if (!isDraftLoaded || !selectedDate || !selectedArea) return;

    // specific check to avoid saving empty state over draft if something weird happens
    // but relies on isDraftLoaded being true only after we attempted load.
    const timeoutId = setTimeout(() => {
      setDraft(selectedDate, selectedArea, {
        totalDispatched,
        returnedExpression,
        attendance
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [totalDispatched, returnedExpression, attendance, selectedDate, selectedArea, isDraftLoaded, setDraft]);

  // ✅ fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiService.get('/delivery/area');
        const fetchedAreas = response.data.data;
        if (fetchedAreas?.length > 0) {
          setAreas(fetchedAreas);
          setSelectedArea(fetchedAreas[0]._id);
          // ✅ Auto-fill total dispatched from first area
          if (fetchedAreas[0].totalSubscribedItems) {
            setTotalDispatched(String(fetchedAreas[0].totalSubscribedItems));
          }
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);


  // ✅ fetch customers for selected area - REFRESH ON FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!selectedArea) return;

      const fetchCustomers = async () => {
        try {
          const response = await apiService.get(`/customer/area/${selectedArea}`);
          const fetchedCustomers = response.data.data;
          if (!Array.isArray(fetchedCustomers)) {
            setCustomers([]);
            setAttendance({});
            setSectionsMap({});
            setOrderedSectionTitles([]);
            return;
          }

          // ✅ Sort customers by Apartment, then by Flat Number
          const sortedCustomers = fetchedCustomers.sort((a, b) => {
            // Get apartment names (case-insensitive)
            const apartmentA = (a.address?.Apartment || '').toLowerCase();
            const apartmentB = (b.address?.Apartment || '').toLowerCase();

            // First, sort by apartment name
            if (apartmentA !== apartmentB) {
              return apartmentA.localeCompare(apartmentB);
            }

            // If same apartment, sort by flat number numerically
            const flatA = a.address?.FlatNo || '';
            const flatB = b.address?.FlatNo || '';

            // Extract numeric part from flat number (handles formats like "101", "A-101", "Flat 101")
            const numA = parseInt(flatA.replace(/\D/g, '')) || 0;
            const numB = parseInt(flatB.replace(/\D/g, '')) || 0;

            // Compare numbers first
            if (numA !== numB) {
              return numA - numB;
            }

            // If numbers are same, fall back to string comparison (for cases like "101A" vs "101B")
            return flatA.localeCompare(flatB);
          });

          setCustomers(sortedCustomers);

          // ✅ Group customers into sections by apartment
          const map: Record<string, Customer[]> = {};

          sortedCustomers.forEach((customer) => {
            const apartment = customer.address?.Apartment || 'Other';
            if (!map[apartment]) {
              map[apartment] = [];
            }
            map[apartment].push(customer);
          });

          setSectionsMap(map);

          // Initial Order (Alphabetical)
          const allTitles = Object.keys(map).sort((a, b) => {
            if (a === 'Other') return 1;
            if (b === 'Other') return -1;
            return a.localeCompare(b);
          });
          setOrderedSectionTitles(allTitles);


          // Initialize expanded sections
          const initialExpandedSections: { [apartment: string]: boolean } = {};
          allTitles.forEach(title => { initialExpandedSections[title] = true; });
          setExpandedSections(initialExpandedSections);

          // ------------------------------------------------------------------
          // Data Loading Priority: Draft -> Server (History) -> Defaults
          // ------------------------------------------------------------------

          // 1. Try Loading Draft
          const draft = getDraft(selectedDate, selectedArea);
          if (draft) {
            console.log('Using local draft for:', selectedDate);
            if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
            if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
            if (draft.attendance && Object.keys(draft.attendance).length > 0) {
              setAttendance(draft.attendance);
            } else {
              // Fallback to defaults if draft attendance is empty
              setAttendance(calculateDefaultAttendance(fetchedCustomers));
            }
            setIsDraftLoaded(true);
            return;
          }

          // 2. Fetch Server History (if no draft)
          try {
            const historyResponse = await apiService.get('/attendance', {
              date: selectedDate, areaId: selectedArea
            });
            const historyData = historyResponse.data.data; // Expecting array of records or single record

            // The API returns an array, we expect at most one record for (date, area, store)
            const existingRecord = Array.isArray(historyData) ? historyData[0] : historyData;

            if (existingRecord) {
              console.log('Found server history for:', selectedDate);
              // Populate from Server
              setTotalDispatched(String(existingRecord.totalDispatched || 0));
              setReturnedExpression(existingRecord.returnedItems?.expression || '');

              // Convert Server Attendance Array -> Map
              const serverAttendanceMap = {};
              if (Array.isArray(existingRecord.attendance)) {
                existingRecord.attendance.forEach((entry: any) => {
                  const cId = entry.customerId._id || entry.customerId; // Handle populated or unpopulated
                  serverAttendanceMap[cId] = {};
                  if (Array.isArray(entry.products)) {
                    entry.products.forEach((p: any) => {
                      const pId = p.productId._id || p.productId;
                      serverAttendanceMap[cId][pId] = {
                        quantity: p.quantity,
                        status: p.status
                      };
                    });
                  }
                });
              }

              // Merge with defaults to ensure missing customers are still present
              const defaultAtt = calculateDefaultAttendance(fetchedCustomers);
              const finalAttendance = { ...defaultAtt };

              // Overlay server data
              Object.keys(serverAttendanceMap).forEach(cId => {
                if (finalAttendance[cId]) {
                  finalAttendance[cId] = { ...finalAttendance[cId], ...serverAttendanceMap[cId] };
                }
              });

              setAttendance(finalAttendance);
              setIsDraftLoaded(true);
              return;
            }
          } catch (historyError) {
            console.log('No history found or error fetching history:', historyError);
          }

          // 3. Fallback to Defaults (New Day)
          console.log('No draft or history, using defaults.');
          setAttendance(calculateDefaultAttendance(fetchedCustomers));

          // Default Total Dispatched from Area
          const currentArea = areas.find(a => a._id === selectedArea);
          if (currentArea?.totalSubscribedItems) {
            setTotalDispatched(String(currentArea.totalSubscribedItems));
          } else {
            setTotalDispatched('0');
          }
          setReturnedExpression('');

          setIsDraftLoaded(true);

        } catch (error) {
          console.error('Error in data loading sequence:', error);
          setCustomers([]);
          setAttendance({});
          setIsDraftLoaded(true);
        }
      };

      // Helper to calculate defaults
      const calculateDefaultAttendance = (custs: Customer[]) => {
        const initial = {};
        custs.forEach(customer => {
          initial[customer._id] = {};
          if (Array.isArray(customer.requiredProduct)) {
            customer.requiredProduct.forEach(product => {
              if (product.product?._id) {
                initial[customer._id][product.product._id] = {
                  quantity: product.quantity,
                  status: 'delivered',
                };
              }
            });
          }
        });
        return initial;
      };

      // Reset draft loaded state when needs refresh
      setIsDraftLoaded(false);
      fetchCustomers();

    }, [selectedArea, areas, selectedDate, getDraft])
  );



  const onDateChanged = date => setSelectedDate(date);

  const toggleSectionExpansion = (apartment: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [apartment]: !prev[apartment],
    }));
  };

  const handleProductStatusChange = (customerId, productId, newStatus) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          status: newStatus,
        },
      },
    }));
  };

  const handleProductQuantityChange = (customerId, productId, newQuantity) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          quantity: newQuantity, // Allow string input
        },
      },
    }));
  };

  const openEditModal = customer => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

  // ✅ New: open bottom sheet for Add Extra Product
  const openAddExtraProductModal = customer => {
    setSelectedCustomer(customer);
    setIsAddExtraProductModalVisible(true);
  };

  const closeAddExtraProductModal = () => {
    setIsAddExtraProductModalVisible(false);
    setSelectedCustomer(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer._id === customerId) {
          // Create a mutable copy of the products to work with
          let allProducts = [...editedRequiredProducts];

          // Handle the newly added products, which is an array
          if (Array.isArray(addedExtraProducts)) {
            addedExtraProducts.forEach(newProduct => {
              if (newProduct.quantity > 0) {
                // Normalize the new product to match the structure of existing ones
                const normalizedProduct = {
                  product: { _id: newProduct.productId, name: newProduct.name },
                  quantity: newProduct.quantity,
                };

                // Check if this product already exists in the list
                const existingIndex = allProducts.findIndex(
                  p => p.product._id === normalizedProduct.product._id
                );

                if (existingIndex !== -1) {
                  // If it exists, update the quantity
                  allProducts[existingIndex].quantity = normalizedProduct.quantity;
                } else {
                  // Otherwise, add it to the list
                  allProducts.push(normalizedProduct);
                }
              }
            });
          }

          // Update the attendance state for the customer
          const newAttendanceForCustomer = {};
          allProducts.forEach(p => {
            if (p.product && p.product._id) {
              newAttendanceForCustomer[p.product._id] = {
                quantity: p.quantity,
                status: p.status || 'delivered',
              };
            }
          });

          setAttendance(prev => ({
            ...prev,
            [customerId]: newAttendanceForCustomer,
          }));

          // Return the updated customer object
          return { ...customer, requiredProduct: allProducts };
        }
        return customer;
      })
    );

    // Close the modals
    closeEditModal();
    closeAddExtraProductModal();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    const today = new Date().toISOString().split('T')[0];

    if (selectedDate < today) {
      // Temporarily allowing past dates for editing history, or you can restrict
      // For now, let's keep restriction but maybe warn?
      // setFeedbackMessage('Cannot modify attendance for past dates.');
      // setFeedbackMessageType('error');
      // setIsLoading(false);
      // return;
    }

    const formattedAttendance = Object.keys(attendance)
      .map(customerId => ({
        customerId,
        products: Object.keys(attendance[customerId]).map(productId => ({
          productId,
          quantity: parseFloat(String(attendance[customerId][productId].quantity)) || 0,
          status: attendance[customerId][productId].status,
        })),
      }))
      .filter(c => c.products.length > 0);

    if (formattedAttendance.length === 0) {
      setFeedbackMessage('No attendance data to submit.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const payload = {
      date: selectedDate,
      areaId: selectedArea,
      attendance: formattedAttendance,
      totalDispatched: parseFloat(totalDispatched) || 0,
      returnedItems: {
        quantity: returnedQuantity,
        expression: returnedExpression
      }
    };

    if (balance !== 0) {
      Alert.alert(
        'Stock Mismatch',
        `The stock does not match!\n\nGiven: ${totalDispatched || 0}\nDelivered: ${totalDelivered}\nReturned: ${returnedQuantity}\n\nBalance: ${balance}\n\nPlease adjust the delivered quantities until the balance is 0.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      // Wait, letting them submit anyway? Usually NO. Return here.
      setIsLoading(false); // Make sure to stop loading
      return;
    }

    submitData(payload);
  };

  const submitData = async (payload) => {
    try {
      if (isEditModalVisible) closeEditModal();
      const response = await apiService.postWithConfig('/attendance', payload, {
        headers: { 'X-Suppress-Global-Error-Alert': true },
      });

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));

      // ✅ Clear draft on successful submit
      if (selectedDate && selectedArea) {
        clearDraft(selectedDate, selectedArea);
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Attendance submit error:', error);

      if (error.response?.status === 409) {
        setFeedbackMessage(error.response.data.message || 'Attendance already exists for this date.');
        setFeedbackMessageType('error');
        setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
      } else {
        setFeedbackMessage(
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred while submitting attendance.'
        );
        setFeedbackMessageType('error');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackMessageType(null);
      }, 5000);
    }
  };

  const renderCustomHeader = (date: any) => {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');

    return (
      <View style= { styles.header } >
      <View style={ styles.headerLeft }>
        <Feather name="calendar" size = { 24} color = "#1E73B8" />
          <Text style={ styles.monthText }> {`${month} ${year}`
  }</Text>
    </View>
    < View style = { styles.headerRight } >
      <TouchableOpacity onPress={ goToPreviousMonth }>
        <Feather name="chevron-left" size = { 24} color = "#1E73B8" />
          </TouchableOpacity>
          < TouchableOpacity onPress = { goToNextMonth } >
            <Feather name="chevron-right" size = { 24} color = "#1E73B8" />
              </TouchableOpacity>
              </View>
              </View>
    );
  };

const [areAllExpanded, setAreAllExpanded] = useState(true);

const toggleAllSections = () => {
  const newExpandedState = !areAllExpanded;
  setAreAllExpanded(newExpandedState);

  const newSectionsState: { [key: string]: boolean } = {};
  const titles = orderedSectionTitles.length > 0 ? orderedSectionTitles : Object.keys(sectionsMap);

  titles.forEach(title => {
    newSectionsState[title] = newExpandedState;
  });

  setExpandedSections(newSectionsState);
};

const renderListHeader = () => (
  <View style= { styles.listHeaderContainer } >
  {/* Calendar Provider is wrapping the whole screen, usually ListHeaderComponent doesn't contain the CalendarProvider itself */ }

{/* Area & Totals */ }
<View style={ styles.attendanceHeader }>
  <View style={ styles.headerRowLeft }>
    <View style={ styles.dropdownContainer }>
      <Picker
              selectedValue={ selectedArea }
onValueChange = { setSelectedArea }
style = { styles.picker }
  >
{
  areas.map(area => (
    <Picker.Item key= { area._id } label = { area.name } value = { area._id } />
              ))
}
  </Picker>
  </View>
  < TouchableOpacity style = { styles.toggleButton } onPress = { toggleAllSections } >
    <Feather
              name={ areAllExpanded ? "chevrons-up" : "chevrons-down" }
size = { 22}
color = { COLORS.primary }
  />
  </TouchableOpacity>
  </View>

  < View style = { styles.totalEmployeesContainer } >
    <Text style={ styles.totalEmployeesLabel }> Total Customers </Text>
      < Text style = { styles.totalEmployeesCount } > { customers.length } </Text>
        </View>
        </View>

{/* Input Row */ }
<View style={ styles.topInputRow }>
  <View style={ styles.topInputGroup }>
    <Text style={ styles.topLabel }> Total Given </Text>
      < TextInput
style = { [styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
value = { totalDispatched }
// onChangeText={setTotalDispatched} // Read-only from Store
editable = { false}
placeholder = "0"
placeholderTextColor = "#999"
  />
  </View>
  < View style = { [styles.topInputGroup, { flex: 1.5 }]} >
    <Text style={ styles.topLabel }> Adjustments(+/-)</Text >
      <TextInput
            style={ [styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
            value = { returnedExpression }
            // onChangeText={setReturnedExpression} // Read-only from Store
            editable = { false}
            placeholder = "e.g. +3 or -5"
            placeholderTextColor = "#999"
      />
      </View>
      < TouchableOpacity
          style = { styles.infoButton }
          onPress = {() => setIsSummaryModalVisible(true)}
        >
      <Feather name="info" size = { 20} color = "#fff" />
      </TouchableOpacity>
      </View>
      </View>
    );

const renderItem = useCallback(({ item: title, drag, isActive }: RenderItemParams<string>) => {
  const isExpanded = expandedSections[title] !== false; // Default true
  const customersInApartment = sectionsMap[title] || [];

  // Sort Customers within Section (Flat No)
  // The main customer list is already sorted, so these should be sorted if sectionsMap was built from sorted list
  // But to be safe, we can re-sort or rely on the initial sort order which we did in fetchCustomers.
  // Since sectionsMap is built from sortedCustomers, they preserve order.

  return (
    <ScaleDecorator>
    <View style= { [styles.sectionContainer, isActive && styles.activeSection]} >
    <View style={ styles.sectionHeaderRow }>
      <TouchableOpacity onLongPress={ drag } disabled = { isActive } style = { styles.dragHandle } >
        <Feather name="menu" size = { 24} color = "#aaa" />
          </TouchableOpacity>

          < TouchableOpacity style = { styles.sectionHeaderContent } onPress = {() => toggleSectionExpansion(title)}>
            <Text style={ styles.sectionHeaderText }> { title } < Text style = {{ fontSize: 12, fontWeight: 'normal' }}> ({ customersInApartment.length }) < /Text></Text >
              <Feather
                name={ isExpanded ? "chevron-up" : "chevron-down" }
size = { 20}
color = "#6B6B6B"
  />
  </TouchableOpacity>
  </View>

{
  isExpanded && (
    <View>
    {
      customersInApartment.map((customer: any) => (
        <CustomerAttendanceItem
                  key= { customer._id }
                  customer = { customer }
                  attendance = { attendance[customer._id] || {} }
                  onProductStatusChange = {(pId, status) => handleProductStatusChange(customer._id, pId, status)}
                  onProductQuantityChange = {(pId, qty) => handleProductQuantityChange(customer._id, pId, qty)
}
onEdit = {() => openEditModal(customer)}
onAddExtra = {() => openAddExtraProductModal(customer)}
                />
              ))}
</View>
          )}
</View>
  </ScaleDecorator>
    );
  }, [sectionsMap, expandedSections, attendance]);


return (
  <GestureHandlerRootView style= {{ flex: 1 }}>
    <View style={ styles.container }>
      <CalendarProvider
          date={ selectedDate }
onDateChanged = { onDateChanged }
showTodayButton
disabledOpacity = { 0.6}
theme = {{
  todayButtonTextColor: '#1E73B8',
          }}
        >
  <ExpandableCalendar
            // horizontal={false}
            // hideArrows
            // disablePan
            // hideKnob
            // initialPosition={ExpandableCalendar.positions.OPEN}
            // calendarStyle={styles.calendar}
            // headerStyle={styles.calendarHeader} // customize the header style
            firstDay={ 1 }
marks = {
  [
    { date: '2025-09-20', dots: [{ color: 'red' }] },
    { date: '2025-09-21', dots: [{ color: 'red' }] }
  ]}
renderHeader = { renderCustomHeader }
theme = {{
  selectedDayBackgroundColor: '#1E73B8',
    selectedDayTextColor: '#ffffff',
      todayTextColor: '#1E73B8',
        arrowColor: '#1E73B8',
          dotColor: '#1E73B8',
            textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                  textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '300',
                        textDayFontSize: 14,
                          textMonthFontSize: 16,
                            textDayHeaderFontSize: 14
}}
          />

  < DraggableFlatList
data = { orderedSectionTitles }
onDragEnd = {({ data }) => setOrderedSectionTitles(data)}
keyExtractor = {(item) => item}
renderItem = { renderItem }
ListHeaderComponent = { renderListHeader }
contentContainerStyle = {{ paddingBottom: 100, paddingTop: 10 }}
ListEmptyComponent = {
              < EmptyState
icon = "👥"
title = "No Customers Found"
description = { selectedArea? "No customers found in this area.": "Please select an area." }
  />
            }
          />

{/* Submit Button */ }
{
  customers.length > 0 && (
    <View style={ styles.submitButtonContainer }>
      <View style={ styles.summaryRow }>
        <View style={ styles.summaryItem }>
          <Text style={ styles.summaryLabel }> Balance </Text>
            < Text style = { [styles.summaryValue, { color: balance === 0 ? COLORS.success : COLORS.error }]} > { balance } </Text>
              </View>
              < View style = { styles.summaryItem } >
                <Text style={ styles.summaryLabel }> Delivered </Text>
                  < Text style = { styles.summaryValue } > { totalDelivered } </Text>
                    </View>
                    </View>
                    < Button
  title = { isLoading? "Submitting...": "Submit Attendance" }
  onPress = { handleSubmit }
  disabled = { isLoading }
  style = { [styles.submitButton, balance !== 0 && { opacity: 0.7 }]}
    />
    { feedbackMessage && (
      <Text style={
    [
      styles.feedbackText,
      feedbackMessageType === 'error' ? styles.errorText : styles.successText
    ]
  }>
    { feedbackMessage }
    </Text>
              )
}
</View>
          )}

</CalendarProvider>

{/* Modals */ }
{
  selectedCustomer && (
    <EditAttendanceBottomSheet
            visible={ isEditModalVisible }
  onClose = { closeEditModal }
  onSave = {(editedProducts) => handleSaveAttendance(selectedCustomer?._id, editedProducts, [])
}
customer = { selectedCustomer }
attendance = { attendance[selectedCustomer._id]}
  />
        )}

{
  selectedCustomer && (
    <AddExtraProductBottomSheet
            visible={ isAddExtraProductModalVisible }
  onClose = { closeAddExtraProductModal }
  onSave = {(addedProducts) => handleSaveAttendance(selectedCustomer?._id, selectedCustomer.requiredProduct, addedProducts)
}
          // Pass necessary props
          />
        )}

<Modal
          visible={ isSummaryModalVisible }
transparent = { true}
animationType = "fade"
onRequestClose = {() => setIsSummaryModalVisible(false)}
        >
  <TouchableOpacity
            style={ styles.modalOverlay }
activeOpacity = { 1}
onPress = {() => setIsSummaryModalVisible(false)}
          >
  <View style={ styles.modalContent }>
    <Text style={ styles.modalTitle }> Dispatch Summary </Text>
      < View style = { styles.modalRow } >
        <Text style={ styles.modalLabel }> Total Given: </Text>
          < Text style = { styles.modalValue } > { totalGivenQuantity } </Text>
            </View>
            < View style = { styles.modalRow } >
              <Text style={ styles.modalLabel }> Returned Items: </Text>
                < Text style = { styles.modalValue } > { returnedQuantity } </Text>
                  </View>
                  < View style = { styles.modalRow } >
                    <Text style={ styles.modalLabel }> Total Delivered: </Text>
                      < Text style = { styles.modalValue } > { totalDelivered } </Text>
                        </View>
                        < View style = { [styles.modalRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 10 }]} >
                          <Text style={ styles.modalLabel }> Balance: </Text>
                            < Text style = { [styles.modalValue, { color: balance === 0 ? COLORS.success : COLORS.error, fontWeight: 'bold' }]} > { balance } </Text>
                              </View>
                              < View style = { styles.infoBox } >
                                <Text style={ styles.infoText }> Balance should be 0 before submitting.</Text>
                                  </View>
                                  < TouchableOpacity
style = { styles.closeButton }
onPress = {() => setIsSummaryModalVisible(false)}
              >
  <Text style={ styles.closeButtonText }> Close </Text>
    </TouchableOpacity>
    </View>
    </TouchableOpacity>
    </Modal>

    </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 10
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Take available space
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '60%', // Adjusted width
    height: 45,
    justifyContent: 'center',
    marginRight: 8,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 45
  },
  totalEmployeesContainer: {
    alignItems: 'flex-end',
  },
  totalEmployeesLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalEmployeesCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  picker: {
    width: '100%',
  },
  topInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    // padding: 10,
    // elevation: 1,
  },
  topInputGroup: {
    flex: 1,
    marginRight: 10,
  },
  topLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500'
  },
  topInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  infoButton: {
    backgroundColor: '#1E73B8',
    borderRadius: 8,
    height: 44, // Match input height roughly
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'flex-end'
  },
  feedbackText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
  },
  successText: {
    color: COLORS.success,
  },
  submitButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  submitButton: {
    width: '100%',
  },
  sectionContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16, // Add horizontal margin to container
    borderRadius: 8,
    overflow: 'hidden', // Ensure content doesn't bleed out
  },
  activeSection: {
    backgroundColor: '#f6faff',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingRight: 16,
    // marginBottom: 8, // removed marginBottom, managed by collapsible content
  },
  dragHandle: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E73B8',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalLabel: {
    fontSize: 16,
    color: '#666'
  },
  modalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20
  },
  infoText: {
    color: '#1565c0',
    fontSize: 14,
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#666',
    fontWeight: '600'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { ProductAttendanceItem } from './ProductAttendanceItem';

export const CustomerAttendanceItem = ({ customer, isExpanded, onToggleExpansion, attendance, onProductStatusChange, onProductQuantityChange, onEdit, onAdd, isPastDate, flatNumber }) => {
  return (
    <View style= { styles.container } >
    <View style={ styles.header }>
      {/* Display only flat number (no chevron needed) */ }
      < View style = { styles.infoContainer } >
        <Text style={ styles.customerName }>
          { customer.address?.FlatNo || 'N/A' }
          </Text>
          </View>

          < TouchableOpacity onPress = { isPastDate? null: onEdit } style = { styles.editButton } disabled = { isPastDate } >
            <Feather name="edit-2" size = { 20} color = { isPastDate? COLORS.lightGrey : COLORS.text } />
              </TouchableOpacity>
              < TouchableOpacity onPress = { isPastDate? null: onAdd } style = { styles.addButton } disabled = { isPastDate } >
                <Feather name="plus-circle" size = { 20} color = { isPastDate? COLORS.lightGrey : COLORS.primary } />
                  </TouchableOpacity>
                  </View>
  {/* Products always shown inline when apartment is expanded */ }
  {
    isExpanded && (
      <View>
      {
        customer.requiredProduct.map((item) => (
          <ProductAttendanceItem
              key= { item.product._id }
              product = {{ ...item, quantity: attendance[item.product._id]?.quantity ?? item.quantity }}
              status = { attendance[item.product._id]?.status }
    onStatusChange = {(newStatus) => onProductStatusChange(item.product._id, newStatus)}
onQuantityChange = {(newQuantity) => onProductQuantityChange(item.product._id, newQuantity)}
isDisabled = { isPastDate }
  />
          ))}
</View>
      )}
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 15,
  },
  addButton: {
    marginLeft: 15,
  },
});


//Worked Perfectly before Drag Feature.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import DraggableFlatList, { ScaleDecorator, OpacityDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { apiService } from '../../services/apiService';
import { EditAttendanceBottomSheet } from './components/EditAttendanceModal';
import { AddExtraProductBottomSheet } from './components/AddExtraProductModal';
import { COLORS } from '../../constants/colors';
import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useAttendanceStore } from '../../store/attendanceStore';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Interfaces
interface Area {
  _id: string;
  name: string;
  totalSubscribedItems: number;
}

interface Product {
  product: { // Changed from productId to product to match existing usage
    _id: string;
    name: string;
    price?: number; // Price might be optional
  };
  quantity: number;
  status?: 'delivered' | 'not_delivered' | 'skipped' | 'out_of_stock'; // Status is often added later
  _id?: string; // For requiredProduct array items
}

interface Customer {
  _id: string;
  name: string;
  requiredProduct: Product[]; // Changed from products to requiredProduct to match existing usage
  submitted?: boolean;
}

interface AttendanceState {
  [customerId: string]: {
    [productId: string]: {
      status: string;
      quantity: number;
    };
  };
}

export const AddAttendance = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSections, setCustomerSections] = useState<{ title: string; data: Customer[] }[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [expandedSections, setExpandedSections] = useState<{ [apartment: string]: boolean }>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddExtraProductModalVisible, setIsAddExtraProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  // States for Reconciliation
  const [totalDispatched, setTotalDispatched] = useState<string>('');
  const [returnedExpression, setReturnedExpression] = useState<string>('');
  const [returnedQuantity, setReturnedQuantity] = useState(0);

  // --- Calculations ---

  // 1. Calculate Returned Quantity from Expression
  useEffect(() => {
    if (!returnedExpression) {
      setReturnedQuantity(0);
      return;
    }

    const parseExpression = (expr: string) => {
      if (!expr) return 0;
      try {
        const sanitized = expr.replace(/[^0-9+\-.]/g, ''); // Allow .
        if (!sanitized) return 0;
        const result = sanitized.split('+').reduce((acc, part) => {
          const subParts = part.split('-');
          let subSum = parseFloat(subParts[0] || '0');
          for (let i = 1; i < subParts.length; i++) {
            subSum -= parseFloat(subParts[i] || '0');
          }
          return acc + subSum;
        }, 0);
        return isNaN(result) ? 0 : result;
      } catch (e) {
        return 0;
      }
    };

    setReturnedQuantity(parseExpression(returnedExpression));
  }, [returnedExpression]);

  // 2. Calculate Total Given Quantity from Expression
  const totalGivenQuantity = useMemo(() => {
    const expr = totalDispatched;
    if (!expr) return 0;
    try {
      const sanitized = expr.replace(/[^0-9+\-.]/g, '');
      if (!sanitized) return 0;
      const result = sanitized.split('+').reduce((acc, part) => {
        const subParts = part.split('-');
        let subSum = parseFloat(subParts[0] || '0');
        for (let i = 1; i < subParts.length; i++) {
          subSum -= parseFloat(subParts[i] || '0');
        }
        return acc + subSum;
      }, 0);
      return isNaN(result) ? 0 : result;
    } catch (e) {
      return 0;
    }
  }, [totalDispatched]);

  // 3. Calculate Total Delivered
  const totalDelivered = useMemo(() => {
    let total = 0;
    Object.values(attendance).forEach(customerAttendance => {
      Object.values(customerAttendance).forEach((prod: any) => {
        if (prod.status === 'delivered') {
          total += (parseInt(prod.quantity, 10) || 0);
        }
      });
    });
    return total;
  }, [attendance]);

  const balance = (totalGivenQuantity + returnedQuantity) - totalDelivered;

  // --- Persistence Logic ---
  const { setDraft, getDraft, clearDraft } = useAttendanceStore();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Load Draft
  const loadDraft = useCallback(() => {
    if (!selectedDate || !selectedArea) return;

    const draft = getDraft(selectedDate, selectedArea);
    if (draft) {
      console.log('Loading draft for:', selectedDate, selectedArea);
      if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
      if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
      if (draft.attendance !== undefined && Object.keys(draft.attendance).length > 0) {
        setAttendance(draft.attendance);
      }
    }
    setIsDraftLoaded(true);
  }, [selectedDate, selectedArea, getDraft]);

  // Save Draft (Auto-save)
  useEffect(() => {
    if (!isDraftLoaded || !selectedDate || !selectedArea) return;

    // specific check to avoid saving empty state over draft if something weird happens
    // but relies on isDraftLoaded being true only after we attempted load.
    const timeoutId = setTimeout(() => {
      setDraft(selectedDate, selectedArea, {
        totalDispatched,
        returnedExpression,
        attendance
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [totalDispatched, returnedExpression, attendance, selectedDate, selectedArea, isDraftLoaded, setDraft]);

  // ✅ fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiService.get('/delivery/area');
        const fetchedAreas = response.data.data;
        if (fetchedAreas?.length > 0) {
          setAreas(fetchedAreas);
          setSelectedArea(fetchedAreas[0]._id);
          // ✅ Auto-fill total dispatched from first area
          if (fetchedAreas[0].totalSubscribedItems) {
            setTotalDispatched(String(fetchedAreas[0].totalSubscribedItems));
          }
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);


  // ✅ fetch customers for selected area - REFRESH ON FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!selectedArea) return;

      const fetchCustomers = async () => {
        try {
          const response = await apiService.get(`/customer/area/${selectedArea}`);
          const fetchedCustomers = response.data.data;
          if (!Array.isArray(fetchedCustomers)) {
            setCustomers([]);
            setAttendance({});
            return;
          }

          // ✅ Sort customers by Apartment, then by Flat Number
          const sortedCustomers = fetchedCustomers.sort((a, b) => {
            // Get apartment names (case-insensitive)
            const apartmentA = (a.address?.Apartment || '').toLowerCase();
            const apartmentB = (b.address?.Apartment || '').toLowerCase();

            // First, sort by apartment name
            if (apartmentA !== apartmentB) {
              return apartmentA.localeCompare(apartmentB);
            }

            // If same apartment, sort by flat number numerically
            const flatA = a.address?.FlatNo || '';
            const flatB = b.address?.FlatNo || '';

            // Extract numeric part from flat number (handles formats like "101", "A-101", "Flat 101")
            const numA = parseInt(flatA.replace(/\D/g, '')) || 0;
            const numB = parseInt(flatB.replace(/\D/g, '')) || 0;

            // Compare numbers first
            if (numA !== numB) {
              return numA - numB;
            }

            // If numbers are same, fall back to string comparison (for cases like "101A" vs "101B")
            return flatA.localeCompare(flatB);
          });

          setCustomers(sortedCustomers);

          // ✅ Group customers into sections by apartment
          const sections: { title: string; data: Customer[] }[] = [];
          let currentApartment = '';
          let currentSection: Customer[] = [];

          sortedCustomers.forEach((customer, index) => {
            const apartment = customer.address?.Apartment || 'No Apartment Info';
            if (apartment !== currentApartment) {
              if (currentSection.length > 0) sections.push({ title: currentApartment, data: currentSection });
              currentApartment = apartment;
              currentSection = [customer];
            } else {
              currentSection.push(customer);
            }
            if (index === sortedCustomers.length - 1) sections.push({ title: currentApartment, data: currentSection });
          });

          setCustomerSections(sections);

          // Initialize expanded sections
          const initialExpandedSections: { [apartment: string]: boolean } = {};
          sections.forEach(section => { initialExpandedSections[section.title] = true; });
          setExpandedSections(initialExpandedSections);

          // ------------------------------------------------------------------
          // Data Loading Priority: Draft -> Server (History) -> Defaults
          // ------------------------------------------------------------------

          // 1. Try Loading Draft
          const draft = getDraft(selectedDate, selectedArea);
          if (draft) {
            console.log('Using local draft for:', selectedDate);
            if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
            if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
            if (draft.attendance && Object.keys(draft.attendance).length > 0) {
              setAttendance(draft.attendance);
            } else {
              // Fallback to defaults if draft attendance is empty
              setAttendance(calculateDefaultAttendance(fetchedCustomers));
            }
            setIsDraftLoaded(true);
            return;
          }

          // 2. Fetch Server History (if no draft)
          try {
            const historyResponse = await apiService.get('/attendance', {
              date: selectedDate, areaId: selectedArea
            });
            const historyData = historyResponse.data.data; // Expecting array of records or single record

            // The API returns an array, we expect at most one record for (date, area, store)
            const existingRecord = Array.isArray(historyData) ? historyData[0] : historyData;

            if (existingRecord) {
              console.log('Found server history for:', selectedDate);
              // Populate from Server
              setTotalDispatched(String(existingRecord.totalDispatched || 0));
              setReturnedExpression(existingRecord.returnedItems?.expression || '');

              // Convert Server Attendance Array -> Map
              const serverAttendanceMap = {};
              if (Array.isArray(existingRecord.attendance)) {
                existingRecord.attendance.forEach((entry: any) => {
                  const cId = entry.customerId._id || entry.customerId; // Handle populated or unpopulated
                  serverAttendanceMap[cId] = {};
                  if (Array.isArray(entry.products)) {
                    entry.products.forEach((p: any) => {
                      const pId = p.productId._id || p.productId;
                      serverAttendanceMap[cId][pId] = {
                        quantity: p.quantity,
                        status: p.status
                      };
                    });
                  }
                });
              }

              // Merge with defaults to ensure missing customers are still present
              // (Server might only store those who had orders? or typically all?
              //  Safest is to start with defaults and override with server data)
              const defaultAtt = calculateDefaultAttendance(fetchedCustomers);
              const finalAttendance = { ...defaultAtt };

              // Overlay server data
              Object.keys(serverAttendanceMap).forEach(cId => {
                if (finalAttendance[cId]) {
                  finalAttendance[cId] = { ...finalAttendance[cId], ...serverAttendanceMap[cId] };
                } else {
                  // If customer exists in history but not in current list (maybe deleted?), optionally add them or ignore.
                  // For now, let's ignore to avoid crashes if they aren't in `customers` list.
                }
              });

              setAttendance(finalAttendance);
              setIsDraftLoaded(true);
              return;
            }
          } catch (historyError) {
            console.log('No history found or error fetching history:', historyError);
            // Verify 404 vs real error? Usually empty array just means no data.
          }

          // 3. Fallback to Defaults (New Day)
          console.log('No draft or history, using defaults.');
          setAttendance(calculateDefaultAttendance(fetchedCustomers));

          // Default Total Dispatched from Area
          const currentArea = areas.find(a => a._id === selectedArea);
          if (currentArea?.totalSubscribedItems) {
            setTotalDispatched(String(currentArea.totalSubscribedItems));
          } else {
            setTotalDispatched('0');
          }
          setReturnedExpression('');

          setIsDraftLoaded(true);


        } catch (error) {
          console.error('Error in data loading sequence:', error);
          setCustomers([]);
          setAttendance({});
          setIsDraftLoaded(true);
        }
      };

      // Helper to calculate defaults
      const calculateDefaultAttendance = (custs: Customer[]) => {
        const initial = {};
        custs.forEach(customer => {
          initial[customer._id] = {};
          if (Array.isArray(customer.requiredProduct)) {
            customer.requiredProduct.forEach(product => {
              if (product.product?._id) {
                initial[customer._id][product.product._id] = {
                  quantity: product.quantity,
                  status: 'delivered',
                };
              }
            });
          }
        });
        return initial;
      };

      // Reset draft loaded state when needs refresh
      setIsDraftLoaded(false);
      fetchCustomers();

    }, [selectedArea, areas, selectedDate, getDraft])
  );



  const onDateChanged = date => setSelectedDate(date);

  const toggleSectionExpansion = (apartment: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [apartment]: !prev[apartment],
    }));
  };

  const handleDragEnd = (apartmentTitle: string, reorderedData: Customer[]) => {
    // Update the section with new order
    setCustomerSections(prev =>
      prev.map(section =>
        section.title === apartmentTitle
          ? { ...section, data: reorderedData }
          : section
      )
    );
  };

  const handleProductStatusChange = (customerId, productId, newStatus) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          status: newStatus,
        },
      },
    }));
  };

  const handleProductQuantityChange = (customerId, productId, newQuantity) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          quantity: newQuantity, // Allow string input
        },
      },
    }));
  };

  const openEditModal = customer => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

  // ✅ New: open bottom sheet for Add Extra Product
  const openAddExtraProductModal = customer => {
    setSelectedCustomer(customer);
    setIsAddExtraProductModalVisible(true);
  };

  const closeAddExtraProductModal = () => {
    setIsAddExtraProductModalVisible(false);
    setSelectedCustomer(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer._id === customerId) {
          // Create a mutable copy of the products to work with
          let allProducts = [...editedRequiredProducts];

          // Handle the newly added products, which is an array
          if (Array.isArray(addedExtraProducts)) {
            addedExtraProducts.forEach(newProduct => {
              if (newProduct.quantity > 0) {
                // Normalize the new product to match the structure of existing ones
                const normalizedProduct = {
                  product: { _id: newProduct.productId, name: newProduct.name },
                  quantity: newProduct.quantity,
                };

                // Check if this product already exists in the list
                const existingIndex = allProducts.findIndex(
                  p => p.product._id === normalizedProduct.product._id
                );

                if (existingIndex !== -1) {
                  // If it exists, update the quantity
                  allProducts[existingIndex].quantity = normalizedProduct.quantity;
                } else {
                  // Otherwise, add it to the list
                  allProducts.push(normalizedProduct);
                }
              }
            });
          }

          // Update the attendance state for the customer
          const newAttendanceForCustomer = {};
          allProducts.forEach(p => {
            if (p.product && p.product._id) {
              newAttendanceForCustomer[p.product._id] = {
                quantity: p.quantity,
                status: p.status || 'delivered',
              };
            }
          });

          setAttendance(prev => ({
            ...prev,
            [customerId]: newAttendanceForCustomer,
          }));

          // Return the updated customer object
          return { ...customer, requiredProduct: allProducts };
        }
        return customer;
      })
    );

    // Close the modals
    closeEditModal();
    closeAddExtraProductModal();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    const today = new Date().toISOString().split('T')[0];

    if (selectedDate < today) {
      setFeedbackMessage('Cannot modify attendance for past dates.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const formattedAttendance = Object.keys(attendance)
      .map(customerId => ({
        customerId,
        products: Object.keys(attendance[customerId]).map(productId => ({
          productId,
          quantity: parseFloat(String(attendance[customerId][productId].quantity)) || 0,
          status: attendance[customerId][productId].status,
        })),
      }))
      .filter(c => c.products.length > 0);

    if (formattedAttendance.length === 0) {
      setFeedbackMessage('No attendance data to submit.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const payload = {
      date: selectedDate,
      areaId: selectedArea,
      attendance: formattedAttendance,
      totalDispatched: parseFloat(totalDispatched) || 0,
      returnedItems: {
        quantity: returnedQuantity,
        expression: returnedExpression
      }
    };

    if (balance !== 0) {
      Alert.alert(
        'Stock Mismatch',
        `The stock does not match!\n\nGiven: ${totalDispatched || 0}\nDelivered: ${totalDelivered}\nReturned: ${returnedQuantity}\n\nBalance: ${balance}\n\nPlease adjust the delivered quantities until the balance is 0.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    submitData(payload);
  };

  const submitData = async (payload) => {
    try {
      if (isEditModalVisible) closeEditModal();
      const response = await apiService.postWithConfig('/attendance', payload, {
        headers: { 'X-Suppress-Global-Error-Alert': true },
      });

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));

      // ✅ Clear draft on successful submit
      if (selectedDate && selectedArea) {
        clearDraft(selectedDate, selectedArea);
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Attendance submit error:', error);

      if (error.response?.status === 409) {
        setFeedbackMessage(error.response.data.message || 'Attendance already exists for this date.');
        setFeedbackMessageType('error');
        setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
      } else {
        setFeedbackMessage(
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred while submitting attendance.'
        );
        setFeedbackMessageType('error');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackMessageType(null);
      }, 5000);
    }
  };

  /* Placeholder for original submit logic to avoid errors */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _originalSubmit = async () => {
  };

  const renderCustomHeader = (date: any) => {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');

    return (
      <View style= { styles.header } >
      <View style={ styles.headerLeft }>
        <Feather name="calendar" size = { 24} color = "#1E73B8" />
          <Text style={ styles.monthText }> {`${month} ${year}`
  }</Text>
    </View>
    < View style = { styles.headerRight } >
      <TouchableOpacity onPress={ goToPreviousMonth }>
        <Feather name="chevron-left" size = { 24} color = "#1E73B8" />
          </TouchableOpacity>
          < TouchableOpacity onPress = { goToNextMonth } >
            <Feather name="chevron-right" size = { 24} color = "#1E73B8" />
              </TouchableOpacity>
              </View>
              </View>
    );
  };

const renderListHeader = () => (
  <>
  {/* Header */ }
  < View style = { styles.attendanceHeader } >
    <View style={ styles.dropdownContainer }>
      <Picker
            selectedValue={ selectedArea }
onValueChange = { setSelectedArea }
style = { styles.picker }
  >
{
  areas.map(area => (
    <Picker.Item key= { area._id } label = { area.name } value = { area._id } />
            ))
}
  </Picker>
  </View>
  < View style = { styles.totalEmployeesContainer } >
    <Text style={ styles.totalEmployeesLabel }> Total Customers </Text>
      < Text style = { styles.totalEmployeesCount } > { customers.length } </Text>
        </View>
        </View>

{/* Top Row Inputs (Given | Returns | Info) */ }
<View style={ styles.topInputRow }>
  <View style={ styles.topInputGroup }>
    <Text style={ styles.topLabel }> Total Given </Text>
      < TextInput
style = { [styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
value = { totalDispatched }
// onChangeText={setTotalDispatched} // Read-only from Store
editable = { false}
placeholder = "0"
placeholderTextColor = "#999"
  />
  </View>
  < View style = { [styles.topInputGroup, { flex: 1.5 }]} >
    <Text style={ styles.topLabel }> Adjustments(+/-)</Text >
      <TextInput
            style={ [styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
            value = { returnedExpression }
            // onChangeText={setReturnedExpression} // Read-only from Store
            editable = { false}
            placeholder = "e.g. +3 or -5"
            placeholderTextColor = "#999"
      />
      </View>
      < TouchableOpacity
          style = { styles.infoButton }
          onPress = {() => setIsSummaryModalVisible(true)}
        >
      <Feather name="info" size = { 20} color = "#fff" />
      </TouchableOpacity>
      </View>
      </>
    );

// Flatten data for DraggableFlatList
const flatData = useMemo(() => {
  const data: any[] = [];

  // Add Global Header (formerly ListHeaderComponent)
  data.push({
    type: 'global_header',
    key: 'global_header_inputs',
  });

  customerSections.forEach(section => {
    // Add Header
    data.push({
      type: 'header',
      key: `header-${section.title}`,
      title: section.title,
      data: section.data
    });

    // Add Customers (if expanded)
    if (expandedSections[section.title]) {
      section.data.forEach(customer => {
        data.push({
          type: 'customer',
          key: customer._id,
          data: customer,
          sectionTitle: section.title
        });
      });
    }
  });
  return data;
}, [customerSections, expandedSections]);

// Calculate sticky header indices
// logic remains same: only 'header' type sticks. 'global_header' does NOT stick.
const stickyHeaderIndices = useMemo(() => {
  return flatData
    .map((item, index) => (item.type === 'header' ? index : null))
    .filter(item => item !== null) as number[];
}, [flatData]);

const handleFlatListDragEnd = ({ data }: { data: any[] }) => {
  // Filter out global header before processing sections
  const listData = data.filter(item => item.type !== 'global_header');

  const newSectionsMap: { [key: string]: Customer[] } = {};
  const newSectionOrder: string[] = [];
  let currentSectionTitle = '';

  listData.forEach(item => {
    if (item.type === 'header') {
      currentSectionTitle = item.title;
      newSectionOrder.push(currentSectionTitle);
      newSectionsMap[currentSectionTitle] = [];
    } else if (item.type === 'customer' && currentSectionTitle) {
      newSectionsMap[currentSectionTitle].push(item.data);
    }
  });

  const newSections = newSectionOrder.map(title => ({
    title,
    data: newSectionsMap[title]
  }));

  setCustomerSections(newSections);
};

return (
  <GestureHandlerRootView style= {{ flex: 1 }}>
    <View style={ styles.container }>
      { feedbackMessage && (
        <View
            style={
  [
    styles.feedbackContainer,
    feedbackMessageType === 'success'
      ? styles.successBackground
      : styles.errorBackground,
  ]
}
          >
  <Text style={ styles.feedbackText }> { feedbackMessage } </Text>
    </View>
        )}

{/* Calendar + List */ }
<CalendarProvider date={ selectedDate } onDateChanged = { onDateChanged } >
  <ExpandableCalendar
            renderHeader={ renderCustomHeader }
hideArrows
markedDates = {{
  [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
              ...Object.keys(agendaItems).reduce((acc, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {}),
            }}
theme = {{
  selectedDayBackgroundColor: COLORS.primary,
    todayTextColor: COLORS.primary,
      arrowColor: COLORS.primary,
            }}
          />

  < DraggableFlatList
data = { flatData }
onDragEnd = { handleFlatListDragEnd }
keyExtractor = {(item) => item.key}
stickyHeaderIndices = { stickyHeaderIndices }
// ListHeaderComponent={renderListHeader} // REMOVED
contentContainerStyle = { styles.listContentContainer }
renderItem = {({ item, drag, isActive }) => {
  if (item.type === 'global_header') {
    return renderListHeader();
  }
  if (item.type === 'header') {
    return (
      <TouchableOpacity
                    style= { styles.sectionHeader }
    onPress = {() => toggleSectionExpansion(item.title)
  }
  disabled = { isActive }
    >
    <Feather
                      name={ expandedSections[item.title] ? 'chevron-down' : 'chevron-right' }
  size = { 24}
  color = { COLORS.primary }
    />
    <Text style={ styles.sectionHeaderText }> { item.title.toUpperCase() } </Text>
      </TouchableOpacity>
                );
}

return (
  <ScaleDecorator>
  <OpacityDecorator activeOpacity= { 0.8} >
  <View style={
    [
      styles.customerRow,
      isActive && { backgroundColor: '#f0f0f0', elevation: 5 }
    ]
}>
  <TouchableOpacity
                        onLongPress={ drag }
style = { styles.dragHandle }
disabled = { isActive }
  >
  <Feather name="menu" size = { 20} color = { COLORS.text } />
    </TouchableOpacity>
    < View style = {{ flex: 1 }}>
      <CustomerAttendanceItem
                          customer={ item.data }
isExpanded = { true}
onToggleExpansion = { null}
attendance = { attendance[item.data._id] || {} }
onProductStatusChange = {(productId, newStatus) =>
handleProductStatusChange(item.data._id, productId, newStatus)
                          }
onProductQuantityChange = {(productId, newQuantity) =>
handleProductQuantityChange(item.data._id, productId, newQuantity)
                          }
onEdit = {() => openEditModal(item.data)}
onAdd = {() => openAddExtraProductModal(item.data)}
isPastDate = { selectedDate< new Date().toISOString().split('T')[0] }
flatNumber = { item.data.address?.FlatNo }
  />
  </View>
  </View>
  </OpacityDecorator>
  </ScaleDecorator>
              );
            }}
ListEmptyComponent = {
  areas.length === 0 ? (
    <EmptyState
                  icon= "📍"
                  title="No Delivery Areas Found"
                  description="You haven't created any delivery areas yet. Please create an area first to start managing attendance."
                  actionLabel="Create Area"
                  onAction={() => navigation.navigate('AreaList')
}
  />
              ) : (
  <EmptyState
                  icon= "👥"
title = "No Customers in This Area"
description = "There are no customers subscribed in the selected area yet. Add customers with delivery subscriptions to start managing their daily attendance."
actionLabel = "Go to Customers"
onAction = {() => navigation.navigate('CustomerList')}
                />
              )
            }
          />

{
  customers.length > 0 && (
    <View style={ styles.fixedFooter }>
      { balance !== 0 && (
        <Text style={
          {
            color: 'red',
              textAlign: 'center',
                marginBottom: 8,
                  fontWeight: 'bold'
          }
  }>
    Balance({ balance }) must be 0 to submit.
                </Text>
              )
}
<Button
                title={ isLoading ? 'Submitting...' : 'Submit Attendance' }
onPress = { handleSubmit }
loading = { isLoading }
disabled = { isLoading || balance !== 0}
style = {{ opacity: (isLoading || balance !== 0) ? 0.5 : 1 }}
              />
  </View>
          )}



</CalendarProvider>

{/* ✅ Summary Modal - Moved to Root */ }
<Modal
          animationType="slide"
transparent = { true}
visible = { isSummaryModalVisible }
onRequestClose = {() => setIsSummaryModalVisible(false)}
        >
  <View style={ styles.modalOverlay }>
    <View style={ styles.modalContent }>
      <Text style={ styles.modalTitle }> Stock Reconciliation </Text>

        < View style = { styles.summaryRow } >
          <Text style={ styles.summaryText }> Total Given: </Text>
            < Text style = { styles.summaryValue } > { totalDispatched || 0}</Text>
              </View>
              < View style = { styles.summaryRow } >
                <Text style={ styles.summaryText }> (+/-) Adjustments:</Text >
                  <Text style={ styles.summaryValue }> { returnedQuantity >= 0 ? '+' : ''}{ returnedQuantity } </Text>
                    </View>
                    < View style = { [styles.summaryRow, styles.balanceRow]} >
                      <Text style={ [styles.summaryText, styles.balanceText] }>= Actual Given: </Text>
                        < Text style = { [styles.summaryValue, styles.balanceValue]} >
                          { totalGivenQuantity + returnedQuantity}
</Text>
  </View>
  < View style = { styles.summaryRow } >
    <Text style={ styles.summaryText }> (-) Delivered: </Text>
      < Text style = { styles.summaryValue } > { totalDelivered } </Text>
        </View>
        < View style = { [styles.summaryRow, styles.balanceRow]} >
          <Text style={ [styles.summaryText, styles.balanceText] }> (=) Balance: </Text>
            < Text style = { [styles.summaryValue, styles.balanceValue, { color: balance === 0 ? COLORS.success : COLORS.error }]} >
              { balance }
              </Text>
              </View>

              < TouchableOpacity
style = { styles.closeButton }
onPress = {() => setIsSummaryModalVisible(false)}
              >
  <Text style={ styles.closeButtonText }> Close </Text>
    </TouchableOpacity>
    </View>
    </View>
    </Modal>

{/* Edit modal - Moved to Root */ }
<EditAttendanceBottomSheet
          isVisible={ isEditModalVisible }
customer = { selectedCustomer }
currentAttendance = { attendance[selectedCustomer?._id] || {} }
onClose = { closeEditModal }
onSave = { handleSaveAttendance }
  />

  {/* ✅ Add Extra Product Bottom Sheet - Moved to Root */ }
{
  isAddExtraProductModalVisible && (
    <AddExtraProductBottomSheet
              isVisible={ isAddExtraProductModalVisible }
  customer = { selectedCustomer }
  currentAttendance = { attendance[selectedCustomer?._id] || {} }
  onClose = { closeAddExtraProductModal }
  onAddProducts = {(addedProducts) =>
  handleSaveAttendance(selectedCustomer._id, selectedCustomer.requiredProduct || [], addedProducts)
}
            />
          )
        }
</View >
  </GestureHandlerRootView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for fixed footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  monthText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  totalEmployeesContainer: { alignItems: 'flex-end' },
  totalEmployeesLabel: { fontSize: 12, color: '#666666' },
  totalEmployeesCount: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  dropdownContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  feedbackContainer: {
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  successBackground: { backgroundColor: COLORS.success },
  errorBackground: { backgroundColor: COLORS.error },
  feedbackText: { color: COLORS.white, fontWeight: 'bold' },

  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  topInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 5,
    marginBottom: 5,
  },
  topInputGroup: {
    flex: 1,
  },
  topLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  topInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    height: 40,
  },
  infoButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20, // Add some bottom padding for safe area
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10, // Shadow for Android
    zIndex: 100,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  balanceRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  balanceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  balanceValue: { fontSize: 16, fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  dragHandle: {
    padding: 10,
    paddingRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggingItem: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: COLORS.white,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});