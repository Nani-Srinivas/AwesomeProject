import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Animated } from 'react-native';

// ---- Categories ----
const categories = [
  { category: 'All', image: 'https://picsum.photos/id/101/80/80' },
  { category: 'Fresh Vegetables', image: 'https://picsum.photos/id/102/80/80' },
  { category: 'Fresh Fruits', image: 'https://picsum.photos/id/103/80/80' },
  { category: 'Exotics', image: 'https://picsum.photos/id/104/80/80' },
  { category: 'Coriander & Others', image: 'https://picsum.photos/id/105/80/80' },
  { category: 'Flowers & Leaves', image: 'https://picsum.photos/id/106/80/80' },
  { category: 'Dairy & Eggs', image: 'https://picsum.photos/id/107/80/80' },
  { category: 'Bakery', image: 'https://picsum.photos/id/108/80/80' },
  { category: 'Snacks', image: 'https://picsum.photos/id/109/80/80' },
  { category: 'Beverages', image: 'https://picsum.photos/id/110/80/80' },
  { category: 'Household', image: 'https://picsum.photos/id/111/80/80' },
];

// ---- Subcategories ----
const subcategories: Record<string, string[]> = {
  All: [],
  'Fresh Vegetables': ['Leafy Greens', 'Roots', 'Beans', 'Onions', 'Tomatoes'],
  'Fresh Fruits': ['Apples', 'Oranges', 'Bananas', 'Grapes', 'Melons'],
  Exotics: ['Kiwis', 'Avocados', 'Berries', 'Dragon Fruit'],
  'Coriander & Others': ['Herbs', 'Spices'],
  'Flowers & Leaves': ['Pooja Flowers', 'Decorative Leaves'],
  'Dairy & Eggs': ['Milk', 'Cheese', 'Eggs', 'Butter'],
  Bakery: ['Bread', 'Cakes', 'Cookies'],
  Snacks: ['Chips', 'Namkeen', 'Biscuits'],
  Beverages: ['Tea', 'Coffee', 'Juice', 'Soda'],
  Household: ['Cleaning', 'Toiletries'],
};

// ---- Products ----
const products = [
  // Fresh Fruits
  {
    name: 'Royal Gala Apple - Kashmir',
    category: 'Fresh Fruits',
    subcategory: 'Apples',
    tag: "Season's best",
    weight: '2 pcs (300-350 g)',
    time: '23 MINS',
    discount: '20% OFF',
    price: 99,
    mrp: 125,
    image: 'https://picsum.photos/id/120/300/300',
  },
  {
    name: 'Nagpur Orange',
    category: 'Fresh Fruits',
    subcategory: 'Oranges',
    tag: "Season's best",
    weight: '500-600 g',
    time: '20 MINS',
    discount: '21% OFF',
    price: 54,
    mrp: 69,
    image: 'https://picsum.photos/id/121/300/300',
  },
  {
    name: 'Banana Yelakki',
    category: 'Fresh Fruits',
    subcategory: 'Bananas',
    tag: 'Popular',
    weight: '12 pcs',
    time: '15 MINS',
    discount: '15% OFF',
    price: 60,
    mrp: 70,
    image: 'https://picsum.photos/id/122/300/300',
  },
  {
    name: 'Green Grapes',
    category: 'Fresh Fruits',
    subcategory: 'Grapes',
    tag: 'Fresh',
    weight: '500 g',
    time: '18 MINS',
    discount: '10% OFF',
    price: 85,
    mrp: 95,
    image: 'https://picsum.photos/id/123/300/300',
  },
  {
    name: 'Watermelon',
    category: 'Fresh Fruits',
    subcategory: 'Melons',
    tag: 'Juicy',
    weight: '1 pc ~2kg',
    time: '25 MINS',
    discount: '25% OFF',
    price: 90,
    mrp: 120,
    image: 'https://picsum.photos/id/124/300/300',
  },

  // Vegetables
  {
    name: 'Spinach',
    category: 'Fresh Vegetables',
    subcategory: 'Leafy Greens',
    tag: 'Iron Rich',
    weight: '250 g',
    time: '15 MINS',
    discount: '10% OFF',
    price: 25,
    mrp: 28,
    image: 'https://picsum.photos/id/125/300/300',
  },
  {
    name: 'Carrot',
    category: 'Fresh Vegetables',
    subcategory: 'Roots',
    tag: 'Vitamin A',
    weight: '500 g',
    time: '15 MINS',
    discount: '12% OFF',
    price: 40,
    mrp: 46,
    image: 'https://picsum.photos/id/126/300/300',
  },
  {
    name: 'French Beans',
    category: 'Fresh Vegetables',
    subcategory: 'Beans',
    tag: 'Fiber Rich',
    weight: '250 g',
    time: '20 MINS',
    discount: '15% OFF',
    price: 55,
    mrp: 65,
    image: 'https://picsum.photos/id/127/300/300',
  },
  {
    name: 'Onion',
    category: 'Fresh Vegetables',
    subcategory: 'Onions',
    tag: 'Daily Use',
    weight: '1 kg',
    time: '10 MINS',
    discount: '8% OFF',
    price: 35,
    mrp: 38,
    image: 'https://picsum.photos/id/128/300/300',
  },
  {
    name: 'Tomato',
    category: 'Fresh Vegetables',
    subcategory: 'Tomatoes',
    tag: 'Juicy',
    weight: '1 kg',
    time: '10 MINS',
    discount: '10% OFF',
    price: 30,
    mrp: 33,
    image: 'https://picsum.photos/id/129/300/300',
  },

  // Dairy & Eggs
  {
    name: 'Cow Milk',
    category: 'Dairy & Eggs',
    subcategory: 'Milk',
    tag: 'Farm Fresh',
    weight: '1 Litre',
    time: '12 MINS',
    discount: '5% OFF',
    price: 55,
    mrp: 58,
    image: 'https://picsum.photos/id/130/300/300',
  },
  {
    name: 'Cheddar Cheese',
    category: 'Dairy & Eggs',
    subcategory: 'Cheese',
    tag: 'Imported',
    weight: '200 g',
    time: '25 MINS',
    discount: '20% OFF',
    price: 180,
    mrp: 225,
    image: 'https://picsum.photos/id/131/300/300',
  },
  {
    name: 'Farm Eggs',
    category: 'Dairy & Eggs',
    subcategory: 'Eggs',
    tag: 'Protein',
    weight: '12 pcs',
    time: '15 MINS',
    discount: '18% OFF',
    price: 72,
    mrp: 88,
    image: 'https://picsum.photos/id/132/300/300',
  },

  // Bakery
  {
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    subcategory: 'Bread',
    tag: 'Healthy',
    weight: '400 g',
    time: '18 MINS',
    discount: '12% OFF',
    price: 38,
    mrp: 44,
    image: 'https://picsum.photos/id/133/300/300',
  },
  {
    name: 'Chocolate Cake',
    category: 'Bakery',
    subcategory: 'Cakes',
    tag: 'Rich Taste',
    weight: '500 g',
    time: '30 MINS',
    discount: '22% OFF',
    price: 250,
    mrp: 320,
    image: 'https://picsum.photos/id/134/300/300',
  },
  {
    name: 'Butter Cookies',
    category: 'Bakery',
    subcategory: 'Cookies',
    tag: 'Crunchy',
    weight: '250 g',
    time: '20 MINS',
    discount: '15% OFF',
    price: 95,
    mrp: 110,
    image: 'https://picsum.photos/id/135/300/300',
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
    <Image source={{ uri: item.image }} style={styles.productImage} />
    <View style={styles.productDetails}>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.mrp}>₹{item.mrp}</Text>
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
        activeOpacity={0.8}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};



