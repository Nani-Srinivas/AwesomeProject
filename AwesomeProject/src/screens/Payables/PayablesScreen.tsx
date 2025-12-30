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
  currentDateStatus: 'paid' | 'partial' | 'pending' | 'no_entry';
  pendingHistory: Array<{
    _id: string;
    date: string;
    amount: number;
    status: 'partial' | 'pending';
    receiptNumber?: string;
  }>;
}

const PayablesScreen = ({ route }: any) => {
  const navigation = useNavigation<PayablesScreenNavigationProp>();
  const source = route?.params?.source || 'default'; // Get navigation source

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
  });
  const [storeBrands, setStoreBrands] = useState<any[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
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

      // Fetch brands to ensure names are available
      const brandsResponse = await apiService.get('/product/store-brands');
      const allBrands = brandsResponse.data.data || [];
      const brandMap = new Map(allBrands.map((b: any) => [b._id, b.name]));

      // Get today's date string for comparison
      const todayStr = new Date().toISOString().split('T')[0];

      // Calculate payable amounts for each vendor
      const extendedVendors: ExtendedVendor[] = vendorsData.map(vendor => {
        // Enrich assignedBrands based on backend response structure for vendor (it might still have field name assignedCategories if we didn't migrate DB schema name, but logically it's Brands now)
        // CAUTION: The Vendor model still says 'assignedCategories'. We should proceed assuming the data inside is now Brands.
        const enrichedBrands = (vendor.assignedCategories || []).map((brand: any) => {
          let brandId: string = '';
          let brandName: string = '';

          if (typeof brand === 'string') {
            brandId = brand;
          } else if (brand && typeof brand === 'object') {
            brandId = brand._id || '';
            brandName = brand.name || '';
          }

          if (brandName) return { _id: brandId, name: brandName };
          if (brandId && brandMap.has(brandId)) return { _id: brandId, name: brandMap.get(brandId) };
          return { _id: brandId, name: 'Unknown' };
        });

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

        // --- NEW LOGIC START ---
        let currentDateStatus: 'paid' | 'partial' | 'pending' | 'no_entry' = 'no_entry';
        const pendingHistory: ExtendedVendor['pendingHistory'] = [];

        // Check for today's receipts
        const todayReceipts = vendorReceipts.filter((r: any) => {
          const receiptDate = new Date(r.receivedDate).toISOString().split('T')[0];
          return receiptDate === todayStr;
        });

        if (todayReceipts.length > 0) {
          // If any receipt today is pending/partial, status is pending/partial
          const hasPending = todayReceipts.some((r: any) => r.paymentStatus === 'pending');
          const hasPartial = todayReceipts.some((r: any) => r.paymentStatus === 'partial');

          if (hasPending) currentDateStatus = 'pending';
          else if (hasPartial) currentDateStatus = 'partial';
          else currentDateStatus = 'paid';
        }

        // Calculate History
        vendorReceipts.forEach((r: any) => {
          const receiptDate = new Date(r.receivedDate).toISOString().split('T')[0];
          // If not today AND not fully paid
          if (receiptDate !== todayStr && r.paymentStatus !== 'paid') {
            const due = (r.totalAmount || 0) - (r.amountPaid || 0);
            if (due > 0) {
              pendingHistory.push({
                _id: r._id,
                date: receiptDate,
                amount: due,
                status: r.paymentStatus,
                receiptNumber: r.receiptNumber
              });
            }
          }
        });

        // Sort history by date desc
        pendingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Determine main paymentStatus (used for card badge - strictly current date preference)
        // User request: "main card payment status need to be according to the current date"
        // If 'no_entry', we can fallback to 'paid' (visually empty) or handle specifically.
        // Let's use 'currentDateStatus' logic mapping directly.
        let displayStatus: 'paid' | 'partial' | 'pending' = 'paid';
        if (currentDateStatus === 'pending') displayStatus = 'pending';
        else if (currentDateStatus === 'partial') displayStatus = 'partial';
        else if (currentDateStatus === 'paid') displayStatus = 'paid';
        else {
          // no_entry today. Default to 'paid' green or maybe 'no_entry' distinct logic?
          // The user says: "if there is old payment pending i see the current status also pending,
          // what i want to see is if there is any old payment not paid i need to see the date and payment status...
          // but for the main card payment status need to be according to the current date"
          // Implication: If no activity today, it shouldn't show Pending.
          displayStatus = 'paid'; // Default "safe" state
        }

        return {
          ...vendor,
          assignedCategories: enrichedBrands, // Keeping property name for TS compatibility if Vendor type is not updated, but value is brands
          payableAmount,
          paymentStatus: displayStatus,
          currentDateStatus,
          pendingHistory
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
    // Check navigation source to determine destination
    if (source === 'addStock') {
      // Navigate to AddStock screen with vendor ID
      navigation.navigate('AddStock', { vendorId: vendor._id });
    } else {
      // Default behavior - just log for now (could navigate to vendor details)
      console.log('Vendor pressed:', vendor._id);
    }
  };

  useEffect(() => {
    if (isAddVendorModalVisible || isEditVendorModalVisible) {
      // Load store brands
      loadStoreBrands();

      // If editing, we'll set the selected brands based on the vendor's assigned brands
      if (isEditVendorModalVisible && editingVendor) {
        if (editingVendor.assignedCategories) {
          setSelectedBrands(editingVendor.assignedCategories.map((b: any) => b._id || b));
        } else {
          setSelectedBrands([]);
        }
      } else if (isAddVendorModalVisible) {
        // Reset form and brands for adding new vendor
        setNewVendor({
          name: '',
          phone: '',
        });
        setSelectedBrands([]);
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

  const loadStoreBrands = async () => {
    try {
      const response = await apiService.get('/product/store-brands');
      if (response.data.success) {
        let availableBrands;

        if (isEditVendorModalVisible && editingVendor) {
          // If we're editing a vendor, show brands assigned to this vendor plus unassigned ones
          availableBrands = response.data.data.filter(
            (brand: any) => !brand.vendorId || brand.vendorId._id === editingVendor._id || brand.vendorId === editingVendor._id
          );
        } else {
          // If we're adding a new vendor, only show unassigned brands
          availableBrands = response.data.data.filter(
            (brand: any) => !brand.vendorId
          );
        }

        setStoreBrands(availableBrands);
      } else {
        console.error('Failed to load store brands:', response.data.message);
        setStoreBrands([]);
      }
    } catch (error) {
      console.error('Error loading store brands:', error);
      setStoreBrands([]);
    }
  };

  const updateStoreBrandsWithVendor = async (vendorId: string, brandIds: string[]): Promise<boolean> => {
    try {
      // Update each selected brand with the vendorId
      for (const brandId of brandIds) {
        const response = await apiService.put(`/product/store-brands/${brandId}`, {
          vendorId: vendorId
        });

        if (!response.data.success) {
          console.error('Failed to update brand:', brandId, response.data.message);
          return false;
        }
      }
      return true; // All updates successful
    } catch (error: any) {
      console.error('Error updating store brands with vendor:', error);
      return false;
    }
  };

  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleEditVendor = (vendor: ExtendedVendor) => {
    // Load vendor data into form
    setNewVendor({
      name: vendor.name,
      phone: vendor.phone,
    });
    setEditingVendor(vendor);
    setAddVendorModalVisible(false); // Close add modal if open
    setEditVendorModalVisible(true); // Open edit modal
  };

  const handleToggleVendorStatus = async (vendor: ExtendedVendor) => {
    // Ask user for confirmation
    const newStatus: 'active' | 'inactive' = vendor.status === 'active' ? 'inactive' : 'active';
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
                const updatedVendor: ExtendedVendor = {
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
      const response = await apiService.put(`/vendors/${editingVendor._id}`, {
        name: newVendor.name,
        phone: newVendor.phone,
        assignedCategories: selectedBrands
      });

      if (response.data.success) {
        // Handle Brand Assignment Diff
        const originalBrandIds = editingVendor.assignedCategories
          ? editingVendor.assignedCategories.map((b: any) => b._id || b)
          : [];

        const toUnassign = originalBrandIds.filter((id: string) => !selectedBrands.includes(id));
        const toAssign = selectedBrands.filter((id: string) => !originalBrandIds.includes(id));

        // Unassign removed brands
        for (const brandId of toUnassign) {
          await apiService.put(`/product/store-brands/${brandId}`, { vendorId: null });
        }

        // Assign new brands
        for (const brandId of toAssign) {
          await apiService.put(`/product/store-brands/${brandId}`, { vendorId: editingVendor._id });
        }

        // Construct updated list of brand objects for the UI
        // We find objects in storeBrands store which should contain all potential selections
        const updatedAssignedBrands = storeBrands.filter(b => selectedBrands.includes(b._id));

        // If some brands were originally assigned but not in storeBrands (due to filter?), 
        // we might lose their full object data if we rely solely on storeBrands.
        // But loadStoreBrands fetches everything relevant to this vendor. So it should be fine.

        const updatedVendor: ExtendedVendor = {
          ...response.data.data,
          payableAmount: editingVendor.payableAmount,
          paymentStatus: editingVendor.paymentStatus,
          assignedCategories: updatedAssignedBrands
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

      const vendorData = {
        name: newVendor.name,
        phone: newVendor.phone,
        phone: newVendor.phone,
        assignedCategories: selectedBrands // Still sending as assignedCategories for Vendor model compatibility
      };

      const response = await apiService.post('/vendors', vendorData);

      if (response.data.success) {
        // If brands were selected, try to update them with the new vendorId
        if (selectedBrands.length > 0) {
          const brandUpdateSuccess = await updateStoreBrandsWithVendor(response.data.data._id, selectedBrands);

          // Only show success message if both vendor creation and brand updates succeed
          if (brandUpdateSuccess) {
            Alert.alert('Success', `Vendor "${response.data.data.name}" has been added and assigned to ${selectedBrands.length} brands.`);
          } else {
            // Show partial success message if category updates failed
            Alert.alert(
              'Partial Success',
              `Vendor "${response.data.data.name}" has been added, but failed to assign to brands. Please assign brands manually later.`,
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
          <TouchableWithoutFeedback onPress={() => { }}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.modalTitle}>Add New Vendor</Text>
              <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Vendor Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.name}
                    onChangeText={(text) => setNewVendor({ ...newVendor, name: text })}
                    placeholder="Enter vendor name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.phone}
                    onChangeText={(text) => setNewVendor({ ...newVendor, phone: text })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Assign to Brands</Text>
                  <Text style={styles.helperText}>Select the brands this delivery agent will supply</Text>
                  {storeBrands.length > 0 ? (
                    storeBrands.map((brand) => (
                      <TouchableOpacity
                        key={brand._id}
                        style={[
                          styles.categoryOption,
                          selectedBrands.includes(brand._id) && styles.categoryOptionSelected
                        ]}
                        onPress={() => toggleBrandSelection(brand._id)}
                      >
                        <Text style={[
                          styles.categoryText,
                          selectedBrands.includes(brand._id) && styles.categoryTextSelected
                        ]}>
                          {brand.name}
                        </Text>
                        {selectedBrands.includes(brand._id) && (
                          <Feather name="check" size={18} color={COLORS.white} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noCategoriesText}>No store brands found</Text>
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
          </TouchableWithoutFeedback>
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
          <TouchableWithoutFeedback onPress={() => { }}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.modalTitle}>Edit Vendor</Text>
              <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Vendor Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.name}
                    onChangeText={(text) => setNewVendor({ ...newVendor, name: text })}
                    placeholder="Enter vendor name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.phone}
                    onChangeText={(text) => setNewVendor({ ...newVendor, phone: text })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Assign to Brands</Text>
                  <Text style={styles.helperText}>Select the brands this delivery agent will supply</Text>
                  {storeBrands.length > 0 ? (
                    storeBrands.map((brand) => (
                      <TouchableOpacity
                        key={brand._id}
                        style={[
                          styles.categoryOption,
                          selectedBrands.includes(brand._id) && styles.categoryOptionSelected
                        ]}
                        onPress={() => toggleBrandSelection(brand._id)}
                      >
                        <Text style={[
                          styles.categoryText,
                          selectedBrands.includes(brand._id) && styles.categoryTextSelected
                        ]}>
                          {brand.name}
                        </Text>
                        {selectedBrands.includes(brand._id) && (
                          <Feather name="check" size={18} color={COLORS.white} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noCategoriesText}>No store brands found</Text>
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
          </TouchableWithoutFeedback>
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
      <View style={[styles.statusBorder, {
        backgroundColor: vendor.currentDateStatus === 'no_entry' ? 'transparent' : getStatusStyle(vendor.paymentStatus).color
      }]} />

      {/* Absolute Positioned Status Badge */}
      <View style={[styles.statusBadge, {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        backgroundColor: vendor.currentDateStatus === 'no_entry'
          ? '#F0F0F0'
          : getStatusStyle(vendor.paymentStatus).backgroundColor
      }]}>
        <Text style={[styles.statusText, {
          color: vendor.currentDateStatus === 'no_entry'
            ? '#999'
            : getStatusStyle(vendor.paymentStatus).color
        }]}>
          {vendor.currentDateStatus === 'no_entry'
            ? 'NO ENTRY'
            : vendor.paymentStatus.toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {vendor.assignedCategories && vendor.assignedCategories.length > 0 && vendor.assignedCategories.slice(0, 3).map((cat: any, index: number) => (
            <View key={index} style={[styles.brandPill, { marginTop: 0, marginRight: 4 }]}>
              <Text style={styles.brandText}>{cat?.name || 'Unknown'}</Text>
            </View>
          ))}
          {vendor.assignedCategories && vendor.assignedCategories.length > 3 && (
            <View style={[styles.brandPill, { marginTop: 0 }]}>
              <Text style={styles.brandText}>+{vendor.assignedCategories.length - 3}</Text>
            </View>
          )}
        </View>
        <Text style={styles.customerName}>{vendor.name}</Text>

        <Text style={styles.customerInfo}>Contact: {vendor.phone}</Text>

        {/* Price and Status Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          <View>
            <Text style={styles.customerInfo}>Total Payable</Text>
            <Text style={styles.vendorAmount}>₹{vendor.payableAmount.toFixed(2)}</Text>
          </View>

        </View>

        {/* PENDING HISTORY SECTION */}
        {vendor.pendingHistory && vendor.pendingHistory.length > 0 && (
          <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 4 }}>Pending Dues:</Text>
            {vendor.pendingHistory.map((historyItem) => (
              <View key={historyItem._id} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: '#666', marginBottom: 1 }}>
                  #{historyItem.receiptNumber || historyItem._id.slice(-6).toUpperCase()}
                </Text>
                <Text style={{ fontSize: 12, color: '#DC2626' }}>
                  {historyItem.date} | Due: ₹{historyItem.amount.toFixed(2)} | {historyItem.status === 'partial' ? 'Partial' : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        )}


      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleToggleVendorStatus(vendor)} style={styles.actionButton}>
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
    marginTop: 4,
    alignSelf: 'flex-start',
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
  vendorStatusBadge: {
    position: 'absolute',
    top: 0,
    right: 65,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    marginLeft: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
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
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
  noBrandsText: {
    fontSize: 12,
    color: COLORS.grey,
    fontStyle: 'italic',
    marginTop: 4,
  },
  brandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  brandPill: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  brandText: {
    fontSize: 11,
    color: '#1E88E5',
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
});

export default PayablesScreen;