import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';

const agendaItems = {
  '2025-11-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-11-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Payment data structure
const paymentData = {
  brandName: 'Brand Name',
  date: '09-11-2025',
  paymentRef: '0123456789',
  amount: 17000,
  due: 0,
  isPaid: true, // Toggle this to see different states
  subcategories: [
    {
      name: 'Milk',
      products: [{ name: 'Product', status: 'Out of office TH' }]
    },
    {
      name: 'Vegetables',
      products: [{ name: 'Product', status: 'Out of office Total' }]
    }
  ]
};

export const AddStockScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
        <ScrollView style={styles.scrollContent}>
          <View style={styles.agendaContainer}>
            <Text style={styles.agendaTitle}>Agenda for {selectedDate}</Text>
            {agendaItems[selectedDate] ? (
              agendaItems[selectedDate].map((item, index) => (
                <View key={index} style={styles.agendaItem}>
                  <Text style={styles.agendaTime}>{item.time}</Text>
                  <Text style={styles.agendaItemTitle}>{item.title}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No items for this day</Text>
            )}
          </View>

          {/* Payment Receipt Section */}
          <View style={styles.paymentReceiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.brandNameHeader}>{paymentData.brandName}</Text>
              <View style={styles.paymentStatusBadge}>
                <Text style={[styles.statusText, paymentData.isPaid ? styles.paidText : styles.dueText]}>
                  {paymentData.isPaid ? '1st Payment Due' : '1st Not Paid'}
                </Text>
              </View>
            </View>

            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date</Text>
                <Text style={styles.receiptValue}>{paymentData.date}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Ref</Text>
                <Text style={styles.receiptValue}>{paymentData.paymentRef}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount</Text>
                <Text style={styles.receiptValue}>₹ {paymentData.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Due</Text>
                <Text style={styles.receiptValue}>₹ {paymentData.due}</Text>
              </View>

              <View style={styles.divider} />

              {/* Subcategories Section */}
              {paymentData.subcategories.map((subcategory, index) => (
                <View key={index} style={styles.subcategorySection}>
                  <Text style={styles.subcategoryTitle}>{subcategory.name} (subcategory)</Text>
                  {subcategory.products.map((product, prodIndex) => (
                    <View key={prodIndex} style={styles.productRow}>
                      <Text style={styles.productName}>Product</Text>
                      <Text style={styles.productStatus}>{product.status}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </CalendarProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    flex: 1,
  },
  agendaContainer: {
    padding: 16,
  },
  agendaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaTime: {
    fontSize: 16,
    marginRight: 8,
  },
  agendaItemTitle: {
    fontSize: 16,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    color: '#999',
  },
  paymentReceiptContainer: {
    padding: 16,
    paddingTop: 0,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandNameHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#4CAF50',
  },
  dueText: {
    color: '#F44336',
  },
  receiptCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  subcategorySection: {
    marginBottom: 16,
  },
  subcategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 12,
  },
  productName: {
    fontSize: 14,
    color: '#666',
  },
  productStatus: {
    fontSize: 13,
    color: '#1E73B8',
    fontWeight: '500',
  },
});