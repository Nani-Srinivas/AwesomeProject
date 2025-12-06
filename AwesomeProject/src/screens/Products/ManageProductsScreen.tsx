import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { ProductCard } from '../../components/products/ProductCard';
import { Picker } from '@react-native-picker/picker';

type ManageProductsScreenProps = StackScreenProps<MainStackParamList, 'ManageProducts'>;

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    images?: string[];
    storeCategoryId?: {
        _id: string;
        name: string;
    };
    storeSubcategoryId?: {
        _id: string;
        name: string;
    };
    isAvailable?: boolean;
}

interface Category {
    _id: string;
    name: string;
}

interface Subcategory {
    _id: string;
    name: string;
    storeCategoryId: string;
}

export const ManageProductsScreen: React.FC<ManageProductsScreenProps> = ({ navigation }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Fetch subcategories when category changes
        if (selectedCategoryId) {
            fetchSubcategories(selectedCategoryId);
        } else {
            setSubcategories([]);
            setSelectedSubcategoryId('');
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        // Fetch products when filters change
        fetchProducts();
    }, [searchQuery, selectedCategoryId, selectedSubcategoryId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchProducts(),
            ]);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiService.getStoreCategories();
            if (response.data?.success && response.data?.data) {
                setCategories(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const response = await apiService.getStoreSubcategories(categoryId);
            if (response.data?.success && response.data?.data) {
                const filtered = response.data.data.filter(
                    (sub: Subcategory) => sub.storeCategoryId === categoryId
                );
                setSubcategories(filtered);
            }
        } catch (error: any) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const filters: any = {};
            if (searchQuery) filters.search = searchQuery;
            if (selectedCategoryId) filters.storeCategoryId = selectedCategoryId;
            if (selectedSubcategoryId) filters.storeSubcategoryId = selectedSubcategoryId;

            const response = await apiService.getStoreProducts(filters);
            if (response.data?.success && response.data?.data) {
                setProducts(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to load products');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    };

    const handleEdit = (productId: string) => {
        const product = products.find(p => p._id === productId);
        if (product) {
            navigation.navigate('AddEditProduct', { product });
        }
    };

    const handleDelete = async (productId: string) => {
        try {
            const response = await apiService.deleteStoreProduct(productId);
            if (response.data?.success) {
                Alert.alert('Success', 'Product deleted successfully');
                fetchProducts(); // Refresh list
            }
        } catch (error: any) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleAddProduct = () => {
        navigation.navigate('AddEditProduct', {});
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Manage Products</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Search and Filters */}
            <View style={styles.filtersContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray}
                />

                <View style={styles.pickerRow}>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedCategoryId}
                            onValueChange={(value) => setSelectedCategoryId(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Categories" value="" />
                            {categories.map((cat) => (
                                <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                            ))}
                        </Picker>
                    </View>

                    {selectedCategoryId && subcategories.length > 0 && (
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedSubcategoryId}
                                onValueChange={(value) => setSelectedSubcategoryId(value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="All Subcategories" value="" />
                                {subcategories.map((sub) => (
                                    <Picker.Item key={sub._id} label={sub.name} value={sub._id} />
                                ))}
                            </Picker>
                        </View>
                    )}
                </View>

                {(searchQuery || selectedCategoryId || selectedSubcategoryId) && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear Filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Product List */}
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery || selectedCategoryId
                                ? 'Try adjusting your filters'
                                : 'Add your first product to get started'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.gray,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    searchInput: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 8,
    },
    pickerWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: COLORS.background,
    },
    picker: {
        height: 50,
    },
    clearButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    clearButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
});
