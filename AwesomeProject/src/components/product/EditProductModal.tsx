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
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible && product) {
      setName(product.name);
      setCostPrice(product.costPrice?.toString() || '');
      setSellingPrice(product.sellingPrice?.toString() || '');
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
        setCostPrice('');
        setSellingPrice('');
      });
    }
  }, [isVisible, product, slideAnim]);

  const handleSave = () => {
    if (name && costPrice && sellingPrice) {
      const costPriceNum = parseFloat(costPrice);
      const sellingPriceNum = parseFloat(sellingPrice);

      if (sellingPriceNum < costPriceNum) {
        Alert.alert('Validation Error', 'Selling price should be greater than or equal to cost price');
        return;
      }

      onSave({
        ...product,
        name,
        costPrice: costPriceNum,
        sellingPrice: sellingPriceNum,
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
                  placeholder="Cost Price (₹)"
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Selling Price (₹)"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
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
