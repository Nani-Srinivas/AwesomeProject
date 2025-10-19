// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Button,
// } from 'react-native';
// import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
// import Feather from 'react-native-vector-icons/Feather';
// import { apiService } from '../../services/apiService';
// import { EditAttendanceModal } from './components/EditAttendanceModal';
// import { COLORS } from '../../constants/colors';
// import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
// import { Picker } from '@react-native-picker/picker';

// const agendaItems = {
//   '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
//   '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
// };

// export const AddAttendance = () => {
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split('T')[0],
//   );
//   const [areas, setAreas] = useState([]);
//   const [selectedArea, setSelectedArea] = useState(null);
//   const [customers, setCustomers] = useState([]);
//   const [attendance, setAttendance] = useState({}); // { customerId: { productId: boolean } }
//   const [expandedCustomers, setExpandedCustomers] = useState({}); // { customerId: boolean }
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [currentCustomerAttendance, setCurrentCustomerAttendance] = useState({});
//   const [feedbackMessage, setFeedbackMessage] = useState(null);
//   const [feedbackMessageType, setFeedbackMessageType] = useState(null); // 'success' or 'error'
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchAreas = async () => {
//       try {
//         const response = await apiService.get('/delivery/area');
//         const fetchedAreas = response.data.data;
//         if (fetchedAreas && fetchedAreas.length > 0) {
//           setAreas(fetchedAreas);
//           setSelectedArea(fetchedAreas[0]._id); // Set first area as default
//         }
//       } catch (error) {
//         console.error('Error fetching areas:', error);
//       }
//     };

//     fetchAreas();
//   }, []);

//   useEffect(() => {
//     if (selectedArea) {
//       const fetchCustomers = async () => {
//         try {
//           const response = await apiService.get(`/customer/area/${selectedArea}`);
//           const fetchedCustomers = response.data.data;
//           if (!fetchedCustomers || !Array.isArray(fetchedCustomers)) {
//             console.warn('Fetched customers data is not an array or is null/undefined.', fetchedCustomers);
//             setCustomers([]);
//             setAttendance({});
//             return;
//           }
//           setCustomers(fetchedCustomers);
//           // Initialize attendance for new customers
//           const initialAttendance = {};
//           fetchedCustomers.forEach(customer => {
//             initialAttendance[customer._id] = {};
//             if (customer.requiredProduct && Array.isArray(customer.requiredProduct)) {
//               customer.requiredProduct.forEach(product => {
//                 if (product.product && product.product._id) {
//                   initialAttendance[customer._id][product.product._id] = {
//                     delivered: true, // Default to checked
//                     quantity: product.quantity, // Use initial quantity
//                   };
//                 }
//               });
//             }
//           });
//           setAttendance(initialAttendance);
//         } catch (error) {
//           console.error('Error fetching customers:', error);
//           setCustomers([]);
//           setAttendance({});
//         }
//       };

//       fetchCustomers();
//     }
//   }, [selectedArea]);

//   const onDateChanged = (date: string) => {
//     setSelectedDate(date);
//   };

//   const toggleCustomerExpansion = (customerId) => {
//     setExpandedCustomers(prev => ({
//       ...prev,
//       [customerId]: !prev[customerId],
//     }));
//   };

//   const handleProductAttendanceChange = (customerId, productId) => {
//     setAttendance(prev => ({
//       ...prev,
//       [customerId]: {
//         ...prev[customerId],
//         [productId]: {
//           ...prev[customerId]?.[productId],
//           delivered: !prev[customerId]?.[productId]?.delivered,
//         },
//       },
//     }));
//   };

//   const openEditModal = (customer) => {
//     setSelectedCustomer(customer);
//     // Pass the current attendance for this customer to the modal
//     setCurrentCustomerAttendance(attendance[customer._id] || {});
//     setIsEditModalVisible(true);
//   };

//   const closeEditModal = () => {
//     setIsEditModalVisible(false);
//     setSelectedCustomer(null);
//   };

//   const goToPreviousMonth = () => {
//     console.log('Go to previous month (not implemented yet)');
//     // Implement calendar navigation logic here
//   };

//   const goToNextMonth = () => {
//     console.log('Go to next month (not implemented yet)');
//     // Implement calendar navigation logic here
//   };

//   const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
//     setCustomers(prevCustomers =>
//       prevCustomers.map(customer => {
//         if (customer._id === customerId) {
//           // Combine edited required products and added extra products
//           const allProductsForCustomer = [...editedRequiredProducts];

//           Object.keys(addedExtraProducts).forEach(productId => {
//             const productDetails = addedExtraProducts[productId];
//             if (productDetails.quantity > 0) {
//               allProductsForCustomer.push({
//                 productId: productId,
//                 name: productDetails.name,
//                 quantity: productDetails.quantity,
//                 delivered: true, // Newly added products are delivered by default
//               });
//             }
//           });

//           // Update attendance state based on the combined list
//           const newAttendanceForCustomer = {};
//           allProductsForCustomer.forEach(p => {
//             newAttendanceForCustomer[p.productId] = {
//               quantity: p.quantity,
//               delivered: p.delivered,
//             };
//           });

//           setAttendance(prev => ({
//             ...prev,
//             [customerId]: newAttendanceForCustomer,
//           }));

//           // Update the customer's requiredProduct to reflect changes from modal
//           // This is important for the FlatList to re-render correctly with updated quantities/products
//           const updatedRequiredProduct = allProductsForCustomer.map(p => ({
//             product: { _id: p.productId, name: p.name }, // Reconstruct product object for requiredProduct structure
//             quantity: p.quantity,
//           }));

//           return { ...customer, requiredProduct: updatedRequiredProduct };
//         }
//         return customer;
//       }),
//     );
//     closeEditModal();
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true); // Set loading to true at the start

