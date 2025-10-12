import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EditCustomerModal } from '../../components/customer/EditCustomerModal';

const initialCustomers = [
  { name: 'John Doe', id: '#CST1023', contact: '+91 9876543210', status: 'Paid' },
  { name: 'Jane Smith', id: '#CST1024', contact: '+91 9876543211', status: 'Unpaid' },
  { name: 'Peter Jones', id: '#CST1025', contact: '+91 9876543212', status: 'Pending' },
  { name: 'Mary Johnson', id: '#CST1026', contact: '+91 9876543213', status: 'Paid' },
  { name: 'David Williams', id: '#CST1027', contact: '+91 9876543214', status: 'Unpaid' },
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

const CustomerCard = ({
  customer,
  onPress,
  onViewBill,
  onEdit,
}: {
  customer: any;
  onPress: () => void;
  onViewBill: () => void;
  onEdit: () => void;
}) => (
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
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={onViewBill}>
        <Feather name="file-text" size={20} color={COLORS.primary} />
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
  const [customers, setCustomers] = useState(initialCustomers);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (filter !== 'All') {
      list = list.filter((c) => c.status === filter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.contact.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, searchQuery, customers]);

  const handleCustomerPress = (customer: any) => {
    navigation.navigate('Details', { customer });
  };

  const handleViewBillPress = (customer: any) => {
    navigation.navigate('StatementPeriodSelection', { customerId: customer.id });
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
      {/* 🔍 Search bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('StatementPeriodSelection')}>
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
        {['All', 'Paid', 'Pending', 'Unpaid'].map((status) => (
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => handleCustomerPress(item)}
            onViewBill={() => handleViewBillPress(item)}
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
  // statusBadge: {
  //   position: 'absolute',
  //   top: 16,
  //   right: 16,
  //   paddingVertical: 4,
  //   paddingHorizontal: 10,
  //   borderRadius: 12,
  // },
  // statusText: {
  //   fontSize: 12,
  //   fontWeight: '600',
  // },
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
