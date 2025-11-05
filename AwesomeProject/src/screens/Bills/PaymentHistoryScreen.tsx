// src/screens/Bills/PaymentHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

interface Payment {
  _id: string;
  customerId: {
    name: string;
    phone: string;
  };
  invoiceId: {
    billNo: string;
    period: string;
    grandTotal: string;
  };
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export const PaymentHistoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerId } = route.params as { customerId: string };

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [customerId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/payment/history/${customerId}`);
      setPayments(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err);
      setError(err.response?.data?.message || 'Failed to load payment history');
      Alert.alert('Error', err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'Pending':
        return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      case 'Failed':
        return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      case 'Refunded':
        return { color: '#9C27B0', backgroundColor: 'rgba(156, 39, 176, 0.1)' };
      default:
        return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'dollar-sign';
      case 'Card':
        return 'credit-card';
      case 'UPI':
        return 'smartphone';
      case 'Online':
        return 'globe';
      case 'Net Banking':
        return 'server';
      case 'Pay Later':
        return 'clock';
      default:
        return 'credit-card';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  if (error && !payments.length) {
    return (
      <View style={styles.centered}>
        <Feather name="x-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentHistory}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentAmount}>₹{item.amount}</Text>
          <Text style={styles.paymentBillNo}>{item.invoiceId?.billNo || 'N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(item.paymentStatus).backgroundColor }]}>
          <Text style={[styles.statusText, { color: getStatusStyle(item.paymentStatus).color }]}>
            {item.paymentStatus}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Feather name={getPaymentMethodIcon(item.paymentMethod)} size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.paymentMethod}</Text>
        </View>

        {item.transactionId && (
          <View style={styles.detailRow}>
            <Feather name="hash" size={16} color={COLORS.accent} />
            <Text style={styles.detailText}>{item.transactionId}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color={COLORS.accent} />
          <Text style={styles.detailText}>
            {new Date(item.paymentDate).toLocaleDateString()}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.detailRow}>
            <Feather name="info" size={16} color={COLORS.accent} />
            <Text style={styles.detailText} numberOfLines={1}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment History</Text>
        <Text style={styles.subHeaderText}>Customer: {customerId}</Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="credit-card" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No payment history found</Text>
            <Text style={styles.emptySubtext}>Payments will appear here once received</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 14,
    color: COLORS.accent,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  paymentBillNo: {
    fontSize: 14,
    color: COLORS.accent,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});