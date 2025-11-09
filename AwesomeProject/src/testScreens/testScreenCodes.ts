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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading vendor details...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.errorContainer}>
        <Text>Vendor not found</Text>
        <TouchableOpacity onPress={loadVendorDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Vendor Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.vendorId}>ID: {vendor._id}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: 
              vendor.status === 'active' ? 'rgba(76, 175, 80, 0.1)' :
              vendor.status === 'inactive' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
          }]}>
            <Text style={[styles.statusText, {
              color: 
                vendor.status === 'active' ? COLORS.success :
                vendor.status === 'inactive' ? COLORS.warning : COLORS.error
            }]}>
              {vendor.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Payable Amount Card */}
      <View style={styles.payableCard}>
        <View style={styles.payableInfo}>
          <Text style={styles.payableLabel}>Current Payable</Text>
          <Text style={styles.payableAmount}>₹{vendor.payableAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={[styles.paymentStatusBadge, { 
          backgroundColor: 
            vendor.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
            vendor.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }]}>
          <Text style={[styles.statusText, {
            color: 
              vendor.paymentStatus === 'paid' ? COLORS.success :
              vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
          }]}>
            {vendor.paymentStatus?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleMakePayment}>
          <Feather name="dollar-sign" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Make Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={handleEditVendor}
        >
          <Feather name="edit" size={20} color={COLORS.primary} />
          <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Edit Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Vendor Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{vendor.phone}</Text>
        </View>
        {vendor.email && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{vendor.email}</Text>
          </View>
        )}
        {vendor.address && (
          <>
            <Text style={styles.detailLabel}>Address</Text>
            {vendor.address.street && <Text style={styles.detailValue}>{vendor.address.street}</Text>}
            <Text style={styles.detailValue}>
              {vendor.address.city}, {vendor.address.state} {vendor.address.zip}
            </Text>
            {vendor.address.country && <Text style={styles.detailValue}>{vendor.address.country}</Text>}
          </>
        )}
        {vendor.contactPerson && (
          <>
            <Text style={styles.detailLabel}>Contact Person</Text>
            {vendor.contactPerson.name && <Text style={styles.detailValue}>{vendor.contactPerson.name}</Text>}
            {vendor.contactPerson.phone && <Text style={styles.detailValue}>{vendor.contactPerson.phone}</Text>}
            {vendor.contactPerson.email && <Text style={styles.detailValue}>{vendor.contactPerson.email}</Text>}
          </>
        )}
      </View>

      {/* Assigned Categories */}
      {vendor.assignedCategories && vendor.assignedCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Categories</Text>
          {vendor.assignedCategories.map((categoryId, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category {index + 1}</Text>
              <Text style={styles.detailValue}>{categoryId.toString()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Inventory Receipts */}
      {inventoryReceipts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Inventory Receipts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {inventoryReceipts.slice(0, 3).map((receipt) => (
            <View key={receipt._id} style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
                <Text style={styles.receiptDate}>{new Date(receipt.receivedDate).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.receiptTotal}>Total: ₹{receipt.totalAmount?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.receiptStatus}>
                Payment: {receipt.paymentStatus?.toUpperCase()} (Paid: ₹{receipt.amountPaid?.toFixed(2) || '0.00'})
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {payments.slice(0, 3).map((payment) => (
            <View key={payment._id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentAmount}>₹{payment.amount.toFixed(2)}</Text>
                <Text style={styles.paymentDate}>{new Date(payment.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.paymentMethod}>Method: {payment.method}</Text>
              {payment.transactionId && (
                <Text style={styles.paymentId}>Transaction: {payment.transactionId}</Text>
              )}
              {payment.notes && (
                <Text style={styles.paymentNotes}>Note: {payment.notes}</Text>
              )}
            </View>
          ))}
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading vendor payment details...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.errorContainer}>
        <Text>Vendor not found</Text>
        <TouchableOpacity onPress={loadVendorAndOutstandingReceipts}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <Text style={styles.vendorId}>ID: {vendor._id}</Text>
        <Text style={styles.vendorContact}>Contact: {vendor.phone}</Text>
      </View>

      {/* Current Payable Amount */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Current Payable Amount</Text>
        <Text style={styles.payableAmount}>₹{vendor.payableAmount?.toFixed(2) || '0.00'}</Text>
        <View style={[styles.paymentStatusBadge, { 
          backgroundColor: 
            vendor.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' : 
            vendor.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }]}>
          <Text style={[styles.statusText, {
            color: 
              vendor.paymentStatus === 'paid' ? COLORS.success : 
              vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
          }]}>
            {vendor.paymentStatus?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Outstanding Receipts */}
      {outstandingReceipts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outstanding Receipts</Text>
          {outstandingReceipts.map((receipt) => (
            <View key={receipt._id} style={styles.outstandingReceiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
                <Text style={styles.receiptDate}>{new Date(receipt.receivedDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.receiptDetails}>
                <Text style={styles.receiptDetail}>Total: ₹{receipt.totalAmount?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.receiptDetail}>Paid: ₹{receipt.amountPaid?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.receiptDetail}>Due: ₹{(receipt.totalAmount - receipt.amountPaid).toFixed(2)}</Text>
              </View>
              <View style={[styles.receiptStatus, { 
                backgroundColor: 
                  receipt.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' : 
                  receipt.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
              }]}>
                <Text style={[styles.receiptStatusText, {
                  color: 
                    receipt.paymentStatus === 'paid' ? COLORS.success : 
                    receipt.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
                }]}>
                  {receipt.paymentStatus?.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Payment Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Payment</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Amount *</Text>
          <TextInput
            style={styles.input}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="Enter payment amount"
            keyboardType="decimal-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            {['cash', 'bank_transfer', 'digital', 'cheque'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[styles.paymentMethodOption, paymentMethod === method && styles.paymentMethodOptionSelected]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={[styles.paymentMethodText, paymentMethod === method && styles.paymentMethodTextSelected]}>
                  {method.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {['bank_transfer', 'digital', 'cheque'].includes(paymentMethod) && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transaction ID *</Text>
            <TextInput
              style={styles.input}
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Enter transaction ID"
            />
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes (optional)"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handlePaymentSubmit}
          disabled={isProcessing}
        >
          <Feather name="check-circle" size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>
            {isProcessing ? 'Processing Payment...' : 'Record Payment'}
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="calendar" size={24} color="#1E73B8" />
          <Text style={styles.monthText}>{`${month} ${year}`}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Feather name="chevron-left" size={24} color="#1E73B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Feather name="chevron-right" size={24} color="#1E73B8" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
        <ExpandableCalendar
          renderHeader={renderCustomHeader}
          hideArrows={true}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
            ...Object.keys(agendaItems).reduce((acc, date) => {
              acc[date] = { marked: true };
              return acc;
            }, {}),
          }}
        />
        <ScrollView style={styles.scrollContent}>
          <View style={styles.agendaContainer}>
            <Text style={styles.agendaTitle}>Agenda for {selectedDate}</Text>
            {agendaItems[selectedDate] ? (
              agendaItems[selectedDate].map((item, index) => (
                <View key={index} style={styles.agendaItem}>
                  <Text style={styles.agendaTime}>{item.time}</Text>
                  <Text style={styles.agendaItemTitle}>{item.title}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No items for this day</Text>
            )}
          </View>

          {/* Payment Receipt Section */}
          <View style={styles.paymentReceiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.brandNameHeader}>{paymentData.brandName}</Text>
              <View style={styles.paymentStatusBadge}>
                <Text style={[styles.statusText, paymentData.isPaid ? styles.paidText : styles.dueText]}>
                  {paymentData.isPaid ? '1st Payment Due' : '1st Not Paid'}
                </Text>
              </View>
            </View>

            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date</Text>
                <Text style={styles.receiptValue}>{paymentData.date}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Ref</Text>
                <Text style={styles.receiptValue}>{paymentData.paymentRef}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount</Text>
                <Text style={styles.receiptValue}>₹ {paymentData.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Due</Text>
                <Text style={styles.receiptValue}>₹ {paymentData.due}</Text>
              </View>

              <View style={styles.divider} />

              {/* Subcategories Section */}
              {paymentData.subcategories.map((subcategory, index) => (
                <View key={index} style={styles.subcategorySection}>
                  <Text style={styles.subcategoryTitle}>{subcategory.name} (subcategory)</Text>
                  {subcategory.products.map((product, prodIndex) => (
                    <View key={prodIndex} style={styles.productRow}>
                      <Text style={styles.productName}>Product</Text>
                      <Text style={styles.productStatus}>{product.status}</Text>
                    </View>
                  ))}
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