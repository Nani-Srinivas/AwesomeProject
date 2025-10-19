import React from 'react';
import { View, Text } from 'react-native';

interface AddExtraProductModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddProducts: (products: any[]) => void;
  customer: any;
}

export const AddExtraProductModal: React.FC<AddExtraProductModalProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray' }}>
      <Text>AddExtraProductModal (Reverted)</Text>
    </View>
  );
};