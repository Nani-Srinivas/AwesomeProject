import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type VendorSelectionNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AddStock'>;

interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    city?: string;
    state?: string;
  };
}

const VendorSelectionScreen = () => {
  const navigation = useNavigation<VendorSelectionNavigationProp>();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/vendors');
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendors();
    setRefreshing(false);
  };

  const handleVendorSelect = (vendor: Vendor) => {
    // Navigate to AddStock screen, vendor info can be accessed from state/api
    // For now, just navigate to the AddStock screen
    navigation.navigate('AddStock', {}); 
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => handleVendorSelect(item)}
    >
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorPhone}>Phone: {item.phone}</Text>
        {item.email && <Text style={styles.vendorEmail}>{item.email}</Text>}
        {item.address && (
          <Text style={styles.vendorAddress}>
            {item.address.city}, {item.address.state}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={24} color={COLORS.grey} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Vendor</Text>
        <Text style={styles.headerSubtitle}>Choose a vendor to add inventory</Text>
      </View>

      <FlatList
        data={vendors}
        keyExtractor={(item) => item._id}
        renderItem={renderVendor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="truck" size={48} color={COLORS.grey} />
            <Text style={styles.emptyText}>No vendors found</Text>
            <Text style={styles.emptySubtext}>
              Add vendors from the Payables screen
            </Text>
          </View>
        }
        contentContainerStyle={vendors.length === 0 ? null : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  vendorPhone: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 4,
  },
  vendorEmail: {
    fontSize: 13,
    color: COLORS.grey,
    marginTop: 2,
  },
  vendorAddress: {
    fontSize: 13,
    color: COLORS.grey,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.grey,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default VendorSelectionScreen;