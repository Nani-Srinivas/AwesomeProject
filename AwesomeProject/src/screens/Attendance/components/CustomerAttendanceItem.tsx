import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { ProductAttendanceItem } from './ProductAttendanceItem';

export const CustomerAttendanceItem = ({ customer, isExpanded, onToggleExpansion, attendance, onProductAttendanceChange, onEdit, isPastDate }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggleExpansion} style={styles.header}>
        <Feather name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} color={COLORS.text} />
        <Text style={styles.customerName}>{customer.name}</Text>
        <TouchableOpacity onPress={isPastDate ? null : onEdit} style={styles.editButton} disabled={isPastDate}>
          <Feather name="edit-2" size={20} color={isPastDate ? COLORS.lightGrey : COLORS.text} />
        </TouchableOpacity>
      </TouchableOpacity>
      {isExpanded && (
        <FlatList
          data={customer.requiredProduct}
          renderItem={({ item }) => (
            <ProductAttendanceItem
              product={item}
              isChecked={attendance[item.product._id]?.delivered} // Access delivered property
              onCheckboxChange={isPastDate ? null : () => onProductAttendanceChange(item.product._id)}
              isDisabled={isPastDate} // Pass isDisabled prop
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
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.background,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  editButton: {
    marginLeft: 15,
  },
});
