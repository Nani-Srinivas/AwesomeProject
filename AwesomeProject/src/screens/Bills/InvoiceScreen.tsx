// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import { COLORS } from '../../constants/colors';

// interface InvoiceItem {
//   date: string;
//   product: string;
//   qty: string;
//   sp: string;
//   total: string;
// }

// interface InvoiceData {
//   billNo: string;
//   fromDate: string;
//   toDate: string;
//   company: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   customer: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   items: InvoiceItem[];
//   deliveryCharges: string;
//   grandTotal: string;
// }

// export const InvoiceScreen = () => {
//   const route = useRoute();
//   const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

//   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // Parse the period (e.g., "October 2025") into start and end dates
//         console.log('Period received:', period, 'length:', period.length, 'char codes:', Array.from(period).map(char => char.charCodeAt(0)));

//         // Use a regex to extract month and year more robustly
//         const match = period.trim().match(/^([a-zA-Z]+)\s+(\d{4})$/);
//         if (!match) {
//           console.error('Period string did not match expected format:', period);
//           throw new Error(`Invalid period format: ${period}`);
//         }
//         const monthName = match[1];
//         const yearString = match[2];
//         console.log('Parsed monthName (regex):', monthName, 'yearString (regex):', yearString);

//         const dateStringForParsing = `${monthName} 1, ${yearString}`;
//         const parsedDate = new Date(dateStringForParsing);
//         if (isNaN(parsedDate.getTime())) {
//           console.error('Invalid Date object created from:', dateStringForParsing);
//           throw new Error(`Invalid date format for period: ${period}`);
//         }
//         const year = parsedDate.getFullYear();
//         const monthIndex = parsedDate.getMonth(); // 0-indexed month
//         console.log('Final year:', year, 'Final monthIndex:', monthIndex);

//         const startDate = new Date(year, monthIndex, 1);
//         const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month
//         console.log('Generated startDate:', startDate, 'endDate:', endDate);

//         if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//           console.error('startDate or endDate is an Invalid Date object.', { startDate, endDate });
//           throw new Error(`Failed to generate valid date range for period: ${period}`);
//         }

//         const formattedStartDate = startDate.toISOString().split('T')[0];
//         const formattedEndDate = endDate.toISOString().split('T')[0];
//         console.log('Formatted startDate:', formattedStartDate, 'formattedEndDate:', formattedEndDate);

//         const response = await apiService.get(
//           `/invoice?customerId=${customerId}&period=${period}`
//         );
//         setInvoiceData(response.data);
//       } catch (err: any) {
//         console.error('Failed to fetch invoice:', err);
//         setError(err.message || 'Failed to load invoice data.');
//         Alert.alert('Error', err.message || 'Failed to load invoice data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && period) {
//       fetchInvoice();
//     }
//   }, [customerId, period]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading invoice...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   if (!invoiceData) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>No invoice data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Bill</Text>
//         <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
//         <Text style={styles.billDates}>
//           Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
//         </Text>
//       </View>

//       {/* Company + Customer Row */}
//       <View style={styles.row}>
//         {/* Company (Left) */}
//         <View style={styles.companyBox}>
//           {/* <View style={styles.logoBox} /> */}
//           <Text style={styles.companyName}>{invoiceData.company.name}</Text>
//           <Text style={styles.text}>{invoiceData.company.address}</Text>
//           <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
//         </View>

//         {/* Customer (Right) */}
//         <View style={styles.customerBox}>
//           <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
//           <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
//           <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
//         </View>
//       </View>

//       {/* Table */}
//       <View style={styles.table}>
//         {/* Table Header */}
//         <View style={styles.tableHeader}>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
//           <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>SP</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
//         </View>

//         {/* Table Rows */}
//         {invoiceData.items.map((item, idx) => (
//           <View key={idx} style={styles.tableRow}>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.date}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>{item.product}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.qty}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.sp}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.total}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Summary */}
//       <View style={styles.summary}>
//         <Text style={styles.summaryText}>Delivery Charges : {invoiceData.deliveryCharges}</Text>
//         <Text style={styles.summaryTotal}>Grand Total : {invoiceData.grandTotal}</Text>
//       </View>
//     </ScrollView>
//   );
// };

