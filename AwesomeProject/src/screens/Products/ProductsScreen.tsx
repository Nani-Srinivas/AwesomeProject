import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useCatalogStore } from '../../store/catalogStore';
import { EditProductModal } from '../../components/product/EditProductModal';
import { AddProductBottomSheet } from '../../components/products/AddProductBottomSheet';

const CategoryCard = ({ category, isSelected, onPress }: any) => (
  <TouchableOpacity
    style={[styles.categoryCard, isSelected && styles.selectedCategory]}
    onPress={onPress}>
    <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
    <Text
      style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const ProductCard = ({ item, onEdit }: any) => (
  <View style={styles.productCard}>
    <View style={styles.statusBorder} />
    <View style={styles.cardContent}>
      <View style={styles.leftContent}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
      <View style={styles.rightContent}>
        <View style={styles.priceContainer}>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Feather name="edit-2" style={styles.editIcon} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const SubcategoryChip = ({ label, isSelected, onPress }: any) => {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}>
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ProductsScreen = () => {
  const {
    categories,
    subcategories,
    products,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    fetchCategories,
    fetchSubcategories,
    fetchProducts,
    setSelectedCategory,
    setSelectedSubcategory,
    updateProduct,
  } = useCatalogStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAddProductVisible, setAddProductVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, [fetchCategories, fetchSubcategories, fetchProducts]);

  const handleEditPress = (product: any) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleSaveProduct = (updatedProduct: any) => {
    updateProduct(updatedProduct._id, {
      name: updatedProduct.name,
      costPrice: updatedProduct.costPrice,
      sellingPrice: updatedProduct.sellingPrice,
    });
    setModalVisible(false);
    setEditingProduct(null);
  };

  // Build subcategories dynamically based on selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      // Get unique subcategories from all products
      const subIds = new Set(
        products
          .map(p => p.storeSubcategoryId)
          .filter(Boolean)
      );
      const subs = subcategories.filter(s => subIds.has(s._id));
      return ['All', ...subs.map(s => s.name)];
    } else {
      // Get subcategories for selected category
      const categorySubcategories = subcategories.filter(
        s => {
          // Find a product that matches this subcategory and category
          return products.some(
            p => p.storeSubcategoryId === s._id && p.storeCategoryId._id === selectedCategory
          );
        }
      );
      return ['All', ...categorySubcategories.map(s => s.name)];
    }
  }, [selectedCategory, products, subcategories]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        product => product.storeCategoryId._id === selectedCategory
      );
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'All') {
      const selectedSub = subcategories.find(s => s.name === selectedSubcategory);
      if (selectedSub) {
        filtered = filtered.filter(
          product => product.storeSubcategoryId === selectedSub._id
        );
      }
    }

    return filtered;
  }, [products, selectedCategory, selectedSubcategory, subcategories]);

  if (loading && categories.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load products.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Categories (Left) */}
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              isSelected={item._id === selectedCategory}
              onPress={() => setSelectedCategory(item._id)}
            />
          )}
          keyExtractor={item => item._id}
          style={styles.categoryList}
          showsVerticalScrollIndicator={false}
        />

        {/* Products & Subcategories (Right) */}
        <View style={styles.productGrid}>
          {/* Subcategory Chips */}
          {availableSubcategories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoryScroll}
              contentContainerStyle={styles.subcategoryContent}>
              {availableSubcategories.map(sub => (
                <SubcategoryChip
                  key={sub}
                  label={sub}
                  isSelected={sub === selectedSubcategory}
                  onPress={() => setSelectedSubcategory(sub)}
                />
              ))}
            </ScrollView>
          )}

          {/* Product List */}
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductCard item={item} onEdit={handleEditPress} />
            )}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.contentContainerPadding}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>No products found</Text>
            }
          />
        </View>
      </View>

      {editingProduct && (
        <EditProductModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      )}

      {/* Add Product Bottom Sheet */}
      <AddProductBottomSheet
        isVisible={isAddProductVisible}
        onClose={() => setAddProductVisible(false)}
        onSuccess={() => {
          fetchProducts();
          fetchCategories();
          fetchSubcategories();
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddProductVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, flexDirection: 'row' },

  // Left side
  categoryList: { width: '20%', backgroundColor: '#fafafa' },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    marginBottom: 8,
  },
  selectedCategory: { borderLeftColor: 'green', backgroundColor: '#f0fff0' },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  categoryText: { fontSize: 12, textAlign: 'center', color: '#333' },
  selectedCategoryText: { fontWeight: 'bold', color: 'green' },

  // Right side
  productGrid: { width: '80%' },

  // Products
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBorder: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 16,
    backgroundColor: '#27ae60',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1C' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  mrp: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  editIcon: {
    fontSize: 20,
    color: '#888',
  },

  contentContainerPadding: { paddingHorizontal: 16, paddingBottom: 12 },
  emptyListText: { textAlign: 'center', marginTop: 50 },
  subcategoryScroll: { maxHeight: 48, marginTop: 8, marginBottom: 16 },
  subcategoryContent: { paddingHorizontal: 8 },

  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
    shadowOpacity: 0.15,
  },
  chipText: { fontSize: 13, color: '#444', fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});