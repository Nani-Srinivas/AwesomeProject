import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useCatalogStore} from '../../store/catalogStore';

const CategoryCard = ({category, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.categoryCard, isSelected && styles.selectedCategory]}
    onPress={onPress}>
    <Image source={{uri: category.imageUrl}} style={styles.categoryImage} />
    <Text
      style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const ProductCard = ({item}) => (
  <View style={styles.productCard}>
    <Text style={styles.tag}>{item.tag}</Text>
    <Image source={{uri: item.images[0]}} style={styles.productImage} />
    <Text style={styles.name} numberOfLines={2}>
      {item.name}
    </Text>
    <Text style={styles.weight}>{item.weight}</Text>
    <Text style={styles.delivery}>{item.time}</Text>
    <View style={styles.priceRow}>
      <Text style={styles.price}>₹{item.price}</Text>
      <Text style={styles.mrp}>MRP ₹{item.mrp}</Text>
    </View>
    <Text style={styles.discount}>{item.discount}</Text>
    <TouchableOpacity style={styles.addButton}>
      <Text style={styles.addButtonText}>ADD</Text>
    </TouchableOpacity>
  </View>
);

export const ProductsScreen = () => {
  const {
    categories,
    products,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    fetchProducts,
    setSelectedCategory,
  } = useCatalogStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter(product => product.storeCategoryId._id === selectedCategory);
  }, [products, selectedCategory]);

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
        <FlatList
          data={categories}
          renderItem={({item}) => (
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

        <FlatList
          data={filteredProducts}
          renderItem={({item}) => <ProductCard item={item} />}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainerPadding}
          style={styles.productGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No products found</Text>
          }
        />
      </View>
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
  productGrid: { width: '80%' },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tag: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    marginBottom: 4,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: '600' },
  weight: { fontSize: 12, color: '#777' },
  delivery: { fontSize: 10, color: '#999', marginVertical: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  mrp: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  discount: { fontSize: 12, color: '#E67300', marginTop: 2 },
  addButton: {
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 6,
    paddingVertical: 4,
    marginTop: 6,
  },
  addButtonText: { color: 'green', textAlign: 'center', fontWeight: '600' },
  columnWrapper: { gap: 12 },
  contentContainerPadding: { padding: 12 },
  emptyListText: { textAlign: 'center', marginTop: 50 },
});