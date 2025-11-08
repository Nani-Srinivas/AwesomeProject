import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, ScrollView, Modal, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { apiService } from '../../services/apiService';
import { Vendor } from '../../types/Vendor';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

type PayablesScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Payables'>;

interface ExtendedVendor extends Vendor {
  paymentStatus: 'paid' | 'partial' | 'pending';
  payableAmount: number;
}

const PayablesScreen = () => {
  const navigation = useNavigation<PayablesScreenNavigationProp>();
  const [vendors, setVendors] = useState<ExtendedVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<ExtendedVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddVendorModalVisible, setAddVendorModalVisible] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    contactPerson: { name: '', phone: '', email: '' },
    paymentTerms: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    loadVendorsAndPayables();
  }, []);

  useEffect(() => {
    // Filter vendors based on search query
    if (searchQuery) {
      const filtered = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phone.includes(searchQuery) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchQuery, vendors]);

  const loadVendorsAndPayables = async () => {
    try {
      setLoading(true);
      
      // First, get all vendors
      const vendorsResponse = await apiService.get('/vendors');
      const vendorsData: Vendor[] = vendorsResponse.data.data || [];
      
      // Then, get all inventory receipts to calculate payables
      const receiptsResponse = await apiService.get('/inventory/receipts');
      const receipts = receiptsResponse.data.data || [];
      
      // Calculate payable amounts for each vendor
      const extendedVendors: ExtendedVendor[] = vendorsData.map(vendor => {
        // Get receipts for this vendor
        const vendorReceipts = receipts.filter(
          (receipt: any) => receipt.vendorId._id === vendor._id
        );
        
        // Calculate total amount and paid amount
        const totalAmount = vendorReceipts.reduce(
          (sum: number, receipt: any) => sum + (receipt.totalAmount || 0),
          0
        );
        
        const paidAmount = vendorReceipts.reduce(
          (sum: number, receipt: any) => sum + (receipt.amountPaid || 0),
          0
        );
        
        const payableAmount = totalAmount - paidAmount;
        
        // Determine payment status
        let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid';
        if (payableAmount > 0 && paidAmount > 0) {
          paymentStatus = 'partial';
        } else if (payableAmount > 0) {
          paymentStatus = 'pending';
        }
        
        return {
          ...vendor,
          payableAmount,
          paymentStatus,
        };
      });
      
      setVendors(extendedVendors);
      setFilteredVendors(extendedVendors);
    } catch (error) {
      console.error('Error loading vendors and payables:', error);
      // In a real app, you might want to show an error message
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendorsAndPayables();
    setRefreshing(false);
  };

  const handleVendorPress = (vendor: ExtendedVendor) => {
    // Navigate to vendor details screen
    // For now, we'll just log the vendor ID
    console.log('Vendor pressed:', vendor._id);
  };

  useEffect(() => {
    if (isAddVendorModalVisible) {
      // Reset form when modal opens
      setNewVendor({
        name: '',
        phone: '',
        email: '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        contactPerson: { name: '', phone: '', email: '' },
        paymentTerms: '',
        notes: '',
      });
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    } else {
      Animated.timing(slideAnim, { 
        toValue: Dimensions.get('window').height, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    }
  }, [isAddVendorModalVisible, slideAnim]);

  const handleAddVendor = () => {
    setAddVendorModalVisible(true);
  };

  const handleSaveVendor = async () => {
    if (!newVendor.name || !newVendor.phone) {
      Alert.alert('Error', 'Name and phone are required fields');
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiService.post('/vendors', newVendor);

      if (response.data.success) {
        // Add the new vendor to the list
        const totalAmount = 0; // New vendor has no receipts yet
        const newExtendedVendor: ExtendedVendor = {
          ...response.data.data,
          payableAmount: totalAmount,
          paymentStatus: 'paid', // New vendor has no outstanding payments
        };

        setVendors(prev => [newExtendedVendor, ...prev]);
        setFilteredVendors(prev => [newExtendedVendor, ...prev]);
        setAddVendorModalVisible(false);
        Alert.alert('Success', `Vendor "${response.data.data.name}" has been added.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add vendor.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while adding the vendor.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAddVendorModal = () => (
    <Modal
      transparent={true}
      visible={isAddVendorModalVisible}
      onRequestClose={() => setAddVendorModalVisible(false)}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={() => setAddVendorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.modalTitle}>Add New Vendor</Text>
            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vendor Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newVendor.name}
                  onChangeText={(text) => setNewVendor({...newVendor, name: text})}
                  placeholder="Enter vendor name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone *</Text>
                <TextInput
                  style={styles.input}
                  value={newVendor.phone}
                  onChangeText={(text) => setNewVendor({...newVendor, phone: text})}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newVendor.email}
                  onChangeText={(text) => setNewVendor({...newVendor, email: text})}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>
              
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={newVendor.address.street}
                  onChangeText={(text) => setNewVendor({
                    ...newVendor, 
                    address: {...newVendor.address, street: text}
                  })}
                  placeholder="Street"
                />
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.address.city}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      address: {...newVendor.address, city: text}
                    })}
                    placeholder="City"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.address.state}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      address: {...newVendor.address, state: text}
                    })}
                    placeholder="State"
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.address.zip}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      address: {...newVendor.address, zip: text}
                    })}
                    placeholder="ZIP Code"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.address.country}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      address: {...newVendor.address, country: text}
                    })}
                    placeholder="Country"
                  />
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Contact Person</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={newVendor.contactPerson.name}
                  onChangeText={(text) => setNewVendor({
                    ...newVendor, 
                    contactPerson: {...newVendor.contactPerson, name: text}
                  })}
                  placeholder="Contact person name"
                />
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.contactPerson.phone}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      contactPerson: {...newVendor.contactPerson, phone: text}
                    })}
                    placeholder="Contact phone"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    value={newVendor.contactPerson.email}
                    onChangeText={(text) => setNewVendor({
                      ...newVendor, 
                      contactPerson: {...newVendor.contactPerson, email: text}
                    })}
                    placeholder="Contact email"
                    keyboardType="email-address"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Terms</Text>
                <TextInput
                  style={styles.input}
                  value={newVendor.paymentTerms}
                  onChangeText={(text) => setNewVendor({...newVendor, paymentTerms: text})}
                  placeholder="Payment terms (e.g. Net 30, Cash on Delivery)"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newVendor.notes}
                  onChangeText={(text) => setNewVendor({...newVendor, notes: text})}
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setAddVendorModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveVendor}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Vendor'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

    const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case 'partial':
        return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
      case 'pending':
        return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      default:
        return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    }
  };

  const VendorCard = ({ vendor, onPress }: { vendor: ExtendedVendor, onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(vendor.paymentStatus).color }]} />
      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{vendor.name}</Text>
        <Text style={styles.customerInfo}>Vendor ID | {vendor._id}</Text>
        <Text style={styles.customerInfo}>Contact: {vendor.phone}</Text>
        {vendor.address && <Text style={styles.customerInfo}>{vendor.address.city}, {vendor.address.state}</Text>}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(vendor.paymentStatus).backgroundColor }]}>
        <Text style={[styles.statusText, { color: getStatusStyle(vendor.paymentStatus).color }]}>
          {vendor.paymentStatus?.toUpperCase()}
        </Text>
      </View>
      <View style={styles.vendorStatus}>
        <Text style={styles.vendorAmount}>₹{vendor.payableAmount?.toFixed(2) || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderVendor = ({ item }: { item: ExtendedVendor }) => (
    <VendorCard vendor={item} onPress={() => handleVendorPress(item)} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E73B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredVendors}
        renderItem={renderVendor}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vendors found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }} // Make space for FAB
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddVendor}
      >
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {isAddVendorModalVisible && renderAddVendorModal()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
    marginLeft: 15,
  },
  vendorStatus: {
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 16,
    right: 70, // Positioned left of the status badge
  },
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContainer: { 
    backgroundColor: COLORS.white, 
    width: '100%', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    paddingHorizontal: 20, 
    minHeight: Dimensions.get('window').height * 0.6, // Minimum 60% of screen
    maxHeight: Dimensions.get('window').height * 0.9, // Maximum 90% of screen
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 10,
  },
  formContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 200, // Increased padding to account for the button container
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#1E73B8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PayablesScreen;