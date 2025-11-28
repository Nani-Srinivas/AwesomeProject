import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const services = [
  // { name: 'Bills', icon: '💵', screen: 'Bills' },
  // { name: 'Payables', icon: '💳', screen: 'PayablesDashboard' },
  { name: 'Add Stock', icon: '📦', screen: 'Payables', params: { source: 'addStock' } },
  // { name: 'Receive Inventory', icon: '🛒', screen: 'VendorSelectionForInventory' },
  { name: 'Dispatch', icon: '🚚', screen: 'DispatchSummary' },
  { name: 'Delivery Boy', icon: '🚴', screen: 'DeliveryBoyList' },
  { name: 'Products', icon: '🛍️', screen: 'Products' },
  { name: 'Attendance', icon: '✅', screen: 'AddAttendance' },
  { name: 'Area', icon: '🗺️', screen: 'AreaList' },
  { name: 'Notes', icon: '🗒️', screen: 'Notes' },
];

const ServiceItem = ({ name, icon, onPress }: { name: string; icon: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Text style={styles.emojiIcon}>{icon}</Text>
    </View>
    <Text style={styles.itemLabel}>{name}</Text>
  </TouchableOpacity>
);

export const ServicesGrid = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleContainer}>
        <View style={styles.titleIndicator} />
        <Text style={styles.sectionTitle}>Services</Text>
      </View>
      <View style={styles.grid}>
        {services.map((service) => (
          <ServiceItem
            key={service.name}
            name={service.name}
            icon={service.icon}
            onPress={() => navigation.navigate(service.screen, service.params || {})}
          />
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    width: '21%', // 4 items per row with 4% margin
    alignItems: 'center',
    marginBottom: 24,
    marginRight: '4%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 32,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'center',
  },
});
