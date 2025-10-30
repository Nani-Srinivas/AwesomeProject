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
//   SafeAreaView,
//   StatusBar,
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
//         presentationStyle="fullScreen"
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Invoice Preview</Text>
//             <TouchableOpacity 
//               onPress={handleClosePreview} 
//               style={styles.closeButtonContainer}
//               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//             >
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
//               scalesPageToFit={true}
//               javaScriptEnabled={true}
//               domStorageEnabled={true}
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
//             <TouchableOpacity
//               style={[styles.modalActionButton, styles.closeActionButton]}
//               onPress={handleClosePreview}
//             >
//               <Text style={styles.modalActionText}>✕ Close</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
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
//           presentationStyle="fullScreen"
//         >
//           <SafeAreaView style={styles.modalContainer}>
//             <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Invoice Preview</Text>
//               <TouchableOpacity 
//                 onPress={handleClosePreview} 
//                 style={styles.closeButtonContainer}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
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
//                 scalesPageToFit={true}
//                 javaScriptEnabled={true}
//                 domStorageEnabled={true}
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
//               <TouchableOpacity
//                 style={[styles.modalActionButton, styles.closeActionButton]}
//                 onPress={handleClosePreview}
//               >
//                 <Text style={styles.modalActionText}>✕ Close</Text>
//               </TouchableOpacity>
//             </View>
//           </SafeAreaView>
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
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: COLORS.primary,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   modalTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   closeButtonContainer: {
//     padding: 8,
//     marginRight: -4,
//   },
//   closeButton: {
//     color: '#fff',
//     fontSize: 32,
//     fontWeight: '700',
//     lineHeight: 32,
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   noPdfText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: COLORS.accent,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#f8f9fa',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   modalActionButton: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginHorizontal: 6,
//     alignItems: 'center',
//   },
//   closeActionButton: {
//     backgroundColor: '#DC3545',
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

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Modal,
  StatusBar,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';

const Tab = createMaterialTopTabNavigator();

type Invoice = {
  id: string;
  billNo: string;
  period: string;
  fromDate: string;
  toDate: string;
  grandTotal: string;
  url: string;
  generatedAt: string;
};

type Props = { 
  customerId?: string;
  onInvoiceGenerated?: () => void;
};

// =====================================================
// INVOICE LIST COMPONENT (Redesigned - Minimal)
// =====================================================
const InvoiceList = ({ 
  customerId, 
  onRefresh 
}: { 
  customerId: string; 
  onRefresh?: () => void;
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await apiService.get(`/invoice/customer/${customerId}`);
      setInvoices(response.data.invoices || []);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchInvoices();
    }
  }, [customerId, fetchInvoices]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
    onRefresh?.();
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewUrl(invoice.url);
    setPreviewVisible(true);
  };

  const handleShare = async (invoice: Invoice) => {
    try {
      const fileName = `${invoice.billNo}.pdf`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: invoice.url,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        await Share.share({
          url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
          title: `Invoice ${invoice.billNo}`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission required');
        return;
      }

      const fileName = `${invoice.billNo}.pdf`;
      const downloadDest = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: invoice.url,
        toFile: downloadDest,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert('Success', `Invoice downloaded successfully`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  const handleRegenerate = async (invoice: Invoice) => {
    Alert.alert(
      'Regenerate Invoice',
      'This will delete the existing invoice and generate a new one. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.post(`/invoice/regenerate/${invoice.id}`);
              Alert.alert('Success', 'Invoice regenerated successfully');
              fetchInvoices();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to regenerate');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (invoice: Invoice) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.delete(`/invoice/${invoice.id}`);
              Alert.alert('Success', 'Invoice deleted successfully');
              fetchInvoices();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <View style={styles.invoiceCard}>
        <TouchableOpacity 
          style={styles.invoiceMainContent}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.invoiceMainLeft}>
            <Text style={styles.invoiceBillNo}>{item.billNo}</Text>
            <Text style={styles.invoicePeriod}>{item.period}</Text>
            <Text style={styles.invoiceDate}>
              {new Date(item.generatedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.invoiceMainRight}>
            <Text style={styles.invoiceAmount}>₹{item.grandTotal}</Text>
            <Text style={styles.expandHint}>
              {isExpanded ? 'Tap to collapse' : 'Tap for actions'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.invoiceActionsExpanded}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePreview(item)}
            >
              <Text style={styles.actionButtonText}>View Invoice</Text>
            </TouchableOpacity>

            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={[styles.actionButtonSmall, styles.shareButton]}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.actionButtonSmallText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButtonSmall, styles.downloadButton]}
                onPress={() => handleDownload(item)}
              >
                <Text style={styles.actionButtonSmallText}>Download</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={[styles.actionButtonSmall, styles.regenerateButton]}
                onPress={() => handleRegenerate(item)}
              >
                <Text style={styles.actionButtonSmallText}>Regenerate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButtonSmall, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.actionButtonSmallText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceCard}
        contentContainerStyle={styles.invoiceListContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No invoices generated yet</Text>
            <Text style={styles.emptySubtext}>Generate your first invoice below</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />

{/* Preview Modal */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invoice Preview</Text>
            <TouchableOpacity 
              onPress={() => setPreviewVisible(false)} 
              style={styles.closeButtonContainer}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {previewUrl && (
            <WebView
              source={{ 
                uri: `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true` 
              }}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
              )}
              style={styles.webview}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

// =====================================================
// MONTHLY STATEMENT TAB (Fixed Layout)
// =====================================================
const MonthlyStatement = ({ customerId }: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingInvoices, setExistingInvoices] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

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

  const fetchExistingPeriods = useCallback(async () => {
    try {
      const response = await apiService.get(`/invoice/customer/${customerId}`);
      const periods = new Set(
        response.data.invoices.map((inv: Invoice) => inv.period)
      );
      setExistingInvoices(periods);
    } catch (error) {
      console.error('Failed to fetch existing invoices:', error);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchExistingPeriods();
    }
  }, [customerId, fetchExistingPeriods, refreshKey]);

  const isPeriodDisabled = (monthIndex: number, period: string) => {
    if (monthIndex > currentMonth) return true;
    return existingInvoices.has(period);
  };

  const handleGenerateBill = async () => {
    if (!selectedPeriod) {
      Alert.alert('Selection Required', 'Please select a statement period.');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/invoice/generate', {
        customerId,
        period: selectedPeriod,
      });

      Alert.alert('Success', 'Bill generated successfully!');
      setSelectedPeriod(null);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert('Duplicate Invoice', 'Invoice already exists for this period.');
      } else {
        Alert.alert('Error', err.message || 'Failed to generate bill.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.tabContainer}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.sectionTitle}>Generated Invoices</Text>
      </View>

      {/* Scrollable Invoice List */}
      <View style={styles.invoiceListSection}>
        <InvoiceList 
          customerId={customerId!} 
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      </View>

      {/* Scrollable Period Selection */}
      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollableContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Generate New Invoice</Text>
        
        <View style={styles.periodGrid}>
          {availablePeriods.map((period, index) => {
            const isDisabled = isPeriodDisabled(index, period);
            const isSelected = selectedPeriod === period;
            const isCurrentMonth = index === currentMonth;
            const alreadyGenerated = existingInvoices.has(period);

            const buttonStyles = [styles.periodButton];

            if (isCurrentMonth && !isSelected && !alreadyGenerated) {
              buttonStyles.push(styles.currentMonthHighlight);
            }
            if (isSelected) {
              buttonStyles.push(styles.selectedPeriodButton);
            }
            if (isDisabled) {
              buttonStyles.push(styles.disabledButton);
            }
            if (alreadyGenerated) {
              buttonStyles.push(styles.generatedButton);
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
                {alreadyGenerated && (
                  <Text style={styles.generatedBadge}>Generated</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Generate Button */}
      <View style={styles.fixedFooter}>
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
            <Text style={styles.generateButtonText}>
              {selectedPeriod ? `Generate Bill for ${selectedPeriod}` : 'Select a Period'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================================
// CUSTOM STATEMENT TAB (Fixed Layout)
// =====================================================
const CustomStatement = ({ customerId }: Props) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onDayPress = (day: { dateString: string }) => {
    const picked = day.dateString;
    const today = new Date().toISOString().split('T')[0];

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
  };

  const handleGenerateBill = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Selection Required', 'Please select both From and To dates.');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/invoice/generate', {
        customerId,
        from: startDate,
        to: endDate,
      });

      Alert.alert('Success', 'Bill generated successfully!');
      handleClear();
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert('Duplicate Invoice', 'Invoice already exists for this period.');
      } else {
        Alert.alert('Error', err.message || 'Failed to generate bill.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.tabContainer}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.sectionTitle}>Generated Invoices</Text>
      </View>

      {/* Scrollable Invoice List */}
      <View style={styles.invoiceListSection}>
        <InvoiceList 
          customerId={customerId!} 
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollableContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select Date Range</Text>
        
        <Calendar
          onDayPress={onDayPress}
          markingType={'period'}
          markedDates={markedDates}
          maxDate={new Date().toISOString().split('T')[0]}
          firstDay={1}
        />

        <View style={styles.dateCards}>
          <View style={styles.dateCard}>
            <Text style={styles.dateCardLabel}>From Date</Text>
            <Text style={styles.dateCardValue}>{startDate || 'Not selected'}</Text>
          </View>
          <View style={styles.dateCard}>
            <Text style={styles.dateCardLabel}>To Date</Text>
            <Text style={styles.dateCardValue}>{endDate || 'Not selected'}</Text>
          </View>
        </View>

        {(startDate || endDate) && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear Selection</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Fixed Generate Button */}
      <View style={styles.fixedFooter}>
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
            <Text style={styles.generateButtonText}>
              {startDate && endDate 
                ? `Generate Bill (${startDate} to ${endDate})`
                : 'Select Date Range'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================
const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        return true;
      }
      
      if (androidVersion >= 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// =====================================================
// TAB NAVIGATOR WRAPPER
// =====================================================
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

// =====================================================
// STYLES (Redesigned & Fixed)
// =====================================================
const styles = StyleSheet.create({
  // Main Layout
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  invoiceListSection: {
    height: 220,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for fixed button
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Typography
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  // Invoice List
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.accent,
  },
  invoiceListContainer: {
    padding: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },

  // Invoice Card (Minimal Design)
  invoiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  invoiceMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  invoiceMainLeft: {
    flex: 1,
  },
  invoiceMainRight: {
    alignItems: 'flex-end',
  },
  invoiceBillNo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  invoicePeriod: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 2,
    fontWeight: '500',
  },
  invoiceDate: {
    fontSize: 12,
    color: COLORS.accent,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  expandHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },

  // Expanded Actions (Clean Design)
  invoiceActionsExpanded: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButtonSmall: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonSmallText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#34A853',
  },
  downloadButton: {
    backgroundColor: '#4285F4',
  },
  regenerateButton: {
    backgroundColor: '#FBBC04',
  },
  deleteButton: {
    backgroundColor: '#EA4335',
  },

  // Period Grid
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  periodButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
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
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  generatedButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  generatedBadge: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '700',
    marginTop: 4,
  },

  // Date Cards
  dateCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateCardLabel: {
    fontSize: 12,
    color: COLORS.accent,
    marginBottom: 6,
    fontWeight: '500',
  },
  dateCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Clear Button
  clearButton: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '600',
  },

  // Generate Button
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
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
});