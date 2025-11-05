// src/screens/Bills/BillsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EditCustomerModal } from '../../components/customer/EditCustomerModal';
import { apiService } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';

// Define the type for customer
interface Customer {
  _id: string;
  name: string;
  phone: string;
  paymentStatus: string;
  currentDueAmount: number;
  totalAmountPayable: number;
  totalAmountPaid: number;
  lastPaymentDate?: string;
  lastBillPeriod?: string;
}

// Status badge styling
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'Unpaid':
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'Partially Paid':
      return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default:
      return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
  }
};

const CustomerCard = ({
  customer,
  onPress,
  onViewBill,
  onViewHistory,
  onViewPayment,
  onEdit,
}: {
  customer: Customer;
  onPress: () => void;
  onViewBill: () => void;
  onViewHistory: () => void;
  onViewPayment: () => void;
  onEdit: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(customer.paymentStatus).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerInfo}>Customer ID | {customer._id}</Text>
      <Text style={styles.customerInfo}>Contact: {customer.phone}</Text>
      {customer.currentDueAmount !== undefined && (
        <Text style={styles.dueAmount}>Due: ₹{customer.currentDueAmount || 0}</Text>
      )}
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(customer.paymentStatus).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(customer.paymentStatus).color }]}>
        {customer.paymentStatus}
      </Text>
    </View>
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={onViewBill}>
        <Feather name="file-text" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onViewHistory} style={{ marginLeft: 16 }}>
        <Feather name="archive" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onViewPayment} style={{ marginLeft: 16 }}>
        <Feather name="credit-card" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onEdit} style={{ marginLeft: 16 }}>
        <Feather name="edit-2" size={20} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const BillsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const [filter, setFilter] = useState(route?.params?.filter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Fetch customers with payment information
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/customer');
        if (response.data.success) {
          setCustomers(response.data.data || []);
        } else {
          Alert.alert('Error', response.data.message || 'Failed to fetch customers');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (filter !== 'All') {
      list = list.filter((c) => c.paymentStatus === filter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c._id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, searchQuery, customers]);

  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('Details', { customer });
  };

  const handleViewBillPress = (customer: Customer) => {
    navigation.navigate('StatementPeriodSelection', { customerId: customer._id });
  };

  const handleViewHistoryPress = (customer: Customer) => {
    navigation.navigate('InvoiceHistory', { customerId: customer._id });
  };

  const handleViewPaymentPress = (customer: Customer) => {
    navigation.navigate('PaymentStatus', { customerId: customer._id });
  };

  const handleEditPress = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditModalVisible(true);
  };

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      const response = await apiService.patch(`/customer/update/${updatedCustomer._id}`, updatedCustomer);

      if (response.data.success) {
        setCustomers(prev =>
          prev.map(c => (c._id === updatedCustomer._id ? response.data.data : c))
        );
        setEditModalVisible(false);
        setEditingCustomer(null);
        Alert.alert('Success', `Customer "${response.data.data.name}" has been updated.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while updating.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Feather name="search" size={18} color="#6B6B6B" style={{ marginRight: 8 }} />
        </TouchableOpacity>
        <TextInput
          placeholder="Search by name, contact or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {['All', 'Paid', 'Unpaid', 'Partially Paid'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filter === status && styles.activeTab]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.activeFilterText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Customer list */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => handleCustomerPress(item)}
            onViewBill={() => handleViewBillPress(item)}
            onViewHistory={() => handleViewHistoryPress(item)}
            onViewPayment={() => handleViewPaymentPress(item)}
            onEdit={() => handleEditPress(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
            No customers found
          </Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {editingCustomer && (
        <EditCustomerModal
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1C',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#1E73B8',
  },
  filterText: {
    color: '#6B6B6B',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
    marginRight: 80, // Make space for the badge
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  dueAmount: {
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
    paddingHorizontal: 14,
    borderTopRightRadius: 12,     // same as card radius
    borderBottomLeftRadius: 12,   // tag-like shape
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
});