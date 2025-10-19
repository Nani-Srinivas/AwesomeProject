import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Button, FlatList, TextInput } from 'react-native';
import { apiService } from '../../../services/apiService';

export const EditAttendanceModal = ({ isVisible, customer, onClose, onSave, currentAttendance }) => {
  const [storeProducts, setStoreProducts] = useState([]);
  const [editedRequiredProducts, setEditedRequiredProducts] = useState([]); // { productId: { name, quantity, delivered } }
  const [addedExtraProducts, setAddedExtraProducts] = useState({}); // { productId: { name, quantity } }

  useEffect(() => {
    if (isVisible && customer) {
      // Initialize editedRequiredProducts from customer.requiredProduct and currentAttendance
      const initialEditedRequired = customer.requiredProduct.map(rp => ({
        productId: rp.product._id,
        name: rp.product.name,
        quantity: currentAttendance[rp.product._id]?.quantity ?? rp.quantity, // Use attendance quantity if available, else default
        delivered: currentAttendance[rp.product._id]?.delivered ?? true, // Default to delivered
      }));
      setEditedRequiredProducts(initialEditedRequired);
      setAddedExtraProducts({}); // Reset added extra products when modal opens for a new customer

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
  }, [isVisible, customer]);

  const handleRequiredProductQuantityChange = (productId, quantity) => {
    setEditedRequiredProducts(prev =>
      prev.map(p =>
        p.productId === productId ? { ...p, quantity: Number(quantity) } : p
      )
    );
  };

  const handleRequiredProductDeliveredChange = (productId, delivered) => {
    setEditedRequiredProducts(prev =>
      prev.map(p =>
        p.productId === productId ? { ...p, delivered: delivered } : p
      )
    );
  };

  const handleExtraProductQuantityChange = (product, quantity) => {
    setAddedExtraProducts(prev => ({
      ...prev,
      [product._id]: { name: product.name, quantity: Number(quantity) },
    }));
  };

  const handleSave = () => {
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
          <Text style={styles.modalText}>Edit Products for {customer.name}</Text>

          <Text style={styles.sectionTitle}>Subscribed Products</Text>
          <FlatList
            data={editedRequiredProducts}
            keyExtractor={item => item.productId}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text>{item.name}</Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  onChangeText={(text) => handleRequiredProductQuantityChange(item.productId, text)}
                  value={String(item.quantity)}
                />
                <CheckBox
                  value={item.delivered}
                  onValueChange={(newValue) => handleRequiredProductDeliveredChange(item.productId, newValue)}
                  tintColors={{ true: COLORS.primary, false: COLORS.text }}
                />
                <Text>Delivered</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No subscribed products.</Text>}
          />

          <Text style={styles.sectionTitle}>Add Extra Products</Text>
          <FlatList
            data={storeProducts}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text>{item.name}</Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  onChangeText={(text) => handleExtraProductQuantityChange(item, text)}
                  value={addedExtraProducts[item._id]?.quantity ? String(addedExtraProducts[item._id].quantity) : ''}
                />
              </View>
            )}
            ListEmptyComponent={<Text>No extra products available.</Text>}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
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
