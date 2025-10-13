import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Switch, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';
import { ProductSelector } from '../product/ProductSelector';
import Feather from 'react-native-vector-icons/Feather';
import { AddCustomerFormHeader } from './AddCustomerFormHeader';

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
  const [requiredProducts, setRequiredProducts] = useState<any[]>([]);
  const [isProductSelectorVisible, setProductSelectorVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      setName('');
      setPhone('');
      setAddress('');
      setDeliveryCost('');
      setAdvanceAmount('');
      setIsSubscribed(false);
      setRequiredProducts([]);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
    }
  }, [isVisible, slideAnim]);

  const handleProductsSelected = useCallback((products: any[]) => {
    const productsWithQuantity = products.map(p => ({ product: p, quantity: 1 }));
    setRequiredProducts(productsWithQuantity);
  }, []);

  const handleQuantityChange = (text: string, index: number) => {
    const newProducts = [...requiredProducts];
    newProducts[index].quantity = Number(text) || 0;
    setRequiredProducts(newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = [...requiredProducts];
    newProducts.splice(index, 1);
    setRequiredProducts(newProducts);
  };

  const handleSave = useCallback(() => {
    if (name && phone) {
      onSave({
        name,
        phone,
        address: { Apartment: address },
        deliveryCost: Number(deliveryCost) || 0,
        advanceAmount: Number(advanceAmount) || 0,
        isSubscribed,
        requiredProduct: requiredProducts.map(p => ({ product: p.product._id, quantity: p.quantity }))
      });
    }
  }, [name, phone, address, deliveryCost, advanceAmount, isSubscribed, requiredProducts, onSave]);

  const renderListFooter = useCallback(() => (
    <View style={styles.footerContainer}>
      <Button title={isSaving ? 'Saving...' : 'Save Customer'} onPress={handleSave} disabled={isSaving} />
    </View>
  ), [isSaving, handleSave]);

  return (
    <>
      <Modal transparent={true} visible={isVisible} onRequestClose={onClose} animationType="none">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
              <FlatList
                data={requiredProducts}
                keyExtractor={item => item.product._id}
                ListHeaderComponent={
                  <AddCustomerFormHeader
                    name={name} setName={setName}
                    phone={phone} setPhone={setPhone}
                    address={address} setAddress={setAddress}
                    deliveryCost={deliveryCost} setDeliveryCost={setDeliveryCost}
                    advanceAmount={advanceAmount} setAdvanceAmount={setAdvanceAmount}
                    isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed}
                    setProductSelectorVisible={setProductSelectorVisible}
                    requiredProducts={requiredProducts}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveProduct={handleRemoveProduct}
                  />
                }
                ListFooterComponent={renderListFooter}
                renderItem={({ item, index }) => (
                  <View style={styles.productItem}>
                    <Text style={styles.productName}>{item.product.name}</Text>
                    <TextInput style={styles.quantityInput} value={String(item.quantity)} onChangeText={(text) => handleQuantityChange(text, index)} keyboardType="numeric" />
                    <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                      <Feather name="x-circle" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyListText}>No products selected.</Text>}
                contentContainerStyle={styles.innerContent}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ProductSelector
        isVisible={isProductSelectorVisible}
        onClose={() => setProductSelectorVisible(false)}
        initialSelectedProducts={requiredProducts.map(p => p.product)}
        onProductsSelected={handleProductsSelected}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: COLORS.white, width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, maxHeight: height * 0.9 },
  innerContent: { paddingTop: 20, paddingBottom: 40 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey },
  productName: { flex: 1 },
  quantityInput: { width: 50, textAlign: 'center', borderColor: COLORS.grey, borderWidth: 1, borderRadius: 5, paddingVertical: 5, marginHorizontal: 10 },
  emptyListText: { textAlign: 'center', padding: 20, color: COLORS.grey },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  productListContainer: {
    width: '100%',
    minHeight: 50, // Ensure it has some height even if empty
    maxHeight: 150, // Adjust as needed
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    marginTop: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  productName: {
    flex: 1,
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: COLORS.grey,
  },
});