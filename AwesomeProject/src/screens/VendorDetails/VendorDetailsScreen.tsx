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