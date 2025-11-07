// src/screens/Bills/PaymentStatusScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

interface PaymentStatus {
  customerId: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: string;
  currentDueAmount: number;
  totalAmountPayable: number;
  totalAmountPaid: number;
  lastPaymentDate?: string;
  paymentCycle: string;
  lastBillPeriod?: string;
}

export const PaymentStatusScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerId } = route.params as { customerId: string };

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchPaymentStatus();
  }, [customerId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/payment/status/${customerId}`);
      setPaymentStatus(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch payment status:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load payment status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentStatus();
  };

  const handleRecordPayment = () => {
    navigation.navigate('ReceivePayment', { customerId: customerId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return '#4CAF50';
      case 'Unpaid':
        return '#F44336';
      case 'Partially Paid':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment status...</Text>
      </View>
    );
  }

  if (!paymentStatus) {
    return (
      <View style={styles.centered}>
        <Feather name="x-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>No payment status found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Status</Text>
        <Text style={styles.customerName}>{paymentStatus.customerName}</Text>
        <Text style={styles.customerPhone}>{paymentStatus.customerPhone}</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment Status</Text>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(paymentStatus.paymentStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(paymentStatus.paymentStatus) }]}>
              {paymentStatus.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current Due Amount</Text>
          <Text style={[styles.amountText, { color: paymentStatus.currentDueAmount > 0 ? COLORS.error : COLORS.primary }]}>
            ₹{paymentStatus.currentDueAmount}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Total Amount Payable</Text>
          <Text style={styles.amountText}>₹{paymentStatus.totalAmountPayable}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Total Amount Paid</Text>
          <Text style={styles.amountText}>₹{paymentStatus.totalAmountPaid}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment Cycle</Text>
          <Text style={styles.valueText}>{paymentStatus.paymentCycle}</Text>
        </View>

        {paymentStatus.lastBillPeriod && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Bill Period</Text>
            <Text style={styles.valueText}>{paymentStatus.lastBillPeriod}</Text>
          </View>
        )}

        {paymentStatus.lastPaymentDate && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Payment Date</Text>
            <Text style={styles.valueText}>
              {new Date(paymentStatus.lastPaymentDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.receivePaymentButton]} 
          onPress={handleRecordPayment}
        >
          <Feather name="plus" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Record Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.historyButton]} 
          onPress={() => navigation.navigate('InvoiceHistory', { customerId })}
        >
          <Feather name="clock" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Invoice History</Text>
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
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
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
  statusCard: {
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.accent,
    flex: 1,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  valueText: {
    fontSize: 14,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 130,
  },
  receivePaymentButton: {
    backgroundColor: '#4CAF50',
  },
  historyButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});