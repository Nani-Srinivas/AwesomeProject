import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PayablesSection = () => {
  return (
    <View style={styles.sectionContainer}>
        <View style={styles.titleContainer}>
            <View style={styles.titleIndicator} />
            <Text style={styles.sectionTitle}>Payables</Text>
        </View>
      <View style={styles.row}>
        <Text style={styles.dateText}>2025-09-06</Text>
        <Text style={styles.amountText}>Rs 0.0 /-</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    sectionContainer: {
        paddingHorizontal: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleIndicator: {
        width: 4,
        height: 20,
        backgroundColor: '#1E73B8',
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
});