//     const formattedAttendance = Object.keys(attendance).map(customerId => ({
//       customerId,
//       products: Object.keys(attendance[customerId])
//         .filter(productId => attendance[customerId][productId]?.delivered && attendance[customerId][productId]?.quantity > 0)
//         .map(productId => ({
//           productId,
//           quantity: attendance[customerId][productId].quantity,
//         })),
//     }));

//     const attendanceData = {
//       date: selectedDate,
//       areaId: selectedArea,
//       attendance: formattedAttendance,
//     };


//     console.log('Submitting attendanceData:', attendanceData);

//     try {
//       // Ensure any open modals are closed before showing feedback
//       if (isEditModalVisible) {
//         closeEditModal();
//       }
//       const response = await apiService.post('/attendance', attendanceData);
//       console.log('Attendance submission successful, showing feedback:', response.data.message);
//       setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
//       setFeedbackMessageType('success');
//       // Optionally, clear form or navigate
//     } catch (error) {
//       console.error('Error submitting attendance:', error);
//       setFeedbackMessage(error.response?.data?.message || 'Failed to submit attendance.');
//       setFeedbackMessageType('error');
//     } finally {
//       setIsLoading(false); // Set loading to false regardless of success or error
//       // Clear feedback message after 3 seconds
//       setTimeout(() => {
//         setFeedbackMessage(null);
//         setFeedbackMessageType(null);
//       }, 3000);
//     }
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

//   return (
//     <View style={styles.container}>
//       {feedbackMessage && (
//         <View style={[styles.feedbackContainer, feedbackMessageType === 'success' ? styles.successBackground : styles.errorBackground]}>
//           <Text style={styles.feedbackText}>{feedbackMessage}</Text>
//         </View>
//       )}
//       <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
//         <ExpandableCalendar
//           hideArrows={true}
//           markedDates={{
//             [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
//             ...Object.keys(agendaItems).reduce((acc, date) => {
//               acc[date] = { marked: true };
//               return acc;
//             }, {}),
//           }}
//         />

//         <View style={styles.attendanceHeader}>
//           <View style={styles.dropdownContainer}>
//             <Picker
//               selectedValue={selectedArea}
//               onValueChange={(itemValue) => setSelectedArea(itemValue)}
//               style={styles.picker}
//             >
//               {areas.map((area) => (
//                 <Picker.Item key={area._id} label={area.name} value={area._id} />
//               ))}
//             </Picker>
//           </View>
//           <View style={styles.totalEmployeesContainer}>
//             <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
//             <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
//           </View>
//         </View>

//         <FlatList
//           data={customers}
//           renderItem={({ item }) => (
//             <CustomerAttendanceItem
//               customer={item}
//               isExpanded={expandedCustomers[item._id]}
//               onToggleExpansion={() => toggleCustomerExpansion(item._id)}
//               attendance={attendance[item._id] || {}}
//               onProductAttendanceChange={(productId) => handleProductAttendanceChange(item._id, productId)}
//               onEdit={() => openEditModal(item)}
//             />
//           )}
//           keyExtractor={item => item._id}
//           contentContainerStyle={styles.listContainer}
//         />
//       </CalendarProvider>

//       <Button title={isLoading ? "Submitting..." : "Submit Attendance"} onPress={handleSubmit} disabled={isLoading} />

