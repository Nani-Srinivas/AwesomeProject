import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Button, FlatList, TextInput } from 'react-native';
import { apiService } from '../../../services/apiService';

export const EditAttendanceModal = ({ isVisible, customer, onClose, onSave }) => {
  const [storeProducts, setStoreProducts] = useState([]);
  const [extraProducts, setExtraProducts] = useState({}); // { productId: { name, quantity } }

  useEffect(() => {
    if (isVisible) {
      const fetchStoreProducts = async () => {
        try {
          const response = await apiService.get('/product/store');
          setStoreProducts(response.data.data);
        } catch (error) {
          console.error('Error fetching store products:', error);
        }
      };

      fetchStoreProducts();
    }
  }, [isVisible]);

  const handleQuantityChange = (product, quantity) => {
    setExtraProducts(prev => ({
      ...prev,
      [product._id]: { name: product.name, quantity: Number(quantity) },
    }));
  };

  const handleSave = () => {
    onSave(customer._id, extraProducts);
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
          <Text style={styles.modalText}>Add Extra Products for {customer.name}</Text>
          <FlatList
            data={storeProducts}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text>{item.name}</Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  onChangeText={(text) => handleQuantityChange(item, text)}
                  value={extraProducts[item._id]?.quantity ? String(extraProducts[item._id].quantity) : ''}
                />
              </View>
            )}
          />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={onClose} />
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
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
    height: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 50,
    textAlign: 'center',
  },
});
