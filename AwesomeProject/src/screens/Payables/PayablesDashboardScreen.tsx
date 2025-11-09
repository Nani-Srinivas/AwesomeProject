import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
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
  daysOverdue: number;
  status: 'paid' | 'pending' | 'overdue';
  recentReceipts: any[];
}

const PayablesDashboardScreen = () => {
  const navigation = useNavigation<PayablesDashboardScreenNavigationProp>();
  const [vendors, setVendors] = useState<VendorPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVendorPayables();
  }, []);

  const loadVendorPayables = async () => {
    try {
      setLoading(true);
      // Using the vendor API instead of the finance API
      const response = await apiService.get('/vendors');

      if (response.data.success) {
        // Transform vendor data to match expected structure for display
        const transformedVendors = response.data.data.map((vendor: any) => ({
          ...vendor,
          _id: vendor._id,
          name: vendor.name,
          phone: vendor.phone,
          totalDue: vendor.payableAmount || 0, // Using the payable amount from our implementation
          lastDeliveryDate: vendor.updatedAt, // Using updated time as proxy for last delivery
          daysOverdue: 0, // Placeholder - would need specific overdue logic
          status: vendor.paymentStatus || 'pending', // Using payment status from our implementation
          recentReceipts: [] // Placeholder - would need to get receipts data if needed
        }));
        setVendors(transformedVendors);
      } else {
        console.error('Failed to load vendor payables:', response.data.message);
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

  const getVendorStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: COLORS.success, backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'overdue':
        return { color: COLORS.error, backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      case 'pending':
        return { color: COLORS.warning, backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      default:
        return { color: COLORS.primary, backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    }
  };

  const renderVendor = ({ item }: { item: VendorPayable }) => (
    <TouchableOpacity 
      style={styles.vendorCard} 
      onPress={() => handleVendorPress(item)}
    >
      <View style={[styles.statusBorder, { backgroundColor: getVendorStatusStyle(item.status).color }]} />
      <View style={styles.cardContent}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorInfo}>Vendor ID | {item._id}</Text>
        <Text style={styles.vendorInfo}>Contact: {item.phone}</Text>
        <Text style={styles.vendorInfo}>Last Delivery: {item.lastDeliveryDate}</Text>
        {item.daysOverdue > 0 && (
          <Text style={styles.overdueText}>{item.daysOverdue} days overdue</Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getVendorStatusStyle(item.status).backgroundColor }]}>
        <Text style={[styles.statusText, { color: getVendorStatusStyle(item.status).color }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.vendorAmountContainer}>
        <Text style={styles.vendorAmount}>₹{item.totalDue?.toFixed(2) || '0.00'}</Text>
        <TouchableOpacity style={styles.payButton}>
          <Feather name="arrow-right" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleVendorPress = (vendor: VendorPayable) => {
    navigation.navigate('VendorDetails', { vendorId: vendor._id });
  };

  if (loading) {
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
            <Text style={styles.emptyText}>No vendors with payables found</Text>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  statusBorder: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginRight: 80, // Make space for the badge
  },
  vendorInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  overdueText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vendorAmountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 30,
  },
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default PayablesDashboardScreen;