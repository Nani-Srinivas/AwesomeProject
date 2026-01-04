import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { EditCustomerModal } from '../../components/customer/EditCustomerModal';
import { AddCustomerModal } from '../../components/customer/AddCustomerModal';
import { apiService } from '../../services/apiService';
import { debounce } from 'lodash';
import { EmptyState } from '../../components/common/EmptyState';
import * as DocumentPicker from '@react-native-documents/picker';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FlatList } from 'react-native';


const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'Unpaid':
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'Partially Paid':
      return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default: // Assuming 'Pending' or other statuses fall here
      return { color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
  }
};

const CustomerCard = ({ customer, onPress, onEdit, onDelete, onViewBill, onViewHistory, onViewPayment }: { customer: any, onPress: () => void, onEdit: (customer: any) => void, onDelete: (customer: any) => void, onViewBill: (customer: any) => void, onViewHistory: (customer: any) => void, onViewPayment: (customer: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(customer.paymentStatus || customer.Bill).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <View style={styles.contactRow}>
        <Feather name="phone" size={13} color="#6B6B6B" style={{ marginRight: 6 }} />
        <Text style={styles.customerInfo}>{customer.phone}</Text>
      </View>
      {customer.address?.FlatNo && (
        <View style={styles.contactRow}>
          <Feather name="home" size={13} color="#6B6B6B" style={{ marginRight: 6 }} />
          <Text style={styles.customerInfo}>
            {customer.address.FlatNo} {customer.address.Apartment ? `, ${customer.address.Apartment}` : ''}
          </Text>
        </View>
      )}

      {customer.currentDueAmount !== undefined && (
        <Text style={styles.dueAmount}>Due: ₹{customer.currentDueAmount || 0}</Text>
      )}
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(customer.paymentStatus || customer.Bill).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(customer.paymentStatus || customer.Bill).color }]}>
        {customer.paymentStatus || customer.Bill}
      </Text>
    </View>
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={() => onViewBill(customer)} style={styles.actionButton}>
        <Feather name="file-text" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onViewHistory(customer)} style={styles.actionButton}>
        <Feather name="archive" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onViewPayment(customer)} style={styles.actionButton}>
        <Feather name="credit-card" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onEdit(customer)} style={styles.actionButton}>
        <Feather name="edit-2" size={20} color={COLORS.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(customer)} style={styles.actionButton}>
        <Feather name="trash-2" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const CustomerListScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(route.params?.filter || 'All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Track expanded/collapsed state for each apartment section
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [areAllExpanded, setAreAllExpanded] = useState(true);

  // Custom Order for Sections
  const [orderedSectionTitles, setOrderedSectionTitles] = useState<string[]>([]);
  const [isUserOrdered, setIsUserOrdered] = useState(false);


  // Debounce search input
  const debouncedSearch = useCallback(
    debounce((text) => {
      setDebouncedSearchQuery(text);
    }, 300), // 300ms delay
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/customer');
      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch customers.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customers.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await apiService.get('/delivery/area');
      if (response.data.success) {
        setAreas(response.data.data);
      } else {
        console.error(response.data.message || 'Failed to fetch areas.');
      }
    } catch (err: any) {
      console.error(err.message || 'An error occurred while fetching areas.');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAreas();
  }, []);

  const sectionsData = useMemo(() => {
    let list = customers;

    // Filter by Area
    if (selectedArea !== 'All') {
      list = list.filter((customer: any) => {
        return customer.area?.name === selectedArea || customer.area?._id === selectedArea;
      });
    }

    // Filter by Payment Status
    if (selectedPaymentStatus !== 'All') {
      list = list.filter((customer: any) => {
        const status = customer.paymentStatus || customer.Bill;
        return status === selectedPaymentStatus;
      });
    }

    // Search
    if (debouncedSearchQuery.trim() !== '') {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter(
        (customer: any) =>
          customer.name.toLowerCase().includes(q) ||
          customer.phone.toLowerCase().includes(q) ||
          customer._id.toLowerCase().includes(q) ||
          (customer.address?.FlatNo && customer.address.FlatNo.toLowerCase().includes(q)) ||
          (customer.address?.Apartment && customer.address.Apartment.toLowerCase().includes(q)) ||
          (customer.address?.city && customer.address.city.toLowerCase().includes(q))
      );
    }

    // Grouping Logic
    const grouped = list.reduce((acc: any, customer: any) => {
      const apartment = customer.address?.Apartment || 'Other';
      if (!acc[apartment]) {
        acc[apartment] = [];
      }
      acc[apartment].push(customer);
      return acc;
    }, {});

    return grouped;
  }, [selectedArea, selectedPaymentStatus, debouncedSearchQuery, customers]);

  // Sync orderedSectionTitles with data when filters/search change, unless user has dragged
  useEffect(() => {
    // If user hasn't manually reordered, or if the list of keys has changed (e.g. filtering), reset/update order
    // For simplicity/robustness with filtering, we regenerate the default sort when data changes.
    // Reordering usually only valid within a stable filtered view anyway.
    const titles = Object.keys(sectionsData).sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
    setOrderedSectionTitles(titles);
  }, [sectionsData]); // Depend on the grouped data object

  const toggleAllSections = () => {
    const newExpandedState = !areAllExpanded;
    setAreAllExpanded(newExpandedState);

    if (newExpandedState) {
      // Expand All -> Just clear the specific false overrides
      setExpandedSections({});
    } else {
      // Collapse All -> Set all current sections to false
      const validationState: Record<string, boolean> = {};
      Object.keys(sectionsData).forEach(title => {
        validationState[title] = false;
      });
      setExpandedSections(validationState);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: prev[title] === false ? true : false // Toggle (Default was True/Undefined -> False)
    }));
  };

  const apartmentsByArea = useMemo(() => {
    const map: Record<string, string[]> = {};
    customers.forEach((c: any) => {
      const areaId = c.area?._id || 'unknown';
      if (!areaId) return;

      const apt = c.address?.Apartment;
      if (apt && typeof apt === 'string' && apt.trim() !== '') {
        if (!map[areaId]) map[areaId] = [];
        if (!map[areaId].includes(apt)) map[areaId].push(apt);
      }
    });
    Object.keys(map).forEach(key => map[key].sort());
    return map;
  }, [customers]);

  // Calculate customer counts per area
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': customers.length };

    customers.forEach((customer: any) => {
      const areaName = customer.area?.name;
      if (areaName) {
        counts[areaName] = (counts[areaName] || 0) + 1;
      }
    });

    return counts;
  }, [customers]);

  const handleCustomerPress = (customer: any) => {
    navigation.navigate('Details', { customer });
  };

  const handleEditPress = (customer: any) => {
    setEditingCustomer(customer);
    setEditModalVisible(true);
  };

  const handleViewBillPress = (customer: any) => {
    navigation.navigate('StatementPeriodSelection', {
      customerId: customer._id,
      onBillOperationComplete: fetchCustomers
    });
  };

  const handleViewPaymentPress = (customer: any) => {
    navigation.navigate('PaymentStatus', { customerId: customer._id });
  };

  const handleViewHistoryPress = (customer: any) => {
    navigation.navigate('InvoiceHistory', { customerId: customer._id });
  };

  const handleSaveCustomer = async (updatedCustomer: any) => {
    try {
      setIsSaving(true);
      const response = await apiService.patch(`/customer/update/${updatedCustomer._id}`, updatedCustomer);

      if (response.data.success) {
        setCustomers(prev =>
          prev.map((c: any) => (c._id === updatedCustomer._id ? response.data.data : c))
        );
        setEditModalVisible(false);
        setEditingCustomer(null);
        Alert.alert('Success', `Customer "${response.data.data.name}" has been updated.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCustomer = async (newCustomer: { name: string; phone: string }) => {
    try {
      setIsSaving(true);
      const response = await apiService.post('/customer/create', newCustomer);

      if (response.data.success) {
        setCustomers(prev => [response.data.data, ...prev]);
        setAddModalVisible(false);
        Alert.alert('Success', `Customer "${response.data.data.name}" has been added.`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while adding the customer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePress = (customer: any) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.delete(`/customer/delete/${customer._id}`);
              if (response.data.success) {
                setCustomers(prev => prev.filter((c: any) => c._id !== customer._id));
                Alert.alert('Success', `Customer "${customer.name}" has been deleted.`);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete customer.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred while deleting.');
            }
          },
        },
      ]
    );
  };

  const handleBulkUpload = async () => {
    try {
      const [result] = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (!result) return;
      const file = {
        uri: result.uri,
        type: result.type || 'text/csv',
        name: result.name || 'upload.csv',
      };
      const formData = new FormData();
      formData.append('file', file as any);
      setIsLoading(true);
      const response = await apiService.post('/admin/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          'Success',
          `Upload processed.\nSuccess: ${response.data.successCount}\nErrors: ${response.data.errors?.length || 0}`,
          [{ text: 'OK', onPress: fetchCustomers }]
        );
      } else {
        Alert.alert('Upload Failed', 'Server returned an error.');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Bulk Upload Error:', err);
        Alert.alert('Error', 'Failed to upload file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = useCallback(({ item: title, drag, isActive }: RenderItemParams<string>) => {
    const isExpanded = expandedSections[title] !== false; // Default true
    const customersInApartment = sectionsData[title] || [];

    const sortedCustomers = customersInApartment.sort((a: any, b: any) => {
      const flatA = a.address?.FlatNo || '';
      const flatB = b.address?.FlatNo || '';

      // Extract numeric part from flat number
      const numA = parseInt(flatA.replace(/\D/g, '')) || 0;
      const numB = parseInt(flatB.replace(/\D/g, '')) || 0;

      if (numA !== numB) return numA - numB;
      return flatA.localeCompare(flatB);
    });


    return (
      <ScaleDecorator>
        <View style={[styles.sectionContainer, isActive && styles.activeSection]}>
          <View style={styles.sectionHeaderRow}>
            <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.dragHandle}>
              <Feather name="menu" size={24} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionHeaderContent} onPress={() => toggleSection(title)}>
              <Text style={styles.sectionHeaderText}>{title} <Text style={{ fontSize: 12, fontWeight: 'normal' }}>({customersInApartment.length})</Text></Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B6B6B"
              />
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View>
              {sortedCustomers.map((customer: any) => (
                <CustomerCard
                  key={customer._id}
                  customer={customer}
                  onPress={() => handleCustomerPress(customer)}
                  onViewBill={(c) => handleViewBillPress(c)}
                  onViewHistory={(c) => handleViewHistoryPress(c)}
                  onViewPayment={(c) => handleViewPaymentPress(c)}
                  onEdit={(c) => handleEditPress(c)}
                  onDelete={(c) => handleDeletePress(c)}
                />
              ))}
            </View>
          )}
        </View>
      </ScaleDecorator>
    );
  }, [sectionsData, expandedSections]);


  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 🔍 Search bar & Toggle Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#6B6B6B" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search by name, contact, address..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleAllSections}>
            <Feather
              name={areAllExpanded ? "chevrons-up" : "chevrons-down"}
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Areas and Filter Row */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['All', ...areas.map((a: any) => a.name)]}
            keyExtractor={(item, index) => item + index}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingRight: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedArea === item && styles.activeTab
                ]}
                onPress={() => setSelectedArea(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedArea === item && styles.activeFilterText
                  ]}
                >
                  {item} ({areaCounts[item] || 0})
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="filter" size={20} color={selectedPaymentStatus !== 'All' ? COLORS.primary : '#6B6B6B'} />
            {selectedPaymentStatus !== 'All' && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          data={orderedSectionTitles}
          onDragEnd={({ data }) => {
            setOrderedSectionTitles(data);
            setIsUserOrdered(true);
          }}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140 }}
          refreshing={isLoading}
          onRefresh={fetchCustomers}
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="No Customers Found"
              description={
                selectedArea !== 'All' || selectedPaymentStatus !== 'All'
                  ? "No customers match your selected filters."
                  : "You haven't added any customers yet."
              }
              actionLabel={selectedArea !== 'All' || selectedPaymentStatus !== 'All' ? "Clear Filters" : "Add Customer"}
              onAction={() => {
                if (selectedArea !== 'All' || selectedPaymentStatus !== 'All') {
                  setSelectedArea('All');
                  setSelectedPaymentStatus('All');
                } else {
                  setAddModalVisible(true);
                }
              }}
            />
          }
        />

        {/* Filter Modal */}
        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter by Status</Text>
              {['All', 'Paid', 'Unpaid', 'Partially Paid'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.modalOption,
                    selectedPaymentStatus === status && styles.selectedModalOption
                  ]}
                  onPress={() => {
                    setSelectedPaymentStatus(status);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedPaymentStatus === status && styles.selectedModalOptionText
                    ]}
                  >
                    {status}
                  </Text>
                  {selectedPaymentStatus === status && (
                    <Feather name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        {editingCustomer && (
          <EditCustomerModal
            isVisible={isEditModalVisible}
            onClose={() => setEditModalVisible(false)}
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            isSaving={isSaving}
            areas={areas}
            apartmentsByArea={apartmentsByArea}
          />
        )}

        <AddCustomerModal
          isVisible={isAddModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSave={handleAddNewCustomer}
          isSaving={isSaving}
          areas={areas}
          apartmentsByArea={apartmentsByArea}
        />

        <TouchableOpacity style={styles.fabUpload} onPress={handleBulkUpload}>
          <Feather name="upload-cloud" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
          <Feather name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
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
  filterIconButton: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginLeft: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    marginRight: 80,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customerInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    flexShrink: 1,
  },
  dueAmount: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
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
    marginLeft: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1C',
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
  fabUpload: {
    position: 'absolute',
    right: 30,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedModalOption: {
    backgroundColor: '#f6faff', // Light highlight
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    // backgroundColor: '#f8f9fa',
    // paddingVertical: 12,
    // paddingHorizontal: 16,
    // marginBottom: 8,
    // borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    textTransform: 'uppercase',
  },
  sectionContainer: {
    marginBottom: 10,
  },
  activeSection: {
    backgroundColor: '#f6faff',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.9
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingRight: 16,
    marginBottom: 8,
  },
  dragHandle: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
});