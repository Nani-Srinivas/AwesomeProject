import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import CustomButton from '../../components/ui/CustomButton';
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
  name: string;
  price: number;
}



export const SelectProductScreen = ({ route, navigation }: SelectProductScreenProps) => {
  console.log('SelectProductScreen: route object:', JSON.stringify(route, null, 2));
  console.log('SelectProductScreen: route.params:', JSON.stringify(route.params, null, 2));

  const { user } = useUserStore();
  const selectedCategories = route.params?.selectedCategories || user?.selectedCategoryIds || [];
  const selectedSubcategories = route.params?.selectedSubcategories || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pre-selection logic
  useEffect(() => {
    if (products.length > 0 && route.params?.selectedProducts && Array.isArray(route.params.selectedProducts)) {
      // Check if params are IDs (strings) or objects
      const paramProducts = route.params.selectedProducts;
      if (paramProducts.length > 0 && typeof paramProducts[0] === 'string') {
        // IDs passed from AppNavigator/Backend
        const preSelectedIds = paramProducts as unknown as string[];
        const preSelectedObjects: SelectedProduct[] = [];

        products.forEach(p => {
          if (preSelectedIds.includes(p._id)) {
            preSelectedObjects.push({
              productId: p._id,
              categoryId: p.categoryId,
              name: p.name,
              price: p.price
            });
          }
        });

        // Only set if we found matches and haven't manually selected yet (optional check)
        if (preSelectedObjects.length > 0) {
          setSelectedProducts(prev => prev.length === 0 ? preSelectedObjects : prev);
        }
      }
    }
  }, [products, route.params?.selectedProducts]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, selectedSubcategories]);

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
          if (!cat.products || !Array.isArray(cat.products)) {
            return [];
          }

          // Find selected subcategories belonging to THIS category
          const categorySubIds = cat.subcategories ? cat.subcategories.map((s: any) => s._id) : [];
          const selectedInThisCategory = selectedSubcategories.filter((id: string) => categorySubIds.includes(id));

          // Filter products by subcategory ONLY if subcategories are selected for THIS category
          const filteredProducts = selectedInThisCategory.length > 0
            ? cat.products.filter((p: any) => {
              const hasSubcategory = !!p.subcategory;
              const subId = p.subcategory?._id || p.subcategory;
              const isMatch = hasSubcategory && selectedInThisCategory.includes(subId);

              return isMatch;
            })
            : cat.products;

          return filteredProducts.map((p: any) => ({
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

  const toggleProductSelection = (productId: string, categoryId: string, name: string, price: number) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some(
        (p) => p.productId === productId && p.categoryId === categoryId
      );
      if (isSelected) {
        return prevSelected.filter(
          (p) => !(p.productId === productId && p.categoryId === categoryId)
        );
      } else {
        return [...prevSelected, { productId, categoryId, name, price }];
      }
    });
  };

  const handleNext = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one product.');
      return;
    }

    try {
      setSubmitting(true);
      // Save selected product IDs to backend
      const selectedIds = selectedProducts.map(p => p.productId);
      await apiService.post('/store/onboarding/update-selected-products', {
        products: selectedIds
      });

      navigation.navigate('PricingConfig', {
        selectedCategories,
        selectedProducts
      });
    } catch (error) {
      console.error('Error saving products:', error);
      // Optional: Allow proceeding even if save fails? Or block?
      // For now, alert but allow proceeding if they want (or maybe better to block to ensure consistency)
      Alert.alert('Error', 'Failed to save selection. Please try again.');
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
            onPress={() => toggleProductSelection(item._id, item.categoryId, item.name, item.price)}
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
      <CustomButton
        title="Next: Configure Pricing"
        onPress={handleNext}
        disabled={selectedProducts.length === 0}
        loading={submitting}
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
