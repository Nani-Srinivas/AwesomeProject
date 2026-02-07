import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, Linking, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/apiService';
import { useUserStore } from '../../store/userStore';
import { FinanceHeroCard } from './components/FinanceHeroCard';
import { TransactionTimeline } from './components/TransactionTimeline';
import { QuickPayModal } from './components/QuickPayModal';
import { BillGeneratorModal } from './components/BillGeneratorModal';
import { BillActionsModal } from './components/BillActionsModal';
import { BillPreviewModal } from './components/BillPreviewModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { generatePaymentReceipt } from '../../utils/receiptGenerator';

export const DetailsScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { customer: initialCustomer } = route.params;
  const [customer, setCustomer] = useState(initialCustomer);
  const { user } = useUserStore(); // Get logged-in user

  // Data State
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
  const [stats, setStats] = useState({
    lastPaidAmount: 0,
    lastPaidDate: 'N/A',
    openBillsCount: 0,
    avgBillAmount: 0
  });

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OPEN_BILLS' | 'HISTORY'>('OPEN_BILLS');

  // Modals
  const [isPayModalVisible, setPayModalVisible] = useState(false);
  const [isBillModalVisible, setBillModalVisible] = useState(false);

  // Bill Actions State
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [isPreviewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Receipt State
  const [isReceiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptPdfPath, setReceiptPdfPath] = useState<string>('');

  const openBillActions = (bill: any) => {
    setSelectedBill(bill);
    setActionModalVisible(true);
  };

  const handleViewBill = () => {
    if (selectedBill?.url) {
      setPreviewModalVisible(true);
    } else {
      Alert.alert('Notice', 'No bill URL available.');
    }
    setActionModalVisible(false);
  };

  const handleShareBill = async () => {
    if (!selectedBill?.url) return;

    setActionModalVisible(false);

    try {
      const fileName = `Invoice_${customer.name.replace(/\s+/g, '_')}_${selectedBill.period.replace(/\s+/g, '_')}.pdf`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Alert.alert('Preparing', 'Downloading invoice for sharing...'); // Removed as per user request

      const download = RNFS.downloadFile({
        fromUrl: selectedBill.url,
        toFile: filePath,
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        await Share.open({
          url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
          title: `Invoice - ${selectedBill.period}`,
          message: `Invoice for ${customer.name} - ${selectedBill.period}`,
          type: 'application/pdf',
        });
      } else {
        console.warn('Failed to download invoice for sharing.');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownloadBill = () => {
    handleViewBill();
  };

  const handleRegenerateBill = async () => {
    if (!selectedBill) return;
    try {
      setActionModalVisible(false);
      const response = await apiService.post(`/invoice/regenerate/${selectedBill._id}`, {});
      if (response.data.success || response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Bill regenerated successfully.');
        fetchCustomerDetails();
      } else {
        Alert.alert('Error', 'Failed to regenerate bill.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Regeneration failed.');
    }
  };

  const handleDeleteBill = async () => {
    if (!selectedBill) return;
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this bill? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionModalVisible(false);
              const response = await apiService.delete(`/invoice/${selectedBill._id}`);
              if (response.data.success || response.status === 200) {
                Alert.alert('Success', 'Bill deleted.');
                fetchCustomerDetails();
              } else {
                Alert.alert('Error', 'Failed to delete bill.');
              }
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Delete failed.');
            }
          }
        }
      ]
    );
  };

  const fetchCustomerDetails = useCallback(async () => {
    try {
      // 1. Fetch updated customer data (for balance/dues)
      // Note: Assuming /customer endpoints exist or we refresh the customer list equivalent
      // For now, we might need to rely on what we have or generic endpoints. 
      // Let's assume we can re-fetch customer by ID or simple GET.
      // If no specific endpoint, we trust the param + updates we make.

      // 2. Fetch Payments History
      let payments = [];
      try {
        const paymentsRes = await apiService.get(`/payment/history/${customer._id}`);
        payments = paymentsRes.data.success ? paymentsRes.data.data : [];
      } catch (err) {
        console.log('No payments found or API error', err);
      }

      // 3. Fetch Invoices History
      // FIX: Use the correct endpoint for retrieving all invoices for a customer
      let invoices = [];
      try {
        const invoicesRes = await apiService.get(`/invoice/customer/${customer._id}`);
        // The backend returns { count: n, invoices: [...] }, no 'success' field
        invoices = invoicesRes.data.invoices || [];
      } catch (err) {
        console.log('No invoices found or API error', err);
      }

      // Process Data
      processFinanceData(payments, invoices);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Alert.alert('Error', 'Failed to load latest data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [customer._id]);

  const processFinanceData = (payments: any[], invoices: any[]) => {
    // 1. Calculate Stats
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastPayment = sortedPayments[0];

    // Filter unpaid bills (assuming status Logic)
    // Checking `paymentStatus` or derived logic
    const openInvoices = invoices.filter((inv: any) =>
      inv.status !== 'Paid' && inv.status !== 'Completed' // Adjust based on actual API status values
    ).sort((a, b) => new Date(b.createdAt || b.generatedAt).getTime() - new Date(a.createdAt || a.generatedAt).getTime());

    // Avg Bill
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.grandTotal || 0), 0);
    const avgBill = invoices.length > 0 ? totalBilled / invoices.length : 0;

    setStats({
      lastPaidAmount: lastPayment ? lastPayment.amount : 0,
      lastPaidDate: lastPayment ? new Date(lastPayment.date).toLocaleDateString() : 'Never',
      openBillsCount: openInvoices.length,
      avgBillAmount: Math.round(avgBill)
    });

    setUnpaidBills(openInvoices);

    // Calculate total due from unpaid invoices
    const totalDue = openInvoices.reduce((sum, inv: any) => {
      // Use dueAmount if available, otherwise fall back to totalAmount or grandTotal
      const unpaidAmount = inv.dueAmount ?? inv.totalAmount ?? inv.grandTotal ?? 0;
      return sum + unpaidAmount;
    }, 0);

    // Update customer object with calculated total due
    setCustomer((prev: any) => ({ ...prev, currentDueAmount: totalDue }));

    // 2. Build Timeline (Mix of recent 5 events)
    const recentPayments = sortedPayments.slice(0, 5).map(p => ({
      id: p._id,
      type: 'PAYMENT',
      title: 'Payment Received',
      subtitle: p.method || 'Cash',
      date: new Date(p.date).toLocaleDateString(),
      amount: `₹${p.amount}`,
      status: 'Completed'
    }));

    const recentInvoices = invoices.slice(0, 5).map(i => ({
      id: i._id,
      type: 'BILL_GENERATED',
      title: 'Bill Generated',
      subtitle: i.period || 'Statement',
      date: new Date(i.generatedAt || i.fromDate).toLocaleDateString(),
      amount: `₹${i.grandTotal || i.totalAmount}`,
      status: i.status || 'Pending'
    }));

    const combined = [...recentPayments, ...recentInvoices]
      .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime()) // simple string date sort might be flaky, but okay for display
      .slice(0, 10); // Show last 10 mixed

    setTimelineEvents(combined as any);
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleCollectPayment = async (amount: number, method: string, transactionId: string, allocations: { invoiceId: string; amount: number }[]) => {
    // API Call to record payment with allocations
    const payload: any = {
      customerId: customer._id,
      amount: amount,
      paymentMethod: method,
      notes: 'Quick Payment from Dashboard',
      allocations: allocations // Send allocation array to backend
    };

    // Add transaction ID for non-cash payments
    if (method !== 'Cash' && transactionId) {
      payload.transactionId = transactionId;
    }

    const response = await apiService.post('/payment/receive', payload);
    if (response.data.success) {
      // Refresh data
      fetchCustomerDetails();

      // Update local customer due amount
      const newDue = response.data.data?.currentDueAmount !== undefined
        ? response.data.data.currentDueAmount
        : Math.max(0, (customer.currentDueAmount || 0) - amount);

      setCustomer((prev: any) => ({ ...prev, currentDueAmount: newDue }));

      // Generate Receipt Data
      const billsPaid = allocations.map(alc => {
        const bill = unpaidBills.find(b => b._id === alc.invoiceId);
        return {
          billNo: bill?.billNo || 'N/A',
          period: bill?.period || 'N/A',
          amountPaid: alc.amount
        };
      });

      const receipt = {
        amount,
        method,
        billsAllocated: billsPaid,
        remainingBalance: newDue
      };

      setReceiptData(receipt);

      // Generate PDF
      try {
        const pdfPath = await generatePaymentReceipt({
          receiptNumber: `RCP-${Date.now()}`,
          customerName: customer.name,
          paymentDate: new Date().toLocaleDateString(),
          amount: amount,
          paymentMethod: method,
          billsAllocated: billsPaid,
          remainingBalance: newDue
        });
        setReceiptPdfPath(pdfPath);
      } catch (err) {
        console.warn('Receipt PDF generation failed', err);
      }

      setReceiptModalVisible(true);
    } else {
      throw new Error(response.data.message || 'Payment failed');
    }
  };

  const handleGenerateBill = async (period: string, from?: string, to?: string) => {
    try {
      const payload: any = {
        customerId: customer._id,
        generatedBy: 'App User'
      };

      if (from && to) {
        payload.from = from;
        payload.to = to;
      } else {
        payload.period = period;
      }

      // Must use POST as per backend controller validation
      const response = await apiService.post(`/invoice/generate`, payload);

      // Backend returns 201 Created on success
      if (response.status === 201 || response.data.success || response.data.message?.includes('success')) {
        Alert.alert('Success', `Bill generated successfully.`);
        setBillModalVisible(false); // Close modal
        fetchCustomerDetails(); // Refresh list to show new bill
      } else {
        Alert.alert('Notice', response.data.message || 'Could not generate bill.');
      }
    } catch (e: any) {
      // Axios error object might have response.data.message
      const msg = e.response?.data?.message || e.message || 'Generation failed';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{customer.name}</Text>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>Trust Score: Excellent</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchCustomerDetails(); }} />}
      >
        <FinanceHeroCard
          totalDue={customer.currentDueAmount || 0}
          creditBalance={0} // TODO: Add credit balance to customer model/API
          onCollectPayment={() => setPayModalVisible(true)}
        />

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="clock" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>Last Paid</Text>
            <Text style={styles.statValue}>₹{stats.lastPaidAmount}</Text>
            <Text style={styles.statSub}>{stats.lastPaidDate}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Feather name="file-text" size={16} color="#E65100" />
            </View>
            <Text style={styles.statLabel}>Open Bills</Text>
            <Text style={styles.statValue}>{stats.openBillsCount}</Text>
            <Text style={styles.statSub}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="bar-chart-2" size={16} color="#1565C0" />
            </View>
            <Text style={styles.statLabel}>Avg. Bill</Text>
            <Text style={styles.statValue}>₹{stats.avgBillAmount}</Text>
            <Text style={styles.statSub}>Per Month</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'OPEN_BILLS' && styles.activeTab]}
            onPress={() => setActiveTab('OPEN_BILLS')}
          >
            <Text style={[styles.tabText, activeTab === 'OPEN_BILLS' && styles.activeTabText]}>Open Bills</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]}
            onPress={() => setActiveTab('HISTORY')}
          >
            <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'HISTORY' ? (
          <TransactionTimeline events={timelineEvents} />
        ) : (
          <View style={styles.billsList}>
            <TouchableOpacity
              style={styles.newBillButton}
              onPress={() => setBillModalVisible(true)}
            >
              <View style={styles.newBillIcon}>
                <Feather name="plus" size={20} color="#FFF" />
              </View>
              <Text style={styles.newBillText}>Generate New Bill</Text>
            </TouchableOpacity>

            {unpaidBills.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={40} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>No open bills</Text>
              </View>
            ) : (
              unpaidBills.map((bill) => (
                <View key={bill._id} style={styles.billCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billPeriod}>{bill.period}</Text>
                    <Text style={styles.billDate}>Due: {new Date(bill.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                      <Text style={styles.billAmount}>₹{bill.totalAmount}</Text>
                      <TouchableOpacity style={styles.payNowSmallButton} onPress={() => setPayModalVisible(true)}>
                        <Text style={styles.payNowSmallText}>Pay Now</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => openBillActions(bill)} style={{ padding: 8 }}>
                      <Feather name="more-vertical" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <QuickPayModal
        isVisible={isPayModalVisible}
        onClose={() => setPayModalVisible(false)}
        customerName={customer.name}
        totalDue={customer.currentDueAmount || 0}
        unpaidBills={unpaidBills}
        upiId={user?.upiId} // Dynamic UPI ID from logged-in user
        onPaymentSuccess={handleCollectPayment}
      />

      <BillGeneratorModal
        isVisible={isBillModalVisible}
        onClose={() => setBillModalVisible(false)}
        onGenerate={handleGenerateBill}
      />

      <BillActionsModal
        isVisible={isActionModalVisible}
        onClose={() => setActionModalVisible(false)}
        billDate={selectedBill?.period || 'Unknown'}
        billAmount={selectedBill?.totalAmount || 0}
        onView={handleViewBill}
        onShare={handleShareBill}
        onDownload={handleDownloadBill}
        onRegenerate={handleRegenerateBill}
        onDelete={handleDeleteBill}
      />

      <BillPreviewModal
        isVisible={isPreviewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        pdfUrl={selectedBill?.url}
      />

      {receiptData && (
        <PaymentReceiptModal
          isVisible={isReceiptModalVisible}
          onClose={() => setReceiptModalVisible(false)}
          receiptData={receiptData}
          pdfPath={receiptPdfPath}
        />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E73B8', // Primary Blue for Header Background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E73B8',
  },
  moreButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  trustBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  trustText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light Gray background for body
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 10,
    color: '#9E9E9E',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    marginRight: 24,
    paddingBottom: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },

  // Bills List
  billsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  newBillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  newBillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  billPeriod: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  billDate: {
    fontSize: 12,
    color: '#757575',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error, // Red for due
    marginBottom: 8,
  },
  payNowSmallButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payNowSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#BDBDBD',
    fontSize: 14,
  },
});