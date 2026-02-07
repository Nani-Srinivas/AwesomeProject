import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { ProductAttendanceItem } from './ProductAttendanceItem';

export const CustomerAttendanceItem = ({ customer, isExpanded, onToggleExpansion, attendance, onProductStatusChange, onProductQuantityChange, onDeleteProduct, onEdit, onAdd, isPastDate, flatNumber, isReadOnly }) => {
  const isDisabled = isPastDate || isReadOnly;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Display only flat number (no chevron needed) */}
        <View style={styles.infoContainer}>
          <Text style={styles.customerName}>
            {customer.address?.FlatNo || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity onPress={isDisabled ? null : onEdit} style={styles.editButton} disabled={isDisabled}>
          <Feather name="edit-2" size={20} color={isDisabled ? COLORS.lightGrey : COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isDisabled ? null : onAdd} style={styles.addButton} disabled={isDisabled}>
          <Feather name="plus-circle" size={20} color={isDisabled ? COLORS.lightGrey : COLORS.primary} />
        </TouchableOpacity>
      </View>
      {/* Products always shown inline when apartment is expanded */}
      {isExpanded && (
        <View>
          {customer.requiredProduct.map((item) => (
            <ProductAttendanceItem
              key={item.product._id}
              product={{ ...item, quantity: attendance[item.product._id]?.quantity ?? item.quantity }}
              status={attendance[item.product._id]?.status}
              onStatusChange={(newStatus) => onProductStatusChange(item.product._id, newStatus)}
              onQuantityChange={(newQuantity) => onProductQuantityChange(item.product._id, newQuantity)}
              onDelete={() => onDeleteProduct && onDeleteProduct(item.product._id)}
              isDisabled={isDisabled}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 15,
  },
  addButton: {
    marginLeft: 15,
  },
});