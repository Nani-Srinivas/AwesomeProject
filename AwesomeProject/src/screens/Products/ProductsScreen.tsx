import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

const categories = [
  { category: 'All', image: 'https://picsum.photos/id/101/80/80' },
  { category: 'Fresh Vegetables', image: 'https://picsum.photos/id/102/80/80' },
  { category: 'Fresh Fruits', image: 'https://picsum.photos/id/103/80/80' },
  { category: 'Exotics', image: 'https://picsum.photos/id/104/80/80' },
  { category: 'Coriander & Others', image: 'https://picsum.photos/id/105/80/80' },
  { category: 'Flowers & Leaves', image: 'https://picsum.photos/id/106/80/80' },
];

const products = [
  {
    name: 'Royal Gala Apple - Kashmir',
    category: 'Fresh Fruits',
    subcategory: 'Apples',
    tag: "Season's best",
    weight: '2 pieces (300-350 g)',
    time: '23 MINS',
    discount: '20% OFF',
    price: 99,
    mrp: 125,
    image: 'https://picsum.photos/id/110/300/300',
  },
  {
    name: 'Nagpur Orange (Narinja Pandu)',
    category: 'Fresh Fruits',
    subcategory: 'Oranges',
    tag: "Season's best",
    weight: '500-600 g',
    time: '23 MINS',
    discount: '21% OFF',
    price: 54,
    mrp: 69,
    image: 'https://picsum.photos/id/111/300/300',
  },
  {
    name: 'Shine Muscat Green Grapes',
    category: 'Exotics',
    subcategory: 'Grapes',
    tag: 'Imported',
    weight: '250 g',
    time: '23 MINS',
    discount: '27% OFF',
    price: 145,
    mrp: 200,
    image: 'https://picsum.photos/id/112/300/300',
  },
  {
    name: 'Zespri Sungold Kiwi',
    category: 'Exotics',
    subcategory: 'Kiwis',
    tag: 'Imported',
    weight: '2 pieces',
    time: '23 MINS',
    discount: '25% OFF',
    price: 140,
    mrp: 189,
    image: 'https://picsum.photos/id/113/300/300',
  },
];

const CategoryCard = ({ category, isSelected, onPress }: any) => (
  <TouchableOpacity
    style={[styles.categoryCard, isSelected && styles.selectedCategory]}
    onPress={onPress}
  >
    <Image source={{ uri: category.image }} style={styles.categoryImage} />
    <Text
      style={[styles.categoryText, isSelected && styles.selectedCategoryText]}
    >
      {category.category}
    </Text>
  </TouchableOpacity>
);

const ProductCard = ({ item }: any) => (
  <View style={styles.productCard}>
    <Text style={styles.tag}>{item.tag}</Text>
    <Image source={{ uri: item.image }} style={styles.productImage} />
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
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCat === 'All' || item.category === selectedCat;
    return matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={searchText}
        onChangeText={setSearchText}
      /> */}

      <View style={styles.content}>
        {/* Categories */}
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              isSelected={item.category === selectedCat}
              onPress={() => setSelectedCat(item.category)}
            />
          )}
          keyExtractor={(item) => item.category}
          style={styles.categoryList}
          showsVerticalScrollIndicator={false}
        />

        {/* Products */}
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={(item, index) => item.name + index}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainerPadding}
          style={styles.productGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              No products found
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 12,
  },
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







