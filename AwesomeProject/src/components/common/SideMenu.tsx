import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

import { useNavigation } from '@react-navigation/native';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const { width } = Dimensions.get('window');
const menuWidth = width * 0.7; // 70% of screen width

export const SideMenu = ({ isVisible, onClose, onLogout }: SideMenuProps) => {
  const navigation = useNavigation();
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
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate('Bills');
                    onClose();
                  }}
                >
                  <Feather name="file-text" size={20} color={COLORS.text} />
                  <Text style={styles.menuItemText}>Bills</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate('ProfileSettings');
                    onClose();
                  }}
                >
                  <Feather name="user" size={20} color={COLORS.text} />
                  <Text style={styles.menuItemText}>Profile Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                  <Feather name="log-out" size={20} color={COLORS.text} />
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
                {/* Add more menu items here */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 18,
    marginLeft: 15,
    color: COLORS.text,
  },
});
