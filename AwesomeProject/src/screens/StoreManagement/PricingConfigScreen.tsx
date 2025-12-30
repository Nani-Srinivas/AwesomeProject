import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import CustomButton from '../../components/ui/CustomButton';
import { reset } from '../../navigation/NavigationRef';

type PricingConfigScreenProps = StackScreenProps<MainStackParamList, 'PricingConfig'>;

interface PricingItem {
    productId: string;
    categoryId: string;
    name: string;
    basePrice: number;
    costPrice: string;
    sellingPrice: string;
}

export const PricingConfigScreen = ({ route, navigation }: PricingConfigScreenProps) => {
    const { selectedBrandIds, selectedSubcategoryIds, selectedProductIds } = route.params;

    const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProductDetails();
    }, []);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            // Fetch full product details for the selected product IDs
            const response = await apiService.get(
                `/admin/master-products?brandIds=${selectedBrandIds.join(',')}&subcategoryIds=${selectedSubcategoryIds.join(',')}`
            );

            // Filter to only selected products and map to pricing items
            const allProducts = response.data.data;
            const selectedProducts = allProducts.filter((p: any) => selectedProductIds.includes(p._id));

            const items = selectedProducts.map((p: any) => ({
                productId: p._id,
                categoryId: p.category?._id || p.category, // Handle populated or ID
                name: p.name,
                basePrice: p.basePrice || 0,
                costPrice: '', // User must enter
                sellingPrice: (p.basePrice || 0).toString(), // Default to base price
            }));

            setPricingItems(items);
        } catch (error: any) {
            console.error('Failed to fetch product details:', error);
            Alert.alert('Error', 'Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    const updatePrice = (index: number, field: 'costPrice' | 'sellingPrice', value: string) => {
        const newItems = [...pricingItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPricingItems(newItems);
    };

    const handleSubmit = async () => {
        // Validate inputs
        const invalidItems = pricingItems.filter(item =>
            !item.costPrice || isNaN(parseFloat(item.costPrice)) ||
            !item.sellingPrice || isNaN(parseFloat(item.sellingPrice))
        );

        if (invalidItems.length > 0) {
            Alert.alert('Validation Error', 'Please enter valid cost and selling prices for all products.');
            return;
        }

        setSubmitting(true);
        try {
            const productsWithPricing = pricingItems.map(item => ({
                masterProductId: item.productId,
                costPrice: parseFloat(item.costPrice),
                sellingPrice: parseFloat(item.sellingPrice),
            }));

            // Extract unique category IDs from the selected products
            const uniqueCategoryIds = [...new Set(pricingItems.map(item => item.categoryId))];

            const payload = {
                selectedMasterCategoryIds: uniqueCategoryIds,
                selectedBrandIds, // Pass explicitly selected brands
                productsWithPricing,
            };

            console.log('Submitting to /import-catalog with payload:', payload);

            const response = await apiService.post('/store/onboarding/import-catalog', payload);

            if (response.data && response.data.success) {
                Alert.alert('Success', 'Store catalog created successfully!', [
                    { text: 'OK', onPress: () => reset('Home') }
                ]);
            } else {
                Alert.alert('Error', response.data?.message || 'Failed to import catalog.');
            }
        } catch (error: any) {
            console.error('Import catalog error:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred during catalog import.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Text style={styles.title}>Configure Pricing</Text>
            <Text style={styles.subtitle}>Set your cost price and selling price for each product.</Text>

            <FlatList
                data={pricingItems}
                keyExtractor={(item) => item.productId}
                renderItem={({ item, index }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Cost Price (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={item.costPrice}
                                    onChangeText={(text) => updatePrice(index, 'costPrice', text)}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Selling Price (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={item.sellingPrice}
                                    onChangeText={(text) => updatePrice(index, 'sellingPrice', text)}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                />
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <CustomButton
                    title="Finish Setup"
                    onPress={handleSubmit}
                    disabled={submitting}
                    loading={submitting}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
        textAlign: 'center',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.grey,
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    itemContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: COLORS.text,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 12,
        color: COLORS.grey,
        marginBottom: 5,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
});
