import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

export function AddStockScreen({ route, navigation }: any) {
  const { vendorId } = route.params || {};
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New state for duplicate check and viewing existing receipts
  const [existingReceipt, setExistingReceipt] = useState<any>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);

  // Refs for keyboard navigation
  const inputRefs = useRef<{ [key: string]: { price: any; qty: any } }>({});

  const [billInfo, setBillInfo] = useState({
    billNumber: '',
    billDate: selectedDate,
    paymentRef: '',
    paymentStatus: 'pending' as 'paid' | 'partial' | 'pending',
    amountPaid: 0,
    paymentMethod: 'cash' as 'cash' | 'bank' | 'card' | 'cheque' | 'credit',
    transactionId: '',
  });

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer / UPI' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'credit', label: 'Credit (Pay Later)' },
  ];

  // ============ FETCH DATA ============
  useEffect(() => {
    if (vendorId) {
      loadVendorAndProducts();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No vendor selected');
    }
  }, [vendorId]);

  useEffect(() => {
    // Update bill date when selected date changes
    setBillInfo(prevBillInfo => ({
      ...prevBillInfo,
      billDate: selectedDate
    }));
  }, [selectedDate]);

  useEffect(() => {
    if (vendor?._id && selectedDate) {
      checkDuplicateStock();
    }
  }, [vendor, selectedDate]);

  const checkDuplicateStock = async () => {
    try {
      if (!vendor?._id || !selectedDate) return;

      setCheckingDuplicate(true);
      setExistingReceipt(null);
      setIsEditing(false);

      // Create start and end date for the selected day
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      console.log('Checking duplicate for:', {
        vendorId: vendor._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await apiService.get('/inventory/receipts', {
        vendorId: vendor._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      console.log('Duplicate check response:', response.data);

      if (response.data.success && response.data.data.length > 0) {
        const receipt = response.data.data[0];
        console.log('Duplicate found:', receipt);
        setExistingReceipt(receipt);

        // Populate Bill Info
        setBillInfo({
          billNumber: receipt.receiptNumber || '', // Or receipt.billNumber if available in your schema/response
          billDate: receipt.receivedDate ? receipt.receivedDate.split('T')[0] : selectedDate,
          paymentRef: receipt.notes ? receipt.notes.split('Payment Ref: ')[1] || '' : '',
          paymentStatus: receipt.paymentStatus,
          amountPaid: receipt.amountPaid,
          paymentMethod: receipt.paymentMethod || 'cash',
          transactionId: receipt.transactionId || '',
        });

        // Populate Inventory Items (to show in summary)
        if (receipt.items && receipt.items.length > 0) {
          setInventoryItems(prevItems => prevItems.map(item => {
            const foundItem = receipt.items.find((rItem: any) =>
              (rItem.storeProductId._id || rItem.storeProductId) === item.productId
            );
            if (foundItem) {
              return {
                ...item,
                receivedQuantity: foundItem.receivedQuantity,
                unitPrice: foundItem.unitPrice
              };
            }
            return item;
          }));
        }
      } else {
        console.log('No duplicate found');
        // Reset for new entry
        setInventoryItems(prevItems => prevItems.map(item => ({
          ...item,
          receivedQuantity: 0,
          unitPrice: item.unitPrice
        })));
        setBillInfo(prevBillInfo => ({
          ...prevBillInfo,
          billNumber: '',
          paymentRef: '',
          paymentStatus: 'pending',
          amountPaid: 0,
          paymentMethod: 'cash',
          transactionId: '',
        }));
      }
    } catch (error) {
      console.error('Error checking duplicate stock:', error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

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
          unitPrice: p.costPrice ?? p.price ?? 0,
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

  // ============ SUBMIT & UPDATE ============
  const handleSubmit = async () => {
    try {
      // Validate products
      const itemsToSubmit = inventoryItems
        .filter(item => item.receivedQuantity > 0)
        .map(item => ({
          storeProductId: item.productId,
          receivedQuantity: item.receivedQuantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        }));

      if (itemsToSubmit.length === 0) {
        Alert.alert('No Products', 'Please enter quantity for at least one product');
        return;
      }

      setSubmitting(true);
      const totalAmount = itemsToSubmit.reduce((sum, item) => sum + (item.receivedQuantity * (item.unitPrice || 0)), 0);

      const response = await apiService.post('/inventory/receipts', {
        vendorId: vendor._id,
        receivedDate: selectedDate,
        items: itemsToSubmit,
        totalAmount: totalAmount,
        paymentStatus: 'pending', // Always pending on initial submission
        amountPaid: 0,
        paymentMethod: 'cash',
        notes: billInfo.billNumber ? `Bill: ${billInfo.billNumber}` : ''
      });

      if (response.data.success) {
        Alert.alert('Success', 'Stock saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Refresh to show the newly created receipt
              checkDuplicateStock();
            }
          }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!existingReceipt?._id) return;

    try {
      setSubmitting(true);

      const totalAmount = inventoryItems
        .filter(item => item.receivedQuantity > 0)
        .reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);

      const paymentStatus = billInfo.paymentStatus;
      const amountPaid = paymentStatus === 'paid' ? totalAmount :
        paymentStatus === 'partial' ? billInfo.amountPaid : 0;

      const response = await apiService.put(`/inventory/receipts/${existingReceipt._id}`, {
        paymentStatus: paymentStatus,
        amountPaid: amountPaid,
        paymentMethod: billInfo.paymentMethod,
        transactionId: billInfo.transactionId,
        notes: `Bill: ${billInfo.billNumber}, Payment Ref: ${billInfo.paymentRef}`
      });

      if (response.data.success) {
        Alert.alert('Success', 'Payment updated successfully');
        setIsEditing(false);
        setExistingReceipt(response.data.data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!existingReceipt?._id) return;

    try {
      setSubmitting(true);

      const itemsToSubmit = inventoryItems
        .filter(item => item.receivedQuantity > 0)
        .map(item => ({
          storeProductId: item.productId,
          receivedQuantity: item.receivedQuantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        }));

      const totalAmount = itemsToSubmit.reduce((sum, item) => sum + (item.receivedQuantity * (item.unitPrice || 0)), 0);

      const paymentStatus = billInfo.paymentStatus;
      const amountPaid = paymentStatus === 'paid' ? totalAmount :
        paymentStatus === 'partial' ? billInfo.amountPaid : 0;

      const response = await apiService.put(`/inventory/receipts/${existingReceipt._id}`, {
        items: itemsToSubmit,
        totalAmount: totalAmount,
        paymentStatus: paymentStatus,
        amountPaid: amountPaid,
        paymentMethod: billInfo.paymentMethod,
        transactionId: billInfo.transactionId,
        notes: `Bill: ${billInfo.billNumber}, Payment Ref: ${billInfo.paymentRef}`
      });

      if (response.data.success) {
        Alert.alert('Success', 'Stock updated successfully');
        setIsEditing(false);
        setExistingReceipt(response.data.data);
        checkDuplicateStock();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleMarkAsPaid = () => {
    const totalAmount = inventoryItems
      .filter(item => item.receivedQuantity > 0)
      .reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);

    Alert.alert(
      'Confirm Payment',
      `Mark this stock receipt as PAID?\n\nTotal Amount: ₹${totalAmount.toFixed(2)}\nVendor: ${vendor?.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm Payment',
          onPress: async () => {
            try {
              setSubmitting(true);
              const response = await apiService.put(`/inventory/receipts/${existingReceipt._id}`, {
                paymentStatus: 'paid',
                amountPaid: totalAmount,
                paymentMethod: billInfo.paymentMethod,
                transactionId: billInfo.transactionId,
              });

              if (response.data.success) {
                Alert.alert('Success', 'Payment marked as PAID! ✓');
                setBillInfo({
                  ...billInfo,
                  paymentStatus: 'paid',
                  amountPaid: totalAmount
                });
                setExistingReceipt(response.data.data);
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update payment');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
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
          <Feather name="calendar" size={24} color="#1E73B8" />
          <Text style={styles.monthText}>{`${month} ${year}`}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Feather name="chevron-left" size={24} color="#1E73B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Feather name="chevron-right" size={24} color="#1E73B8" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============ RENDER PRODUCT ============
  const renderProduct = (item: any, index: number) => {
    const inv = inventoryItems.find((i) => i.productId === item._id) || {};
    const nextProduct = products[index + 1];

    return (
      <View key={item._id} style={styles.productRow}>
        <Image
          source={
            item.images && item.images.length > 0
              ? { uri: item.images[0] }
              : require('../../assets/products/1.png') // Fallback image
          }
          style={styles.productImage}
        />
        <Text style={styles.productNameCompact}>{item.name}</Text>
        <View style={styles.inputsRow}>
          <TextInput
            ref={(ref) => {
              if (!inputRefs.current[item._id]) {
                inputRefs.current[item._id] = { price: null, qty: null };
              }
              inputRefs.current[item._id].price = ref;
            }}
            style={styles.compactInput}
            value={String(inv.unitPrice ?? item.costPrice ?? 0)}
            onChangeText={(text) =>
              updateField(
                item._id,
                'unitPrice',
                parseFloat(text) || item.costPrice || 0
              )
            }
            keyboardType="decimal-pad"
            placeholder="CP"
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus quantity input for this product
              inputRefs.current[item._id]?.qty?.focus();
            }}
            blurOnSubmit={false}
          />
          <TextInput
            ref={(ref) => {
              if (!inputRefs.current[item._id]) {
                inputRefs.current[item._id] = { price: null, qty: null };
              }
              inputRefs.current[item._id].qty = ref;
            }}
            style={styles.compactInput}
            value={String(inv.receivedQuantity ?? 0)}
            onChangeText={(text) =>
              updateField(item._id, 'receivedQuantity', parseInt(text) || 0)
            }
            keyboardType="numeric"
            placeholder="Qty"
            returnKeyType={nextProduct ? "next" : "done"}
            onSubmitEditing={() => {
              // Focus price input of next product if exists
              if (nextProduct) {
                inputRefs.current[nextProduct._id]?.price?.focus();
              }
            }}
            blurOnSubmit={!nextProduct}
          />
        </View>
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
          theme={{
            selectedDayBackgroundColor: COLORS.primary,
            todayTextColor: COLORS.primary,
            arrowColor: COLORS.primary,
          }}
        />

        <ScrollView style={styles.scrollContent}>
          {/* VENDOR & RECEIPT INFO HEADER */}
          {!existingReceipt || isEditing ? (
            /* NEW STOCK ENTRY OR EDIT MODE - Simple Header */
            <View style={styles.infoHeader}>
              <View style={styles.infoRow}>
                <Feather name="user" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>{isEditing ? 'Editing Stock for:' : 'Adding Stock for:'}</Text>
                <Text style={styles.infoValue}>{vendor?.name || 'Vendor'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{selectedDate}</Text>
              </View>
            </View>
          ) : (
            /* EXISTING RECEIPT - Card Style */
            <View style={styles.receiptCard}>
              <View style={[
                styles.receiptStatusBorder,
                billInfo.paymentStatus === 'paid' && { backgroundColor: '#4CAF50' },
                billInfo.paymentStatus === 'partial' && { backgroundColor: '#FF9800' },
                billInfo.paymentStatus === 'pending' && { backgroundColor: '#9E9E9E' },
              ]} />

              <View style={styles.receiptCardContent}>
                <Text style={styles.receiptVendorName}>{vendor?.name || 'Vendor'}</Text>
                <Text style={styles.receiptMetaText}>Receipt # {existingReceipt?.receiptNumber || 'N/A'}</Text>
                {billInfo.billNumber && (
                  <Text style={styles.receiptMetaText}>Bill # {billInfo.billNumber}</Text>
                )}
                <Text style={styles.receiptMetaText}>
                  Date: {existingReceipt?.receivedDate ? new Date(existingReceipt.receivedDate).toLocaleDateString() : selectedDate}
                </Text>
                <Text style={styles.receiptMetaText}>
                  Amount: ₹{inventoryItems.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0).toFixed(2)}
                </Text>
              </View>

              {/* Status Badge - Top Right */}
              <View style={[
                styles.receiptCardStatusBadge,
                billInfo.paymentStatus === 'paid' && styles.receiptCardStatusBadgePaid,
                billInfo.paymentStatus === 'partial' && styles.receiptCardStatusBadgePartial,
                billInfo.paymentStatus === 'pending' && styles.receiptCardStatusBadgePending,
              ]}>
                <Text style={[
                  styles.receiptCardStatusText,
                  {
                    color: billInfo.paymentStatus === 'paid' ? '#4CAF50' :
                      billInfo.paymentStatus === 'partial' ? '#FF9800' : '#9E9E9E'
                  }
                ]}>
                  {billInfo.paymentStatus === 'paid' ? 'PAID' :
                    billInfo.paymentStatus === 'partial' ? 'PARTIAL' : 'PENDING'}
                </Text>
              </View>
            </View>
          )}

          {!existingReceipt ? (
            /* NEW STOCK ENTRY */
            <View style={styles.productSection}>
              {/* Header Row */}
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Product</Text>
                <View style={styles.headerInputs}>
                  <Text style={styles.headerLabel}>CP</Text>
                  <Text style={styles.headerLabel}>Qty</Text>
                </View>
              </View>

              {products.length > 0 ? (
                products.map((p, index) => renderProduct(p, index))
              ) : (
                <Text>No products found.</Text>
              )}
            </View>
          ) : (
            /* EXISTING RECEIPT VIEW */
            <>
              {/* Product Summary or Editable List */}
              {isEditing ? (
                /* EDITABLE PRODUCT LIST */
                <View style={styles.productSection}>
                  <Text style={styles.sectionTitle}>Edit Products</Text>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <Text style={styles.headerText}>Product</Text>
                    <View style={styles.headerInputs}>
                      <Text style={styles.headerLabel}>CP</Text>
                      <Text style={styles.headerLabel}>Qty</Text>
                    </View>
                  </View>

                  {products.length > 0 ? (
                    products.map((p, index) => renderProduct(p, index))
                  ) : (
                    <Text>No products found.</Text>
                  )}
                </View>
              ) : (
                /* READ-ONLY PRODUCT SUMMARY */
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>Products Summary</Text>
                  <View style={styles.summaryCard}>
                    {inventoryItems.filter(item => item.receivedQuantity > 0).map((item) => {
                      const product = products.find(p => p._id === item.productId);
                      return (
                        <View key={item.productId} style={styles.summaryRow}>
                          <Text style={styles.summaryProductName}>{product?.name || 'Product'}</Text>
                          <Text style={styles.summaryQuantity}>{item.receivedQuantity} × ₹{item.unitPrice}</Text>
                          <Text style={styles.summaryTotal}>₹{(item.receivedQuantity * item.unitPrice).toFixed(2)}</Text>
                        </View>
                      );
                    })}
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                      <Text style={styles.summaryTotalValue}>
                        ₹{inventoryItems.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Payment Information */}
              <View style={styles.billSection}>
                <Text style={styles.sectionTitle}>Payment Information</Text>

                <View style={styles.billCard}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Payment Status</Text>
                    <View style={styles.paymentStatusContainer}>
                      {['pending', 'partial', 'paid'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.paymentStatusButton,
                            billInfo.paymentStatus === status && styles.paymentStatusButtonSelected,
                            !isEditing && { opacity: 0.6 }
                          ]}
                          onPress={() => isEditing && setBillInfo({ ...billInfo, paymentStatus: status as any })}
                          disabled={!isEditing}
                        >
                          <Text style={[
                            styles.paymentStatusText,
                            billInfo.paymentStatus === status && styles.paymentStatusTextSelected
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {billInfo.paymentStatus === 'partial' && (
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Amount Paid</Text>
                      <TextInput
                        style={[styles.billInput, !isEditing && styles.disabledInput]}
                        value={String(billInfo.amountPaid)}
                        onChangeText={(text) => setBillInfo({ ...billInfo, amountPaid: parseFloat(text) || 0 })}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        editable={isEditing}
                      />
                    </View>
                  )}

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Payment Method</Text>
                    <TouchableOpacity
                      style={[styles.dropdownButton, !isEditing && styles.disabledInput]}
                      onPress={() => isEditing && setPaymentMethodModalVisible(true)}
                      disabled={!isEditing}
                    >
                      <Text style={styles.dropdownText}>
                        {paymentMethods.find(m => m.value === billInfo.paymentMethod)?.label || 'Select Method'}
                      </Text>
                      <Feather name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {billInfo.paymentMethod !== 'cash' && billInfo.paymentMethod !== 'credit' && (
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Transaction ID</Text>
                      <TextInput
                        style={[styles.billInput, !isEditing && styles.disabledInput]}
                        value={billInfo.transactionId}
                        onChangeText={(text) => setBillInfo({ ...billInfo, transactionId: text })}
                        placeholder="Transaction ID"
                        editable={isEditing}
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

                  {/* Mark as Paid Button - Inside Card */}
                  {!isEditing && (billInfo.paymentStatus === 'pending' || billInfo.paymentStatus === 'partial') && (
                    <TouchableOpacity
                      style={styles.markPaidButton}
                      onPress={handleMarkAsPaid}
                    >
                      <Feather name="check-circle" size={18} color="#fff" />
                      <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          {!existingReceipt ? (
            /* NEW STOCK - Save Button */
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Save Stock</Text>
              )}
            </TouchableOpacity>
          ) : (
            /* EXISTING RECEIPT - Edit/Update/Close Buttons */
            <>
              {isEditing ? (
                /* EDITING MODE */
                <>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Feather name="x" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.continueButton, submitting && { opacity: 0.6 }]}
                    onPress={handleUpdate}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.continueButtonText}>Update</Text>
                        <Feather name="check" size={20} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                /* VIEW MODE */
                <>
                  <TouchableOpacity style={styles.backButton} onPress={handleEdit}>
                    <Feather name="edit-2" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.continueButton} onPress={handleFinish}>
                    <Text style={styles.continueButtonText}>Close</Text>
                    <Feather name="x" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        {/* Payment Method Modal */}
        <Modal
          visible={paymentMethodModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPaymentMethodModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setPaymentMethodModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Payment Method</Text>
                <TouchableOpacity onPress={() => setPaymentMethodModalVisible(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.modalOption,
                      billInfo.paymentMethod === method.value && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setBillInfo({ ...billInfo, paymentMethod: method.value as any });
                      setPaymentMethodModalVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      billInfo.paymentMethod === method.value && styles.modalOptionTextSelected
                    ]}>
                      {method.label}
                    </Text>
                    {billInfo.paymentMethod === method.value && (
                      <Feather name="check" size={20} color="#1E73B8" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </CalendarProvider>
    </View >
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
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

  productSection: {
    padding: 0,
    paddingTop: 8,
  },

  // Flat Header Row (Clean Labels)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Standard padding
    paddingVertical: 12,
    backgroundColor: '#F5F7FA', // Light background for header
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#95A5A6',
    flex: 1,
    marginRight: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#95A5A6',
    width: 75,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Modern Product Row (Full Width)
  productRow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productNameCompact: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    color: '#1A202C',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  compactInput: {
    width: 75,
    height: 42,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A202C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    marginTop: 8,
  },
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
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#555',
  },

  buttonContainer: {
    padding: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },

  // Summary Section
  summarySection: {
    padding: 16,
    paddingBottom: 0,
  },
  summaryCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  summaryProductName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  summaryQuantity: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    marginRight: 10,
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 70,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.primary + '20',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Dropdown styles
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#1E73B8',
    fontWeight: '600',
  },

  // Info Header Styles
  infoHeader: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Receipt Header Styles
  receiptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  // statusBadge: {
  //   paddingVertical: 4,
  //   paddingHorizontal: 12,
  //   borderRadius: 12,
  // },
  statusBadgePaid: {
    backgroundColor: '#4CAF50',
  },
  statusBadgePartial: {
    backgroundColor: '#FF9800',
  },
  statusBadgePending: {
    backgroundColor: '#9E9E9E',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Receipt Metadata Styles
  receiptMetadata: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metadataLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  // Receipt Card Styles (Card Design)
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  receiptStatusBorder: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 16,
  },
  receiptCardContent: {
    flex: 1,
  },
  receiptVendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginBottom: 4,
    marginRight: 80, // Space for badge
  },
  receiptMetaText: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  receiptCardStatusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  receiptCardStatusBadgePaid: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  receiptCardStatusBadgePartial: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  receiptCardStatusBadgePending: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
  },
  receiptCardStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  markPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  markPaidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
});