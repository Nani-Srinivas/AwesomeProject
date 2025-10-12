import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { MainStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type BillsScreenProps = NativeStackScreenProps<MainStackParamList, 'Bills'>;

interface Bill {
  id: string;
  customerName: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

const DUMMY_BILLS: Bill[] = [
  { id: 'B001', customerName: 'Alice Smith', date: '2024-09-15', description: 'Groceries', amount: 120.50, status: 'Paid' },
  { id: 'B002', customerName: 'Bob Johnson', date: '2024-09-14', description: 'Electronics', amount: 500.00, status: 'Unpaid' },
  { id: 'B003', customerName: 'Alice Smith', date: '2024-09-10', description: 'Apparel', amount: 75.25, status: 'Paid' },
  { id: 'B004', customerName: 'Charlie Brown', date: '2024-09-08', description: 'Home Goods', amount: 30.00, status: 'Overdue' },
  { id: 'B005', customerName: 'Bob Johnson', date: '2024-09-05', description: 'Books', amount: 45.00, status: 'Paid' },
];

export const PayableTempScreen = ({ navigation }: BillsScreenProps) => {
  const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustomer = selectedCustomer === 'All' || bill.customerName === selectedCustomer;
    const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
    return matchesSearch && matchesCustomer && matchesStatus;
  });

  const allCustomers = ['All', ...new Set(DUMMY_BILLS.map(bill => bill.customerName))];
  const allStatuses = ['All', 'Paid', 'Unpaid', 'Overdue'];

  const renderBillItem = ({ item }: { item: Bill }) => (
    <View style={styles.billItem}>
      <View style={styles.billDetails}>
        <Text style={styles.billId}>Bill ID: {item.id}</Text>
        <Text style={styles.billCustomer}>Customer: {item.customerName}</Text>
        <Text style={styles.billDescription}>{item.description}</Text>
        <Text style={styles.billDate}>{item.date}</Text>
      </View>
      <View style={styles.billAmountStatus}>
        <Text style={styles.billAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={[styles.billStatus, styles[item.status.toLowerCase()]]}>{item.status}</Text>
      </View>
    </View>
  );

  const handleExport = () => {
    Alert.alert('Export Bills', 'Export functionality will be implemented here.');
    // In a real app, this would trigger a download of PDF/CSV
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Customer Bills</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, Customer, or Description"
          placeholderTextColor={COLORS.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Customer:</Text>
          <View style={styles.pickerContainer}>
            {/* This would ideally be a Picker component */}
            <TextInput
              style={styles.pickerInput}
              value={selectedCustomer}
              onChangeText={setSelectedCustomer}
              placeholder="Select Customer"
            />
          </View>

          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.pickerContainer}>
            {/* This would ideally be a Picker component */}
            <TextInput
              style={styles.pickerInput}
              value={filterStatus}
              onChangeText={setFilterStatus}
              placeholder="Select Status"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export Bills</Text>
        </TouchableOpacity>

        <FlatList
          data={filteredBills}
          renderItem={renderBillItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No bills found.</Text>
            </View>
          }
          style={styles.billList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 10,
  },
  pickerContainer: {
    flex: 1,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  pickerInput: {
    color: COLORS.text,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  billList: {
    flex: 1,
  },
  billItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  billDetails: {
    flex: 2,
  },
  billId: {
    fontSize: 14,
    color: COLORS.gray,
  },
  billCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  billDescription: {
    fontSize: 14,
    color: COLORS.text,
  },
  billDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5,
  },
  billAmountStatus: {
    flex: 1,
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  billStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  paid: {
    color: COLORS.success,
  },
  unpaid: {
    color: COLORS.danger,
  },
  overdue: {
    color: COLORS.warning,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: COLORS.gray,
  },
});
