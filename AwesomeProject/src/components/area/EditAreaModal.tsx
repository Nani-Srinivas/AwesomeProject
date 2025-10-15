import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

interface EditAreaModalProps {
  isVisible: boolean;
  onClose: () => void;
  area: any;
  onSave: (updatedArea: any) => void;
}

const { height } = Dimensions.get('window');

export const EditAreaModal = ({ isVisible, onClose, area, onSave }: EditAreaModalProps) => {
  const [name, setName] = useState('');
  const [totalSubscribedItems, setTotalSubscribedItems] = useState('');
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible && area) {
      setName(area.name);
      setTotalSubscribedItems(area.totalSubscribedItems.toString());
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
        setTotalSubscribedItems('');
      });
    }
  }, [isVisible, area, slideAnim]);

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !totalSubscribedItems) {
      Alert.alert('Error', 'Please enter both area name and total subscribed items.');
      return;
    }

    setLoading(true);
    try {
      const items = Number(totalSubscribedItems);
      if (isNaN(items)) {
        Alert.alert('Error', 'Total subscribed items must be a number.');
        setLoading(false);
        return;
      }

      const response = await apiService.patch(`/delivery/area/update/${area._id}`, { name, totalSubscribedItems: items });
      Alert.alert('Success', 'Area updated successfully!');
      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error('Failed to update area:', error);
      Alert.alert('Error', 'Failed to update area. Please try again.');
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
                <Text style={styles.title}>Edit Area</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Area Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Total Subscribed Items"
                  value={totalSubscribedItems}
                  onChangeText={setTotalSubscribedItems}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text}
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
