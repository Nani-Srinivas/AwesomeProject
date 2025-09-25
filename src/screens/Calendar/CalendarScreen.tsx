import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

export const CalendarScreen = () => {
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
        <View style={styles.agendaContainer}>
          <Text style={styles.agendaTitle}>Agenda for {selectedDate}</Text>
          <ScrollView>
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
          </ScrollView>
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
  agendaContainer: {
    flex: 1,
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
  },
});
