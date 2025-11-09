import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

export default function VendorReceiveScreen({ route, navigation }) {
  const { vendorId } = route.params;
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [billInfo, setBillInfo] = useState({
    billNumber: '',
    billDate: selectedDate,
    paymentRef: '',
    billAmount: 0,
    dueAmount: 0,
    isPaid: false,
    paymentStatus: 'pending' as 'paid' | 'partial' | 'pending',
    amountPaid: 0,
    paymentMethod: '',
    transactionId: '',
  });

  // ============ FETCH DATA ============
  useEffect(() => {
    loadVendorAndProducts();
  }, []);

  useEffect(() => {
    // Update bill date when selected date changes
    setBillInfo(prevBillInfo => ({
      ...prevBillInfo,
      billDate: selectedDate
    }));
  }, [selectedDate]);

  const loadVendorAndProducts = async () => {
    try {
      setLoading(true);
      const [vendorRes, productRes] = await Promise.all([
        apiService.get(`/vendors/${vendorId}`),
        apiService.get(`/product/store-by-vendor?vendorId=${vendorId}`),
      ]);

      const vendorData =
        vendorRes.data.data ?? vendorRes.data ?? { name: 'Vendor' };
      const productsData =
        productRes.data.data ?? productRes.data ?? [];

      setVendor(vendorData);
      setProducts(productsData);
      setInventoryItems(
        productsData.map((p: any) => ({
          productId: p._id,
          receivedQuantity: 0,
          unitPrice: p.price ?? 0,
          batchNumber: '',
          expiryDate: '',
        }))
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load vendor or products');
    } finally {
      setLoading(false);
    }
  };

  // ============ UPDATE HANDLERS ============
  const updateField = (productId: string, field: string, value: any) => {
    setInventoryItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, [field]: value } : i))
    );
  };

  // ============ SUBMIT ============
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Calculate total amount from inventory items
      const totalAmount = inventoryItems.reduce((sum, item) => {
        return sum + (item.receivedQuantity * item.unitPrice);
      }, 0);
      
      await apiService.post(`/inventory/receipts`, {
        vendorId,
        receivedDate: selectedDate,
        items: inventoryItems.map(item => ({
          storeProductId: item.productId,
          receivedQuantity: item.receivedQuantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
        totalAmount,
        billNumber: billInfo.billNumber,
        billDate: billInfo.billDate,
        paymentStatus: billInfo.paymentStatus,
        amountPaid: billInfo.paymentStatus === 'paid' ? totalAmount : 
                   billInfo.paymentStatus === 'partial' ? billInfo.amountPaid : 0,
        paymentMethod: billInfo.paymentMethod || undefined,
        transactionId: billInfo.transactionId || undefined,
        notes: `Bill: ${billInfo.billNumber}, Payment Ref: ${billInfo.paymentRef}`
      });
      
      Alert.alert('Success', 'Inventory receipt created successfully');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit inventory receipt');
    } finally {
      setSubmitting(false);
    }
  };

  // ============ HEADER ============
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const renderCustomHeader = (date: any) => {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="calendar" size={24} color={COLORS.primary} />
          <Text style={styles.monthText}>{`${month} ${year}`}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Feather name="chevron-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Feather name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============ RENDER PRODUCT ============
  const renderProduct = (item: any) => {
    const inv = inventoryItems.find((i) => i.productId === item._id) ?? {};
    return (
      <View key={item._id} style={styles.productCard}>
        <Text style={styles.productName}>{item.name}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={String(inv.receivedQuantity ?? 0)}
            onChangeText={(text) =>
              updateField(item._id, 'receivedQuantity', parseInt(text) || 0)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Unit Price</Text>
          <TextInput
            style={styles.input}
            value={String(inv.unitPrice ?? item.price ?? 0)}
            onChangeText={(text) =>
              updateField(
                item._id,
                'unitPrice',
                parseFloat(text) || item.price || 0
              )
            }
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* <View style={styles.row}>
          <Text style={styles.label}>Batch No</Text>
          <TextInput
            style={styles.input}
            value={inv.batchNumber ?? ''}
            onChangeText={(text) => updateField(item._id, 'batchNumber', text)}
            placeholder="Batch #"
          />
        </View> */}

        {/* <View style={styles.row}>
          <Text style={styles.label}>Expiry</Text>
          <TextInput
            style={styles.input}
            value={inv.expiryDate ?? ''}
            onChangeText={(text) => updateField(item._id, 'expiryDate', text)}
            placeholder="YYYY-MM-DD"
          />
        </View> */}
      </View>
    );
  };

  // ============ LOADING ============
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate}>
        <ExpandableCalendar
          renderHeader={renderCustomHeader}
          hideArrows
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: COLORS.primary },
          }}
        />

        <ScrollView style={styles.scrollContent}>
          {/* VENDOR SECTION */}
          {vendor && (
            <View style={styles.card}>
              <View style={[styles.statusBorder, { backgroundColor: vendor.paymentStatus === 'paid' ? COLORS.success : vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error }]} />
              <View style={styles.cardContent}>
                <Text style={styles.customerName}>{vendor.name}</Text>
                <Text style={styles.customerInfo}>Vendor ID | {vendor._id}</Text>
                <Text style={styles.customerInfo}>Contact: {vendor.phone}</Text>
                {vendor.address && <Text style={styles.customerInfo}>{vendor.address.city}, {vendor.address.state}</Text>}
                <Text style={styles.vendorAmount}>₹{vendor.payableAmount?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: 
                  vendor.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
                  vendor.paymentStatus === 'partial' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
              }]}>
                <Text style={[styles.statusText, { 
                  color: 
                    vendor.paymentStatus === 'paid' ? COLORS.success :
                    vendor.paymentStatus === 'partial' ? COLORS.warning : COLORS.error
                }]}>
                  {vendor.paymentStatus?.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {/* BILL INFORMATION SECTION */}
          <View style={styles.billSection}>
            <Text style={styles.sectionTitle}>Bill Information</Text>
            
            <View style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bill Number</Text>
                <TextInput
                  style={styles.billInput}
                  value={billInfo.billNumber}
                  onChangeText={(text) => setBillInfo({...billInfo, billNumber: text})}
                  placeholder="Enter bill number"
                />
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bill Date</Text>
                <TextInput
                  style={styles.billInput}
                  value={billInfo.billDate}
                  onChangeText={(text) => setBillInfo({...billInfo, billDate: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Payment Ref</Text>
                <TextInput
                  style={styles.billInput}
                  value={billInfo.paymentRef}
                  onChangeText={(text) => setBillInfo({...billInfo, paymentRef: text})}
                  placeholder="Payment reference"
                />
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Payment Status</Text>
                <View style={styles.paymentStatusContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paymentStatusButton,
                      billInfo.paymentStatus === 'paid' && styles.paymentStatusButtonSelected
                    ]}
                    onPress={() => setBillInfo({
                      ...billInfo,
                      paymentStatus: 'paid',
                      amountPaid: inventoryItems.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0)
                    })}
                  >
                    <Text style={[
                      styles.paymentStatusText,
                      billInfo.paymentStatus === 'paid' && styles.paymentStatusTextSelected
                    ]}>Paid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentStatusButton,
                      billInfo.paymentStatus === 'partial' && styles.paymentStatusButtonSelected
                    ]}
                    onPress={() => setBillInfo({...billInfo, paymentStatus: 'partial'})}
                  >
                    <Text style={[
                      styles.paymentStatusText,
                      billInfo.paymentStatus === 'partial' && styles.paymentStatusTextSelected
                    ]}>Partial</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentStatusButton,
                      billInfo.paymentStatus === 'pending' && styles.paymentStatusButtonSelected
                    ]}
                    onPress={() => setBillInfo({...billInfo, paymentStatus: 'pending', amountPaid: 0})}
                  >
                    <Text style={[
                      styles.paymentStatusText,
                      billInfo.paymentStatus === 'pending' && styles.paymentStatusTextSelected
                    ]}>Pending</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {billInfo.paymentStatus === 'partial' && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Amount Paid</Text>
                  <TextInput
                    style={styles.billInput}
                    value={String(billInfo.amountPaid)}
                    onChangeText={(text) => setBillInfo({...billInfo, amountPaid: parseFloat(text) || 0})}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              )}

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Payment Method</Text>
                <TextInput
                  style={styles.billInput}
                  value={billInfo.paymentMethod}
                  onChangeText={(text) => setBillInfo({...billInfo, paymentMethod: text})}
                  placeholder="Cash, Bank Transfer, etc."
                />
              </View>

              {billInfo.paymentMethod.toLowerCase() !== 'cash' && billInfo.paymentMethod !== '' && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Transaction ID</Text>
                  <TextInput
                    style={styles.billInput}
                    value={billInfo.transactionId}
                    onChangeText={(text) => setBillInfo({...billInfo, transactionId: text})}
                    placeholder="Transaction ID"
                  />
                </View>
              )}

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Total Amount</Text>
                <Text style={styles.billValue}>
                  ₹{inventoryItems.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0).toFixed(2)}
                </Text>
              </View>

              {billInfo.paymentStatus !== 'paid' && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Due Amount</Text>
                  <Text style={styles.billValue}>
                    ₹{Math.max(0, 
                      inventoryItems.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0) - 
                      (billInfo.paymentStatus === 'partial' ? billInfo.amountPaid : 0)
                    ).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* PRODUCT SECTION */}
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>
              Receive Items ({products.length})
            </Text>
            {products.length > 0 ? (
              products.map((p) => renderProduct(p))
            ) : (
              <Text>No products found.</Text>
            )}
          </View>
        </ScrollView>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </CalendarProvider>
    </View>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  monthText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },

  scrollContent: { flex: 1 },
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
    marginHorizontal: 16,
    marginTop: 10,
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

  productSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },

  billSection: { padding: 16 },
  billCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  billRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 6,
    justifyContent: 'space-between'
  },
  billLabel: { width: 110, color: '#555', fontSize: 14, fontWeight: '500' },
  billInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  paymentStatusButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  paymentStatusButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#666',
  },
  paymentStatusTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  productCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 8,
  },
  productName: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  label: { width: 100, color: '#555', fontSize: 14 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 6,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
