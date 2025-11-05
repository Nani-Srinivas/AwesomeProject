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

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/customer/${customerId}`);
      setCustomer(response.data.data);
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

    if (parseFloat(amount) > (customer?.currentDueAmount || 0)) {
      Alert.alert('Error', `Amount exceeds current due amount of ₹${customer?.currentDueAmount}`);
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await apiService.post('/payment/receive', {
        customerId,
        amount: parseFloat(amount),
        paymentMethod,
        transactionId: transactionId || undefined,
        notes: notes || undefined
      });

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
        
        <View style={[styles.statusRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.statusText}>Current Due:</Text>
          <Text style={[styles.statusValue, { color: COLORS.error }]}>
            ₹{customer?.currentDueAmount || 0}
          </Text>
        </View>
      </View>

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
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter payment amount"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

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