export const OrderScreen = () => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedSubcat, setSelectedSubcat] = useState('All');

  // Build subcategories dynamically
  const subcategories = useMemo(() => {
    if (selectedCat === 'All') {
      // collect all unique subcategories from all products
      const subs = products.map((p) => p.subcategory);
      return ['All', ...Array.from(new Set(subs))];
    } else {
      const subs = products
        .filter((p) => p.category === selectedCat)
        .map((p) => p.subcategory);
      return ['All', ...Array.from(new Set(subs))];
    }
  }, [selectedCat]);

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCat === 'All' || item.category === selectedCat;
    const matchesSubcategory =
      selectedSubcat === 'All' || item.subcategory === selectedSubcat;
    return matchesCategory && matchesSubcategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Categories (Left) */}
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              isSelected={item.category === selectedCat}
              onPress={() => {
                setSelectedCat(item.category);
                setSelectedSubcat('All');
              }}
            />
          )}
          keyExtractor={(item) => item.category}
          style={styles.categoryList}
          showsVerticalScrollIndicator={false}
        />

        {/* Products & Subcategories (Right) */}
        <View style={styles.productGrid}>
          {/* Subcategory Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subcategoryScroll}
            contentContainerStyle={styles.subcategoryContent}
          >
            {subcategories.map((sub) => (
              <SubcategoryChip
                key={sub}
                label={sub}
                isSelected={sub === selectedSubcat}
                onPress={() => setSelectedSubcat(sub)}
              />
            ))}
          </ScrollView>

          {/* Product Grid */}
          <FlatList
            key={1} // Add key to force re-render when numColumns changes
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item, index) => item.name + index}
            numColumns={1}
            contentContainerStyle={styles.contentContainerPadding}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>No products found</Text>
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 12,
  },
  productDetails: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  mrp: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },

  columnWrapper: { justifyContent: 'flex-start', gap: 12 },
  contentContainerPadding: { paddingHorizontal: 8, paddingBottom: 12 },
  emptyListText: { textAlign: 'center', marginTop: 50 },
  subcategoryScroll: { maxHeight: 48, marginVertical: 8 },
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
  chipTextSelected: { color: '#fff', fontWeight: '600' }
});
