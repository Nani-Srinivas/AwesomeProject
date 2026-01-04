// import React, { useState, useEffect } from 'react';
// import { Modal, View, Text, StyleSheet, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
// import { COLORS } from '../../../constants/colors';

// const statusConfig = {
//   delivered: { label: 'Delivered', color: COLORS.success },
//   skipped: { label: 'Skipped', color: COLORS.warning },
//   out_of_stock: { label: 'Out of Stock', color: COLORS.error },
//   not_delivered: { label: 'Not Delivered', color: COLORS.grey },
// };

// const statusCycle = ['delivered', 'skipped', 'out_of_stock', 'not_delivered'];

// const ProductEditor = ({ product, onQuantityChange, onStatusChange }) => {
//   const { label, color } = statusConfig[product.status];

//   const handleStatusPress = () => {
//     const currentIndex = statusCycle.indexOf(product.status);
//     const nextIndex = (currentIndex + 1) % statusCycle.length;
//     onStatusChange(product.product._id, statusCycle[nextIndex]);
//   };

//   return (
//     <View style={styles.productItem}>
//       <Text style={styles.productName}>{product.product.name}</Text>
//       <TextInput
//         style={styles.quantityInput}
//         keyboardType="numeric"
//         onChangeText={(text) => onQuantityChange(product.product._id, text)}
//         value={String(product.quantity)}
//       />
//       <TouchableOpacity onPress={handleStatusPress} style={[styles.statusButton, { backgroundColor: color }]}>
//         <Text style={styles.statusText}>{label}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export const EditAttendanceModal = ({ isVisible, customer, onClose, onSave, currentAttendance }) => {
//   const [editedProducts, setEditedProducts] = useState([]);

//   useEffect(() => {
//     if (isVisible && customer) {
//       const initialProducts = customer.requiredProduct.map(rp => ({
//         ...rp,
//         product: { ...rp.product },
//         quantity: currentAttendance[rp.product._id]?.quantity ?? rp.quantity,
//         status: currentAttendance[rp.product._id]?.status ?? 'delivered',
//       }));
//       setEditedProducts(initialProducts);
//     }
//   }, [isVisible, customer, currentAttendance]);

//   const handleQuantityChange = (productId, newQuantity) => {
//     setEditedProducts(prev =>
//       prev.map(p =>
//         p.product._id === productId ? { ...p, quantity: Number(newQuantity) } : p
//       )
//     );
//   };

//   const handleStatusChange = (productId, newStatus) => {
//     setEditedProducts(prev =>
//       prev.map(p =>
//         p.product._id === productId ? { ...p, status: newStatus } : p
//       )
//     );
//   };

//   const handleSave = () => {
//     const editedRequiredProducts = editedProducts.map(p => ({
//         productId: p.product._id,
//         name: p.product.name,
//         quantity: p.quantity,
//         status: p.status,
//     }));
//     const addedExtraProducts = {}; // Not implemented yet
//     onSave(customer._id, editedRequiredProducts, addedExtraProducts);
//   };

//   if (!customer) {
//     return null;
//   }

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={isVisible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.centeredView}>
//         <View style={styles.modalView}>
//           <Text style={styles.modalText}>Edit Attendance for {customer.name}</Text>

//           <FlatList
//             data={editedProducts}
//             keyExtractor={item => item.product._id}
//             renderItem={({ item }) => (
//               <ProductEditor
//                 product={item}
//                 onQuantityChange={handleQuantityChange}
//                 onStatusChange={handleStatusChange}
//               />
//             )}
//             ListEmptyComponent={<Text>No subscribed products.</Text>}
//           />

//           <View style={styles.buttonContainer}>
//             <Button title="Save" onPress={handleSave} />
//             <Button title="Cancel" onPress={onClose} />
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//     centeredView: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//     },
//     modalView: {
//         margin: 20,
//         backgroundColor: 'white',
//         borderRadius: 20,
//         padding: 20,
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         elevation: 5,
//         width: '90%',
//         maxHeight: '80%',
//     },
//     modalText: {
//         marginBottom: 15,
//         textAlign: 'center',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     productItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         width: '100%',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: COLORS.lightGrey,
//     },
//     productName: {
//         flex: 1,
//         fontSize: 14,
//         color: COLORS.text,
//     },
//     quantityInput: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 5,
//         width: 50,
//         textAlign: 'center',
//         marginHorizontal: 10,
//     },
//     statusButton: {
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 5,
//     },
//     statusText: {
//         color: COLORS.white,
//         fontSize: 12,
//         fontWeight: 'bold',
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         width: '100%',
//         marginTop: 20,
//     }
// });

import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';

const { height } = Dimensions.get('window');

