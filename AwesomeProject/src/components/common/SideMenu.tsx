import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, TouchableWithoutFeedback, Modal, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const { width } = Dimensions.get('window');
const menuWidth = width * 0.7; // 70% of screen width

export const SideMenu = ({ isVisible, onClose, onLogout }: SideMenuProps) => {
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current; // Initial position off-screen to the left

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -menuWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Menu</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Feather name="x" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.menuScroll} contentContainerStyle={{ paddingBottom: 50 }}>
                  {/* Service Grid Options */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('Home'); onClose(); }}>
                    <Feather name="home" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Home</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('AreaList'); onClose(); }}>
                    <Feather name="map" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Area</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('DeliveryBoyList'); onClose(); }}>
                    <Feather name="truck" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Delivery Boy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('Products'); onClose(); }}>
                    <Feather name="package" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Products</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('Payables', { source: 'addStock' }); onClose(); }}>
                    <Feather name="layers" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Add Stock</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('AddAttendance'); onClose(); }}>
                    <Feather name="check-square" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Attendance</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('Bills'); onClose(); }}>
                    <Feather name="file-text" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Cust. Bills</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('DispatchSummary'); onClose(); }}>
                    <Feather name="send" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Dispatch</Text>
                  </TouchableOpacity>

                  {/* Separator */}
                  <View style={styles.separator} />

                  {/* Profile & Logout */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('ProfileSettings'); onClose(); }}>
                    <Feather name="user" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Profile Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                    <Feather name="log-out" size={20} color={COLORS.text} />
                    <Text style={styles.menuItemText}>Logout</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  sideMenu: {
    width: menuWidth,
    backgroundColor: COLORS.white,
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuScroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
});
