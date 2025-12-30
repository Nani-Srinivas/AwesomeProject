import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TextInput, Switch, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';
import { ProductSelector } from '../product/ProductSelector';
import Feather from 'react-native-vector-icons/Feather';
import { EditCustomerFormHeader } from './EditCustomerFormHeader';

interface EditCustomerModalProps {
  isVisible: boolean;
  onClose: () => void;
  customer: any;
  onSave: (updatedCustomer: any) => void;
  isSaving: boolean;
  areas: any[];
  apartmentsByArea: Record<string, string[]>;
}

const { height } = Dimensions.get('window');

export const EditCustomerModal = ({ isVisible, onClose, customer, onSave, isSaving, areas, apartmentsByArea = {} }: EditCustomerModalProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [requiredProducts, setRequiredProducts] = useState<any[]>([]);
  const [isProductSelectorVisible, setProductSelectorVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Derive apartments based on selected area
  const availableApartments = useMemo(() => {
    if (!selectedArea) return [];
    return apartmentsByArea[selectedArea] || [];
  }, [selectedArea, apartmentsByArea]);

  useEffect(() => {
    if (isVisible && customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setAddress(customer.address?.Apartment || '');
      setFlatNo(customer.address?.FlatNo || '');
      setDeliveryCost(String(customer.deliveryCost || ''));
      setAdvanceAmount(String(customer.advanceAmount || ''));
      setIsSubscribed(customer.isSubscribed || false);
      setRequiredProducts(customer.requiredProduct || []);
      setSelectedArea(customer.area?._id);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
    }
  }, [isVisible, customer, slideAnim]);

  const handleProductsSelected = useCallback((products: any[]) => {
    const productsWithQuantity = products.map(p => {
      const existing = requiredProducts.find(rp => rp.product._id === p._id);
      return existing ? existing : {
        product: p,
        quantity: 1,
        specialPrice: p.sellingPrice // Default to current selling price
      };
    });
    setRequiredProducts(productsWithQuantity);
  }, []);

  const handleQuantityChange = (text: string, index: number) => {
    const newProducts = [...requiredProducts];
    newProducts[index].quantity = text;
    setRequiredProducts(newProducts);
  };

  const handlePriceChange = (text: string, index: number) => {
    const newProducts = [...requiredProducts];
    // If text is empty, we might want to revert to default behavior or 0, but string allows user to clear input
    newProducts[index].specialPrice = text;
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
        ...customer,
        name,
        phone,
        address: { ...customer.address, Apartment: address, FlatNo: flatNo },
        deliveryCost: Number(deliveryCost) || 0,
        advanceAmount: Number(advanceAmount) || 0,
        isSubscribed,
        requiredProduct: requiredProducts.map(p => ({
          product: p.product._id,
          quantity: parseFloat(String(p.quantity)) || 0,
          specialPrice: p.specialPrice !== undefined && p.specialPrice !== '' ? parseFloat(String(p.specialPrice)) : p.product.sellingPrice
        })),
        area: selectedArea,
      });
    }
  }, [name, phone, address, flatNo, deliveryCost, advanceAmount, isSubscribed, requiredProducts, onSave, customer, selectedArea]);

  const renderListFooter = useCallback(() => (
    <View style={styles.footerContainer}>
      <Button title={isSaving ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={isSaving} />
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
                  <EditCustomerFormHeader
                    name={name} setName={setName}
                    phone={phone} setPhone={setPhone}
                    address={address} setAddress={setAddress}
                    flatNo={flatNo} setFlatNo={setFlatNo}
                    deliveryCost={deliveryCost} setDeliveryCost={setDeliveryCost}
                    advanceAmount={advanceAmount} setAdvanceAmount={setAdvanceAmount}
                    isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed}
                    setProductSelectorVisible={setProductSelectorVisible}
                    requiredProducts={requiredProducts}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveProduct={handleRemoveProduct}
                    areas={areas}
                    selectedArea={selectedArea}
                    setSelectedArea={setSelectedArea}
                    apartments={availableApartments}
                  />
                }
                ListFooterComponent={renderListFooter}
                renderItem={({ item, index }) => (
                  <View style={styles.productItem}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.productName}>{item.product.name}</Text>
                      <Text style={styles.productSubtext}>Std Price: ₹{item.product.sellingPrice}</Text>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Qty</Text>
                      <TextInput style={styles.quantityInput} value={String(item.quantity)} onChangeText={(text) => handleQuantityChange(text, index)} keyboardType="decimal-pad" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Price</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={item.specialPrice !== undefined ? String(item.specialPrice) : String(item.product.sellingPrice)}
                        onChangeText={(text) => handlePriceChange(text, index)}
                        keyboardType="decimal-pad"
                        placeholder={String(item.product.sellingPrice)}
                      />
                    </View>
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
  productName: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 2 },
  productSubtext: { fontSize: 10, color: COLORS.grey },
  inputGroup: { alignItems: 'center', marginHorizontal: 5 },
  inputLabel: { fontSize: 10, color: COLORS.grey, marginBottom: 2 },
  quantityInput: { width: 50, textAlign: 'center', borderColor: COLORS.grey, borderWidth: 1, borderRadius: 5, paddingVertical: 5, color: COLORS.text },
  priceInput: { width: 60, textAlign: 'center', borderColor: COLORS.grey, borderWidth: 1, borderRadius: 5, paddingVertical: 5, color: COLORS.text },
  emptyListText: { textAlign: 'center', padding: 20, color: COLORS.grey },
  footerContainer: { paddingVertical: 20, alignItems: 'center' },
});