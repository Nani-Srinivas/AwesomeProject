import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

interface AddDeliveryBoyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddDeliveryBoy: (name: string, contact: string) => void;
}

const { height } = Dimensions.get('window');

export const AddDeliveryBoyModal = ({ isVisible, onClose, onAddDeliveryBoy }: AddDeliveryBoyModalProps) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const slideAnim = useRef(new Animated.Value(height)).current; // Initial position off-screen

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setName('');
        setContact('');
      });
    }
  }, [isVisible, slideAnim]);

  const handleAddPress = () => {
    if (name && contact) {
      onAddDeliveryBoy(name, contact);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableWithoutFeedback>
              <View style={styles.innerContent}>
                <Text style={styles.title}>Add New Delivery Boy</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contact (e.g., +91 9876543210)"
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.text}
                />
                <Button title="Add Delivery Boy" onPress={handleAddPress} />
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: height * 0.75, // Max height for the bottom sheet
  },
  innerContent: {
    paddingTop: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
});
