import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker'; // dropdown

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Sample employee data based on your image
const employeeData = [
  {
    id: '1',
    name: 'Jack Nicholson',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50', // Replace with actual image URLs
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Login',
    statusColor: '#007AFF',
  },
  {
    id: '2',
    name: 'Robert De Niro',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Logout',
    statusColor: '#FF3B30',
  },
  {
    id: '3',
    name: 'Marlon Brando',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Login',
    statusColor: '#007AFF',
  },
  {
    id: '4',
    name: 'Denzel Washington',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Logout',
    statusColor: '#FF3B30',
  },
  {
    id: '5',
    name: 'Katharine Hepburn',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Login',
    statusColor: '#007AFF',
  },
  {
    id: '6',
    name: 'Humphrey Bogart',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Login',
    statusColor: '#007AFF',
  },
  {
    id: '7',
    name: 'Meryl Streep',
    employeeId: '1412DA043',
    position: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/50',
    loginTime: '09:00:00',
    logoutTime: '17:02:53',
    status: 'Login',
    statusColor: '#007AFF',
  },
];

export const AddAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedRole, setSelectedRole] = useState('Student');

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

  const renderEmployeeItem = ({ item }: { item: any }) => (
    <View style={styles.employeeItem}>
      <View style={styles.employeeInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.employeeDetails}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeId}>{item.employeeId}</Text>
          <Text style={styles.employeePosition}>{item.position}</Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.loginTime}</Text>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: item.statusColor }]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.logoutTime}</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </View>
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

        {/* Header with Total Employees */}
        <View style={styles.attendanceHeader}>
          {/* <Text style={styles.attendanceTitle}>Attendance</Text> */}
          <View style={styles.dropdownContainer}>
         <Picker
            selectedValue={selectedRole}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Teacher" value="Teacher" />
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Staff" value="Staff" />
            <Picker.Item label="Management" value="Management" />
          </Picker>
        </View>
          <View style={styles.totalEmployeesContainer}>
            <Text style={styles.totalEmployeesLabel}>Total Employees</Text>
            <Text style={styles.totalEmployeesCount}>590</Text>
          </View>
        </View>

        {/* Employee List */}
        <View style={styles.employeeListContainer}>
          <FlatList
            data={employeeData}
            renderItem={renderEmployeeItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </CalendarProvider>
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
  employeeListContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  employeeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  employeePosition: {
    fontSize: 12,
    color: '#666666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutLabel: {
    fontSize: 12,
    color: '#666666',
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

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
// import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
// import Feather from 'react-native-vector-icons/Feather';
// import { Picker } from '@react-native-picker/picker'; // dropdown

// const agendaItems = {
//   '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
//   '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
// };

// const employeeData = [
//   {
//     id: '1',
//     name: 'Jack Nicholson',
//     employeeId: '1412DA043',
//     position: 'UI/UX Designer',
//     avatar: 'https://via.placeholder.com/50',
//     loginTime: '09:00:00',
//     logoutTime: '17:02:53',
//     status: 'Login',
//     statusColor: '#007AFF'
//   },
//   {
//     id: '2',
//     name: 'Robert De Niro',
//     employeeId: '1412DA043',
//     position: 'UI/UX Designer',
//     avatar: 'https://via.placeholder.com/50',
//     loginTime: '09:00:00',
//     logoutTime: '17:02:53',
//     status: 'Logout',
//     statusColor: '#FF3B30'
//   }
// ];

// export const AddAttendance = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedRole, setSelectedRole] = useState('Teacher');

//   const onDateChanged = (date: string) => {
//     setSelectedDate(date);
//   };

//   const goToNextMonth = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setMonth(newDate.getMonth() + 1);
//     setSelectedDate(newDate.toISOString().split('T')[0]);
//   };

//   const goToPreviousMonth = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setMonth(newDate.getMonth() - 1);
//     setSelectedDate(newDate.toISOString().split('T')[0]);
//   };

//   const renderCustomHeader = (date: any) => {
//     const header = date.toString('MMMM yyyy');
//     const [month, year] = header.split(' ');

//     return (
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Feather name="calendar" size={24} color="#1E73B8" />
//           <Text style={styles.monthText}>{`${month} ${year}`}</Text>
//         </View>
//         <View style={styles.headerRight}>
//           <TouchableOpacity onPress={goToPreviousMonth}>
//             <Feather name="chevron-left" size={24} color="#1E73B8" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={goToNextMonth}>
//             <Feather name="chevron-right" size={24} color="#1E73B8" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderEmployeeItem = ({ item }: { item: any }) => (
//     <View style={styles.employeeItem}>
//       <View style={styles.employeeInfo}>
//         <Image source={{ uri: item.avatar }} style={styles.avatar} />
//         <View style={styles.employeeDetails}>
//           <Text style={styles.employeeName}>{item.name}</Text>
//           <Text style={styles.employeeId}>{item.employeeId}</Text>
//           <Text style={styles.employeePosition}>{item.position}</Text>
//         </View>
//       </View>

//       <View style={styles.timeContainer}>
//         <View style={styles.timeColumn}>
//           <Text style={styles.timeText}>{item.loginTime}</Text>
//           <TouchableOpacity
//             style={[styles.statusButton, { backgroundColor: item.statusColor }]}
//           >
//             <Text style={styles.statusText}>{item.status}</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.timeColumn}>
//           <Text style={styles.timeText}>{item.logoutTime}</Text>
//           <Text style={styles.logoutLabel}>Logout</Text>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header with Dropdown + Total Employees */}
//       <View style={styles.attendanceHeader}>
//         <View style={styles.dropdownContainer}>
//           <Picker
//             selectedValue={selectedRole}
//             onValueChange={(itemValue) => setSelectedRole(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Teacher" value="Teacher" />
//             <Picker.Item label="Student" value="Student" />
//             <Picker.Item label="Staff" value="Staff" />
//             <Picker.Item label="Management" value="Management" />
//           </Picker>
//         </View>

//         <View style={styles.totalEmployeesContainer}>
//           <Text style={styles.totalEmployeesLabel}>Total Employees</Text>
//           <Text style={styles.totalEmployeesCount}>590</Text>
//         </View>
//       </View>

//       {/* Calendar directly below header */}
//       <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
//         <ExpandableCalendar
//           renderHeader={renderCustomHeader}
//           hideArrows={true}
//           markedDates={{
//             [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
//             ...Object.keys(agendaItems).reduce((acc, date) => {
//               acc[date] = { marked: true };
//               return acc;
//             }, {}),
//           }}
//         />

//         {/* Employee List */}
//         <View style={styles.employeeListContainer}>
//           <FlatList
//             data={employeeData}
//             renderItem={renderEmployeeItem}
//             keyExtractor={(item) => item.id}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           />
//         </View>
//       </CalendarProvider>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FFFFFF' },
//   attendanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#F8F9FA',
//   },
//   dropdownContainer: {
//     width: 160,
//     backgroundColor: '#fff',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//   },
//   picker: { height: 40, width: '100%' },
//   totalEmployeesContainer: { alignItems: 'flex-end' },
//   totalEmployeesLabel: { fontSize: 12, color: '#666666' },
//   totalEmployeesCount: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     alignItems: 'center',
//   },
//   headerLeft: { flexDirection: 'row', alignItems: 'center' },
//   headerRight: { flexDirection: 'row', alignItems: 'center' },
//   monthText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
//   employeeListContainer: { flex: 1, backgroundColor: '#FFFFFF' },
//   listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
//   employeeItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   employeeInfo: { flexDirection: 'row', alignItems: 'center' },
//   avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
//   employeeDetails: { flex: 1 },
//   employeeName: { fontSize: 16, fontWeight: '600', color: '#4A90E2', marginBottom: 2 },
//   employeeId: { fontSize: 12, color: '#666666', marginBottom: 2 },
//   employeePosition: { fontSize: 12, color: '#666666' },
//   timeContainer: { flexDirection: 'row', alignItems: 'center' },
//   timeColumn: { alignItems: 'center', marginHorizontal: 8 },
//   timeText: { fontSize: 14, fontWeight: '500', color: '#333333', marginBottom: 4 },
//   statusButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
//   statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
//   logoutLabel: { fontSize: 12, color: '#666666' },
// });
