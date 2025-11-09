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
      const receiptResponse = await apiService.get(`/inventory/receipts?vendorId=${vendorId}`);
      if (receiptResponse.data.success) {
        // Only include receipts that are not fully paid
        const outstandingReceipts = receiptResponse.data.data.filter(
          (receipt: any) => receipt.paymentStatus !== 'paid'
        );
        setOutstandingReceipts(outstandingReceipts);
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