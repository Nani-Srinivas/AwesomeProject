// src/screens/Bills/ReceivePaymentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

export const ReceivePaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerId } = route.params as { customerId: string };

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [amount, setAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  // ... existing code ...

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      // Fetch customer details
      const customerResponse = await apiService.get(`/customer/${customerId}`);
      const customerData = customerResponse.data.data;
      
      // Fetch customer's payment status (real-time calculated)
      const paymentStatusResponse = await apiService.get(`/payment/status/${customerId}`);
      const paymentStatusData = paymentStatusResponse.data.data;
      
      // Fetch customer's invoices to show what they're paying for
      const invoicesResponse = await apiService.get(`/invoice/customer/${customerId}`);
      const invoicesData = invoicesResponse.data.invoices || [];
      
      // Filter unpaid invoices to show what can be paid
      const unpaidInvoices = invoicesData.filter(invoice => 
        invoice.status !== 'Paid' && parseFloat(invoice.dueAmount) > 0
      );
      
      // If there's only one unpaid invoice, auto-select it for payment
      if (unpaidInvoices.length === 1) {
        setSelectedInvoiceId(unpaidInvoices[0]._id);
      }
      
      // Combine customer, payment status and invoice data
      const combinedData = {
        ...customerData,
        ...paymentStatusData,
        unpaidInvoices
      };
      setCustomer(combinedData);
      
      // Initialize amount with current due amount for full payment
      setAmount(combinedData.currentDueAmount.toString());
    } catch (err: any) {
      console.error('Failed to fetch customer:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // For partial payments, check if amount exceeds current due
    if (isPartialPayment && parseFloat(amount) > (customer?.currentDueAmount || 0)) {
      Alert.alert('Error', `Amount exceeds current due amount of ₹${customer?.currentDueAmount}`);
      return;
    }
    
    // For full payment, amount should match the current due (with small tolerance for rounding)
    if (!isPartialPayment) {
      const requestedAmount = parseFloat(customer?.currentDueAmount || 0);
      const enteredAmount = parseFloat(amount);
      const tolerance = 0.01; // Small tolerance for floating-point comparison
      
      if (Math.abs(enteredAmount - requestedAmount) > tolerance) {
        Alert.alert('Error', `Full payment amount should be exactly ₹${requestedAmount}`);
        return;
      }
    }
    
    // Prepare payment allocations based on selection
    let paymentPayload: any = {
      customerId,
      amount: parseFloat(amount),
      paymentMethod,
      notes: notes || undefined
    };

    // If user has selected a specific invoice to pay
    if (selectedInvoiceId) {
      paymentPayload.invoiceId = selectedInvoiceId;
    } else if (customer?.unpaidInvoices && customer.unpaidInvoices.length === 1) {
      // If only one unpaid invoice, allocate to that invoice
      paymentPayload.invoiceId = customer.unpaidInvoices[0]._id;
    }
    // If no selection is made and multiple invoices exist, payment will be applied to oldest invoices

    if (transactionId) {
      paymentPayload.transactionId = transactionId;
    }

    try {
      setSubmitting(true);
      
      const response = await apiService.post('/payment/receive', paymentPayload);

      Alert.alert('Success', 'Payment recorded successfully!');
      
      // Navigate back to customer details or payment status
      navigation.goBack();
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = ['Cash', 'Online', 'Card', 'UPI', 'Net Banking', 'Pay Later'];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading customer details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Record Payment</Text>
        <Text style={styles.customerName}>{customer?.name}</Text>
        <Text style={styles.customerPhone}>{customer?.phone}</Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Current Payment Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Total Payable:</Text>
          <Text style={styles.statusValue}>₹{customer?.totalAmountPayable || 0}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Amount Paid:</Text>
          <Text style={styles.statusValue}>₹{customer?.totalAmountPaid || 0}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Current Due:</Text>
          <Text style={[styles.statusValue, { color: COLORS.error }]}>
            ₹{customer?.currentDueAmount || 0}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Unpaid Invoices:</Text>
          <Text style={styles.statusValue}>{customer?.unpaidInvoices?.length || 0}</Text>
        </View>
        
        <View style={[styles.statusRow, { borderBottomWidth: 0, paddingTop: 10 }]}>
          <Text style={styles.statusText}>Credit Balance:</Text>
          <Text style={[styles.statusValue, { color: '#4CAF50' }]}>₹{customer?.creditBalance || 0}</Text>
        </View>
      </View>
      
      {/* Show unpaid invoices list */}
      {customer?.unpaidInvoices && customer.unpaidInvoices.length > 0 && (
        <>
          {customer.unpaidInvoices.length > 1 ? (
            <View style={styles.invoicesCard}>
              <Text style={styles.sectionTitle}>Select Invoice to Pay</Text>
              {customer.unpaidInvoices.map((invoice: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.invoiceRow,
                    selectedInvoiceId === invoice._id && styles.selectedInvoiceRow
                  ]}
                  onPress={() => setSelectedInvoiceId(invoice._id)}
                >
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoicePeriod}>{invoice.period}</Text>
                    <Text style={styles.invoiceBillNo}>{invoice.billNo}</Text>
                  </View>
                  <Text style={styles.invoiceAmount}>₹{invoice.dueAmount}</Text>
                  {selectedInvoiceId === invoice._id && (
                    <Feather name="check" size={20} color={COLORS.primary} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.invoicesCard}>
              <Text style={styles.sectionTitle}>Invoice to be Paid</Text>
              {customer.unpaidInvoices.map((invoice: any, index: number) => (
                <View key={index} style={styles.invoiceRow}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoicePeriod}>{invoice.period}</Text>
                    <Text style={styles.invoiceBillNo}>{invoice.billNo}</Text>
                  </View>
                  <Text style={styles.invoiceAmount}>₹{invoice.dueAmount}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={styles.paymentForm}>
        <Text style={styles.sectionTitle}>Payment Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.methodSelector}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodButton,
                  paymentMethod === method && styles.methodButtonSelected
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={[
                  styles.methodButtonText,
                  paymentMethod === method && styles.methodButtonTextSelected
                ]}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Type</Text>
          <View style={styles.paymentTypeSelector}>
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                !isPartialPayment && styles.paymentTypeButtonSelected
              ]}
              onPress={() => {
                setIsPartialPayment(false);
                setAmount(customer?.currentDueAmount.toString() || '0');
              }}
            >
              <View style={[
                styles.radioButton,
                !isPartialPayment && styles.radioButtonSelected
              ]}>
                {!isPartialPayment && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.paymentTypeText}>Full Payment (₹{customer?.currentDueAmount || 0})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                isPartialPayment && styles.paymentTypeButtonSelected
              ]}
              onPress={() => setIsPartialPayment(true)}
            >
              <View style={[
                styles.radioButton,
                isPartialPayment && styles.radioButtonSelected
              ]}>
                {isPartialPayment && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.paymentTypeText}>Partial Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {isPartialPayment && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter payment amount"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        )}
        
        {!isPartialPayment && (
          <View style={styles.fullPaymentContainer}>
            <Text style={styles.fullPaymentAmount}>₹{customer?.currentDueAmount || 0}</Text>
          </View>
        )}

        {paymentMethod !== 'Cash' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transaction ID</Text>
            <TextInput
              style={styles.input}
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Enter transaction ID"
              placeholderTextColor="#999"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about the payment"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
          onPress={handleRecordPayment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Feather name="save" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Record Payment</Text>
            </>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: COLORS.accent,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentTypeSelector: {
    flexDirection: 'column',
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  paymentTypeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  paymentTypeText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  fullPaymentContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  fullPaymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  invoicesCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoicePeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  invoiceBillNo: {
    fontSize: 12,
    color: COLORS.accent,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },
  selectedInvoiceRow: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  paymentForm: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  methodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  methodButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  methodButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  methodButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  methodButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});