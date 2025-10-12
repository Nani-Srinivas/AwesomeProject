import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

interface AddAreaModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddArea: (name: string, pincode: string) => void;
}

const { height } = Dimensions.get('window');

export const AddAreaModal = ({ isVisible, onClose, onAddArea }: AddAreaModalProps) => {
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
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
        setPincode('');
      });
    }
  }, [isVisible, slideAnim]);

  const [loading, setLoading] = useState(false);

  const handleAddPress = async () => {
    if (!name || !pincode) {
      Alert.alert('Error', 'Please enter both area name and pincode.');
      return;
    }

    setLoading(true);
    try {
      await apiService.post('/area/create', { name, pincode });
      Alert.alert('Success', 'Area added successfully!');
      onAddArea(name, pincode); // Call the prop to update parent state/list
      onClose();
    } catch (error) {
      console.error('Failed to add area:', error);
      Alert.alert('Error', 'Failed to add area. Please try again.');
    } finally {
      setLoading(false);
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
                <Text style={styles.title}>Add New Area</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Area Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text}
                />
                <Button title="Add Area" onPress={handleAddPress} />
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
