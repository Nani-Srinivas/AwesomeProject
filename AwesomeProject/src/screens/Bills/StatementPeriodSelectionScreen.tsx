// // StatementPeriodSelection.tsx
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import { Calendar } from 'react-native-calendars';
// import { COLORS } from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';

// const Tab = createMaterialTopTabNavigator();

// type Props = { customerId?: string };

// // --- Monthly tab ---
// const MonthlyStatement = ({ customerId }: Props) => {
//   const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
//   const navigation = useNavigation();

//   const availablePeriods = useMemo(() => {
//     const periods = [];
//     const today = new Date();
//     // Start from the current month
//     let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

//     for (let i = 0; i < 12; i++) {
//       const month = currentDate.toLocaleString('default', { month: 'long' });
//       const year = currentDate.getFullYear();
//       periods.push(`${month} ${year}`);
//       currentDate.setMonth(currentDate.getMonth() - 1);
//     }
//     return periods;
//   }, []);

//   const handleViewStatement = () => {
//     if (selectedPeriod) {
//       navigation.navigate('Invoice' as never, {
//         customerId,
//         period: selectedPeriod,
//         type: 'monthly',
//       } as never);
//     } else {
//       Alert.alert('Selection Required', 'Please select a statement period.');
//     }
//   };

//   const handleDownload = () => {
//     if (selectedPeriod) {
//       Alert.alert(
//         'Download',
//         `Downloading statement for ${selectedPeriod}...`
//       );
//     } else {
//       Alert.alert('Selection Required', 'Please select a statement period.');
//     }
//   };

//   const isPeriodDisabled = (period: string) => {
//     const today = new Date();
//     const periodDate = new Date(period);
//     return periodDate.getFullYear() > today.getFullYear() ||
//            (periodDate.getFullYear() === today.getFullYear() && periodDate.getMonth() > today.getMonth());
//   };

//   return (
//     <View style={styles.container}>
//       {customerId && <Text style={styles.customerInfo}>Statements for {customerId}</Text>}
//       {!customerId && <Text style={styles.customerInfo}>Select a monthly statement</Text>}

//       <View style={styles.periodGrid}>
//         {availablePeriods.map((period) => {
//           const isDisabled = isPeriodDisabled(period);
//           return (
//             <TouchableOpacity
//               key={period}
//               style={[
//                 styles.periodButton,
//                 selectedPeriod === period && styles.selectedPeriodButton,
//                 isDisabled && styles.disabledButton,
//               ]}
//               onPress={() => !isDisabled && setSelectedPeriod(period)}
//               disabled={isDisabled}
//             >
//               <Text
//                 style={[
//                   styles.periodButtonText,
//                   selectedPeriod === period && styles.selectedPeriodButtonText,
//                 ]}
//               >
//                 {period}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Actions Row */}
//       <View style={styles.actionsRow}>
//         <TouchableOpacity
//           style={[
//             styles.viewStatementButton,
//             styles.rowButton,
//             !selectedPeriod && styles.disabledButton,
//           ]}
//           onPress={handleViewStatement}
//           disabled={!selectedPeriod}
//         >
//           <Text style={styles.viewStatementButtonText}>View Statement</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.downloadButton, !selectedPeriod && styles.disabledButton]}
//           onPress={handleDownload}
//           disabled={!selectedPeriod}
//         >
//           <Text style={styles.downloadButtonText}>Download</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // --- Custom tab ---
// const CustomStatement = ({ customerId }: Props) => {
//   const today = new Date().toISOString().split('T')[0];
//   const [startDate, setStartDate] = useState<string | null>(null);
//   const [endDate, setEndDate] = useState<string | null>(null);
//   const navigation = useNavigation();

//   const onDayPress = (day: { dateString: string }) => {
//     const picked = day.dateString;

//     if (!startDate && !endDate) {
//       setStartDate(picked);
//       return;
//     }

//     if (startDate && !endDate) {
//       if (picked === startDate) {
//         setEndDate(picked);
//       } else if (picked > startDate) {
//         setEndDate(picked);
//       } else {
//         setEndDate(startDate);
//         setStartDate(picked);
//       }
//       return;
//     }

//     setStartDate(picked);
//     setEndDate(null);
//   };

//   const markedDates = useMemo(() => {
//     const marks: Record<string, any> = {};
//     if (!startDate) return marks;

//     if (startDate && !endDate) {
//       marks[startDate] = {
//         startingDay: true,
//         endingDay: true,
//         color: COLORS.primary,
//         textColor: '#ffffff',
//       };
//       return marks;
//     }

//     if (startDate && endDate) {
//       let startStr = startDate;
//       let endStr = endDate;

//       if (new Date(startStr) > new Date(endStr)) {
//         [startStr, endStr] = [endStr, startStr];
//       }

//       let curr = new Date(startStr);
//       const end = new Date(endStr);

//       while (curr <= end) {
//         const d = curr.toISOString().split('T')[0];
//         if (d === startStr && d === endStr) {
//           marks[d] = { startingDay: true, endingDay: true, color: COLORS.primary, textColor: '#fff' };
//         } else if (d === startStr) {
//           marks[d] = { startingDay: true, color: COLORS.primary, textColor: '#fff' };
//         } else if (d === endStr) {
//           marks[d] = { endingDay: true, color: COLORS.primary, textColor: '#fff' };
//         } else {
//           marks[d] = { color: '#E6F3FF', textColor: '#000' };
//         }
//         curr.setDate(curr.getDate() + 1);
//       }
//     }

//     return marks;
//   }, [startDate, endDate]);

//   const handleClear = () => {
//     setStartDate(null);
//     setEndDate(null);
//   };

//   const handleViewStatement = () => {
//     if (startDate && endDate) {
//       navigation.navigate('Invoice' as never, {
//         customerId,
//         from: startDate,
//         to: endDate,
//         type: 'custom',
//       } as never);
//     } else {
//       Alert.alert('Selection Required', 'Please select both From and To dates.');
//     }
//   };

//   const handleDownload = () => {
//     if (startDate && endDate) {
//       Alert.alert(
//         'Download',
//         `Downloading statement from ${startDate} to ${endDate}...`
//       );
//     } else {
//       Alert.alert('Selection Required', 'Please select both From and To dates.');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//       <View style={styles.container}>
//         <Text style={styles.customerInfo}>
//           {customerId ? `Statements for ${customerId}` : 'Select a custom date range for statements'}
//         </Text>

//         <Calendar
//           onDayPress={onDayPress}
//           markingType={'period'}
//           markedDates={markedDates}
//           firstDay={1}
//         />

