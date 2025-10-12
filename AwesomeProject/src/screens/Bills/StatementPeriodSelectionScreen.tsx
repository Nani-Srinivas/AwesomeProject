// StatementPeriodSelection.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

type Props = { customerId?: string };

// --- Monthly tab ---
const MonthlyStatement = ({ customerId }: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const navigation = useNavigation();

  const availablePeriods = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025',
    'May 2025', 'June 2025', 'July 2025', 'August 2025',
    'September 2025', 'October 2025', 'November 2025', 'December 2025',
    'January 2024', 'February 2024', 'March 2024', 'April 2024',
  ];

  // const handleViewStatement = () => {
  //   if (selectedPeriod) {
  //     Alert.alert(
  //       'View Statement',
  //       `Customer ID: ${customerId || 'N/A'}\nPeriod: ${selectedPeriod}`,
  //       [{ text: 'OK' }]
  //     );
  //   } else {
  //     Alert.alert('Selection Required', 'Please select a statement period.');
  //   }
  // };

  const handleViewStatement = () => {
    if (selectedPeriod) {
      navigation.navigate('Invoice' as never, {
        customerId,
        period: selectedPeriod,
        type: 'monthly',
      } as never);
    } else {
      Alert.alert('Selection Required', 'Please select a statement period.');
    }
  };


  const handleDownload = () => {
    if (selectedPeriod) {
      Alert.alert(
        'Download',
        `Downloading statement for ${selectedPeriod}...`
      );
    } else {
      Alert.alert('Selection Required', 'Please select a statement period.');
    }
  };

  return (
    <View style={styles.container}>
      {customerId && <Text style={styles.customerInfo}>Statements for {customerId}</Text>}
      {!customerId && <Text style={styles.customerInfo}>Select a monthly statement</Text>}

      <View style={styles.periodGrid}>
        {availablePeriods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.selectedPeriodButtonText,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.viewStatementButton,
            styles.rowButton,
            !selectedPeriod && styles.disabledButton,
          ]}
          onPress={handleViewStatement}
          disabled={!selectedPeriod}
        >
          <Text style={styles.viewStatementButtonText}>View Statement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.downloadButton, !selectedPeriod && styles.disabledButton]}
          onPress={handleDownload}
          disabled={!selectedPeriod}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Custom tab ---
const CustomStatement = ({ customerId }: Props) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const navigation = useNavigation();

  const onDayPress = (day: { dateString: string }) => {
    const picked = day.dateString;

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
          marks[d] = { startingDay: true, endingDay: true, color: COLORS.primary, textColor: '#fff' };
        } else if (d === startStr) {
          marks[d] = { startingDay: true, color: COLORS.primary, textColor: '#fff' };
        } else if (d === endStr) {
          marks[d] = { endingDay: true, color: COLORS.primary, textColor: '#fff' };
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

  // const handleViewStatement = () => {
  //   if (startDate && endDate) {
  //     Alert.alert(
  //       'Custom Statement',
  //       `Customer ID: ${customerId || 'N/A'}\nFrom: ${startDate}\nTo: ${endDate}`,
  //       [{ text: 'OK' }]
  //     );
  //   } else {
  //     Alert.alert('Selection Required', 'Please select both From and To dates.');
  //   }
  // };
  const handleViewStatement = () => {
    if (startDate && endDate) {
      navigation.navigate('Invoice' as never, {
        customerId,
        from: startDate,
        to: endDate,
        type: 'custom',
      } as never);
    } else {
      Alert.alert('Selection Required', 'Please select both From and To dates.');
    }
  };

  const handleDownload = () => {
    if (startDate && endDate) {
      Alert.alert(
        'Download',
        `Downloading statement from ${startDate} to ${endDate}...`
      );
    } else {
      Alert.alert('Selection Required', 'Please select both From and To dates.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.customerInfo}>
          {customerId ? `Statements for ${customerId}` : 'Select a custom date range for statements'}
        </Text>

        <Calendar
          onDayPress={onDayPress}
          markingType={'period'}
          markedDates={markedDates}
          firstDay={1}
        />

        {/* Selected dates cards */}
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

        {/* Actions: Clear + View Statement + Download */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewStatementButton,
              styles.rowButton,
              !(startDate && endDate) && styles.disabledButton,
            ]}
            onPress={handleViewStatement}
            disabled={!(startDate && endDate)}
          >
            <Text style={styles.viewStatementButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.downloadButton, !(startDate && endDate) && styles.disabledButton]}
            onPress={handleDownload}
            disabled={!(startDate && endDate)}
          >
            <Text style={styles.downloadButtonText}>↓</Text>
          </TouchableOpacity>
        </View>
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

// --- styles ---
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
  viewStatementButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  viewStatementButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
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
  downloadButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  downloadButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
