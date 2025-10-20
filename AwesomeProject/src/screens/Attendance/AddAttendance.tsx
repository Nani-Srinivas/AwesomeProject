import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import { apiService } from '../../services/apiService';
import { EditAttendanceBottomSheet } from './components/EditAttendanceModal';
import { AddExtraProductBottomSheet } from './components/AddExtraProductModal';
import { COLORS } from '../../constants/colors';
import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

export const AddAttendance = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddExtraProductModalVisible, setIsAddExtraProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

// ✅ fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiService.get('/delivery/area');
        const fetchedAreas = response.data.data;
        if (fetchedAreas?.length > 0) {
          setAreas(fetchedAreas);
          setSelectedArea(fetchedAreas[0]._id);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);


  // ✅ fetch customers for selected area
  useEffect(() => {
    if (!selectedArea) return;

    const fetchCustomers = async () => {
      try {
        const response = await apiService.get(`/customer/area/${selectedArea}`);
        const fetchedCustomers = response.data.data;
        if (!Array.isArray(fetchedCustomers)) {
          setCustomers([]);
          setAttendance({});
          return;
        }

        setCustomers(fetchedCustomers);

        // Initialize attendance with status
        const initialAttendance = {};
        const initialExpandedState = {};
        fetchedCustomers.forEach(customer => {
          initialAttendance[customer._id] = {};
          initialExpandedState[customer._id] = true; // Expand all customers by default
          if (Array.isArray(customer.requiredProduct)) {
            customer.requiredProduct.forEach(product => {
              if (product.product?._id) {
                initialAttendance[customer._id][product.product._id] = {
                  quantity: product.quantity,
                  status: 'delivered', // Default status
                };
              }
            });
          }
        });
        setAttendance(initialAttendance);
        setExpandedCustomers(initialExpandedState);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
        setAttendance({});
      }
    };

    fetchCustomers();
  }, [selectedArea]);



  const onDateChanged = date => setSelectedDate(date);

  const toggleCustomerExpansion = customerId => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const handleProductStatusChange = (customerId, productId, newStatus) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          status: newStatus,
        },
      },
    }));
  };

  const handleProductQuantityChange = (customerId, productId, newQuantity) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          quantity: Number(newQuantity),
        },
      },
    }));
  };

  const openEditModal = customer => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

