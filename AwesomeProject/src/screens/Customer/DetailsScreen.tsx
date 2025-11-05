import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/apiService';

export const DetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { customer } = route.params as { customer: any };
  const [customerData, setCustomerData] = useState(customer);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'billing'

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/invoice/customer/${customer._id}`);
      setInvoices(response.data.invoices || []);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      Alert.alert('Error', 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = () => {
    navigation.navigate('StatementPeriodSelection', { customerId: customer._id });
  };

  const handleViewInvoice = (invoice: any) => {
    // For now, navigate to statement period selection
    navigation.navigate('StatementPeriodSelection', { customerId: customer._id });
  };

  const renderCustomerInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Name</Text>
        <Text style={styles.infoValue}>{customerData.name}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>{customerData.phone}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Customer ID</Text>
        <Text style={styles.infoValue}>{customerData._id}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Payment Status</Text>
        <Text style={[styles.infoValue, 
          (customerData.paymentStatus || customerData.Bill) === 'Paid' ? styles.paidStatus : 
          (customerData.paymentStatus || customerData.Bill) === 'Unpaid' ? styles.unpaidStatus : 
          styles.pendingStatus
        ]}>
          {customerData.paymentStatus || customerData.Bill}
        </Text>
      </View>
      {customerData.currentDueAmount !== undefined && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Due</Text>
          <Text style={[styles.infoValue, customerData.currentDueAmount > 0 ? styles.unpaidStatus : styles.paidStatus]}>
            ₹{customerData.currentDueAmount || 0}
          </Text>
        </View>
      )}
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Delivery Cost</Text>
        <Text style={styles.infoValue}>₹{customerData.deliveryCost || '0'}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Advance Amount</Text>
        <Text style={styles.infoValue}>₹{customerData.advance || '0'}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Subscription Status</Text>
        <Text style={styles.infoValue}>{customerData.subscriptionStatus || 'Active'}</Text>
      </View>
    </View>
  );

  const renderBillingInfo = () => (
    <View style={styles.billingSection}>
      <View style={styles.billingHeader}>
        <Text style={styles.sectionTitle}>Invoice History</Text>
        <View style={styles.billingHeaderButtons}>
          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={() => navigation.navigate('PaymentStatus', { customerId: customer._id })}
          >
            <Feather name="credit-card" size={16} color="#fff" />
            <Text style={styles.paymentButtonText}> Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={handleGenerateInvoice}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.generateButtonText}> Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text>Loading invoices...</Text>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="file-text" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No invoices generated yet</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={handleGenerateInvoice}
          >
            <Text style={styles.generateButtonText}>Generate First Invoice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.invoiceList}>
          {invoices.map((invoice: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={styles.invoiceCard}
              onPress={() => handleViewInvoice(invoice)}
            >
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>{invoice.billNo}</Text>
                <Text style={styles.invoicePeriod}>{invoice.period}</Text>
              </View>
              <View style={styles.invoiceAmountContainer}>
                <Text style={styles.invoiceAmount}>₹{invoice.grandTotal}</Text>
                <Feather name="chevron-right" size={20} color={COLORS.accent} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{customerData.name}</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Customer Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'billing' && styles.activeTab]}
          onPress={() => setActiveTab('billing')}
        >
          <Text style={[styles.tabText, activeTab === 'billing' && styles.activeTabText]}>
            Billing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'info' ? renderCustomerInfo() : renderBillingInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  paidStatus: {
    color: '#4CAF50',
  },
  unpaidStatus: {
    color: '#F44336',
  },
  pendingStatus: {
    color: '#FF9800',
  },
  billingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billingHeaderButtons: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 10,
    textAlign: 'center',
  },
  invoiceList: {
    marginTop: 10,
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  invoicePeriod: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 2,
  },
  invoiceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },
});

export default DetailsScreen;