import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const customers = [
  {
    name: 'John Doe',
    id: '#CST1023',
    contact: '+91 9876543210',
    status: 'Active',
  },
  {
    name: 'Jane Smith',
    id: '#CST1024',
    contact: '+91 9876543211',
    status: 'Inactive',
  },
  {
    name: 'Peter Jones',
    id: '#CST1025',
    contact: '+91 9876543212',
    status: 'Pending',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return '#4CAF50';
    case 'Inactive':
      return '#F44336';
    case 'Pending':
      return '#FF9800';
    default:
      return '#2196F3';
  }
};

const CustomerCard = ({ customer, onPress }: { customer: any, onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusColor(customer.status) }]} />
    <View style={styles.cardContent}>
      <View style={styles.leftContent}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerInfo}>Customer ID | {customer.id}</Text>
        <Text style={styles.customerInfo}>Contact: {customer.contact}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={[styles.statusText, { color: getStatusColor(customer.status) }]}>
          {customer.status}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const CustomerList = ({ navigation }: { navigation: any }) => {
  const handleCustomerPress = (customer: any) => {
    navigation.navigate('Details', { customer });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customers</Text>
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} onPress={() => handleCustomerPress(customer)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginBottom: 16,
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
  },
  statusBorder: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