// export default InvoiceScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 12,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   header: {
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//   },
//   billNo: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   billDates: {
//     fontSize: 13,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   companyBox: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   customerBox: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   logoBox: {
//     width: 60,
//     height: 60,
//     backgroundColor: '#000',
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   text: {
//     fontSize: 13,
//     fontWeight: '400',
//   },
//   table: {
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 16,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#333',
//     paddingVertical: 6,
//   },
//   tableHeaderText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//     paddingVertical: 6,
//   },
//   tableCell: {
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   summary: {
//     marginTop: 8,
//     alignItems: 'flex-end',
//   },
//   summaryText: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   summaryTotal: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import { COLORS } from '../../constants/colors';

// interface InvoiceItem {
//   date: string;
//   product: string;
//   qty: string;
//   sp: string;
//   total: string;
// }

// interface InvoiceData {
//   billNo: string;
//   fromDate: string;
//   toDate: string;
//   company: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   customer: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   items: InvoiceItem[];
//   deliveryCharges: string;
//   grandTotal: string;
// }

// // Month name to index mapping
// const MONTH_MAP: { [key: string]: number } = {
//   'january': 0,
//   'february': 1,
//   'march': 2,
//   'april': 3,
//   'may': 4,
//   'june': 5,
//   'july': 6,
//   'august': 7,
//   'september': 8,
//   'october': 9,
//   'november': 10,
//   'december': 11,
// };

// export const InvoiceScreen = () => {
//   const route = useRoute();
//   const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

//   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Period received:', period, 'length:', period.length);

//         // Use a regex to extract month and year
//         const match = period.trim().match(/^([a-zA-Z]+)\s+(\d{4})$/);
//         if (!match) {
//           console.error('Period string did not match expected format:', period);
//           throw new Error(`Invalid period format: ${period}`);
//         }
//         const monthName = match[1].toLowerCase();
//         const yearString = match[2];
//         console.log('Parsed monthName:', monthName, 'yearString:', yearString);

//         // Map month name to index
//         const monthIndex = MONTH_MAP[monthName];
//         if (monthIndex === undefined) {
//           console.error('Invalid month name:', monthName);
//           throw new Error(`Invalid month name: ${monthName}`);
//         }

//         const year = parseInt(yearString, 10);
//         if (isNaN(year)) {
//           console.error('Invalid year:', yearString);
//           throw new Error(`Invalid year: ${yearString}`);
//         }

//         console.log('Final year:', year, 'Final monthIndex:', monthIndex);

//         const startDate = new Date(year, monthIndex, 1);
//         const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month
//         console.log('Generated startDate:', startDate, 'endDate:', endDate);

//         if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//           console.error('startDate or endDate is an Invalid Date object.', { startDate, endDate });
//           throw new Error(`Failed to generate valid date range for period: ${period}`);
//         }

//         const formattedStartDate = startDate.toISOString().split('T')[0];
//         const formattedEndDate = endDate.toISOString().split('T')[0];
//         console.log('Formatted startDate:', formattedStartDate, 'formattedEndDate:', formattedEndDate);

//         const response = await apiService.get(
//           `/invoice?customerId=${customerId}&period=${encodeURIComponent(period)}`
//         );
//         setInvoiceData(response.data);
//       } catch (err: any) {
//         console.error('Failed to fetch invoice:', err);
//         setError(err.message || 'Failed to load invoice data.');
//         Alert.alert('Error', err.message || 'Failed to load invoice data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && period) {
//       fetchInvoice();
//     }
//   }, [customerId, period]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading invoice...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   if (!invoiceData) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>No invoice data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Bill</Text>
//         <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
//         <Text style={styles.billDates}>
//           Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
//         </Text>
//       </View>

//       {/* Company + Customer Row */}
//       <View style={styles.row}>
//         {/* Company (Left) */}
//         <View style={styles.companyBox}>
//           <Text style={styles.companyName}>{invoiceData.company.name}</Text>
//           <Text style={styles.text}>{invoiceData.company.address}</Text>
//           <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
//         </View>

//         {/* Customer (Right) */}
//         <View style={styles.customerBox}>
//           <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
//           <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
//           <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
//         </View>
//       </View>

//       {/* Table */}
//       <View style={styles.table}>
//         {/* Table Header */}
//         <View style={styles.tableHeader}>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
//           <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>SP</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
//         </View>

//         {/* Table Rows */}
//         {invoiceData.items.map((item, idx) => (
//           <View key={idx} style={styles.tableRow}>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.date}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>{item.product}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.qty}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.sp}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{item.total}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Summary */}
//       <View style={styles.summary}>
//         <Text style={styles.summaryText}>Delivery Charges : {invoiceData.deliveryCharges}</Text>
//         <Text style={styles.summaryTotal}>Grand Total : {invoiceData.grandTotal}</Text>
//       </View>
//     </ScrollView>
//   );
// };

// export default InvoiceScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 12,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   header: {
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//   },
//   billNo: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   billDates: {
//     fontSize: 13,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   companyBox: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   customerBox: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   logoBox: {
//     width: 60,
//     height: 60,
//     backgroundColor: '#000',
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   text: {
//     fontSize: 13,
//     fontWeight: '400',
//   },
//   table: {
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 16,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#333',
//     paddingVertical: 6,
//   },
//   tableHeaderText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//     paddingVertical: 6,
//   },
//   tableCell: {
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   summary: {
//     marginTop: 8,
//     alignItems: 'flex-end',
//   },
//   summaryText: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   summaryTotal: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import { COLORS } from '../../constants/colors';

// interface ProductDetail {
//   name: string;
//   quantity: number;
//   price: number;
//   itemTotal: number;
// }

// interface InvoiceItem {
//   date: string;
//   products: ProductDetail[];
//   total: string;
// }

// interface InvoiceData {
//   billNo: string;
//   fromDate: string;
//   toDate: string;
//   company: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   customer: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   items: InvoiceItem[];
//   deliveryCharges: string;
//   grandTotal: string;
// }

// // Month name to index mapping
// const MONTH_MAP: { [key: string]: number } = {
//   'january': 0,
//   'february': 1,
//   'march': 2,
//   'april': 3,
//   'may': 4,
//   'june': 5,
//   'july': 6,
//   'august': 7,
//   'september': 8,
//   'october': 9,
//   'november': 10,
//   'december': 11,
// };

// export const InvoiceScreen = () => {
//   const route = useRoute();
//   const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

//   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Period received:', period);

//         const response = await apiService.get(
//           `/invoice?customerId=${customerId}&period=${encodeURIComponent(period)}`
//         );
//         setInvoiceData(response.data);
//       } catch (err: any) {
//         console.error('Failed to fetch invoice:', err);
//         setError(err.message || 'Failed to load invoice data.');
//         Alert.alert('Error', err.message || 'Failed to load invoice data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && period) {
//       fetchInvoice();
//     }
//   }, [customerId, period]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading invoice...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   if (!invoiceData) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>No invoice data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Bill</Text>
//         <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
//         <Text style={styles.billDates}>
//           Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
//         </Text>
//       </View>

//       {/* Company + Customer Row */}
//       <View style={styles.row}>
//         {/* Company (Left) */}
//         <View style={styles.companyBox}>
//           <Text style={styles.companyName}>{invoiceData.company.name}</Text>
//           <Text style={styles.text}>{invoiceData.company.address}</Text>
//           <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
//         </View>

//         {/* Customer (Right) */}
//         <View style={styles.customerBox}>
//           <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
//           <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
//           <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
//         </View>
//       </View>

//       {/* Table */}
//       <View style={styles.table}>
//         {/* Table Header */}
//         <View style={styles.tableHeader}>
//           <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
//           <Text style={[styles.tableHeaderText, { flex: 3 }]}>Products</Text>
//           <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Total</Text>
//         </View>

//         {/* Table Rows */}
//         {invoiceData.items.map((item, idx) => (
//           <View key={idx} style={styles.tableRow}>
//             <Text style={[styles.tableCell, styles.dateCell, { flex: 1.5 }]}>
//               {item.date}
//             </Text>
            
//             <View style={[styles.productsCell, { flex: 3 }]}>
//               {item.products.map((product, pIdx) => (
//                 <View key={pIdx} style={styles.productRow}>
//                   <Text style={styles.productName}>{product.name}</Text>
//                   <Text style={styles.productDetails}>
//                     {product.quantity} qty × ₹{product.price.toFixed(2)} = ₹{product.itemTotal.toFixed(2)}
//                   </Text>
//                 </View>
//               ))}
//             </View>
            
//             <Text style={[styles.tableCell, styles.totalCell, { flex: 1.5 }]}>
//               ₹{item.total}
//             </Text>
//           </View>
//         ))}
//       </View>

//       {/* Summary */}
//       <View style={styles.summary}>
//         <Text style={styles.summaryText}>Delivery Charges : ₹{invoiceData.deliveryCharges}</Text>
//         <Text style={styles.summaryTotal}>Grand Total : ₹{invoiceData.grandTotal}</Text>
//       </View>
//     </ScrollView>
//   );
// };

// export default InvoiceScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 12,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   header: {
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//   },
//   billNo: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   billDates: {
//     fontSize: 13,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   companyBox: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   customerBox: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   text: {
//     fontSize: 13,
//     fontWeight: '400',
//   },
//   table: {
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 16,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#333',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//   },
//   tableHeaderText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     minHeight: 40,
//   },
//   tableCell: {
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   dateCell: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingRight: 8,
//   },
//   productsCell: {
//     paddingHorizontal: 8,
//   },
//   productRow: {
//     marginBottom: 4,
//     paddingBottom: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   productName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   productDetails: {
//     fontSize: 12,
//     color: '#666',
//   },
//   totalCell: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     fontWeight: '600',
//     paddingLeft: 8,
//   },
//   summary: {
//     marginTop: 8,
//     alignItems: 'flex-end',
//   },
//   summaryText: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   summaryTotal: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });










// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Share } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import { COLORS } from '../../constants/colors';
// import { captureRef } from 'react-native-view-shot';

// interface ProductDetail {
//   name: string;
//   quantity: number;
//   price: number;
//   itemTotal: number;
// }

// interface InvoiceItem {
//   date: string;
//   products: ProductDetail[];
//   total: string;
// }

// interface InvoiceData {
//   billNo: string;
//   fromDate: string;
//   toDate: string;
//   company: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   customer: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   items: InvoiceItem[];
//   deliveryCharges: string;
//   grandTotal: string;
// }

// // Month name to index mapping
// const MONTH_MAP: { [key: string]: number } = {
//   'january': 0,
//   'february': 1,
//   'march': 2,
//   'april': 3,
//   'may': 4,
//   'june': 5,
//   'july': 6,
//   'august': 7,
//   'september': 8,
//   'october': 9,
//   'november': 10,
//   'december': 11,
// };

// export const InvoiceScreen = () => {
//   const route = useRoute();
//   const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

//   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sharing, setSharing] = useState<boolean>(false);
  
//   const invoiceRef = useRef<View>(null);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Period received:', period);

//         const response = await apiService.get(
//           `/invoice?customerId=${customerId}&period=${encodeURIComponent(period)}`
//         );
//         setInvoiceData(response.data);
//       } catch (err: any) {
//         console.error('Failed to fetch invoice:', err);
//         setError(err.message || 'Failed to load invoice data.');
//         Alert.alert('Error', err.message || 'Failed to load invoice data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && period) {
//       fetchInvoice();
//     }
//   }, [customerId, period]);

//   const handleShare = async () => {
//     if (!invoiceRef.current) {
//       Alert.alert('Error', 'Invoice not ready for sharing');
//       return;
//     }

//     try {
//       setSharing(true);
      
//       // Capture the invoice as an image
//       const uri = await captureRef(invoiceRef, {
//         format: 'png',
//         quality: 1,
//       });

//       // Share the image
//       await Share.share({
//         url: uri,
//         message: `Invoice ${invoiceData?.billNo} for ${invoiceData?.customer.name}`,
//       });
//     } catch (err: any) {
//       console.error('Failed to share invoice:', err);
//       Alert.alert('Error', 'Failed to share invoice. Please try again.');
//     } finally {
//       setSharing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading invoice...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   if (!invoiceData) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>No invoice data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.wrapper}>
//       <ScrollView style={styles.container}>
//         <View ref={invoiceRef} style={styles.invoiceContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Bill</Text>
//             <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
//             <Text style={styles.billDates}>
//               Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
//             </Text>
//           </View>

//           {/* Company + Customer Row */}
//           <View style={styles.row}>
//             {/* Company (Left) */}
//             <View style={styles.companyBox}>
//               <Text style={styles.companyName}>{invoiceData.company.name}</Text>
//               <Text style={styles.text}>{invoiceData.company.address}</Text>
//               <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
//             </View>

//             {/* Customer (Right) */}
//             <View style={styles.customerBox}>
//               <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
//               <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
//               <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
//             </View>
//           </View>

//           {/* Table */}
//           <View style={styles.table}>
//             {/* Table Header */}
//             <View style={styles.tableHeader}>
//               <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
//               <Text style={[styles.tableHeaderText, { flex: 3 }]}>Products</Text>
//               <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Total</Text>
//             </View>

//             {/* Table Rows */}
//             {invoiceData.items.map((item, idx) => (
//               <View key={idx} style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.dateCell, { flex: 1.5 }]}>
//                   {item.date}
//                 </Text>
                
//                 <View style={[styles.productsCell, { flex: 3 }]}>
//                   {item.products.map((product, pIdx) => (
//                     <View key={pIdx} style={styles.productRow}>
//                       <Text style={styles.productName}>{product.name}</Text>
//                       <Text style={styles.productDetails}>
//                         {product.quantity} qty × ₹{product.price.toFixed(2)} = ₹{product.itemTotal.toFixed(2)}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>
                
//                 <Text style={[styles.tableCell, styles.totalCell, { flex: 1.5 }]}>
//                   ₹{item.total}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           {/* Summary */}
//           <View style={styles.summary}>
//             <Text style={styles.summaryText}>Delivery Charges : ₹{invoiceData.deliveryCharges}</Text>
//             <Text style={styles.summaryTotal}>Grand Total : ₹{invoiceData.grandTotal}</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Share Button */}
//       <View style={styles.shareButtonContainer}>
//         <TouchableOpacity 
//           style={styles.shareButton} 
//           onPress={handleShare}
//           disabled={sharing}
//         >
//           {sharing ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.shareButtonText}>Share Invoice</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default InvoiceScreen;

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   invoiceContent: {
//     padding: 12,
//     backgroundColor: '#fff',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.error,
//     textAlign: 'center',
//   },
//   header: {
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//   },
//   billNo: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   billDates: {
//     fontSize: 13,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   companyBox: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   customerBox: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   text: {
//     fontSize: 13,
//     fontWeight: '400',
//   },
//   table: {
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 16,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#333',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//   },
//   tableHeaderText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     minHeight: 40,
//   },
//   tableCell: {
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   dateCell: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingRight: 8,
//   },
//   productsCell: {
//     paddingHorizontal: 8,
//   },
//   productRow: {
//     marginBottom: 4,
//     paddingBottom: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   productName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   productDetails: {
//     fontSize: 12,
//     color: '#666',
//   },
//   totalCell: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     fontWeight: '600',
//     paddingLeft: 8,
//   },
//   summary: {
//     marginTop: 8,
//     alignItems: 'flex-end',
//   },
//   summaryText: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   summaryTotal: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   shareButtonContainer: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   shareButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 50,
//   },
//   shareButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });






import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Share, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNShare from 'react-native-share';

interface ProductDetail {
  name: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

interface InvoiceItem {
  date: string;
  products: ProductDetail[];
  total: string;
}

interface InvoiceData {
  billNo: string;
  fromDate: string;
  toDate: string;
  company: {
    name: string;
    address: string;
    phone: string;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  items: InvoiceItem[];
  deliveryCharges: string;
  grandTotal: string;
}

export const InvoiceScreen = () => {
  const route = useRoute();
  const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Period received:', period);

        const response = await apiService.get(
          `/invoice?customerId=${customerId}&period=${encodeURIComponent(period)}`
        );
        setInvoiceData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch invoice:', err);
        setError(err.message || 'Failed to load invoice data.');
        Alert.alert('Error', err.message || 'Failed to load invoice data.');
      } finally {
        setLoading(false);
      }
    };

    if (customerId && period) {
      fetchInvoice();
    }
  }, [customerId, period]);

  const generateHTML = (data: InvoiceData): string => {
    const productsHTML = data.items.map(item => {
      const productsDetails = item.products.map(product => `
        <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${product.name}</div>
          <div style="font-size: 12px; color: #666;">
            ${product.quantity} qty × ₹${product.price.toFixed(2)} = ₹${product.itemTotal.toFixed(2)}
          </div>
        </div>
      `).join('');

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: center; vertical-align: top;">
            ${item.date}
          </td>
          <td style="border: 1px solid #ddd; padding: 12px;">
            ${productsDetails}
          </td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: center; vertical-align: top; font-weight: 600;">
            ₹${item.total}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: right;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .header p {
              font-size: 14px;
              margin: 4px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-box {
              flex: 1;
            }
            .info-box h3 {
              font-size: 16px;
              margin-bottom: 8px;
            }
            .info-box p {
              font-size: 14px;
              margin: 4px 0;
            }
            .label {
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #333;
              color: white;
              padding: 12px;
              text-align: center;
              font-weight: 700;
            }
            .summary {
              text-align: right;
              margin-top: 20px;
            }
            .summary p {
              font-size: 14px;
              margin: 8px 0;
            }
            .summary .total {
              font-size: 18px;
              font-weight: 700;
              margin-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <h1>Bill</h1>
              <p>Bill #: ${data.billNo}</p>
              <p>Dates #: ${data.fromDate} to ${data.toDate}</p>
            </div>

            <!-- Company and Customer Info -->
            <div class="info-row">
              <div class="info-box">
                <h3>${data.company.name}</h3>
                <p>${data.company.address}</p>
                <p>P: ${data.company.phone}</p>
              </div>
              <div class="info-box">
                <p><span class="label">Bill to #:</span> ${data.customer.name}</p>
                <p><span class="label">Address #:</span> ${data.customer.address}</p>
                <p><span class="label">Phone #:</span> ${data.customer.phone}</p>
              </div>
            </div>

            <!-- Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Date</th>
                  <th style="width: 55%;">Products</th>
                  <th style="width: 25%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <!-- Summary -->
            <div class="summary">
              <p>Delivery Charges: ₹${data.deliveryCharges}</p>
              <p class="total">Grand Total: ₹${data.grandTotal}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleSharePDF = async () => {
    if (!invoiceData) {
      Alert.alert('Error', 'Invoice data not available');
      return;
    }

    try {
      setSharing(true);

      // Generate HTML content
      const htmlContent = generateHTML(invoiceData);

      // Generate PDF
      const options = {
        html: htmlContent,
        fileName: `Invoice_${invoiceData.billNo}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        // Share the PDF
        const shareOptions = {
          url: Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`,
          title: `Invoice ${invoiceData.billNo}`,
          message: `Invoice ${invoiceData.billNo} for ${invoiceData.customer.name}`,
          type: 'application/pdf',
        };

        await Share.open(shareOptions);
      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    } catch (err: any) {
      console.error('Failed to share PDF:', err);
      if (err.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share invoice. Please try again.');
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!invoiceData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No invoice data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.invoiceContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bill</Text>
            <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
            <Text style={styles.billDates}>
              Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
            </Text>
          </View>

          {/* Company + Customer Row */}
          <View style={styles.row}>
            {/* Company (Left) */}
            <View style={styles.companyBox}>
              <Text style={styles.companyName}>{invoiceData.company.name}</Text>
              <Text style={styles.text}>{invoiceData.company.address}</Text>
              <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
            </View>

            {/* Customer (Right) */}
            <View style={styles.customerBox}>
              <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
              <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
              <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Products</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Total</Text>
            </View>

            {/* Table Rows */}
            {invoiceData.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.dateCell, { flex: 1.5 }]}>
                  {item.date}
                </Text>
                
                <View style={[styles.productsCell, { flex: 3 }]}>
                  {item.products.map((product, pIdx) => (
                    <View key={pIdx} style={styles.productRow}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDetails}>
                        {product.quantity} qty × ₹{product.price.toFixed(2)} = ₹{product.itemTotal.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <Text style={[styles.tableCell, styles.totalCell, { flex: 1.5 }]}>
                  ₹{item.total}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryText}>Delivery Charges : ₹{invoiceData.deliveryCharges}</Text>
            <Text style={styles.summaryTotal}>Grand Total : ₹{invoiceData.grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.shareButtonContainer}>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleSharePDF}
          disabled={sharing}
        >
          {sharing ? (
            <View style={styles.sharingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.sharingText}>Generating PDF...</Text>
            </View>
          ) : (
            <Text style={styles.shareButtonText}>Share as PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  invoiceContent: {
    padding: 12,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  billNo: {
    fontSize: 13,
    marginTop: 2,
  },
  billDates: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  companyBox: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  customerBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '400',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 40,
  },
  tableCell: {
    fontSize: 13,
    textAlign: 'center',
  },
  dateCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  productsCell: {
    paddingHorizontal: 8,
  },
  productRow: {
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
  },
  totalCell: {
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '600',
    paddingLeft: 8,
  },
  summary: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 13,
    marginBottom: 4,
  },
  summaryTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  shareButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sharingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sharingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Share, Platform } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { apiService } from '../../services/apiService';
// import { COLORS } from '../../constants/colors';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import RNShare from 'react-native-share';

// interface ProductDetail {
//   name: string;
//   quantity: number;
//   price: number;
//   itemTotal: number;
// }

// interface InvoiceItem {
//   date: string;
//   products: ProductDetail[];
//   total: string;
// }

// interface InvoiceData {
//   billNo: string;
//   fromDate: string;
//   toDate: string;
//   company: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   customer: {
//     name: string;
//     address: string;
//     phone: string;
//   };
//   items: InvoiceItem[];
//   deliveryCharges: string;
//   grandTotal: string;
// }

// export const InvoiceScreen = () => {
//   const route = useRoute();
//   const { customerId, period, type } = route.params as { customerId: string; period: string; type: string };

//   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sharing, setSharing] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Period received:', period);

//         const response = await apiService.get(
//           `/invoice?customerId=${customerId}&period=${encodeURIComponent(period)}`
//         );
//         setInvoiceData(response.data);
//       } catch (err: any) {
//         console.error('Failed to fetch invoice:', err);
//         setError(err.message || 'Failed to load invoice data.');
//         Alert.alert('Error', err.message || 'Failed to load invoice data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && period) {
//       fetchInvoice();
//     }
//   }, [customerId, period]);

//   const generateHTML = (data: InvoiceData): string => {
//     const productsHTML = data.items.map(item => {
//       const productsDetails = item.products.map(product => `
//         <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
//           <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${product.name}</div>
//           <div style="font-size: 12px; color: #666;">
//             ${product.quantity} qty × ₹${product.price.toFixed(2)} = ₹${product.itemTotal.toFixed(2)}
//           </div>
//         </div>
//       `).join('');

//       return `
//         <tr>
//           <td style="border: 1px solid #ddd; padding: 12px; text-align: center; vertical-align: top;">
//             ${item.date}
//           </td>
//           <td style="border: 1px solid #ddd; padding: 12px;">
//             ${productsDetails}
//           </td>
//           <td style="border: 1px solid #ddd; padding: 12px; text-align: center; vertical-align: top; font-weight: 600;">
//             ₹${item.total}
//           </td>
//         </tr>
//       `;
//     }).join('');

//     return `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <style>
//             * {
//               margin: 0;
//               padding: 0;
//               box-sizing: border-box;
//             }
//             body {
//               font-family: Arial, sans-serif;
//               padding: 20px;
//               background: white;
//             }
//             .invoice-container {
//               max-width: 800px;
//               margin: 0 auto;
//             }
//             .header {
//               text-align: right;
//               margin-bottom: 20px;
//             }
//             .header h1 {
//               font-size: 24px;
//               margin-bottom: 8px;
//             }
//             .header p {
//               font-size: 14px;
//               margin: 4px 0;
//             }
//             .info-row {
//               display: flex;
//               justify-content: space-between;
//               margin-bottom: 20px;
//             }
//             .info-box {
//               flex: 1;
//             }
//             .info-box h3 {
//               font-size: 16px;
//               margin-bottom: 8px;
//             }
//             .info-box p {
//               font-size: 14px;
//               margin: 4px 0;
//             }
//             .label {
//               font-weight: 600;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin-bottom: 20px;
//             }
//             th {
//               background-color: #333;
//               color: white;
//               padding: 12px;
//               text-align: center;
//               font-weight: 700;
//             }
//             .summary {
//               text-align: right;
//               margin-top: 20px;
//             }
//             .summary p {
//               font-size: 14px;
//               margin: 8px 0;
//             }
//             .summary .total {
//               font-size: 18px;
//               font-weight: 700;
//               margin-top: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="invoice-container">
//             <!-- Header -->
//             <div class="header">
//               <h1>Bill</h1>
//               <p>Bill #: ${data.billNo}</p>
//               <p>Dates #: ${data.fromDate} to ${data.toDate}</p>
//             </div>

//             <!-- Company and Customer Info -->
//             <div class="info-row">
//               <div class="info-box">
//                 <h3>${data.company.name}</h3>
//                 <p>${data.company.address}</p>
//                 <p>P: ${data.company.phone}</p>
//               </div>
//               <div class="info-box">
//                 <p><span class="label">Bill to #:</span> ${data.customer.name}</p>
//                 <p><span class="label">Address #:</span> ${data.customer.address}</p>
//                 <p><span class="label">Phone #:</span> ${data.customer.phone}</p>
//               </div>
//             </div>

//             <!-- Table -->
//             <table>
//               <thead>
//                 <tr>
//                   <th style="width: 20%;">Date</th>
//                   <th style="width: 55%;">Products</th>
//                   <th style="width: 25%;">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${productsHTML}
//               </tbody>
//             </table>

//             <!-- Summary -->
//             <div class="summary">
//               <p>Delivery Charges: ₹${data.deliveryCharges}</p>
//               <p class="total">Grand Total: ₹${data.grandTotal}</p>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   // ✅ Generate plain text version as fallback
//   const generatePlainText = (data: InvoiceData): string => {
//     let text = `BILL\n`;
//     text += `Bill #: ${data.billNo}\n`;
//     text += `Dates: ${data.fromDate} to ${data.toDate}\n\n`;
    
//     text += `FROM:\n${data.company.name}\n${data.company.address}\nP: ${data.company.phone}\n\n`;
//     text += `BILL TO:\n${data.customer.name}\n${data.customer.address}\nPhone: ${data.customer.phone}\n\n`;
    
//     text += `ITEMS:\n${'='.repeat(50)}\n`;
//     data.items.forEach(item => {
//       text += `\nDate: ${item.date}\n`;
//       item.products.forEach(product => {
//         text += `  - ${product.name}\n`;
//         text += `    ${product.quantity} qty × ₹${product.price.toFixed(2)} = ₹${product.itemTotal.toFixed(2)}\n`;
//       });
//       text += `Total: ₹${item.total}\n`;
//     });
    
//     text += `\n${'='.repeat(50)}\n`;
//     text += `Delivery Charges: ₹${data.deliveryCharges}\n`;
//     text += `GRAND TOTAL: ₹${data.grandTotal}\n`;
    
//     return text;
//   };

//   const handleSharePDF = async () => {
//     if (!invoiceData) {
//       Alert.alert('Error', 'Invoice data not available');
//       return;
//     }

//     try {
//       setSharing(true);

//       // ✅ Check if RNHTMLtoPDF is properly loaded
//       if (!RNHTMLtoPDF || typeof RNHTMLtoPDF.convert !== 'function') {
//         console.warn('RNHTMLtoPDF not available, falling back to text sharing');
        
//         // Fallback: Share as plain text
//         const plainText = generatePlainText(invoiceData);
        
//         await Share.share({
//           message: plainText,
//           title: `Invoice ${invoiceData.billNo}`,
//         });
        
//         return;
//       }

//       // Generate HTML content
//       const htmlContent = generateHTML(invoiceData);

//       // Generate PDF
//       const options = {
//         html: htmlContent,
//         fileName: `Invoice_${invoiceData.billNo}`,
//         directory: 'Documents',
//         base64: false,
//       };

//       console.log('Generating PDF with options:', options);

//       const file = await RNHTMLtoPDF.convert(options);
      
//       console.log('PDF generated:', file);

//       if (file && file.filePath) {
//         // ✅ Use RNShare instead of Share for better compatibility
//         const shareOptions = {
//           url: Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`,
//           title: `Invoice ${invoiceData.billNo}`,
//           message: `Invoice ${invoiceData.billNo} for ${invoiceData.customer.name}`,
//           type: 'application/pdf',
//           subject: `Invoice ${invoiceData.billNo}`,
//         };

//         console.log('Sharing with options:', shareOptions);

//         await RNShare.open(shareOptions);
//       } else {
//         throw new Error('PDF file path not generated');
//       }
//     } catch (err: any) {
//       console.error('Failed to share PDF:', err);
//       console.error('Error details:', JSON.stringify(err, null, 2));
      
//       // ✅ Don't show error if user cancelled
//       if (err.message !== 'User did not share' && err.message !== 'User cancelled') {
//         // Try fallback to plain text
//         Alert.alert(
//           'PDF Generation Failed',
//           'Would you like to share invoice as text instead?',
//           [
//             {
//               text: 'Cancel',
//               style: 'cancel',
//             },
//             {
//               text: 'Share as Text',
//               onPress: async () => {
//                 try {
//                   const plainText = generatePlainText(invoiceData!);
//                   await Share.share({
//                     message: plainText,
//                     title: `Invoice ${invoiceData!.billNo}`,
//                   });
//                 } catch (shareErr) {
//                   console.error('Failed to share text:', shareErr);
//                   Alert.alert('Error', 'Failed to share invoice');
//                 }
//               },
//             },
//           ]
//         );
//       }
//     } finally {
//       setSharing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading invoice...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   if (!invoiceData) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>No invoice data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.wrapper}>
//       <ScrollView style={styles.container}>
//         <View style={styles.invoiceContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Bill</Text>
//             <Text style={styles.billNo}>Bill #: {invoiceData.billNo}</Text>
//             <Text style={styles.billDates}>
//               Dates #: {invoiceData.fromDate} to {invoiceData.toDate}
//             </Text>
//           </View>

//           {/* Company + Customer Row */}
//           <View style={styles.row}>
//             {/* Company (Left) */}
//             <View style={styles.companyBox}>
//               <Text style={styles.companyName}>{invoiceData.company.name}</Text>
//               <Text style={styles.text}>{invoiceData.company.address}</Text>
//               <Text style={styles.text}>P:{invoiceData.company.phone}</Text>
//             </View>

//             {/* Customer (Right) */}
//             <View style={styles.customerBox}>
//               <Text style={styles.label}>Bill to #: <Text style={styles.text}>{invoiceData.customer.name}</Text></Text>
//               <Text style={styles.label}>Address#: <Text style={styles.text}>{invoiceData.customer.address}</Text></Text>
//               <Text style={styles.label}>Phone #: <Text style={styles.text}>{invoiceData.customer.phone}</Text></Text>
//             </View>
//           </View>

//           {/* Table */}
//           <View style={styles.table}>
//             {/* Table Header */}
//             <View style={styles.tableHeader}>
//               <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
//               <Text style={[styles.tableHeaderText, { flex: 3 }]}>Products</Text>
//               <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Total</Text>
//             </View>

//             {/* Table Rows */}
//             {invoiceData.items.map((item, idx) => (
//               <View key={idx} style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.dateCell, { flex: 1.5 }]}>
//                   {item.date}
//                 </Text>
                
//                 <View style={[styles.productsCell, { flex: 3 }]}>
//                   {item.products.map((product, pIdx) => (
//                     <View key={pIdx} style={styles.productRow}>
//                       <Text style={styles.productName}>{product.name}</Text>
//                       <Text style={styles.productDetails}>
//                         {product.quantity} qty × ₹{product.price.toFixed(2)} = ₹{product.itemTotal.toFixed(2)}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>
                
//                 <Text style={[styles.tableCell, styles.totalCell, { flex: 1.5 }]}>
//                   ₹{item.total}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           {/* Summary */}
//           <View style={styles.summary}>
//             <Text style={styles.summaryText}>Delivery Charges : ₹{invoiceData.deliveryCharges}</Text>
//             <Text style={styles.summaryTotal}>Grand Total : ₹{invoiceData.grandTotal}</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Share Button */}
//       <View style={styles.shareButtonContainer}>
//         <TouchableOpacity 
//           style={styles.shareButton} 
//           onPress={handleSharePDF}
//           disabled={sharing}
//         >
//           {sharing ? (
//             <View style={styles.sharingContainer}>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.sharingText}>Generating PDF...</Text>
//             </View>
//           ) : (
//             <Text style={styles.shareButtonText}>Share Invoice</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//   },
//   invoiceContent: {
//     padding: 16,
//   },
//   header: {
//     alignItems: 'flex-end',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   billNo: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   billDates: {
//     fontSize: 14,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   companyBox: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   customerBox: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   text: {
//     fontWeight: 'normal',
//   },
//   table: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginBottom: 20,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#333',
//     padding: 12,
//   },
//   tableHeaderText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     padding: 12,
//   },
//   tableCell: {
//     textAlign: 'center',
//   },
//   dateCell: {
//     justifyContent: 'center',
//   },
//   productsCell: {
//     paddingHorizontal: 8,
//   },
//   productRow: {
//     marginBottom: 8,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   productName: {
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   productDetails: {
//     fontSize: 12,
//     color: '#666',
//   },
//   totalCell: {
//     fontWeight: '600',
//     justifyContent: 'center',
//   },
//   summary: {
//     alignItems: 'flex-end',
//     marginTop: 20,
//   },
//   summaryText: {
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   summaryTotal: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 12,
//   },
//   shareButtonContainer: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//   },
//   shareButton: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   shareButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   sharingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sharingText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },
// });

// export default InvoiceScreen;