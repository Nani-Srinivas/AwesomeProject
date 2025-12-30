import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { storeCatalogService } from '../../services/storeCatalogService';

interface SelectProductsScreenProps {
  navigation: any;
  route: any;
}

interface MasterProduct {
  _id: string;
  name: string;
  basePrice: number;
  brandId: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  subcategory: {
    _id: string;
    name: string;
  };
  imageUrl?: string;
}

export const SelectProductsScreen = ({ navigation, route }: SelectProductsScreenProps) => {
  const { selectedBrandIds, selectedSubcategoryIds } = route.params;
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterProducts();
  }, []);

  const fetchMasterProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(
        `/admin/master-products?brandIds=${selectedBrandIds.join(',')}&subcategoryIds=${selectedSubcategoryIds.join(',')}`
      );
      setProducts(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch master products:', err);
      setError(err.message || 'Failed to load products.');
      Alert.alert('Error', err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleImportCatalog = async () => {
    if (selectedProductIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one product to import.');
      return;
    }

    // Navigate to PricingConfig with selected data
    navigation.navigate('PricingConfig', {
      selectedBrandIds,
      selectedSubcategoryIds,
      selectedProductIds,
    });
  };

  const renderProductItem = ({ item }: { item: MasterProduct }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProductIds.includes(item._id) && styles.selectedProductCard,
      ]}
      onPress={() => toggleProductSelection(item._id)}
    >
      <View style={styles.cardContent}>
        {/* Product Image */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {selectedProductIds.includes(item._id) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.brandName}>{item.brandId?.name}</Text>
          <Text style={styles.subcategoryName}>{item.subcategory?.name}</Text>

          <Text style={styles.productPrice}>₹{item.basePrice?.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchMasterProducts} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Products</Text>
        <Text style={styles.subtitle}>
          Choose products from your selected brands and subcategories
        </Text>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.productList}
          />
        )}

        <Button
          title={`Import Catalog (${selectedProductIds.length} selected)`}
          onPress={handleImportCatalog}
          disabled={selectedProductIds.length === 0}
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  productList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedProductCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  brandName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  subcategoryName: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
