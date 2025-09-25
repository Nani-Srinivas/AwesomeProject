import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EditCustomerModal } from '../../components/customer/EditCustomerModal';

const initialCustomers = [
  { id: '#CST1023', name: 'John Doe', contact: '+91 9876543210', status: 'Paid' },
  { id: '#CST1024', name: 'Jane Smith', contact: '+91 9876543211', status: 'Unpaid' },
  { id: '#CST1025', name: 'Peter Jones', contact: '+91 9876543212', status: 'Pending' },
  { id: '#CST1026', name: 'Mary Johnson', contact: '+91 9876543213', status: 'Paid' },
  { id: '#CST1027', name: 'David Williams', contact: '+91 9876543214', status: 'Unpaid' },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'Unpaid':
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'Pending':
      return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default:
      return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
  }
};

const CustomerCard = ({ customer, onPress, onEdit }: { customer: any, onPress: () => void, onEdit: (customer: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(customer.status).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerInfo}>Customer ID | {customer.id}</Text>
      <Text style={styles.customerInfo}>Contact: {customer.contact}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(customer.status).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(customer.status).color }]}>
        {customer.status}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onEdit(customer)} style={styles.editButton}>
      <Feather name="edit-2" size={20} color={COLORS.text} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export const CustomerListScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [customers, setCustomers] = useState(initialCustomers);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const filteredCustomers = useMemo(() => {
    if (filter === 'All') {
      return customers;
    }
    return customers.filter((customer) => customer.status === filter);
  }, [filter, customers]);

  const handleCustomerPress = (customer: any) => {
    navigation.navigate('Details', { customer });
  };

  const handleEditPress = (customer: any) => {
    setEditingCustomer(customer);
    setEditModalVisible(true);
  };

  const handleSaveCustomer = (updatedCustomer: any) => {
    setCustomers(prev =>
      prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    setEditModalVisible(false);
    setEditingCustomer(null);
    Alert.alert('Success', `Customer "${updatedCustomer.name}" has been updated.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterTab, filter === 'All' && styles.activeTab]} onPress={() => setFilter('All')}>
          <Text style={[styles.filterText, filter === 'All' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Paid' && styles.activeTab]} onPress={() => setFilter('Paid')}>
          <Text style={[styles.filterText, filter === 'Paid' && styles.activeFilterText]}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Pending' && styles.activeTab]} onPress={() => setFilter('Pending')}>
          <Text style={[styles.filterText, filter === 'Pending' && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredCustomers}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => handleCustomerPress(item)}
            onEdit={handleEditPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
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
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
