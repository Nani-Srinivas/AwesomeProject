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
import { Picker } from '@react-native-picker/picker'; // dropdown
import { apiService } from '../../services/apiService';
import CheckBox from '@react-native-community/checkbox';
import { EditAttendanceModal } from './components/EditAttendanceModal';

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
  const [attendance, setAttendance] = useState({});
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

  const handleAttendanceChange = (customerId) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
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

  const handleSaveAttendance = (newAttendance) => {
    setAttendance(prev => ({
      ...prev,
      ...newAttendance,
    }));
    closeEditModal();
  };

  const handleSubmit = async () => {
    const attendanceData = {
      date: selectedDate,
      areaId: selectedArea,
      attendance,
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

  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerItem}>
      <Text style={styles.customerName}>{item.name}</Text>
      <View style={styles.row}>
        <Button title="Edit" onPress={() => openEditModal(item)} />
        <CheckBox
          value={attendance[item._id]}
          onValueChange={() => handleAttendanceChange(item._id)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
        <ExpandableCalendar
          renderHeader={renderCustomHeader}
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

        <View style={styles.customerListContainer}>
          <FlatList
            data={customers}
            renderItem={renderCustomerItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
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
  attendanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
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
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  customerListContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 2,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});