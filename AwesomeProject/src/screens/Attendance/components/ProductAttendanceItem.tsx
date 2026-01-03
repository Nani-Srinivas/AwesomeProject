import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../../../constants/colors';

const statusConfig = {
  delivered: { label: 'Delivered', color: COLORS.success },
  not_delivered: { label: 'Not Delivered', color: COLORS.grey },
  skipped: { label: 'Skipped', color: COLORS.warning },
  out_of_stock: { label: 'Out of Stock', color: COLORS.error },
};

const statusCycle = ['delivered', 'skipped', 'out_of_stock', 'not_delivered'];

export const ProductAttendanceItem = ({ product, status, onStatusChange, onQuantityChange, isDisabled }) => {
  if (!product || !product.product) {
    return null;
  }

  const currentStatus = status || 'delivered';
  const { label, color } = statusConfig[currentStatus];

  const handlePress = () => {
    if (isDisabled) return;
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    onStatusChange(statusCycle[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.productName}>
        {product.product.name}
      </Text>
      <TextInput
        style={styles.quantityInput}
        keyboardType="decimal-pad"
        onChangeText={onQuantityChange}
        value={String(product.quantity)}
        editable={!isDisabled}
      />
      <TouchableOpacity onPress={handlePress} disabled={isDisabled} style={[styles.statusButton, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    paddingLeft: 32,
  },
  productName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
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
});