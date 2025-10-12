import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { storeCatalogService } from '../../services/storeCatalogService';

interface StoreProductListScreenProps {
  navigation: any;
}

interface StoreProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export const StoreProductListScreen = ({ navigation }: StoreProductListScreenProps) => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      const data = await storeCatalogService.getStoreProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch store products:', err);
      setError(err.message || 'Failed to load products.');
      Alert.alert('Error', err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    // Navigate to a screen/modal to add a new product
    Alert.alert('Add Product', 'Navigate to Add Product screen/modal');
  };

  const handleEditProduct = (productId: string) => {
    // Navigate to a screen/modal to edit the product
    Alert.alert('Edit Product', `Navigate to Edit Product screen/modal for ID: ${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              await storeCatalogService.deleteStoreProduct(productId);
              Alert.alert('Success', 'Product deleted successfully.');
              fetchStoreProducts(); // Refresh the list
            } catch (err: any) {
              console.error('Failed to delete product:', err);
              Alert.alert('Error', err.message || 'Failed to delete product.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderProductItem = ({ item }: { item: StoreProduct }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.productStock}>Stock: {item.stock}</Text>
      <Text style={styles.productAvailability}>
        {item.isAvailable ? 'Available' : 'Not Available'}
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => handleEditProduct(item._id)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProduct(item._id)} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading store products...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchStoreProducts} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Store Products</Text>
        <Button title="Add New Product" onPress={handleAddProduct} style={styles.addButton} />

        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found. Add one to get started!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  productList: {
    flexGrow: 1,
  },
  productItem: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 5,
  },
  productStock: {
    fontSize: 14,
    color: COLORS.text,
  },
  productAvailability: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});
