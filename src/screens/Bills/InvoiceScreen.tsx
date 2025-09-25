import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const InvoiceScreen = () => {
  const invoiceData = {
    billNo: '1738857503855',
    fromDate: '2025-02-06',
    toDate: '2025-02-06',
    company: {
      name: 'Company Name',
      address: '12445 Street Name, Denver Co, 58786',
      phone: '76785875855',
    },
    customer: {
      name: 'Anil Thamous',
      address: 'Flat no: Anil Thamous',
      phone: '6543876565',
    },
    items: [
      { date: '06/02', product: 'Vijaya TM', qty: '1.5 qty', sp: '29', total: '87.00' },
    ],
    deliveryCharges: 120,
    grandTotal: 87,
  };

  return (
    <ScrollView style={styles.container}>
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
          <View style={styles.logoBox} />
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
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>SP</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
        </View>

        {/* Table Rows */}
        {invoiceData.items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.date}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.product}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.qty}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.sp}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.total}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Delivery Charges : {invoiceData.deliveryCharges}</Text>
        <Text style={styles.summaryTotal}>Grand Total : {invoiceData.grandTotal}</Text>
      </View>
    </ScrollView>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
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
  customerBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: '#000',
    marginBottom: 8,
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
    paddingVertical: 6,
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
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 13,
    textAlign: 'center',
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
});
