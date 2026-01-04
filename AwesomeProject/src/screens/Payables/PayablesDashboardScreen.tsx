import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type PayablesDashboardScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'PayablesDashboard'>;

interface VendorPayable {
  _id: string;
  name: string;
  phone: string;
  totalDue: number;
  lastDeliveryDate: string;
  daysOverdue: number; // Placeholder
  status: 'paid' | 'pending' | 'overdue';
  receipts: any[]; // Now we will populate this
}

const PayablesDashboardScreen = () => {
  const navigation = useNavigation<PayablesDashboardScreenNavigationProp>();
  const [vendors, setVendors] = useState<VendorPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadVendorPayables();
  }, []);

  const loadVendorPayables = async () => {
    try {
      setLoading(true);

      const [vendorsResponse, receiptsResponse] = await Promise.all([
        apiService.get('/vendors'),
        apiService.get('/inventory/receipts')
      ]);

      if (vendorsResponse.data.success && receiptsResponse.data.success) {
        const allVendors = vendorsResponse.data.data;
        const allReceipts = receiptsResponse.data.data;

        // Group pending receipts by vendor
        const vendorMap = new Map();

        allReceipts.forEach((receipt: any) => {
          // We want all pending bills regardless of date
          const isPending = receipt.paymentStatus !== 'paid';
          // Also include if amountPaid < totalAmount just to be sure, though status should cover it
          const dueAmount = (receipt.totalAmount || 0) - (receipt.amountPaid || 0);

          if (isPending && dueAmount > 0) {
            const vendorId = receipt.vendorId?._id || receipt.vendorId;
            if (!vendorId) return;

            if (!vendorMap.has(vendorId)) {
              vendorMap.set(vendorId, []);
            }
            vendorMap.get(vendorId).push(receipt);
          }
        });

        // Current Payables logic: Only show vendors with pending amount
        const transformedVendors = allVendors
          .map((vendor: any) => {
            const pendingReceipts = vendorMap.get(vendor._id) || [];
            // Sort receipts by date (oldest first? or newest?) User usually wants to see oldest pending first?
            // Let's sort oldest first for "days overdue" context
            pendingReceipts.sort((a: any, b: any) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime());

            const totalDue = pendingReceipts.reduce((sum: number, r: any) => sum + (r.totalAmount - (r.amountPaid || 0)), 0);

            let lastDeliveryDate = '-';
            if (pendingReceipts.length > 0) {
              lastDeliveryDate = new Date(pendingReceipts[pendingReceipts.length - 1].receivedDate).toLocaleDateString();
            } else if (vendor.updatedAt) {
              lastDeliveryDate = new Date(vendor.updatedAt).toLocaleDateString();
            }

            return {
              _id: vendor._id,
              name: vendor.name,
              phone: vendor.phone,
              totalDue: totalDue, // Calculated from actual pending receipts
              lastDeliveryDate: lastDeliveryDate,
              daysOverdue: 0, // Logic for this can be added later
              status: totalDue > 0 ? 'pending' : 'paid',
              receipts: pendingReceipts
            };
          })
          .filter((v: any) => v.totalDue > 0) // Only filter those with dues? Or show all? User said "see all pending...". Usually Payables screen shows who you OWE.
          .sort((a: any, b: any) => b.totalDue - a.totalDue); // Sort by highest due

        setVendors(transformedVendors);
      }
    } catch (error) {
      console.error('Error loading vendor payables:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendorPayables();
    setRefreshing(false);
  };

  const toggleExpand = (vendorId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedVendors(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
  };

  const getVendorStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { color: COLORS.success, backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'overdue': return { color: COLORS.error, backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      case 'pending': return { color: COLORS.warning, backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      default: return { color: COLORS.primary, backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    }
  };

  const renderVendor = ({ item }: { item: VendorPayable }) => (
    <View style={styles.vendorCard}>
      <TouchableOpacity
        style={styles.vendorCardHeader}
        onPress={() => toggleExpand(item._id)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusBorder, { backgroundColor: getVendorStatusStyle(item.status).color }]} />
        <View style={styles.cardContent}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <Text style={styles.vendorInfo}>Cnt: {item.phone}</Text>
          <Text style={styles.vendorInfo}>Due: ₹{item.totalDue.toFixed(2)}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getVendorStatusStyle(item.status).backgroundColor }]}>
            <Text style={[styles.statusText, { color: getVendorStatusStyle(item.status).color }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Feather
            name={expandedVendors[item._id] ? "chevron-up" : "chevron-down"}
            size={24}
            color={COLORS.grey}
            style={{ marginTop: 8 }}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Content: List of Pending Bills */}
      {expandedVendors[item._id] && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.expandedTitle}>Pending Bills:</Text>
          {item.receipts.map((receipt, index) => (
            <View key={receipt._id} style={styles.billRow}>
              <View>
                <Text style={styles.billDate}>{new Date(receipt.receivedDate).toLocaleDateString()}</Text>
                <Text style={styles.billId}>#{receipt.receiptNumber}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.billAmount}>Total: ₹{receipt.totalAmount.toFixed(2)}</Text>
                <Text style={styles.billDue}>Due: ₹{(receipt.totalAmount - (receipt.amountPaid || 0)).toFixed(2)}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.payButtonFull}
            onPress={() => navigation.navigate('VendorDetails', { vendorId: item._id })}
          >
            <Text style={styles.payButtonText}>View Details & Pay</Text>
            <Feather name="arrow-right" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with summary */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendor Payables</Text>
        <Text style={styles.totalAmount}>
          Total Outstanding: ₹{vendors.reduce((sum, vendor) => sum + vendor.totalDue, 0).toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={vendors}
        renderItem={renderVendor}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending payables found.</Text>
            <Text style={styles.emptySubtext}>All vendors are paid up!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  totalAmount: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  vendorCardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  statusBorder: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 8,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  vendorInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  billDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  billId: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  billAmount: {
    fontSize: 14,
    color: '#333',
  },
  billDue: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 2,
  },
  payButtonFull: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PayablesDashboardScreen;