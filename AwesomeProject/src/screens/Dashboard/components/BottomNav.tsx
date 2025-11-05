import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { DashboardScreenProps } from '../../../navigation/types';

export const BottomNav = ({ styles, navigation }: { styles: any, navigation: DashboardScreenProps['navigation'] }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navTab} onPress={() => navigation.navigate('Dashboard')}>
        <View style={styles.navIconContainer}><Feather name="home" size={24} color="#4C9DFE" /></View>
        <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navTab} onPress={() => navigation.navigate('Home')}>
        <View style={styles.navIconContainer}><Feather name="heart" size={24} color="#6B6B6B" /></View>
        <Text style={styles.navLabel}>Saved</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navTab} onPress={() => navigation.navigate('CustomerList')}>
        <View style={styles.navIconContainer}><Feather name="credit-card" size={24} color="#6B6B6B" /></View>
        <Text style={styles.navLabel}>Money</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navTab}>
        <View style={styles.navIconContainer}><Feather name="user" size={24} color="#6B6B6B" /></View>
        <Text style={styles.navLabel}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};
