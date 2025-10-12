import React from 'react';
import { View, Text } from 'react-native';

export const OrderStatusShortcuts = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.orderStatusCard}>
      <View style={styles.orderStatus}>
        <View style={styles.orderStatusButton}>
          <View style={styles.orderStatusIconContainer}><Text style={styles.orderStatusIcon}>📦</Text></View>
          <Text style={styles.orderStatusLabel}>All Orders</Text>
        </View>
        <View style={styles.orderStatusButton}>
          <View style={styles.orderStatusIconContainer}><Text style={styles.orderStatusIcon}>🚚</Text></View>
          <Text style={styles.orderStatusLabel}>On its way</Text>
        </View>
        <View style={styles.orderStatusButton}>
          <View style={styles.orderStatusIconContainer}><Text style={styles.orderStatusIcon}>✅</Text></View>
          <Text style={styles.orderStatusLabel}>Delivered</Text>
        </View>
        <View style={styles.orderStatusButton}>
          <View style={styles.orderStatusIconContainer}><Text style={styles.orderStatusIcon}>🔄</Text></View>
          <Text style={styles.orderStatusLabel}>Returns</Text>
        </View>
        <View style={styles.orderStatusButton}>
          <View style={styles.orderStatusIconContainer}><Text style={styles.orderStatusIcon}>➕</Text></View>
          <Text style={styles.orderStatusLabel}>Add Order</Text>
        </View>
      </View>
    </View>
  );
};
