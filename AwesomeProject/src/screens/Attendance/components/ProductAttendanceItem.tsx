import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { COLORS } from '../../../constants/colors.ts';

export const ProductAttendanceItem = ({ product, isChecked, onCheckboxChange, isDisabled }) => {
  if (!product || !product.product) {
    return null; // Or render a placeholder/error message
  }
  return (
    <View style={styles.container}>
      <Text style={styles.productName}>
        {product.product.name} ({product.quantity !== undefined && product.quantity !== null ? product.quantity : 'N/A'})
      </Text>
      <CheckBox
        value={isChecked}
        onValueChange={onCheckboxChange}
        tintColors={{ true: COLORS.primary, false: COLORS.text }}
        disabled={isDisabled} // Disable checkbox
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  productName: {
    fontSize: 14,
    color: COLORS.text,
  },
});
