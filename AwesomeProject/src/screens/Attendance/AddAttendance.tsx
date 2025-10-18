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
import { EditAttendanceModal } from './components/EditAttendanceModal';
import { COLORS } from '../../constants/colors';
import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
import { Picker } from '@react-native-picker/picker';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

export const AddAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState();
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState({}); // { customerId: { productId: boolean } }
  const [expandedCustomers, setExpandedCustomers] = useState({}); // { customerId: boolean }
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiService.get('/delivery/area');
        setAreas(response.data.data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const fetchCustomers = async () => {
        try {
          const response = await apiService.get(`/customer/area/${selectedArea}`);
          setCustomers(response.data.data);
          // Initialize attendance for new customers
          const initialAttendance = {};
          response.data.data.forEach(customer => {
            initialAttendance[customer._id] = {};
            customer.requiredProduct.forEach(product => {
              initialAttendance[customer._id][product.product._id] = true; // Default to checked
            });
          });
          setAttendance(initialAttendance);
        } catch (error) {
          console.error('Error fetching customers:', error);
        }
      };

      fetchCustomers();
    }
  }, [selectedArea]);

  const onDateChanged = (date: string) => {
    setSelectedDate(date);
  };

  const toggleCustomerExpansion = (customerId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const handleProductAttendanceChange = (customerId, productId) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: !prev[customerId]?.[productId],
      },
    }));
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleSaveAttendance = (customerId, extraProducts) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer._id === customerId) {
          const newRequiredProducts = [...customer.requiredProduct];
          const newAttendanceForCustomer = { ...attendance[customerId] };

          Object.keys(extraProducts).forEach(productId => {
            const productDetails = extraProducts[productId];
            const existingProductIndex = newRequiredProducts.findIndex(p => p.product._id === productId);

            if (existingProductIndex > -1) {
              // Update quantity of existing product
              newRequiredProducts[existingProductIndex].quantity = productDetails.quantity;
            } else {
              // Add new product
              newRequiredProducts.push({
                product: { _id: productId, name: productDetails.name },
                quantity: productDetails.quantity,
              });
            }
            // Mark new/updated products as delivered by default
            newAttendanceForCustomer[productId] = true;
          });

          setAttendance(prev => ({
            ...prev,
            [customerId]: newAttendanceForCustomer,
          }));

          return { ...customer, requiredProduct: newRequiredProducts };
        }
        return customer;
      }),
    );
    closeEditModal();
  };

  const handleSubmit = async () => {
    const formattedAttendance = Object.keys(attendance).map(customerId => ({
      customerId,
      products: Object.keys(attendance[customerId])
        .filter(productId => attendance[customerId][productId])
        .map(productId => ({
          productId,
          // You might need to get the quantity from the original customer.requiredProduct
          // For now, assuming quantity is 1 or needs to be fetched
          quantity: 1, // Placeholder
        })),
    }));

    const attendanceData = {
      date: selectedDate,
      areaId: selectedArea,
      attendance: formattedAttendance,
    };

    try {
      await apiService.post('/api/attendance', attendanceData);
      // Handle successful submission (e.g., show a success message)
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
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

  return (
    <View style={styles.container}>
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

        <View style={styles.attendanceHeader}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedArea}
              onValueChange={(itemValue) => setSelectedArea(itemValue)}
              style={styles.picker}
            >
              {areas.map((area) => (
                <Picker.Item key={area._id} label={area.name} value={area._id} />
              ))}
            </Picker>
          </View>
          <View style={styles.totalEmployeesContainer}>
            <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
            <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
          </View>
        </View>

        <FlatList
          data={customers}
          renderItem={({ item }) => (
            <CustomerAttendanceItem
              customer={item}
              isExpanded={expandedCustomers[item._id]}
              onToggleExpansion={() => toggleCustomerExpansion(item._id)}
              attendance={attendance[item._id] || {}}
              onProductAttendanceChange={(productId) => handleProductAttendanceChange(item._id, productId)}
              onEdit={() => openEditModal(item)}
            />
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
        />
      </CalendarProvider>

      <Button title="Submit Attendance" onPress={handleSubmit} />

      <EditAttendanceModal
        isVisible={isEditModalVisible}
        customer={selectedCustomer}
        onClose={closeEditModal}
        onSave={handleSaveAttendance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  totalEmployeesContainer: {
    alignItems: 'flex-end',
  },
  totalEmployeesLabel: {
    fontSize: 12,
    color: '#666666',
  },
  totalEmployeesCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
});