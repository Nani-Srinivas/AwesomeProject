import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

interface ProductSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onProductsSelected: (selectedProducts: any[]) => void;
  initialSelectedProducts: any[];
}

export const ProductSelector = ({ isVisible, onClose, onProductsSelected, initialSelectedProducts }: ProductSelectorProps) => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchStoreProducts();
      setSelectedProducts(initialSelectedProducts || []);
    }
  }, [isVisible, initialSelectedProducts]);

  const fetchStoreProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/product/store');
      if (response.data.success) {
        setAllProducts(response.data.data);
      } else {
        console.error('Failed to fetch store products');
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allProducts, searchTerm]);

  const toggleProductSelection = (product: any) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p._id === product._id);
      if (isSelected) {
        return prev.filter(p => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleDone = () => {
    onProductsSelected(selectedProducts);
    onClose();
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedProducts.some(p => p._id === item._id);
    return (
      <TouchableOpacity style={styles.productItem} onPress={() => toggleProductSelection(item)}>
        <Text style={styles.productName}>{item.name}</Text>
        <Feather name={isSelected ? 'check-square' : 'square'} size={24} color={COLORS.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Products</Text>
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={item => item._id}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchInput: {
    height: 40,
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  productName: {
    fontSize: 16,
  },
});