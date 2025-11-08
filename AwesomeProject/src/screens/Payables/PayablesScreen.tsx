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
  const [isEditVendorModalVisible, setEditVendorModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ExtendedVendor | null>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    contactPerson: { name: '', phone: '', email: '' },
    paymentTerms: '',
    notes: '',
  });
  const [storeCategories, setStoreCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
    if (isAddVendorModalVisible || isEditVendorModalVisible) {
      // Load store categories
      loadStoreCategories();
      
      // If editing, we'll set the selected categories based on the vendor's assigned categories
      if (isEditVendorModalVisible && editingVendor) {
        // Set the selected categories to match the current vendor's assignments
        if (editingVendor.assignedCategories) {
          setSelectedCategories(editingVendor.assignedCategories.map((cat: any) => cat._id || cat));
        } else {
          setSelectedCategories([]);
        }
      } else if (isAddVendorModalVisible) {
        // Reset form and categories for adding new vendor
        setNewVendor({
          name: '',
          phone: '',
          email: '',
          address: { street: '', city: '', state: '', zip: '', country: '' },
          contactPerson: { name: '', phone: '', email: '' },
          paymentTerms: '',
          notes: '',
        });
        setSelectedCategories([]);
      }
      
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
  }, [isAddVendorModalVisible, isEditVendorModalVisible, editingVendor, slideAnim]);

  const loadStoreCategories = async () => {
    try {
      const response = await apiService.get('/product/store-categories');
      if (response.data.success) {
        let availableCategories;
        
        if (isEditVendorModalVisible && editingVendor) {
          // If we're editing a vendor, show categories assigned to this vendor plus unassigned ones
          availableCategories = response.data.data.filter(
            (category: any) => !category.vendorId || category.vendorId === editingVendor._id
          );
        } else {
          // If we're adding a new vendor, only show unassigned categories
          availableCategories = response.data.data.filter(
            (category: any) => !category.vendorId
          );
        }
        
        setStoreCategories(availableCategories);
      } else {
        console.error('Failed to load store categories:', response.data.message);
        setStoreCategories([]);
      }
    } catch (error) {
      console.error('Error loading store categories:', error);
      setStoreCategories([]);
    }
  };

  const updateStoreCategoriesWithVendor = async (vendorId: string, categoryIds: string[]): Promise<boolean> => {
    try {
      // Update each selected category with the vendorId
      for (const categoryId of categoryIds) {
        const response = await apiService.put(`/product/store-categories/${categoryId}`, {
          vendorId: vendorId
        });
        
        // Check if the update was successful
        if (!response.data.success) {
          console.error('Failed to update category:', categoryId, response.data.message);
          return false;
        }
      }
      return true; // All updates successful
    } catch (error: any) {
      console.error('Error updating store categories with vendor:', error);
      // Don't alert here as the calling function handles error messaging
      return false;
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleEditVendor = (vendor: ExtendedVendor) => {
    // Load vendor data into form
    setNewVendor({
      name: vendor.name,
      phone: vendor.phone,
      email: vendor.email || '',
      address: vendor.address || { street: '', city: '', state: '', zip: '', country: '' },
      contactPerson: vendor.contactPerson || { name: '', phone: '', email: '' },
      paymentTerms: vendor.paymentTerms || '',
      notes: vendor.notes || '',
    });
    setEditingVendor(vendor);
    setAddVendorModalVisible(false); // Close add modal if open
    setEditVendorModalVisible(true); // Open edit modal
  };

  const handleToggleVendorStatus = async (vendor: ExtendedVendor) => {
    // Ask user for confirmation
    const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
    const action = vendor.status === 'active' ? 'deactivate' : 'activate';
    
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} vendor "${vendor.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await apiService.put(`/vendors/${vendor._id}/status`, {
                status: newStatus
              });
              
              if (response.data.success) {
                // Update the vendor in the list
                const updatedVendor = {
                  ...vendor,
                  status: newStatus
                };

                setVendors(prev => prev.map(v => v._id === vendor._id ? updatedVendor : v));
                setFilteredVendors(prev => prev.map(v => v._id === vendor._id ? updatedVendor : v));
                
                Alert.alert('Success', `Vendor "${vendor.name}" has been ${action}d.`);
              } else {
                Alert.alert('Error', response.data.message || `Failed to ${action} vendor.`);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || `An error occurred while trying to ${action} the vendor.`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteVendor = (vendor: ExtendedVendor) => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`,
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
              const response = await apiService.delete(`/vendors/${vendor._id}`);
              if (response.data.success) {
                // Remove from the list
                setVendors(prev => prev.filter((v: ExtendedVendor) => v._id !== vendor._id));
                setFilteredVendors(prev => prev.filter((v: ExtendedVendor) => v._id !== vendor._id));
                Alert.alert('Success', `Vendor "${vendor.name}" has been deleted.`);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete vendor.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred while deleting the vendor.');
            }
          },
        },
      ]
    );
  };

  const handleEditSave = async () => {
    if (!editingVendor || !newVendor.name || !newVendor.phone) {
      Alert.alert('Error', 'Name and phone are required fields');
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiService.put(`/vendors/${editingVendor._id}`, newVendor);

      if (response.data.success) {
        // Update the vendor in the list
        const updatedVendor: ExtendedVendor = {
          ...response.data.data,
          payableAmount: editingVendor.payableAmount,
          paymentStatus: editingVendor.paymentStatus,
        };

        setVendors(prev => prev.map(v => v._id === editingVendor._id ? updatedVendor : v));
        setFilteredVendors(prev => prev.map(v => v._id === editingVendor._id ? updatedVendor : v));
        
        setEditVendorModalVisible(false);
        setEditingVendor(null);
        Alert.alert('Success', `Vendor "${response.data.data.name}" has been updated.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update vendor.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while updating the vendor.');
    } finally {
      setIsSaving(false);
    }
  };

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
      
      // Include the selected categories in the vendor creation request
      const vendorData = {
        ...newVendor,
        assignedCategories: selectedCategories
      };
      
      const response = await apiService.post('/vendors', vendorData);

      if (response.data.success) {
        // If categories were selected, try to update them with the new vendorId
        if (selectedCategories.length > 0) {
          const categoryUpdateSuccess = await updateStoreCategoriesWithVendor(response.data.data._id, selectedCategories);
          
          // Only show success message if both vendor creation and category updates succeed
          if (categoryUpdateSuccess) {
            Alert.alert('Success', `Vendor "${response.data.data.name}" has been added and assigned to ${selectedCategories.length} categories.`);
          } else {
            // Show partial success message if category updates failed
            Alert.alert(
              'Partial Success', 
              `Vendor "${response.data.data.name}" has been added, but failed to assign to categories. Please assign categories manually later.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Continue with adding vendor to the list even if category assignment failed
                    const totalAmount = 0; // New vendor has no receipts yet
                    const newExtendedVendor: ExtendedVendor = {
                      ...response.data.data,
                      payableAmount: totalAmount,
                      paymentStatus: 'paid', // New vendor has no outstanding payments
                    };

                    setVendors(prev => [newExtendedVendor, ...prev]);
                    setFilteredVendors(prev => [newExtendedVendor, ...prev]);
                    setAddVendorModalVisible(false);
                  }
                }
              ]
            );
            return; // Don't continue with normal success flow
          }
        } else {
          Alert.alert('Success', `Vendor "${response.data.data.name}" has been added.`);
        }

        // Add the new vendor to the list (only if we didn't return early due to category assignment failure)
        const totalAmount = 0; // New vendor has no receipts yet
        const newExtendedVendor: ExtendedVendor = {
          ...response.data.data,
          payableAmount: totalAmount,
          paymentStatus: 'paid', // New vendor has no outstanding payments
        };

        setVendors(prev => [newExtendedVendor, ...prev]);
        setFilteredVendors(prev => [newExtendedVendor, ...prev]);
        setAddVendorModalVisible(false);
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
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assign to Store Categories</Text>
                <Text style={styles.helperText}>Select the categories this delivery agent will supply</Text>
                {storeCategories.length > 0 ? (
                  storeCategories.map((category) => (
                    <TouchableOpacity
                      key={category._id}
                      style={[
                        styles.categoryOption,
                        selectedCategories.includes(category._id) && styles.categoryOptionSelected
                      ]}
                      onPress={() => toggleCategorySelection(category._id)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategories.includes(category._id) && styles.categoryTextSelected
                      ]}>
                        {category.name}
                      </Text>
                      {selectedCategories.includes(category._id) && (
                        <Feather name="check" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noCategoriesText}>No store categories found</Text>
                )}
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

  const renderEditVendorModal = () => (
    <Modal
      transparent={true}
      visible={isEditVendorModalVisible}
      onRequestClose={() => setEditVendorModalVisible(false)}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={() => setEditVendorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.modalTitle}>Edit Vendor</Text>
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
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assign to Store Categories</Text>
                <Text style={styles.helperText}>Select the categories this delivery agent will supply</Text>
                {storeCategories.length > 0 ? (
                  storeCategories.map((category) => (
                    <TouchableOpacity
                      key={category._id}
                      style={[
                        styles.categoryOption,
                        selectedCategories.includes(category._id) && styles.categoryOptionSelected
                      ]}
                      onPress={() => toggleCategorySelection(category._id)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategories.includes(category._id) && styles.categoryTextSelected
                      ]}>
                        {category.name}
                      </Text>
                      {selectedCategories.includes(category._id) && (
                        <Feather name="check" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noCategoriesText}>No store categories found</Text>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditVendorModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleEditSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Update Vendor'}
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
        {/* Price on the left side below other info */}
        <Text style={styles.vendorAmount}>₹{vendor.payableAmount?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(vendor.paymentStatus).backgroundColor }]}>
        <Text style={[styles.statusText, { color: getStatusStyle(vendor.paymentStatus).color }]}>
          {vendor.paymentStatus?.toUpperCase()}
        </Text>
      </View>
      <View style={[styles.vendorStatusBadge, { 
        backgroundColor: vendor.status === 'active' ? '#4CAF50' : 
                         vendor.status === 'inactive' ? '#FFC107' : '#F44336' 
      }]}>
        <Text style={styles.statusText}>
          {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={() => handleToggleVendorStatus(vendor)} 
          style={styles.actionButton}
          title={`Mark as ${vendor.status === 'active' ? 'Inactive' : 'Active'}`}
        >
          <Feather 
            name={vendor.status === 'active' ? 'toggle-left' : 'toggle-right'} 
            size={20} 
            color={vendor.status === 'active' ? COLORS.success : COLORS.warning} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditVendor(vendor)} style={styles.actionButton}>
          <Feather name="edit-2" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteVendor(vendor)} style={styles.actionButton}>
          <Feather name="trash-2" size={20} color={COLORS.error} />
        </TouchableOpacity>
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
      {isEditVendorModalVisible && renderEditVendorModal()}
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
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2, // Reduced from 4 to 2
  },
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4, // Further reduced from 8 to 4
  },
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8, // Reduced margin to bring it closer to the above content
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
    right: 0, // Positioned at the exact same place as the customer list status badge
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  vendorStatusBadge: {
    position: 'absolute',
    top: 0,
    right: 65, // Positioned to the left of the status badge with more spacing (adding 10px gap)
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
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
  vendorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4, // Reduced gap from 8 to 4
    alignSelf: 'flex-start', // Move to the left side
  },

  actionsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
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
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.text,
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 8,
  },
  noCategoriesText: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: 'center',
    padding: 10,
  },
});

export default PayablesScreen;