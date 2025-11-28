import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useUserStore } from '../../store/userStore';
import { reset } from '../../navigation/NavigationRef';

type SelectProductScreenProps = StackScreenProps<MainStackParamList, 'SelectProduct'>;

interface Product {
  _id: string;
  name: string;
  price: number;
  unit?: string;
  categoryId: string;
  image?: string | null;
}

interface SelectedProduct {
  productId: string;
  categoryId: string;
}

export const SelectProductScreen = ({ route }: SelectProductScreenProps) => {
  console.log('SelectProductScreen: route object:', JSON.stringify(route, null, 2));
  console.log('SelectProductScreen: route.params:', JSON.stringify(route.params, null, 2));

  const { user } = useUserStore();
  const selectedCategories = route.params?.selectedCategories || user.selectedCategoryIds || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/store/onboarding/master-products-by-categories', {
        categoryIds: selectedCategories,
      });

      console.log("Products API response:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Flatten all products across categories
        const allProducts = response.data.data.flatMap((cat: any) => {
          console.log('Processing category object:', JSON.stringify(cat, null, 2));
          console.log('cat.products:', JSON.stringify(cat.products, null, 2));
          // Ensure cat.products is an array before mapping
          if (!cat.products || !Array.isArray(cat.products)) {
            console.warn('Category object missing or invalid products array:', cat);
            return []; // Skip this category if products is missing or invalid
          }
          return cat.products.map((p: any) => ({
            _id: p._id,
            name: p.name,
            price: p.basePrice,
            unit: p.unit || '',
            categoryId: cat.category._id,
            image: p.images?.[0] || null,
          }));
        });
        setProducts(allProducts);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to fetch products.');
      }
    } catch (error: any) {
      console.error('Fetch products error:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string, categoryId: string) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some(
        (p) => p.productId === productId && p.categoryId === categoryId
      );
      if (isSelected) {
        return prevSelected.filter(
          (p) => !(p.productId === productId && p.categoryId === categoryId)
        );
      } else {
        return [...prevSelected, { productId, categoryId }];
      }
    });
  };

  const handleImportCatalog = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one product.');
      return;
    }

    setSubmitting(true);
    try {
      // Transform the selectedProducts state into an array of product IDs
      const selectedMasterProductIds = selectedProducts.map(p => p.productId);

      // Get the category IDs from the route params
      const selectedMasterCategoryIds = selectedCategories;

      console.log('Submitting to /import-catalog with payload:', {
        selectedMasterCategoryIds,
        selectedMasterProductIds,
      });

      const response = await apiService.post('/store/onboarding/import-catalog', {
        selectedMasterCategoryIds,
        selectedMasterProductIds,
      });

      if (response.data && response.data.success) {
        Alert.alert('Success', response.data.message);
        reset('Home');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to import catalog.');
      }
    } catch (error: any) {
      console.error('Import catalog error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred during catalog import.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading Products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.productItem,
              selectedProducts.some((p) => p.productId === item._id) && styles.selectedProductItem,
            ]}
            onPress={() => toggleProductSelection(item._id, item.categoryId)}
          >
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.productImage} />
            )}
            <Text
              style={[
                styles.productText,
                selectedProducts.some((p) => p.productId === item._id) && styles.selectedProductText,
              ]}
            >
              {item.name} {item.unit ? `(${item.unit})` : ''} - ₹{item.price}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Import Catalog"
        onPress={handleImportCatalog}
        disabled={submitting || selectedProducts.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  selectedProductItem: {
    backgroundColor: COLORS.primary + '20', // transparent highlight
    borderColor: COLORS.primary,
  },
  productImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  productText: { fontSize: 16, color: '#333' },
  selectedProductText: { fontWeight: 'bold', color: COLORS.primary },
});