// ✅ New: open bottom sheet for Add Extra Product
  const openAddExtraProductModal = customer => {
    setSelectedCustomer(customer);
    setIsAddExtraProductModalVisible(true);
  };

  const closeAddExtraProductModal = () => {
    setIsAddExtraProductModalVisible(false);
    setSelectedCustomer(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer._id === customerId) {
          // Create a mutable copy of the products to work with
          let allProducts = [...editedRequiredProducts];

          // Handle the newly added products, which is an array
          if (Array.isArray(addedExtraProducts)) {
            addedExtraProducts.forEach(newProduct => {
              if (newProduct.quantity > 0) {
                // Normalize the new product to match the structure of existing ones
                const normalizedProduct = {
                  product: { _id: newProduct.productId, name: newProduct.name },
                  quantity: newProduct.quantity,
                };

                // Check if this product already exists in the list
                const existingIndex = allProducts.findIndex(
                  p => p.product._id === normalizedProduct.product._id
                );

                if (existingIndex !== -1) {
                  // If it exists, update the quantity
                  allProducts[existingIndex].quantity = normalizedProduct.quantity;
                } else {
                  // Otherwise, add it to the list
                  allProducts.push(normalizedProduct);
                }
              }
            });
          }

          // Update the attendance state for the customer
          const newAttendanceForCustomer = {};
          allProducts.forEach(p => {
            if (p.product && p.product._id) {
              newAttendanceForCustomer[p.product._id] = {
                quantity: p.quantity,
                status: p.status || 'delivered',
              };
            }
          });

          setAttendance(prev => ({
            ...prev,
            [customerId]: newAttendanceForCustomer,
          }));

          // Return the updated customer object
          return { ...customer, requiredProduct: allProducts };
        }
        return customer;
      })
    );

    // Close the modals
    closeEditModal();
    closeAddExtraProductModal();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    const today = new Date().toISOString().split('T')[0];

    if (selectedDate < today) {
      setFeedbackMessage('Cannot modify attendance for past dates.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const formattedAttendance = Object.keys(attendance)
      .map(customerId => ({
        customerId,
        products: Object.keys(attendance[customerId]).map(productId => ({
          productId,
          quantity: attendance[customerId][productId].quantity,
          status: attendance[customerId][productId].status,
        })),
      }))
      .filter(c => c.products.length > 0);

    if (formattedAttendance.length === 0) {
      setFeedbackMessage('No attendance data to submit.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const payload = {
      date: selectedDate,
      areaId: selectedArea,
      attendance: formattedAttendance,
    };

    try {
      if (isEditModalVisible) closeEditModal();
      const response = await apiService.postWithConfig('/attendance', payload, {
        headers: { 'X-Suppress-Global-Error-Alert': true },
      });

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));

      setTimeout(() => {
        navigation.goBack();
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Attendance submit error:', error);

      if (error.response?.status === 409) {
        setFeedbackMessage(error.response.data.message || 'Attendance already exists for this date.');
        setFeedbackMessageType('error');
        setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
      } else {
        setFeedbackMessage(
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred while submitting attendance.'
        );
        setFeedbackMessageType('error');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackMessageType(null);
      }, 5000);
    }
  };

  const renderCustomHeader = date => {
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

  return (
    <View style={styles.container}>
      {feedbackMessage && (
        <View
          style={[
            styles.feedbackContainer,
            feedbackMessageType === 'success'
              ? styles.successBackground
              : styles.errorBackground,
          ]}
        >
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Calendar + List */}
      <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
        <ExpandableCalendar
          hideArrows={true}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
            ...Object.keys(agendaItems).reduce((acc, date) => {
              acc[date] = { marked: true };
              return acc;
            }, {}),
          }}
        />
        {/* Header */}
        <View style={styles.attendanceHeader}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedArea}
              onValueChange={setSelectedArea}
              style={styles.picker}
            >
              {areas.map(area => (
                <Picker.Item key={area._id} label={area.name} value={area._id} />
              ))}
            </Picker>
          </View>
          <View style={styles.totalEmployeesContainer}>
            <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
            <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
          </View>
        </View>

        {/* Customer list */}
        <FlatList
          data={customers}
          renderItem={({ item }) => (
            <CustomerAttendanceItem
              customer={item}
              isExpanded={expandedCustomers[item._id]}
              onToggleExpansion={() => toggleCustomerExpansion(item._id)}
              attendance={attendance[item._id] || {}}
              onProductStatusChange={(productId, newStatus) =>
                handleProductStatusChange(item._id, productId, newStatus)
              }
              onProductQuantityChange={(productId, newQuantity) =>
                handleProductQuantityChange(item._id, productId, newQuantity)
              }
              onEdit={() => openEditModal(item)}
              onAdd={() => openAddExtraProductModal(item)}
            />
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
        />
      </CalendarProvider>

      {/* Submit button */}
      <Button
        title={isLoading ? 'Submitting...' : 'Submit Attendance'}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {/* Edit modal */}
      <EditAttendanceBottomSheet
        isVisible={isEditModalVisible}
        customer={selectedCustomer}
        currentAttendance={attendance[selectedCustomer?._id] || {}}
        onClose={closeEditModal}
        onSave={handleSaveAttendance}
      />

      {/* ✅ Add Extra Product Bottom Sheet */}
      {isAddExtraProductModalVisible && (
        <AddExtraProductBottomSheet
          isVisible={isAddExtraProductModalVisible}
          customer={selectedCustomer}
          currentAttendance={attendance[selectedCustomer?._id] || {}}
          onClose={closeAddExtraProductModal}
          onAddProducts={(addedProducts) =>
            handleSaveAttendance(selectedCustomer._id, selectedCustomer.requiredProduct || [], addedProducts)
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: 20 },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  totalEmployeesContainer: { alignItems: 'flex-end' },
  totalEmployeesLabel: { fontSize: 12, color: '#666666' },
  totalEmployeesCount: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  dropdownContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  feedbackContainer: {
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  successBackground: { backgroundColor: COLORS.success },
  errorBackground: { backgroundColor: COLORS.error },
  feedbackText: { color: COLORS.white, fontWeight: 'bold' },
});