//       <EditAttendanceModal
//         isVisible={isEditModalVisible}
//         customer={selectedCustomer}
//         onClose={closeEditModal}
//         onSave={handleSaveAttendance}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   attendanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#F8F9FA',
//   },
//   totalEmployeesContainer: {
//     alignItems: 'flex-end',
//   },
//   totalEmployeesLabel: {
//     fontSize: 12,
//     color: '#666666',
//   },
//   totalEmployeesCount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333333',
//   },
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   dropdownContainer: {
//     width: 200,
//     backgroundColor: '#fff',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//   },
//   picker: { height: 50, width: '100%' },
//   feedbackContainer: {
//     padding: 10,
//     marginHorizontal: 16,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   successBackground: {
//     backgroundColor: COLORS.success,
//   },
//   errorBackground: {
//     backgroundColor: COLORS.error,
//   },
//   feedbackText: {
//     color: COLORS.white,
//     fontWeight: 'bold',
//   },
// });


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Button,
//   Alert,
// } from 'react-native';
// import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
// import Feather from 'react-native-vector-icons/Feather';
// import { apiService } from '../../services/apiService';
// import { EditAttendanceModal } from './components/EditAttendanceModal';
// import { COLORS } from '../../constants/colors';
// import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
// import { Picker } from '@react-native-picker/picker';

// const agendaItems = {
//   '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
//   '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
// };

// export const AddAttendance = () => {
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split('T')[0],
//   );
//   const [areas, setAreas] = useState([]);
//   const [selectedArea, setSelectedArea] = useState(null);
//   const [customers, setCustomers] = useState([]);
//   const [attendance, setAttendance] = useState({}); // { customerId: { productId: { delivered, quantity } } }
//   const [expandedCustomers, setExpandedCustomers] = useState({});
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [currentCustomerAttendance, setCurrentCustomerAttendance] = useState({});
//   const [feedbackMessage, setFeedbackMessage] = useState(null);
//   const [feedbackMessageType, setFeedbackMessageType] = useState(null); // 'success' or 'error'
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchAreas = async () => {
//       try {
//         const response = await apiService.get('/delivery/area');
//         const fetchedAreas = response.data.data;
//         if (fetchedAreas?.length > 0) {
//           setAreas(fetchedAreas);
//           setSelectedArea(fetchedAreas[0]._id); // Default area
//         }
//       } catch (error) {
//         console.error('Error fetching areas:', error);
//       }
//     };
//     fetchAreas();
//   }, []);

//   useEffect(() => {
//     if (!selectedArea) return;

//     const fetchCustomers = async () => {
//       try {
//         const response = await apiService.get(`/customer/area/${selectedArea}`);
//         const fetchedCustomers = response.data.data;
//         if (!Array.isArray(fetchedCustomers)) {
//           console.warn('Invalid customers response:', fetchedCustomers);
//           setCustomers([]);
//           setAttendance({});
//           return;
//         }

//         setCustomers(fetchedCustomers);

//         // Initialize attendance
//         const initialAttendance = {};
//         fetchedCustomers.forEach(customer => {
//           initialAttendance[customer._id] = {};
//           if (Array.isArray(customer.requiredProduct)) {
//             customer.requiredProduct.forEach(product => {
//               if (product.product?._id) {
//                 initialAttendance[customer._id][product.product._id] = {
//                   delivered: true,
//                   quantity: product.quantity,
//                 };
//               }
//             });
//           }
//         });
//         setAttendance(initialAttendance);
//       } catch (error) {
//         console.error('Error fetching customers:', error);
//         setCustomers([]);
//         setAttendance({});
//       }
//     };

//     fetchCustomers();
//   }, [selectedArea]);

//   const onDateChanged = (date: string) => setSelectedDate(date);

//   const toggleCustomerExpansion = (customerId) => {
//     setExpandedCustomers(prev => ({
//       ...prev,
//       [customerId]: !prev[customerId],
//     }));
//   };

//   const handleProductAttendanceChange = (customerId, productId) => {
//     setAttendance(prev => ({
//       ...prev,
//       [customerId]: {
//         ...prev[customerId],
//         [productId]: {
//           ...prev[customerId]?.[productId],
//           delivered: !prev[customerId]?.[productId]?.delivered,
//         },
//       },
//     }));
//   };

//   const openEditModal = (customer) => {
//     setSelectedCustomer(customer);
//     setCurrentCustomerAttendance(attendance[customer._id] || {});
//     setIsEditModalVisible(true);
//   };

//   const closeEditModal = () => {
//     setIsEditModalVisible(false);
//     setSelectedCustomer(null);
//   };

//   const goToPreviousMonth = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setMonth(newDate.getMonth() - 1);
//     setSelectedDate(newDate.toISOString().split('T')[0]);
//   };

//   const goToNextMonth = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setMonth(newDate.getMonth() + 1);
//     setSelectedDate(newDate.toISOString().split('T')[0]);
//   };

//   const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
//     setCustomers(prevCustomers =>
//       prevCustomers.map(customer => {
//         if (customer._id === customerId) {
//           const allProducts = [...editedRequiredProducts];
//           Object.keys(addedExtraProducts).forEach(productId => {
//             const product = addedExtraProducts[productId];
//             if (product.quantity > 0) {
//               allProducts.push({
//                 productId,
//                 name: product.name,
//                 quantity: product.quantity,
//                 delivered: true,
//               });
//             }
//           });

//           const newAttendanceForCustomer = {};
//           allProducts.forEach(p => {
//             newAttendanceForCustomer[p.productId] = {
//               quantity: p.quantity,
//               delivered: p.delivered,
//             };
//           });

//           setAttendance(prev => ({
//             ...prev,
//             [customerId]: newAttendanceForCustomer,
//           }));

//           const updatedRequiredProduct = allProducts.map(p => ({
//             product: { _id: p.productId, name: p.name },
//             quantity: p.quantity,
//           }));

//           return { ...customer, requiredProduct: updatedRequiredProduct };
//         }
//         return customer;
//       }),
//     );
//     closeEditModal();
//   };

//   const handleSubmit = async () => {
//     const today = new Date().toISOString().split('T')[0];

//     // ✅ 1. Prevent past-date submissions
//     if (selectedDate < today) {
//       setFeedbackMessage('Cannot modify attendance for past dates.');
//       setFeedbackMessageType('error');
//       return;
//     }

//     // ✅ 2. Format and filter valid attendance
//     const formattedAttendance = Object.keys(attendance)
//       .map(customerId => ({
//         customerId,
//         products: Object.keys(attendance[customerId])
//           .filter(
//             productId =>
//               attendance[customerId][productId]?.delivered &&
//               attendance[customerId][productId]?.quantity > 0
//           )
//           .map(productId => ({
//             productId,
//             quantity: attendance[customerId][productId].quantity,
//           })),
//       }))
//       .filter(c => c.products.length > 0);

//     if (formattedAttendance.length === 0) {
//       setFeedbackMessage('No valid attendance to submit.');
//       setFeedbackMessageType('error');
//       return;
//     }

//     const attendanceData = {
//       date: selectedDate,
//       areaId: selectedArea,
//       attendance: formattedAttendance,
//     };

//     Alert.alert(
//       'Confirm Submission',
//       `Submit attendance for ${formattedAttendance.length} customers?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Submit',
//           onPress: async () => {
//             setIsLoading(true);
//             try {
//               if (isEditModalVisible) closeEditModal();
//               const response = await apiService.post('/attendance', attendanceData);

//               setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
//               setFeedbackMessageType('success');

//               // ✅ Optional: mark customers as submitted
//               setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
//             } catch (error) {
//               console.error('Error submitting attendance:', error);
//               setFeedbackMessage(
//                 error.response?.data?.message ||
//                 error.message ||
//                 'An unexpected error occurred while submitting attendance.'
//               );
//               setFeedbackMessageType('error');
//             } finally {
//               setIsLoading(false);
//               setTimeout(() => {
//                 setFeedbackMessage(null);
//                 setFeedbackMessageType(null);
//               }, 3000);
//             }
//           },
//         },
//       ],
//     );
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

//   return (
//     <View style={styles.container}>
//       {feedbackMessage && (
//         <View
//           style={[
//             styles.feedbackContainer,
//             feedbackMessageType === 'success'
//               ? styles.successBackground
//               : styles.errorBackground,
//           ]}
//         >
//           <Text style={styles.feedbackText}>{feedbackMessage}</Text>
//         </View>
//       )}

//       <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
//         <ExpandableCalendar
//           hideArrows={true}
//           markedDates={{
//             [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
//             ...Object.keys(agendaItems).reduce((acc, date) => {
//               acc[date] = { marked: true };
//               return acc;
//             }, {}),
//           }}
//         />

//         <View style={styles.attendanceHeader}>
//           <View style={styles.dropdownContainer}>
//             <Picker
//               selectedValue={selectedArea}
//               onValueChange={setSelectedArea}
//               style={styles.picker}
//             >
//               {areas.map(area => (
//                 <Picker.Item key={area._id} label={area.name} value={area._id} />
//               ))}
//             </Picker>
//           </View>
//           <View style={styles.totalEmployeesContainer}>
//             <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
//             <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
//           </View>
//         </View>

//         <FlatList
//           data={customers}
//           renderItem={({ item }) => (
//             <CustomerAttendanceItem
//               customer={item}
//               isExpanded={expandedCustomers[item._id]}
//               onToggleExpansion={() => toggleCustomerExpansion(item._id)}
//               attendance={attendance[item._id] || {}}
//               onProductAttendanceChange={(productId) =>
//                 handleProductAttendanceChange(item._id, productId)
//               }
//               onEdit={() => openEditModal(item)}
//             />
//           )}
//           keyExtractor={item => item._id}
//           contentContainerStyle={styles.listContainer}
//         />
//       </CalendarProvider>

//       <Button
//         title={isLoading ? 'Submitting...' : 'Submit Attendance'}
//         onPress={handleSubmit}
//         disabled={isLoading}
//       />

//       <EditAttendanceModal
//         isVisible={isEditModalVisible}
//         customer={selectedCustomer}
//         onClose={closeEditModal}
//         onSave={handleSaveAttendance}
//       />
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
//   totalEmployeesContainer: { alignItems: 'flex-end' },
//   totalEmployeesLabel: { fontSize: 12, color: '#666666' },
//   totalEmployeesCount: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
//   listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
//   dropdownContainer: {
//     width: 200,
//     backgroundColor: '#fff',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//   },
//   picker: { height: 50, width: '100%' },
//   feedbackContainer: {
//     padding: 10,
//     marginHorizontal: 16,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   successBackground: { backgroundColor: COLORS.success },
//   errorBackground: { backgroundColor: COLORS.error },
//   feedbackText: { color: COLORS.white, fontWeight: 'bold' },
// });


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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

        // Initialize attendance
        const initialAttendance = {};
        fetchedCustomers.forEach(customer => {
          initialAttendance[customer._id] = {};
          if (Array.isArray(customer.requiredProduct)) {
            customer.requiredProduct.forEach(product => {
              if (product.product?._id) {
                initialAttendance[customer._id][product.product._id] = {
                  delivered: true,
                  quantity: product.quantity,
                };
              }
            });
          }
        });
        setAttendance(initialAttendance);
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

  const handleProductAttendanceChange = (customerId, productId) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          delivered: !prev[customerId]?.[productId]?.delivered,
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
          const allProducts = [...editedRequiredProducts];
          Object.keys(addedExtraProducts).forEach(productId => {
            const product = addedExtraProducts[productId];
            if (product.quantity > 0) {
              allProducts.push({
                productId,
                name: product.name,
                quantity: product.quantity,
                delivered: true,
              });
            }
          });

          const newAttendanceForCustomer = {};
          allProducts.forEach(p => {
            newAttendanceForCustomer[p.productId] = {
              quantity: p.quantity,
              delivered: p.delivered,
            };
          });

          setAttendance(prev => ({
            ...prev,
            [customerId]: newAttendanceForCustomer,
          }));

          const updatedRequiredProduct = allProducts.map(p => ({
            product: { _id: p.productId, name: p.name },
            quantity: p.quantity,
          }));

          return { ...customer, requiredProduct: updatedRequiredProduct };
        }
        return customer;
      })
    );
    closeEditModal();
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
        products: Object.keys(attendance[customerId])
          .filter(pid => attendance[customerId][pid]?.delivered && attendance[customerId][pid]?.quantity > 0)
          .map(pid => ({ productId: pid, quantity: attendance[customerId][pid].quantity })),
      }))
      .filter(c => c.products.length > 0);

    if (formattedAttendance.length === 0) {
      setFeedbackMessage('No valid attendance to submit.');
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
      const response = await apiService.post('/attendance', payload);

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      // Mark customers as submitted
      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
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

        <FlatList
          data={customers}
          renderItem={({ item }) => (
            <CustomerAttendanceItem
              customer={item}
              isExpanded={expandedCustomers[item._id]}
              onToggleExpansion={() => toggleCustomerExpansion(item._id)}
              attendance={attendance[item._id] || {}}
              onProductAttendanceChange={pid => handleProductAttendanceChange(item._id, pid)}
              onEdit={() => openEditModal(item)}
            />
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
        />
      </CalendarProvider>

      <Button
        title={isLoading ? 'Submitting...' : 'Submit Attendance'}
        onPress={handleSubmit}
        disabled={isLoading}
      />

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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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


