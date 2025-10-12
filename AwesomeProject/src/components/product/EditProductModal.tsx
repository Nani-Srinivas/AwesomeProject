import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

interface EditProductModalProps {
  isVisible: boolean;
  onClose: () => void;
  product: any;
  onSave: (updatedProduct: any) => void;
}

const { height } = Dimensions.get('window');

export const EditProductModal = ({ isVisible, onClose, product, onSave }: EditProductModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible && product) {
      setName(product.name);
      setPrice(product.price.toString());
      setMrp(product.mrp.toString());
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
        // Reset fields after animation
        setName('');
        setPrice('');
        setMrp('');
      });
    }
  }, [isVisible, product, slideAnim]);

  const handleSave = () => {
    if (name && price && mrp) {
      onSave({
        ...product,
        name,
        price: parseFloat(price),
        mrp: parseFloat(mrp),
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
              <View style={styles.innerContent}>
                <Text style={styles.title}>Edit Product</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="MRP"
                  value={mrp}
                  onChangeText={setMrp}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text}
                />
                <Button title="Save Changes" onPress={handleSave} />
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
