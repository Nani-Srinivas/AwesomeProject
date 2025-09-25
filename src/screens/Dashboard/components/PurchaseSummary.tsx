import React from 'react';
import { View, Text } from 'react-native';

export const PurchaseSummary = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.purchaseSummaryCard}>
      <View style={styles.summaryItem}>
        <View style={styles.summaryIconContainer}>
          <Text style={styles.summaryIcon}>💰</Text>
        </View>
        <View>
          <Text style={styles.summaryValue}>$100</Text>
          <Text style={styles.summaryLabel}>Purchase Power</Text>
        </View>
      </View>
      <View style={styles.summarySeparator} />
      <View style={styles.summaryItem}>
        <View style={styles.summaryIconContainer}>
          <Text style={styles.summaryIcon}>✅</Text>
        </View>
        <View>
          <Text style={styles.summaryValue}>$000.00</Text>
          <Text style={styles.summaryLabel}>Nothing to pay</Text>
        </View>
      </View>
    </View>
  );
};
