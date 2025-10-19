import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/colors';

const statusConfig = {
  delivered: { label: 'Delivered', color: COLORS.success },
  skipped: { label: 'Skipped', color: COLORS.warning },
  out_of_stock: { label: 'Out of Stock', color: COLORS.error },
  not_delivered: { label: 'Not Delivered', color: COLORS.grey },
};

const statusCycle = ['delivered', 'skipped', 'out_of_stock', 'not_delivered'];

const ProductEditor = ({ product, onQuantityChange, onStatusChange }) => {
  const { label, color } = statusConfig[product.status];

  const handleStatusPress = () => {
    const currentIndex = statusCycle.indexOf(product.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    onStatusChange(product.product._id, statusCycle[nextIndex]);
  };

  return (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{product.product.name}</Text>
      <TextInput
        style={styles.quantityInput}
        keyboardType="numeric"
        onChangeText={(text) => onQuantityChange(product.product._id, text)}
        value={String(product.quantity)}
      />
      <TouchableOpacity onPress={handleStatusPress} style={[styles.statusButton, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EditAttendanceModal = ({ isVisible, customer, onClose, onSave, currentAttendance }) => {
  const [editedProducts, setEditedProducts] = useState([]);

  useEffect(() => {
    if (isVisible && customer) {
      const initialProducts = customer.requiredProduct.map(rp => ({
        ...rp,
        product: { ...rp.product },
        quantity: currentAttendance[rp.product._id]?.quantity ?? rp.quantity,
        status: currentAttendance[rp.product._id]?.status ?? 'delivered',
      }));
      setEditedProducts(initialProducts);
    }
  }, [isVisible, customer, currentAttendance]);

  const handleQuantityChange = (productId, newQuantity) => {
    setEditedProducts(prev =>
      prev.map(p =>
        p.product._id === productId ? { ...p, quantity: Number(newQuantity) } : p
      )
    );
  };

  const handleStatusChange = (productId, newStatus) => {
    setEditedProducts(prev =>
      prev.map(p =>
        p.product._id === productId ? { ...p, status: newStatus } : p
      )
    );
  };

  const handleSave = () => {
    const editedRequiredProducts = editedProducts.map(p => ({
        productId: p.product._id,
        name: p.product.name,
        quantity: p.quantity,
        status: p.status,
    }));
    const addedExtraProducts = {}; // Not implemented yet
    onSave(customer._id, editedRequiredProducts, addedExtraProducts);
  };

  if (!customer) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Edit Attendance for {customer.name}</Text>

          <FlatList
            data={editedProducts}
            keyExtractor={item => item.product._id}
            renderItem={({ item }) => (
              <ProductEditor
                product={item}
                onQuantityChange={handleQuantityChange}
                onStatusChange={handleStatusChange}
              />
            )}
            ListEmptyComponent={<Text>No subscribed products.</Text>}
          />

          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    productName: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: 50,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    statusButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    }
});