//         {/* Selected dates cards */}
//         <View style={styles.cardsRow}>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>From</Text>
//             <Text style={styles.cardValue}>{startDate ?? '—'}</Text>
//           </View>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>To</Text>
//             <Text style={styles.cardValue}>{endDate ?? '—'}</Text>
//           </View>
//         </View>

//         {/* Actions: Clear + View Statement + Download */}
//         <View style={styles.actionsRow}>
//           <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
//             <Text style={styles.clearButtonText}>Clear</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.viewStatementButton,
//               styles.rowButton,
//               !(startDate && endDate) && styles.disabledButton,
//             ]}
//             onPress={handleViewStatement}
//             disabled={!(startDate && endDate)}
//           >
//             <Text style={styles.viewStatementButtonText}>View</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.downloadButton, !(startDate && endDate) && styles.disabledButton]}
//             onPress={handleDownload}
//             disabled={!(startDate && endDate)}
//           >
//             <Text style={styles.downloadButtonText}>↓</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// // --- Tab navigator wrapper ---
// export const StatementPeriodSelection = ({ route }: any) => {
//   const customerId = route?.params?.customerId;

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
//         tabBarStyle: { backgroundColor: COLORS.white },
//         tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
//       }}
//     >
//       <Tab.Screen name="Monthly">
//         {() => <MonthlyStatement customerId={customerId} />}
//       </Tab.Screen>
//       <Tab.Screen name="Custom">
//         {() => <CustomStatement customerId={customerId} />}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// };

