import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { ProductAttendanceItem } from './ProductAttendanceItem';

export const CustomerAttendanceItem = ({ customer, isExpanded, onToggleExpansion, attendance, onProductStatusChange, onProductQuantityChange, onEdit, onAdd, isPastDate, flatNumber }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Display only flat number (no chevron needed) */}
        <View style={styles.infoContainer}>
          <Text style={styles.customerName}>
            {customer.address?.FlatNo || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity onPress={isPastDate ? null : onEdit} style={styles.editButton} disabled={isPastDate}>
          <Feather name="edit-2" size={20} color={isPastDate ? COLORS.lightGrey : COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isPastDate ? null : onAdd} style={styles.addButton} disabled={isPastDate}>
          <Feather name="plus-circle" size={20} color={isPastDate ? COLORS.lightGrey : COLORS.primary} />
        </TouchableOpacity>
      </View>
      {/* Products always shown inline when apartment is expanded */}
      {isExpanded && (
        <FlatList
          data={customer.requiredProduct}
          renderItem={({ item }) => (
            <ProductAttendanceItem
              product={{ ...item, quantity: attendance[item.product._id]?.quantity ?? item.quantity }}
              status={attendance[item.product._id]?.status}
              onStatusChange={(newStatus) => onProductStatusChange(item.product._id, newStatus)}
              onQuantityChange={(newQuantity) => onProductQuantityChange(item.product._id, newQuantity)}
              isDisabled={isPastDate}
            />
          )}
          keyExtractor={item => item.product._id}
        />
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