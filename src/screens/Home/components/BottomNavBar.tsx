import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const NavItem = ({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Feather name={icon} size={24} color={active ? '#1E73B8' : '#000000'} />
    <Text style={[styles.navLabel, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
);

export const BottomNavBar = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.navContainer}>
      <NavItem icon="grid" label="Dashboard" active onPress={() => navigation.navigate('Dashboard')} />
      <NavItem icon="layers" label="Stock" onPress={() => navigation.navigate('Calendar')} />
      <NavItem icon="shopping-bag" label="Orders" onPress={() => navigation.navigate('Order')} />
      <NavItem icon="credit-card" label="Cards" />
      <NavItem icon="dollar-sign" label="Payment" onPress={() => navigation.navigate('PayableTemp')} />
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    marginTop: 4,
  },
  activeLabel: {
    color: '#1E73B8',
  },
});
