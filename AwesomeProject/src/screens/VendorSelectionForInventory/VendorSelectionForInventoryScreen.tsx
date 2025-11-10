import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput } from 'react-native';
import { apiService } from '../../services/apiService';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type VendorSelectionForInventoryNavigationProp = NativeStackNavigationProp<MainStackParamList, 'VendorSelectionForInventory'>;

interface Vendor {
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
  assignedCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExtendedVendor extends Vendor {
  products: any[]; // Products assigned to this vendor's categories
}

const VendorSelectionForInventoryScreen = () => {
  const navigation = useNavigation<VendorSelectionForInventoryNavigationProp>();
  const [vendors, setVendors] = useState<ExtendedVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<ExtendedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phone.includes(searchQuery) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchQuery, vendors]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/vendors');
      if (response.data.success) {
        // Format vendors with extended properties
        const extendedVendors = response.data.data.map((vendor: any) => ({
          ...vendor,
          products: [] // Will be populated when vendor is selected
        }));
        setVendors(extendedVendors);
        setFilteredVendors(extendedVendors);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load vendors');
      }
    } catch (error: any) {
      console.error('Error loading vendors:', error);
      Alert.alert('Error', error.message || 'An error occurred while loading vendors');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendors();
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: COLORS.success, backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'partial':
        return { color: COLORS.warning, backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      case 'pending':
        return { color: COLORS.error, backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      default:
        return { color: COLORS.primary, backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    }
  };

  const handleVendorSelect = async (vendor: ExtendedVendor) => {
    // Navigate to inventory receipt screen for this vendor
    navigation.navigate('InventoryReceipt', { vendorId: vendor._id });
  };

  const renderVendor = ({ item }: { item: ExtendedVendor }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleVendorSelect(item)}
    >
      <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(item.paymentStatus).color }]} />
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerInfo}>Vendor ID | {item._id}</Text>
        <Text style={styles.customerInfo}>Contact: {item.phone}</Text>
        {item.address && <Text style={styles.customerInfo}>{item.address.city}, {item.address.state}</Text>}
        <Text style={styles.vendorAmount}>₹{item.payableAmount?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: getStatusStyle(item.paymentStatus).backgroundColor 
      }]}>
        <Text style={[styles.statusText, { 
          color: getStatusStyle(item.paymentStatus).color 
        }]}>
          {item.paymentStatus?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading vendors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Vendor for Inventory</Text>
        <Text style={styles.headerSubtitle}>Choose a vendor to add inventory received</Text>
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.grey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Vendor List */}
      <FlatList
        data={filteredVendors}
        renderItem={renderVendor}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vendors found</Text>
            <Text style={styles.emptySubtext}>
              Add vendors from the Payables screen
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }} // Make space for FAB
      />

      {/* Add Vendor FAB - Navigate to Payables screen where vendors can be added */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Payables' as never)} // Navigate to payables screen to add vendors
      >
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>
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
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
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
    color: COLORS.grey,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
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
    shadowRadius: 4,
  },
});

export default VendorSelectionForInventoryScreen;