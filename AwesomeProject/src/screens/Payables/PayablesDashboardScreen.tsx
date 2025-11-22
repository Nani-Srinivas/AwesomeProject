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
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalContent: {
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
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
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  productOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  productOptionPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  removeButton: {
    padding: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  radioButtonSelected: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: '#666',
  },
  radioTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pendingAmountContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  pendingAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PayablesDashboardScreen;