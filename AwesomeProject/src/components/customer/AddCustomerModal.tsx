import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Switch, ScrollView } from 'react-native';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

interface AddCustomerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (newCustomer: any) => void;
  isSaving: boolean;
}

const { height } = Dimensions.get('window');

export const AddCustomerModal = ({ isVisible, onClose, onSave, isSaving }: AddCustomerModalProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset form when modal becomes visible
      setName('');
      setPhone('');
      setAddress('');
      setDeliveryCost('');
      setAdvanceAmount('');
      setIsSubscribed(false);
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
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleSave = () => {
    if (name && phone) {
      onSave({ 
        name, 
        phone, 
        address: { Apartment: address }, // Simplified address
        deliveryCost: Number(deliveryCost) || 0,
        advanceAmount: Number(advanceAmount) || 0,
        isSubscribed 
      });
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
              <ScrollView contentContainerStyle={styles.innerContent}>
                <Text style={styles.title}>Add New Customer</Text>
                <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Address (Apartment/Building)" value={address} onChangeText={setAddress} />
                <TextInput style={styles.input} placeholder="Delivery Cost" value={deliveryCost} onChangeText={setDeliveryCost} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Advance Amount" value={advanceAmount} onChangeText={setAdvanceAmount} keyboardType="numeric" />
                <View style={styles.switchContainer}>
                  <Text>Subscribed</Text>
                  <Switch value={isSubscribed} onValueChange={setIsSubscribed} />
                </View>
                <Button 
                  title={isSaving ? 'Saving...' : 'Save Customer'} 
                  onPress={handleSave} 
                  disabled={isSaving}
                />
              </ScrollView>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
});
