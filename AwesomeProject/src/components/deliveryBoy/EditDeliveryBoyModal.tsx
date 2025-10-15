import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import RNPickerSelect from 'react-native-picker-select';

interface EditDeliveryBoyModalProps {
  isVisible: boolean;
  onClose: () => void;
  deliveryBoy: any;
  onSave: (updatedDeliveryBoy: any) => void;
}

const { height } = Dimensions.get('window');

export const EditDeliveryBoyModal = ({ isVisible, onClose, deliveryBoy, onSave }: EditDeliveryBoyModalProps) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [areaId, setAreaId] = useState('');
  const [areas, setAreas] = useState([]);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible && deliveryBoy) {
      fetchAreas();
      setName(deliveryBoy.name);
      setContact(deliveryBoy.phone);
      setAreaId(deliveryBoy.areaId._id);
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
        setAreaId('');
      });
    }
  }, [isVisible, deliveryBoy, slideAnim]);

  const fetchAreas = async () => {
    try {
      const response = await apiService.get('/delivery/area');
      setAreas(response.data.data.map((area: any) => ({ label: area.name, value: area._id }))
      );
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      Alert.alert('Error', 'Failed to fetch areas. Please try again.');
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !contact || !areaId) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.patch(`/delivery/delivery-boy/update/${deliveryBoy._id}`, { name, phone: contact, areaId });
      Alert.alert('Success', 'Delivery boy updated successfully!');
      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error('Failed to update delivery boy:', error);
      Alert.alert('Error', 'Failed to update delivery boy. Please try again.');
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
                <Text style={styles.title}>Edit Delivery Boy</Text>
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
                <RNPickerSelect
                  onValueChange={(value) => setAreaId(value)}
                  items={areas}
                  style={pickerSelectStyles}
                  value={areaId}
                  placeholder={{ label: 'Select an area', value: null }}
                />
                <Button title="Save Changes" onPress={handleSave} loading={loading} />
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
    maxHeight: height * 0.75,
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 15,
    width: '100%',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    color: COLORS.text,
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 15,
    width: 350,
    backgroundColor: COLORS.background,
  },
});
