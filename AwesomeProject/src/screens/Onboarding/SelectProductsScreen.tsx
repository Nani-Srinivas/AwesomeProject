import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { storeCatalogService } from '../../services/storeCatalogService';

interface SelectProductsScreenProps {
  navigation: any;
  route: any; // To get params from previous screen
}

interface MasterSubcategory {
  _id: string;
  name: string;
}

interface MasterProduct {
  _id: string;
  name: string;
  basePrice: number;
  imageUrl?: string;
}

interface CategoryWithProducts {
  category: { _id: string; name: string };
  subcategories: MasterSubcategory[];
  products: MasterProduct[];
}

export const SelectProductsScreen = ({ navigation, route }: SelectProductsScreenProps) => {
  const { selectedCategoryIds } = route.params;
  const [categorizedProducts, setCategorizedProducts] = useState<CategoryWithProducts[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterProducts();
  }, []);

  const fetchMasterProducts = async () => {
    try {
      setLoading(true);
      const data = await storeCatalogService.getMasterProductsByCategories(selectedCategoryIds);
      setCategorizedProducts(data);
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

    try {
      setLoading(true);
      // Assuming selectedCategoryIds are also needed for import, though the API only asks for product IDs
      // The API definition in IMPLEMENTATION_PLAN.md asks for both selectedMasterCategoryIds and selectedMasterProductIds
      await storeCatalogService.importCatalog(selectedCategoryIds, selectedProductIds);
      Alert.alert('Success', 'Selected products imported to your catalog!');
      // Navigate to the main store management screen or dashboard
      navigation.navigate('Dashboard'); // Adjust this to your actual dashboard route
    } catch (err: any) {
      console.error('Failed to import catalog:', err);
      Alert.alert('Error', err.message || 'Failed to import catalog.');
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }: { item: MasterProduct }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        selectedProductIds.includes(item._id) && styles.selectedProductItem,
      ]}
      onPress={() => toggleProductSelection(item._id)}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.basePrice.toFixed(2)}</Text>
      {/* Add image if available */}
    </TouchableOpacity>
  );

  const renderCategorySection = ({ item }: { item: CategoryWithProducts }) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{item.category.name}</Text>
      {item.subcategories.map(sub => (
        <Text key={sub._id} style={styles.subCategoryText}>- {sub.name}</Text>
      ))}
      <FlatList
        data={item.products}
        renderItem={renderProductItem}
        keyExtractor={product => product._id}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
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
        <Text style={styles.subtitle}>Choose products to add to your store's catalog.</Text>

        <FlatList
          data={categorizedProducts}
          renderItem={renderCategorySection}
          keyExtractor={item => item.category._id}
          contentContainerStyle={styles.mainProductList}
        />

        <Button
          title="Import Catalog"
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
  mainProductList: {
    flexGrow: 1,
  },
  categorySection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  subCategoryText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    marginBottom: 3,
  },
  productList: {
    justifyContent: 'space-between',
  },
  productItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedProductItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary,
    borderWidth: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 5,
  },
});