const statusConfig = {
  delivered: { label: 'Delivered', color: COLORS.success },
  // skipped: { label: 'Skipped', color: COLORS.warning },
  // out_of_stock: { label: 'Out of Stock', color: COLORS.error },
  not_delivered: { label: 'Not Delivered', color: COLORS.grey },
};

const statusCycle = ['delivered', 'not_delivered'];

interface EditAttendanceBottomSheetProps {
  isVisible: boolean;
  customer: any;
  onClose: () => void;
  onSave: (customerId: string, editedRequiredProducts: any[], addedExtraProducts: any) => void;
  currentAttendance: any;
}

export const EditAttendanceBottomSheet: React.FC<EditAttendanceBottomSheetProps> = ({
  isVisible,
  customer,
  onClose,
  onSave,
  currentAttendance,
}) => {
  const [editedProducts, setEditedProducts] = useState<any[]>([]);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

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

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setEditedProducts(prev =>
      prev.map(p => (p.product._id === productId ? { ...p, quantity: newQuantity } : p))
    );
  };

  const handleStatusChange = (productId: string, newStatus: string) => {
    const updatedProductsIfConfirmed = (products: any[]) => products.map(p => {
      if (p.product._id === productId) {
        let newQuantity = p.quantity;
        let newCachedQuantity = p.cachedQuantity;

        if (newStatus !== 'delivered') {
          // Going to non-delivered
          newQuantity = 0;
          // Cache the previous quantity if we haven't already
          newCachedQuantity = p.cachedQuantity ?? p.quantity;
        } else {
          // Going back to delivered
          if (newCachedQuantity !== undefined) {
            newQuantity = newCachedQuantity;
            newCachedQuantity = undefined;
          }
        }

        return {
          ...p,
          status: newStatus,
          quantity: newQuantity,
          cachedQuantity: newCachedQuantity,
        };
      }
      return p;
    });

    if (newStatus !== 'delivered') {
      const product = editedProducts.find(p => p.product._id === productId);
      // Check if currently delivered and has quantity > 0
      if (product && (product.status === 'delivered' || !product.status) && product.quantity > 0) {
        Alert.alert(
          "Clear Quantity?",
          "Changing status to 'Not Delivered' will set the quantity to 0. Continue?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Yes", onPress: () => {
                setEditedProducts(prev => updatedProductsIfConfirmed(prev));
              }
            }
          ]
        );
        return;
      }
    }

    // Default update if no confirmation needed (or restoring to delivered)
    setEditedProducts(prev => updatedProductsIfConfirmed(prev));
  };

  const handleIncrement = (productId: string) => {
    const product = editedProducts.find(p => p.product._id === productId);
    if (product) handleQuantityChange(productId, product.quantity + 1);
  };

  const handleDecrement = (productId: string) => {
    const product = editedProducts.find(p => p.product._id === productId);
    if (product && product.quantity > 0) handleQuantityChange(productId, product.quantity - 1);
  };

  const handleSave = () => {
    const editedRequiredProducts = editedProducts.map(p => ({
      productId: p.product._id,
      name: p.product.name,
      quantity: p.quantity,
      status: p.status,
    }));
    const addedExtraProducts = {}; // unchanged
    onSave(customer._id, editedRequiredProducts, addedExtraProducts);
  };

  if (!customer) return null;

  const renderProductItem = ({ item }) => {
    const { label, color } = statusConfig[item.status];

    return (
      <View style={styles.productItem}>
        <Text style={styles.productName}>{item.product.name}</Text>

        {/* Quantity selector */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(item.product._id)}>
            <Feather name="minus" size={16} color={item.quantity === 0 ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleIncrement(item.product._id)}>
            <Feather name="plus" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Status cycle button */}
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: color }]}
          onPress={() => {
            const currentIndex = statusCycle.indexOf(item.status);
            const nextIndex = (currentIndex + 1) % statusCycle.length;
            handleStatusChange(item.product._id, statusCycle[nextIndex]);
          }}
        >
          <Text style={styles.statusText}>{label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.dragIndicator} />
                <Text style={styles.title}>Edit Attendance for {customer.name}</Text>
              </View>

              {/* Product list */}
              <FlatList
                data={editedProducts}
                keyExtractor={item => item.product._id}
                renderItem={renderProductItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No subscribed products.</Text>}
                contentContainerStyle={{ paddingBottom: 100 }}
              />

              {/* Footer buttons */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
                  <Text style={styles.addText}>Save</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    height: height * 0.65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: { flex: 1, fontSize: 15, color: '#333' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { backgroundColor: '#f2f2f2', padding: 6, borderRadius: 6 },
  qtyText: { minWidth: 20, textAlign: 'center', fontSize: 15, color: '#333' },
  statusButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#f2f2f2', borderRadius: 8 },
  cancelText: { color: '#555', fontWeight: '500' },
  addBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#27ae60', borderRadius: 8 },
  addText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
});