// // --- styles ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: COLORS.background,
//   },
//   customerInfo: {
//     fontSize: 16,
//     color: COLORS.accent,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   periodGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   periodButton: {
//     width: '48%',
//     backgroundColor: COLORS.white,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   selectedPeriodButton: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   periodButtonText: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   selectedPeriodButtonText: {
//     color: COLORS.white,
//   },
//   viewStatementButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   viewStatementButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   cardsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 12,
//     borderRadius: 10,
//     marginHorizontal: 6,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 13,
//     color: COLORS.accent,
//     marginBottom: 6,
//   },
//   cardValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     marginTop: 18,
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   clearButtonText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   rowButton: {
//     flex: 1,
//     marginLeft: 8,
//     marginTop: 0,
//   },
//   downloadButton: {
//     backgroundColor: '#F0F0F0',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     marginLeft: 8,
//   },
//   downloadButtonText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
// });






// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Linking,
//   Modal,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import { Calendar } from 'react-native-calendars';
// import { COLORS } from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import { apiService } from '../../services/apiService'; // Import apiService

// const Tab = createMaterialTopTabNavigator();

// type Props = { customerId?: string };

// // --- Monthly tab ---
// const MonthlyStatement = ({ customerId }: Props) => {
//   const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false); // Added loading state
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [previewVisible, setPreviewVisible] = useState<boolean>(false);
//   const navigation = useNavigation();

//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec

//   // Generate all 12 months of current year (Jan–Dec)
//   const availablePeriods = useMemo(() => {
//     const months = [];
//     for (let i = 0; i < 12; i++) {
//       const monthName = new Date(currentYear, i).toLocaleString('default', {
//         month: 'long',
//       });
//       months.push(`${monthName} ${currentYear}`);
//     }
//     return months;
//   }, [currentYear]);

//   // Disable months after the current month
//   const isPeriodDisabled = (monthIndex: number) => monthIndex > currentMonth;

//   const handleGenerateBill = async () => {
//     try {
//       setLoading(true);
//       const response = await apiService.post('/invoice/generate', {
//         customerId,
//         period: selectedPeriod,
//       });
//       console.log('API Response:', response.data);

//       const pdfLink =
//         response.data.pdf?.url;
//         console.log('PDF Link:', pdfLink);

//       setPdfUrl(pdfLink);

//       if (pdfLink) {
//         Alert.alert('Success', 'Bill generated successfully!');
//       } else {
//         Alert.alert('Warning', 'Bill generated but no PDF URL found.');
//       }
//     } catch (err: any) {
//       Alert.alert('Error', err.message || 'Failed to generate bill.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePreview = () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }
//     //Linking.openURL(pdfUrl);
//     setPreviewVisible(true);
//   };

//   const handleClosePreview = () => setPreviewVisible(false);
//   // const handleViewStatement = () => {
//   //   if (selectedPeriod) {
//   //     navigation.navigate('Invoice' as never, {
//   //       customerId,
//   //       period: selectedPeriod,
//   //       type: 'monthly',
//   //     } as never);
//   //   } else {
//   //     Alert.alert('Selection Required', 'Please select a statement period.');
//   //   }
//   // };

//   const handleDownload = async () => {
//     if (!selectedPeriod) {
//       Alert.alert('Selection Required', 'Please select a statement period.');
//       return;
//     }
//     if (!customerId) {
//       Alert.alert('Error', 'Customer ID is missing.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await apiService.post('/invoices/generate', {
//         customerId,
//         period: selectedPeriod,
//       });
//       Alert.alert(
//         'Success',
//         response.data.message || 'Invoice generated and saved!',
//       );
//       // Optionally navigate to InvoiceHistoryScreen here
//     } catch (error: any) {
//       console.error('Failed to generate invoice:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to generate invoice.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {customerId && (
//         <Text style={styles.customerInfo}>Statements for {customerId}</Text>
//       )}
//       {!customerId && (
//         <Text style={styles.customerInfo}>Select a monthly statement</Text>
//       )}

//       <View style={styles.periodGrid}>
//         {availablePeriods.map((period, index) => {
//           const isDisabled = isPeriodDisabled(index);
//           const isSelected = selectedPeriod === period;
//           const isCurrentMonth = index === currentMonth;

//           const buttonStyles = [styles.periodButton];

//           if (isCurrentMonth && !isSelected) {
//             buttonStyles.push(styles.currentMonthHighlight);
//           }
//           if (isSelected) {
//             buttonStyles.push(styles.selectedPeriodButton);
//           }
//           if (isDisabled) {
//             buttonStyles.push(styles.disabledButton);
//           }

//           return (
//             <TouchableOpacity
//               key={period}
//               style={buttonStyles}
//               disabled={isDisabled}
//               onPress={() => !isDisabled && setSelectedPeriod(period)}
//             >
//               <Text
//                 style={[
//                   styles.periodButtonText,
//                   isSelected && styles.selectedPeriodButtonText,
//                   isDisabled && styles.disabledButtonText,
//                 ]}
//               >
//                 {period}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Actions Row */}
//       <View style={styles.actionsRow}>
//         <TouchableOpacity
//           style={[
//             styles.viewStatementButton,
//             styles.rowButton,
//             (!selectedPeriod || loading) && styles.disabledButton,
//           ]}
//           onPress={handleGenerateBill}
//           disabled={!selectedPeriod || loading}
//         >
//           <Text style={styles.viewStatementButtonText}>Generate Bill</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.viewStatementButton,
//             styles.rowButton,
//             (!selectedPeriod || loading) && styles.disabledButton,
//           ]}
//           onPress={handlePreview}
//           disabled={!selectedPeriod || loading}
//         >
//           <Text style={styles.viewStatementButtonText}>View Statement</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.downloadButton,
//             (!selectedPeriod || loading) && styles.disabledButton,
//           ]}
//           onPress={handleDownload}
//           disabled={!selectedPeriod || loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color={COLORS.text} />
//           ) : (
//             <Text style={styles.downloadButtonText}>Download</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//       {/* ✅ WebView Modal for PDF Preview */}
//       <Modal
//         visible={previewVisible}
//         animationType="slide"
//         onRequestClose={handleClosePreview}
//       >
//         <View style={{ flex: 1, backgroundColor: '#fff' }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               padding: 12,
//               backgroundColor: COLORS.primary,
//             }}
//           >
//             <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
//               Invoice Preview
//             </Text>
//             <TouchableOpacity onPress={handleClosePreview}>
//               <Text style={{ color: '#fff', fontWeight: '700' }}>✕</Text>
//             </TouchableOpacity>
//           </View>
//           {pdfUrl ? (
//             <WebView
//               source={{ uri: pdfUrl }}
//               startInLoadingState
//               renderLoading={() => (
//                 <ActivityIndicator
//                   size="large"
//                   color={COLORS.primary}
//                   style={{ marginTop: 20 }}
//                 />
//               )}
//             />
//           ) : (
//             <Text style={{ textAlign: 'center', marginTop: 20 }}>
//               No PDF available
//             </Text>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // --- Custom tab (unchanged) ---
// const CustomStatement = ({ customerId }: Props) => {
//   const today = new Date().toISOString().split('T')[0];
//   const [startDate, setStartDate] = useState<string | null>(null);
//   const [endDate, setEndDate] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false); // Added loading state
//   const navigation = useNavigation();

//   const onDayPress = (day: { dateString: string }) => {
//     const picked = day.dateString;

//     if (!startDate && !endDate) {
//       setStartDate(picked);
//       return;
//     }

//     if (startDate && !endDate) {
//       if (picked === startDate) {
//         setEndDate(picked);
//       } else if (picked > startDate) {
//         setEndDate(picked);
//       } else {
//         setEndDate(startDate);
//         setStartDate(picked);
//       }
//       return;
//     }

//     setStartDate(picked);
//     setEndDate(null);
//   };

//   const markedDates = useMemo(() => {
//     const marks: Record<string, any> = {};
//     if (!startDate) return marks;

//     if (startDate && !endDate) {
//       marks[startDate] = {
//         startingDay: true,
//         endingDay: true,
//         color: COLORS.primary,
//         textColor: '#ffffff',
//       };
//       return marks;
//     }

//     if (startDate && endDate) {
//       let startStr = startDate;
//       let endStr = endDate;

//       if (new Date(startStr) > new Date(endStr)) {
//         [startStr, endStr] = [endStr, startStr];
//       }

//       let curr = new Date(startStr);
//       const end = new Date(endStr);

//       while (curr <= end) {
//         const d = curr.toISOString().split('T')[0];
//         if (d === startStr && d === endStr) {
//           marks[d] = {
//             startingDay: true,
//             endingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else if (d === startStr) {
//           marks[d] = {
//             startingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else if (d === endStr) {
//           marks[d] = {
//             endingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else {
//           marks[d] = { color: '#E6F3FF', textColor: '#000' };
//         }
//         curr.setDate(curr.getDate() + 1);
//       }
//     }

//     return marks;
//   }, [startDate, endDate]);

//   const handleClear = () => {
//     setStartDate(null);
//     setEndDate(null);
//   };

//   const handleViewStatement = () => {
//     if (startDate && endDate) {
//       navigation.navigate(
//         'Invoice' as never,
//         {
//           customerId,
//           from: startDate,
//           to: endDate,
//           type: 'custom',
//         } as never,
//       );
//     } else {
//       Alert.alert(
//         'Selection Required',
//         'Please select both From and To dates.',
//       );
//     }
//   };

//   const handleDownload = async () => {
//     if (!startDate || !endDate) {
//       Alert.alert(
//         'Selection Required',
//         'Please select both From and To dates.',
//       );
//       return;
//     }
//     if (!customerId) {
//       Alert.alert('Error', 'Customer ID is missing.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await apiService.post('/invoices/generate', {
//         customerId,
//         period: `${startDate} to ${endDate}`,
//       });
//       Alert.alert(
//         'Success',
//         response.data.message || 'Invoice generated and saved!',
//       );
//       // Optionally navigate to InvoiceHistoryScreen here
//     } catch (error: any) {
//       console.error('Failed to generate invoice:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to generate invoice.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//       <View style={styles.container}>
//         <Text style={styles.customerInfo}>
//           {customerId
//             ? `Statements for ${customerId}`
//             : 'Select a custom date range for statements'}
//         </Text>

//         <Calendar
//           onDayPress={onDayPress}
//           markingType={'period'}
//           markedDates={markedDates}
//           firstDay={1}
//         />

//         <View style={styles.cardsRow}>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>From</Text>
//             <Text style={styles.cardValue}>{startDate ?? '—'}</Text>
//           </View>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>To</Text>
//             <Text style={styles.cardValue}>{endDate ?? '—'}</Text>
//           </View>
//         </View>

//         <View style={styles.actionsRow}>
//           <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
//             <Text style={styles.clearButtonText}>Clear</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.viewStatementButton,
//               styles.rowButton,
//               (!(startDate && endDate) || loading) && styles.disabledButton,
//             ]}
//             onPress={handleViewStatement}
//             disabled={!(startDate && endDate) || loading}
//           >
//             <Text style={styles.viewStatementButtonText}>View</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.viewStatementButton,
//               styles.rowButton,
//               (!(startDate && endDate) || loading) && styles.disabledButton,
//             ]}
//             onPress={handleViewStatement}
//             disabled={!(startDate && endDate) || loading}
//           >
//             <Text style={styles.viewStatementButtonText}>View</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.downloadButton,
//               (!(startDate && endDate) || loading) && styles.disabledButton,
//             ]}
//             onPress={handleDownload}
//             disabled={!(startDate && endDate) || loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color={COLORS.text} />
//             ) : (
//               <Text style={styles.downloadButtonText}>↓</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// // --- Tab navigator wrapper ---
// export const StatementPeriodSelection = ({ route }: any) => {
//   const customerId = route?.params?.customerId;

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
//         tabBarStyle: { backgroundColor: COLORS.white },
//         tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
//       }}
//     >
//       <Tab.Screen name="Monthly">
//         {() => <MonthlyStatement customerId={customerId} />}
//       </Tab.Screen>
//       <Tab.Screen name="Custom">
//         {() => <CustomStatement customerId={customerId} />}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: COLORS.background,
//   },
//   customerInfo: {
//     fontSize: 16,
//     color: COLORS.accent,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   periodGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   periodButton: {
//     width: '48%',
//     backgroundColor: COLORS.white,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   selectedPeriodButton: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   periodButtonText: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   selectedPeriodButtonText: {
//     color: COLORS.white,
//   },
//   disabledButton: {
//     opacity: 0.4,
//   },
//   disabledButtonText: {
//     color: '#999',
//     textDecorationLine: 'line-through',
//   },
//   currentMonthHighlight: {
//     borderWidth: 1.3,
//     borderColor: COLORS.primary,
//     backgroundColor: '#F7FAFF',
//   },
//   viewStatementButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   viewStatementButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     marginTop: 18,
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   clearButtonText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   rowButton: {
//     flex: 1,
//     marginLeft: 8,
//     marginTop: 0,
//   },
//   downloadButton: {
//     backgroundColor: '#F0F0F0',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     marginLeft: 8,
//   },
//   downloadButtonText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   cardsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 12,
//     borderRadius: 10,
//     marginHorizontal: 6,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 13,
//     color: COLORS.accent,
//     marginBottom: 6,
//   },
//   cardValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
// });



// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   Share,
//   Platform,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import { Calendar } from 'react-native-calendars';
// import { COLORS } from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import RNFS from 'react-native-fs';
// import { PermissionsAndroid } from 'react-native';

// const Tab = createMaterialTopTabNavigator();

// type Props = { customerId?: string };

// // --- Monthly tab ---
// const MonthlyStatement = ({ customerId }: Props) => {
//   const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [previewVisible, setPreviewVisible] = useState<boolean>(false);
//   const navigation = useNavigation();

//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const availablePeriods = useMemo(() => {
//     const months = [];
//     for (let i = 0; i < 12; i++) {
//       const monthName = new Date(currentYear, i).toLocaleString('default', {
//         month: 'long',
//       });
//       months.push(`${monthName} ${currentYear}`);
//     }
//     return months;
//   }, [currentYear]);

//   const isPeriodDisabled = (monthIndex: number) => monthIndex > currentMonth;

//   const handleGenerateBill = async () => {
//     if (!selectedPeriod) {
//       Alert.alert('Selection Required', 'Please select a statement period.');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await apiService.post('/invoice/generate', {
//         customerId,
//         period: selectedPeriod,
//       });

//       const pdfLink = response.data.pdf?.url;
//       setPdfUrl(pdfLink);

//       if (pdfLink) {
//         Alert.alert('Success', 'Bill generated successfully!');
//       } else {
//         Alert.alert('Warning', 'Bill generated but no PDF URL found.');
//       }
//     } catch (err: any) {
//       Alert.alert('Error', err.message || 'Failed to generate bill.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewStatement = () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }
//     setPreviewVisible(true);
//   };

//   const requestStoragePermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const androidVersion = Platform.Version;
        
//         // Android 13+ (API 33+) doesn't need WRITE_EXTERNAL_STORAGE
//         if (androidVersion >= 33) {
//           return true;
//         }
        
//         // For Android 10-12 (API 29-32)
//         if (androidVersion >= 29) {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//             {
//               title: 'Storage Permission',
//               message: 'App needs access to your storage to download PDF',
//               buttonNeutral: 'Ask Me Later',
//               buttonNegative: 'Cancel',
//               buttonPositive: 'OK',
//             },
//           );
//           return granted === PermissionsAndroid.RESULTS.GRANTED;
//         }
        
//         // For older Android versions
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//           {
//             title: 'Storage Permission',
//             message: 'App needs access to your storage to download PDF',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleShare = async () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }

//     try {
//       const fileName = `invoice_${selectedPeriod?.replace(/\s+/g, '_')}.pdf`;
//       const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

//       // Download the file to cache (no permission needed)
//       const downloadResult = await RNFS.downloadFile({
//         fromUrl: pdfUrl,
//         toFile: filePath,
//       }).promise;

//       if (downloadResult.statusCode === 200) {
//         await Share.share({
//           url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
//           title: 'Share Invoice',
//         });
//       } else {
//         Alert.alert('Error', 'Failed to download PDF for sharing');
//       }
//     } catch (error) {
//       console.error('Share error:', error);
//       Alert.alert('Error', 'Failed to share the PDF');
//     }
//   };

//   const handleDownload = async () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }

//     try {
//       const hasPermission = await requestStoragePermission();
//       if (!hasPermission) {
//         Alert.alert('Permission Denied', 'Storage permission is required to download files');
//         return;
//       }

//       const fileName = `invoice_${selectedPeriod?.replace(/\s+/g, '_')}.pdf`;
//       const downloadDest = Platform.OS === 'ios' 
//         ? `${RNFS.DocumentDirectoryPath}/${fileName}`
//         : `${RNFS.DownloadDirectoryPath}/${fileName}`;

//       const downloadResult = await RNFS.downloadFile({
//         fromUrl: pdfUrl,
//         toFile: downloadDest,
//       }).promise;

//       if (downloadResult.statusCode === 200) {
//         Alert.alert(
//           'Success', 
//           Platform.OS === 'ios' 
//             ? `Invoice saved to Documents` 
//             : `Invoice downloaded to Downloads folder`
//         );
//       } else {
//         Alert.alert('Error', 'Failed to download PDF');
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       Alert.alert('Error', 'Failed to download the PDF');
//     }
//   };

//   const handleClosePreview = () => setPreviewVisible(false);

//   return (
//     <View style={styles.container}>
//       {customerId && (
//         <Text style={styles.customerInfo}>Statements for {customerId}</Text>
//       )}
//       {!customerId && (
//         <Text style={styles.customerInfo}>Select a monthly statement</Text>
//       )}

//       <View style={styles.periodGrid}>
//         {availablePeriods.map((period, index) => {
//           const isDisabled = isPeriodDisabled(index);
//           const isSelected = selectedPeriod === period;
//           const isCurrentMonth = index === currentMonth;

//           const buttonStyles = [styles.periodButton];

//           if (isCurrentMonth && !isSelected) {
//             buttonStyles.push(styles.currentMonthHighlight);
//           }
//           if (isSelected) {
//             buttonStyles.push(styles.selectedPeriodButton);
//           }
//           if (isDisabled) {
//             buttonStyles.push(styles.disabledButton);
//           }

//           return (
//             <TouchableOpacity
//               key={period}
//               style={buttonStyles}
//               disabled={isDisabled}
//               onPress={() => !isDisabled && setSelectedPeriod(period)}
//             >
//               <Text
//                 style={[
//                   styles.periodButtonText,
//                   isSelected && styles.selectedPeriodButtonText,
//                   isDisabled && styles.disabledButtonText,
//                 ]}
//               >
//                 {period}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Generate Button */}
//       <TouchableOpacity
//         style={[
//           styles.generateButton,
//           (!selectedPeriod || loading) && styles.disabledButton,
//         ]}
//         onPress={handleGenerateBill}
//         disabled={!selectedPeriod || loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color={COLORS.white} />
//         ) : (
//           <Text style={styles.generateButtonText}>Generate Bill</Text>
//         )}
//       </TouchableOpacity>

//       {/* Preview, Share, Download Buttons */}
//       {pdfUrl && (
//         <View style={styles.actionButtonsRow}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.previewButton]}
//             onPress={handleViewStatement}
//           >
//             <Text style={styles.actionButtonText}>👁️ Preview</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.shareButton]}
//             onPress={handleShare}
//           >
//             <Text style={styles.actionButtonText}>📤 Share</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.downloadButton2]}
//             onPress={handleDownload}
//           >
//             <Text style={styles.actionButtonText}>⬇️ Download</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Preview Modal */}
//       <Modal
//         visible={previewVisible}
//         animationType="slide"
//         onRequestClose={handleClosePreview}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Invoice Preview</Text>
//             <TouchableOpacity onPress={handleClosePreview}>
//               <Text style={styles.closeButton}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           {pdfUrl ? (
//             <WebView
//               source={{ 
//                 uri: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` 
//               }}
//               startInLoadingState={true}
//               renderLoading={() => (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator
//                     size="large"
//                     color={COLORS.primary}
//                   />
//                   <Text style={styles.loadingText}>Loading PDF...</Text>
//                 </View>
//               )}
//               style={styles.webview}
//               onError={(syntheticEvent) => {
//                 const { nativeEvent } = syntheticEvent;
//                 console.warn('WebView error: ', nativeEvent);
//               }}
//               onHttpError={(syntheticEvent) => {
//                 const { nativeEvent } = syntheticEvent;
//                 console.warn('WebView HTTP error: ', nativeEvent);
//               }}
//             />
//           ) : (
//             <Text style={styles.noPdfText}>No PDF available</Text>
//           )}

//           {/* Action Buttons in Modal */}
//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={styles.modalActionButton}
//               onPress={handleShare}
//             >
//               <Text style={styles.modalActionText}>📤 Share</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.modalActionButton}
//               onPress={handleDownload}
//             >
//               <Text style={styles.modalActionText}>⬇️ Download</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // --- Custom tab ---
// const CustomStatement = ({ customerId }: Props) => {
//   const [startDate, setStartDate] = useState<string | null>(null);
//   const [endDate, setEndDate] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [previewVisible, setPreviewVisible] = useState<boolean>(false);

//   const onDayPress = (day: { dateString: string }) => {
//     const picked = day.dateString;
//     const today = new Date().toISOString().split('T')[0];

//     // Prevent selecting future dates
//     if (picked > today) {
//       Alert.alert('Invalid Date', 'Cannot select future dates.');
//       return;
//     }

//     if (!startDate && !endDate) {
//       setStartDate(picked);
//       return;
//     }

//     if (startDate && !endDate) {
//       if (picked === startDate) {
//         setEndDate(picked);
//       } else if (picked > startDate) {
//         setEndDate(picked);
//       } else {
//         setEndDate(startDate);
//         setStartDate(picked);
//       }
//       return;
//     }

//     setStartDate(picked);
//     setEndDate(null);
//   };

//   const markedDates = useMemo(() => {
//     const marks: Record<string, any> = {};
//     if (!startDate) return marks;

//     if (startDate && !endDate) {
//       marks[startDate] = {
//         startingDay: true,
//         endingDay: true,
//         color: COLORS.primary,
//         textColor: '#ffffff',
//       };
//       return marks;
//     }

//     if (startDate && endDate) {
//       let startStr = startDate;
//       let endStr = endDate;

//       if (new Date(startStr) > new Date(endStr)) {
//         [startStr, endStr] = [endStr, startStr];
//       }

//       let curr = new Date(startStr);
//       const end = new Date(endStr);

//       while (curr <= end) {
//         const d = curr.toISOString().split('T')[0];
//         if (d === startStr && d === endStr) {
//           marks[d] = {
//             startingDay: true,
//             endingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else if (d === startStr) {
//           marks[d] = {
//             startingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else if (d === endStr) {
//           marks[d] = {
//             endingDay: true,
//             color: COLORS.primary,
//             textColor: '#fff',
//           };
//         } else {
//           marks[d] = { color: '#E6F3FF', textColor: '#000' };
//         }
//         curr.setDate(curr.getDate() + 1);
//       }
//     }

//     return marks;
//   }, [startDate, endDate]);

//   const handleClear = () => {
//     setStartDate(null);
//     setEndDate(null);
//     setPdfUrl(null);
//   };

//   const handleGenerateBill = async () => {
//     if (!startDate || !endDate) {
//       Alert.alert('Selection Required', 'Please select both From and To dates.');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await apiService.post('/invoice/generate', {
//         customerId,
//         from: startDate,
//         to: endDate,
//       });

//       const pdfLink = response.data.pdf?.url;
//       setPdfUrl(pdfLink);

//       if (pdfLink) {
//         Alert.alert('Success', 'Bill generated successfully!');
//       } else {
//         Alert.alert('Warning', 'Bill generated but no PDF URL found.');
//       }
//     } catch (err: any) {
//       Alert.alert('Error', err.message || 'Failed to generate bill.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewStatement = () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }
//     setPreviewVisible(true);
//   };

//   const requestStoragePermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//           {
//             title: 'Storage Permission',
//             message: 'App needs access to your storage to download PDF',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleShare = async () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }

//     try {
//       const hasPermission = await requestStoragePermission();
//       if (!hasPermission) {
//         Alert.alert('Permission Denied', 'Storage permission is required to share files');
//         return;
//       }

//       const fileName = `invoice_${startDate}_to_${endDate}.pdf`;
//       const { config, fs } = RNFetchBlob;
//       const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
//       const filePath = `${downloadDir}/${fileName}`;

//       const configOptions = Platform.select({
//         ios: {
//           fileCache: true,
//           path: filePath,
//           appendExt: 'pdf',
//         },
//         android: {
//           fileCache: true,
//           path: filePath,
//           appendExt: 'pdf',
//           addAndroidDownloads: {
//             useDownloadManager: false,
//             notification: false,
//           },
//         },
//       });

//       const res = await config(configOptions).fetch('GET', pdfUrl);
      
//       await Share.share({
//         url: Platform.OS === 'ios' ? res.path() : `file://${res.path()}`,
//         title: 'Share Invoice',
//       });

//     } catch (error) {
//       console.error('Share error:', error);
//       Alert.alert('Error', 'Failed to share the PDF');
//     }
//   };

//   const handleDownload = async () => {
//     if (!pdfUrl) {
//       Alert.alert('No PDF', 'Please generate the bill first.');
//       return;
//     }

//     try {
//       const hasPermission = await requestStoragePermission();
//       if (!hasPermission) {
//         Alert.alert('Permission Denied', 'Storage permission is required to download files');
//         return;
//       }

//       const fileName = `invoice_${startDate}_to_${endDate}.pdf`;
//       const { config, fs } = RNFetchBlob;
//       const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
//       const filePath = `${downloadDir}/${fileName}`;

//       const configOptions = Platform.select({
//         ios: {
//           fileCache: true,
//           path: filePath,
//           appendExt: 'pdf',
//         },
//         android: {
//           fileCache: true,
//           path: filePath,
//           appendExt: 'pdf',
//           addAndroidDownloads: {
//             useDownloadManager: true,
//             notification: true,
//             title: fileName,
//             description: 'Downloading invoice PDF',
//             mime: 'application/pdf',
//           },
//         },
//       });

//       const res = await config(configOptions).fetch('GET', pdfUrl);
      
//       if (Platform.OS === 'ios') {
//         Alert.alert('Success', `Invoice saved to ${res.path()}`);
//       } else {
//         Alert.alert('Success', 'Invoice downloaded successfully!');
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       Alert.alert('Error', 'Failed to download the PDF');
//     }
//   };

//   const handleClosePreview = () => setPreviewVisible(false);

//   return (
//     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//       <View style={styles.container}>
//         <Text style={styles.customerInfo}>
//           {customerId
//             ? `Statements for ${customerId}`
//             : 'Select a custom date range for statements'}
//         </Text>

//         <Calendar
//           onDayPress={onDayPress}
//           markingType={'period'}
//           markedDates={markedDates}
//           maxDate={new Date().toISOString().split('T')[0]}
//           firstDay={1}
//         />

//         <View style={styles.cardsRow}>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>From</Text>
//             <Text style={styles.cardValue}>{startDate ?? '—'}</Text>
//           </View>
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>To</Text>
//             <Text style={styles.cardValue}>{endDate ?? '—'}</Text>
//           </View>
//         </View>

//         {/* Generate Button */}
//         <TouchableOpacity
//           style={[
//             styles.generateButton,
//             (!(startDate && endDate) || loading) && styles.disabledButton,
//           ]}
//           onPress={handleGenerateBill}
//           disabled={!(startDate && endDate) || loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color={COLORS.white} />
//           ) : (
//             <Text style={styles.generateButtonText}>Generate Bill</Text>
//           )}
//         </TouchableOpacity>

//         {/* Preview, Share, Download Buttons */}
//         {pdfUrl && (
//           <View style={styles.actionButtonsRow}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.previewButton]}
//               onPress={handleViewStatement}
//             >
//               <Text style={styles.actionButtonText}>👁️ Preview</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionButton, styles.shareButton]}
//               onPress={handleShare}
//             >
//               <Text style={styles.actionButtonText}>📤 Share</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionButton, styles.downloadButton2]}
//               onPress={handleDownload}
//             >
//               <Text style={styles.actionButtonText}>⬇️ Download</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Preview Modal */}
//         <Modal
//           visible={previewVisible}
//           animationType="slide"
//           onRequestClose={handleClosePreview}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Invoice Preview</Text>
//               <TouchableOpacity onPress={handleClosePreview}>
//                 <Text style={styles.closeButton}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             {pdfUrl ? (
//               <WebView
//                 source={{ 
//                   uri: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` 
//                 }}
//                 startInLoadingState={true}
//                 renderLoading={() => (
//                   <View style={styles.loadingContainer}>
//                     <ActivityIndicator
//                       size="large"
//                       color={COLORS.primary}
//                     />
//                     <Text style={styles.loadingText}>Loading PDF...</Text>
//                   </View>
//                 )}
//                 style={styles.webview}
//                 onError={(syntheticEvent) => {
//                   const { nativeEvent } = syntheticEvent;
//                   console.warn('WebView error: ', nativeEvent);
//                 }}
//                 onHttpError={(syntheticEvent) => {
//                   const { nativeEvent } = syntheticEvent;
//                   console.warn('WebView HTTP error: ', nativeEvent);
//                 }}
//               />
//             ) : (
//               <Text style={styles.noPdfText}>No PDF available</Text>
//             )}

//             {/* Action Buttons in Modal */}
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.modalActionButton}
//                 onPress={handleShare}
//               >
//                 <Text style={styles.modalActionText}>📤 Share</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalActionButton}
//                 onPress={handleDownload}
//               >
//                 <Text style={styles.modalActionText}>⬇️ Download</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </ScrollView>
//   );
// };

// // --- Tab navigator wrapper ---
// export const StatementPeriodSelection = ({ route }: any) => {
//   const customerId = route?.params?.customerId;

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
//         tabBarStyle: { backgroundColor: COLORS.white },
//         tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
//       }}
//     >
//       <Tab.Screen name="Monthly">
//         {() => <MonthlyStatement customerId={customerId} />}
//       </Tab.Screen>
//       <Tab.Screen name="Custom">
//         {() => <CustomStatement customerId={customerId} />}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: COLORS.background,
//   },
//   customerInfo: {
//     fontSize: 16,
//     color: COLORS.accent,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   periodGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   periodButton: {
//     width: '48%',
//     backgroundColor: COLORS.white,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   selectedPeriodButton: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   periodButtonText: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   selectedPeriodButtonText: {
//     color: COLORS.white,
//   },
//   disabledButton: {
//     opacity: 0.4,
//   },
//   disabledButtonText: {
//     color: '#999',
//     textDecorationLine: 'line-through',
//   },
//   currentMonthHighlight: {
//     borderWidth: 1.3,
//     borderColor: COLORS.primary,
//     backgroundColor: '#F7FAFF',
//   },
//   generateButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   generateButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     marginTop: 18,
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: COLORS.background,
//   },
//   clearButtonText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   rowButton: {
//     flex: 1,
//     marginLeft: 8,
//     marginTop: 0,
//   },
//   cardsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 12,
//     borderRadius: 10,
//     marginHorizontal: 6,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 13,
//     color: COLORS.accent,
//     marginBottom: 6,
//   },
//   cardValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: COLORS.primary,
//   },
//   modalTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   closeButton: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   webview: {
//     flex: 1,
//   },
//   noPdfText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: COLORS.accent,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   modalActionButton: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginHorizontal: 6,
//     alignItems: 'center',
//   },
//   modalActionText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionButtonsRow: {
//     flexDirection: 'row',
//     marginTop: 16,
//     gap: 10,
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   previewButton: {
//     backgroundColor: '#4A90E2',
//   },
//   shareButton: {
//     backgroundColor: '#50C878',
//   },
//   downloadButton2: {
//     backgroundColor: '#FF6B6B',
//   },
//   actionButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.accent,
//   },
// });



import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Share,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';

const Tab = createMaterialTopTabNavigator();

type Props = { customerId?: string };

// --- Monthly tab ---
const MonthlyStatement = ({ customerId }: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const availablePeriods = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i).toLocaleString('default', {
        month: 'long',
      });
      months.push(`${monthName} ${currentYear}`);
    }
    return months;
  }, [currentYear]);

  const isPeriodDisabled = (monthIndex: number) => monthIndex > currentMonth;

  const handleGenerateBill = async () => {
    if (!selectedPeriod) {
      Alert.alert('Selection Required', 'Please select a statement period.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post('/invoice/generate', {
        customerId,
        period: selectedPeriod,
      });

      const pdfLink = response.data.pdf?.url;
      setPdfUrl(pdfLink);

      if (pdfLink) {
        Alert.alert('Success', 'Bill generated successfully!');
      } else {
        Alert.alert('Warning', 'Bill generated but no PDF URL found.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate bill.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatement = () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }
    setPreviewVisible(true);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        
        // Android 13+ (API 33+) doesn't need WRITE_EXTERNAL_STORAGE
        if (androidVersion >= 33) {
          return true;
        }
        
        // For Android 10-12 (API 29-32)
        if (androidVersion >= 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to download PDF',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        
        // For older Android versions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleShare = async () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }

    try {
      const fileName = `invoice_${selectedPeriod?.replace(/\s+/g, '_')}.pdf`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Download the file to cache (no permission needed)
      const downloadResult = await RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        await Share.share({
          url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
          title: 'Share Invoice',
        });
      } else {
        Alert.alert('Error', 'Failed to download PDF for sharing');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share the PDF');
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files');
        return;
      }

      const fileName = `invoice_${selectedPeriod?.replace(/\s+/g, '_')}.pdf`;
      const downloadDest = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: downloadDest,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert(
          'Success', 
          Platform.OS === 'ios' 
            ? `Invoice saved to Documents` 
            : `Invoice downloaded to Downloads folder`
        );
      } else {
        Alert.alert('Error', 'Failed to download PDF');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download the PDF');
    }
  };

  const handleClosePreview = () => setPreviewVisible(false);

  return (
    <View style={styles.container}>
      {customerId && (
        <Text style={styles.customerInfo}>Statements for {customerId}</Text>
      )}
      {!customerId && (
        <Text style={styles.customerInfo}>Select a monthly statement</Text>
      )}

      <View style={styles.periodGrid}>
        {availablePeriods.map((period, index) => {
          const isDisabled = isPeriodDisabled(index);
          const isSelected = selectedPeriod === period;
          const isCurrentMonth = index === currentMonth;

          const buttonStyles = [styles.periodButton];

          if (isCurrentMonth && !isSelected) {
            buttonStyles.push(styles.currentMonthHighlight);
          }
          if (isSelected) {
            buttonStyles.push(styles.selectedPeriodButton);
          }
          if (isDisabled) {
            buttonStyles.push(styles.disabledButton);
          }

          return (
            <TouchableOpacity
              key={period}
              style={buttonStyles}
              disabled={isDisabled}
              onPress={() => !isDisabled && setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  isSelected && styles.selectedPeriodButtonText,
                  isDisabled && styles.disabledButtonText,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.generateButton,
          (!selectedPeriod || loading) && styles.disabledButton,
        ]}
        onPress={handleGenerateBill}
        disabled={!selectedPeriod || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.generateButtonText}>Generate Bill</Text>
        )}
      </TouchableOpacity>

      {/* Preview, Share, Download Buttons */}
      {pdfUrl && (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.previewButton]}
            onPress={handleViewStatement}
          >
            <Text style={styles.actionButtonText}>👁️ Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Text style={styles.actionButtonText}>📤 Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton2]}
            onPress={handleDownload}
          >
            <Text style={styles.actionButtonText}>⬇️ Download</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        onRequestClose={handleClosePreview}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invoice Preview</Text>
            <TouchableOpacity 
              onPress={handleClosePreview} 
              style={styles.closeButtonContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {pdfUrl ? (
            <WebView
              source={{ 
                uri: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` 
              }}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                  />
                  <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
              )}
              style={styles.webview}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView HTTP error: ', nativeEvent);
              }}
            />
          ) : (
            <Text style={styles.noPdfText}>No PDF available</Text>
          )}

          {/* Action Buttons in Modal */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={handleShare}
            >
              <Text style={styles.modalActionText}>📤 Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={handleDownload}
            >
              <Text style={styles.modalActionText}>⬇️ Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.closeActionButton]}
              onPress={handleClosePreview}
            >
              <Text style={styles.modalActionText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

// --- Custom tab ---
const CustomStatement = ({ customerId }: Props) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  const onDayPress = (day: { dateString: string }) => {
    const picked = day.dateString;
    const today = new Date().toISOString().split('T')[0];

    // Prevent selecting future dates
    if (picked > today) {
      Alert.alert('Invalid Date', 'Cannot select future dates.');
      return;
    }

    if (!startDate && !endDate) {
      setStartDate(picked);
      return;
    }

    if (startDate && !endDate) {
      if (picked === startDate) {
        setEndDate(picked);
      } else if (picked > startDate) {
        setEndDate(picked);
      } else {
        setEndDate(startDate);
        setStartDate(picked);
      }
      return;
    }

    setStartDate(picked);
    setEndDate(null);
  };

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (!startDate) return marks;

    if (startDate && !endDate) {
      marks[startDate] = {
        startingDay: true,
        endingDay: true,
        color: COLORS.primary,
        textColor: '#ffffff',
      };
      return marks;
    }

    if (startDate && endDate) {
      let startStr = startDate;
      let endStr = endDate;

      if (new Date(startStr) > new Date(endStr)) {
        [startStr, endStr] = [endStr, startStr];
      }

      let curr = new Date(startStr);
      const end = new Date(endStr);

      while (curr <= end) {
        const d = curr.toISOString().split('T')[0];
        if (d === startStr && d === endStr) {
          marks[d] = {
            startingDay: true,
            endingDay: true,
            color: COLORS.primary,
            textColor: '#fff',
          };
        } else if (d === startStr) {
          marks[d] = {
            startingDay: true,
            color: COLORS.primary,
            textColor: '#fff',
          };
        } else if (d === endStr) {
          marks[d] = {
            endingDay: true,
            color: COLORS.primary,
            textColor: '#fff',
          };
        } else {
          marks[d] = { color: '#E6F3FF', textColor: '#000' };
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    return marks;
  }, [startDate, endDate]);

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setPdfUrl(null);
  };

  const handleGenerateBill = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Selection Required', 'Please select both From and To dates.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post('/invoice/generate', {
        customerId,
        from: startDate,
        to: endDate,
      });

      const pdfLink = response.data.pdf?.url;
      setPdfUrl(pdfLink);

      if (pdfLink) {
        Alert.alert('Success', 'Bill generated successfully!');
      } else {
        Alert.alert('Warning', 'Bill generated but no PDF URL found.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate bill.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatement = () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }
    setPreviewVisible(true);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleShare = async () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to share files');
        return;
      }

      const fileName = `invoice_${startDate}_to_${endDate}.pdf`;
      const { config, fs } = RNFetchBlob;
      const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const configOptions = Platform.select({
        ios: {
          fileCache: true,
          path: filePath,
          appendExt: 'pdf',
        },
        android: {
          fileCache: true,
          path: filePath,
          appendExt: 'pdf',
          addAndroidDownloads: {
            useDownloadManager: false,
            notification: false,
          },
        },
      });

      const res = await config(configOptions).fetch('GET', pdfUrl);
      
      await Share.share({
        url: Platform.OS === 'ios' ? res.path() : `file://${res.path()}`,
        title: 'Share Invoice',
      });

    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share the PDF');
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      Alert.alert('No PDF', 'Please generate the bill first.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files');
        return;
      }

      const fileName = `invoice_${startDate}_to_${endDate}.pdf`;
      const { config, fs } = RNFetchBlob;
      const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const configOptions = Platform.select({
        ios: {
          fileCache: true,
          path: filePath,
          appendExt: 'pdf',
        },
        android: {
          fileCache: true,
          path: filePath,
          appendExt: 'pdf',
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: 'Downloading invoice PDF',
            mime: 'application/pdf',
          },
        },
      });

      const res = await config(configOptions).fetch('GET', pdfUrl);
      
      if (Platform.OS === 'ios') {
        Alert.alert('Success', `Invoice saved to ${res.path()}`);
      } else {
        Alert.alert('Success', 'Invoice downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download the PDF');
    }
  };

  const handleClosePreview = () => setPreviewVisible(false);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.customerInfo}>
          {customerId
            ? `Statements for ${customerId}`
            : 'Select a custom date range for statements'}
        </Text>

        <Calendar
          onDayPress={onDayPress}
          markingType={'period'}
          markedDates={markedDates}
          maxDate={new Date().toISOString().split('T')[0]}
          firstDay={1}
        />

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>From</Text>
            <Text style={styles.cardValue}>{startDate ?? '—'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>To</Text>
            <Text style={styles.cardValue}>{endDate ?? '—'}</Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!(startDate && endDate) || loading) && styles.disabledButton,
          ]}
          onPress={handleGenerateBill}
          disabled={!(startDate && endDate) || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.generateButtonText}>Generate Bill</Text>
          )}
        </TouchableOpacity>

        {/* Preview, Share, Download Buttons */}
        {pdfUrl && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.previewButton]}
              onPress={handleViewStatement}
            >
              <Text style={styles.actionButtonText}>👁️ Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={styles.actionButtonText}>📤 Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton2]}
              onPress={handleDownload}
            >
              <Text style={styles.actionButtonText}>⬇️ Download</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Preview Modal */}
        <Modal
          visible={previewVisible}
          animationType="slide"
          onRequestClose={handleClosePreview}
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.modalContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Preview</Text>
              <TouchableOpacity 
                onPress={handleClosePreview} 
                style={styles.closeButtonContainer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {pdfUrl ? (
              <WebView
                source={{ 
                  uri: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` 
                }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={COLORS.primary}
                    />
                    <Text style={styles.loadingText}>Loading PDF...</Text>
                  </View>
                )}
                style={styles.webview}
                scalesPageToFit={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
              />
            ) : (
              <Text style={styles.noPdfText}>No PDF available</Text>
            )}

            {/* Action Buttons in Modal */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={handleShare}
              >
                <Text style={styles.modalActionText}>📤 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={handleDownload}
              >
                <Text style={styles.modalActionText}>⬇️ Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.closeActionButton]}
                onPress={handleClosePreview}
              >
                <Text style={styles.modalActionText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </ScrollView>
  );
};

// --- Tab navigator wrapper ---
export const StatementPeriodSelection = ({ route }: any) => {
  const customerId = route?.params?.customerId;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarStyle: { backgroundColor: COLORS.white },
        tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
      }}
    >
      <Tab.Screen name="Monthly">
        {() => <MonthlyStatement customerId={customerId} />}
      </Tab.Screen>
      <Tab.Screen name="Custom">
        {() => <CustomStatement customerId={customerId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  customerInfo: {
    fontSize: 16,
    color: COLORS.accent,
    marginBottom: 12,
    textAlign: 'center',
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  periodButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledButtonText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentMonthHighlight: {
    borderWidth: 1.3,
    borderColor: COLORS.primary,
    backgroundColor: '#F7FAFF',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  clearButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  rowButton: {
    flex: 1,
    marginLeft: 8,
    marginTop: 0,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    color: COLORS.accent,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButtonContainer: {
    padding: 8,
    marginRight: -4,
  },
  closeButton: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  noPdfText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.accent,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  closeActionButton: {
    backgroundColor: '#DC3545',
  },
  modalActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButton: {
    backgroundColor: '#4A90E2',
  },
  shareButton: {
    backgroundColor: '#50C878',
  },
  downloadButton2: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.accent,
  },
});


