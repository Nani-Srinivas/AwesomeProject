import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EditCustomerModal } from '../../components/customer/EditCustomerModal';
import { AddCustomerModal } from '../../components/customer/AddCustomerModal';
import { apiService } from '../../services/apiService';
import { debounce } from 'lodash';
import { EmptyState } from '../../components/common/EmptyState';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'Unpaid':
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'Partially Paid':
      return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default: // Assuming 'Pending' or other statuses fall here
      return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
  }
};

const CustomerCard = ({ customer, onPress, onEdit, onDelete, onViewBill, onViewHistory, onViewPayment }: { customer: any, onPress: () => void, onEdit: (customer: any) => void, onDelete: (customer: any) => void, onViewBill: (customer: any) => void, onViewHistory: (customer: any) => void, onViewPayment: (customer: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(customer.paymentStatus || customer.Bill).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <View style={styles.contactRow}>
        <Feather name="phone" size={13} color="#6B6B6B" style={{ marginRight: 6 }} />
        <Text style={styles.customerInfo}>{customer.phone}</Text>
      </View>

      {customer.currentDueAmount !== undefined && (
        <Text style={styles.dueAmount}>Due: ₹{customer.currentDueAmount || 0}</Text>
      )}
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(customer.paymentStatus || customer.Bill).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(customer.paymentStatus || customer.Bill).color }]}>
        {customer.paymentStatus || customer.Bill}
      </Text>
    </View>
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={() => onViewBill(customer)} style={styles.actionButton}>
        <Feather name="file-text" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onViewHistory(customer)} style={styles.actionButton}>
        <Feather name="archive" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onViewPayment(customer)} style={styles.actionButton}>
        <Feather name="credit-card" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onEdit(customer)} style={styles.actionButton}>
        <Feather name="edit-2" size={20} color={COLORS.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(customer)} style={styles.actionButton}>
        <Feather name="trash-2" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const CustomerListScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Debounce search input
  const debouncedSearch = useCallback(
    debounce((text) => {
      setDebouncedSearchQuery(text);
    }, 300), // 300ms delay
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/customer');
      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch customers.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customers.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await apiService.get('/delivery/area');
      if (response.data.success) {
        setAreas(response.data.data);
      } else {
        console.error(response.data.message || 'Failed to fetch areas.');
      }
    } catch (err: any) {
      console.error(err.message || 'An error occurred while fetching areas.');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAreas();
  }, []);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (filter !== 'All') {
      list = list.filter((customer: any) => {
        // Use paymentStatus if available, otherwise use the old Bill field
        const status = customer.paymentStatus || customer.Bill;
        return status === filter;
      });
    }
    if (debouncedSearchQuery.trim() !== '') {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter(
        (customer: any) =>
          customer.name.toLowerCase().includes(q) ||
          customer.phone.toLowerCase().includes(q) ||
          customer._id.toLowerCase().includes(q) ||
          (customer.address?.FlatNo && customer.address.FlatNo.toLowerCase().includes(q)) ||
          (customer.address?.Apartment && customer.address.Apartment.toLowerCase().includes(q)) ||
          (customer.address?.city && customer.address.city.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filter, debouncedSearchQuery, customers]);

  const handleCustomerPress = (customer: any) => {
    navigation.navigate('Details', { customer });
  };

  const handleEditPress = (customer: any) => {
    setEditingCustomer(customer);
    setEditModalVisible(true);
  };

  const handleViewBillPress = (customer: any) => {
    navigation.navigate('StatementPeriodSelection', {
      customerId: customer._id,
      onBillOperationComplete: fetchCustomers  // Pass callback to refresh customer list
    });
  };

  const handleViewPaymentPress = (customer: any) => {
    navigation.navigate('PaymentStatus', { customerId: customer._id });
  };

  const handleViewHistoryPress = (customer: any) => {
    navigation.navigate('InvoiceHistory', { customerId: customer._id });
  };

  const handleSaveCustomer = async (updatedCustomer: any) => {
    try {
      setIsSaving(true);
      const response = await apiService.patch(`/customer/update/${updatedCustomer._id}`, updatedCustomer);

      if (response.data.success) {
        setCustomers(prev =>
          prev.map((c: any) => (c._id === updatedCustomer._id ? response.data.data : c))
        );
        setEditModalVisible(false);
        setEditingCustomer(null);
        Alert.alert('Success', `Customer "${response.data.data.name}" has been updated.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCustomer = async (newCustomer: { name: string; phone: string }) => {
    try {
      setIsSaving(true);
      const response = await apiService.post('/customer/create', newCustomer);

      if (response.data.success) {
        setCustomers(prev => [response.data.data, ...prev]);
        setAddModalVisible(false);
        Alert.alert('Success', `Customer "${response.data.data.name}" has been added.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while adding the customer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePress = (customer: any) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.delete(`/customer/delete/${customer._id}`);
              if (response.data.success) {
                setCustomers(prev => prev.filter((c: any) => c._id !== customer._id));
                Alert.alert('Success', `Customer "${customer.name}" has been deleted.`);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete customer.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred while deleting.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* 🔍 Search bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#6B6B6B" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name, contact, address, or ID"
          value={searchQuery}
          onChangeText={handleSearchChange}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterTab, filter === 'All' && styles.activeTab]} onPress={() => setFilter('All')}>
          <Text style={[styles.filterText, filter === 'All' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Paid' && styles.activeTab]} onPress={() => setFilter('Paid')}>
          <Text style={[styles.filterText, filter === 'Paid' && styles.activeFilterText]}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Unpaid' && styles.activeTab]} onPress={() => setFilter('Unpaid')}>
          <Text style={[styles.filterText, filter === 'Unpaid' && styles.activeFilterText]}>Unpaid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Partially Paid' && styles.activeTab]} onPress={() => setFilter('Partially Paid')}>
          <Text style={[styles.filterText, filter === 'Partially Paid' && styles.activeFilterText]}>Partially Paid</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredCustomers}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => handleCustomerPress(item)}
            onViewBill={(customer) => handleViewBillPress(customer)}
            onViewHistory={(customer) => handleViewHistoryPress(customer)}
            onViewPayment={(customer) => handleViewPaymentPress(customer)}
            onEdit={(customer) => handleEditPress(customer)}
            onDelete={(customer) => handleDeletePress(customer)}
          />
        )}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ paddingBottom: 80 }} // Increased padding for FAB
        onRefresh={fetchCustomers}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No Customers Yet"
            description="You haven't added any customers yet. Customers are people who subscribe to regular product deliveries. Add your first customer to get started!"
            actionLabel="Add Your First Customer"
            onAction={() => setAddModalVisible(true)}
          />
        }
      />
      {editingCustomer && (
        <EditCustomerModal
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          isSaving={isSaving}
          areas={areas}
        />
      )}

      <AddCustomerModal
        isVisible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddNewCustomer}
        isSaving={isSaving} // We can reuse the isSaving state for now
        areas={areas}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
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
    padding: 20,
    marginBottom: 20,
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  dueAmount: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 20,
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
});