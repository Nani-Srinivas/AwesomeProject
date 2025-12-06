import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';

type AddEditProductScreenProps = StackScreenProps<MainStackParamList, 'AddEditProduct'>;

interface Category {
    _id: string;
    name: string;
}

interface Subcategory {
    _id: string;
    name: string;
    storeCategoryId: string;
}

export const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({ navigation, route }) => {
    const { product } = route.params || {};
    const isEditMode = !!product;

    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [stock, setStock] = useState(product?.stock?.toString() || '');
    const [categoryId, setCategoryId] = useState(
        typeof product?.storeCategoryId === 'object'
            ? product?.storeCategoryId?._id || ''
            : product?.storeCategoryId || ''
    );
    const [subcategoryId, setSubcategoryId] = useState(
        typeof product?.storeSubcategoryId === 'object'
            ? product?.storeSubcategoryId?._id || ''
            : product?.storeSubcategoryId || ''
    );

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categoryId) {
            fetchSubcategories(categoryId);
        } else {
            setSubcategories([]);
            setSubcategoryId('');
        }
    }, [categoryId]);

    const fetchCategories = async () => {
        try {
            const response = await apiService.getStoreCategories();
            if (response.data?.success && response.data?.data) {
                setCategories(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async (catId: string) => {
        try {
            const response = await apiService.getStoreSubcategories(catId);
            if (response.data?.success && response.data?.data) {
                const filtered = response.data.data.filter(
                    (sub: Subcategory) => sub.storeCategoryId === catId
                );
                setSubcategories(filtered);
            }
        } catch (error: any) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const validateForm = (): boolean => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Product name is required');
            return false;
        }
        if (name.trim().length < 3) {
            Alert.alert('Validation Error', 'Product name must be at least 3 characters');
            return false;
        }
        if (!price || parseFloat(price) <= 0) {
            Alert.alert('Validation Error', 'Price must be greater than 0');
            return false;
        }
        if (stock && parseFloat(stock) < 0) {
            Alert.alert('Validation Error', 'Stock cannot be negative');
            return false;
        }
        if (!categoryId) {
            Alert.alert('Validation Error', 'Please select a category');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const productData = {
                name: name.trim(),
                description: description.trim() || undefined,
                price: parseFloat(price),
                stock: stock ? parseInt(stock, 10) : 0,
                storeCategoryId: categoryId,
                storeSubcategoryId: subcategoryId || undefined,
            };

            let response;
            if (isEditMode && product?._id) {
                response = await apiService.updateStoreProduct(product._id, productData);
            } else {
                response = await apiService.createStoreProduct(productData);
            }

            if (response.data?.success) {
                Alert.alert(
                    'Success',
                    `Product ${isEditMode ? 'updated' : 'created'} successfully`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Error saving product:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>{isEditMode ? 'Edit Product' : 'Add New Product'}</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Product Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter product name"
                    placeholderTextColor={COLORS.gray}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter product description (optional)"
                    placeholderTextColor={COLORS.gray}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, styles.half]}>
                    <Text style={styles.label}>
                        Price (₹) <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={price}
                        onChangeText={setPrice}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={[styles.formGroup, styles.half]}>
                    <Text style={styles.label}>
                        Stock <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={stock}
                        onChangeText={setStock}
                        placeholder="0"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Category <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={categoryId}
                        onValueChange={(value) => setCategoryId(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a category" value="" />
                        {categories.map((cat) => (
                            <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                        ))}
                    </Picker>
                </View>
            </View>

            {categoryId && subcategories.length > 0 && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Subcategory (Optional)</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={subcategoryId}
                            onValueChange={(value) => setSubcategoryId(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="No subcategory" value="" />
                            {subcategories.map((sub) => (
                                <Picker.Item key={sub._id} label={sub.name} value={sub._id} />
                            ))}
                        </Picker>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.submitButtonText}>
                        {isEditMode ? 'Update Product' : 'Add Product'}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={submitting}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    half: {
        flex: 1,
    },
    pickerWrapper: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    cancelButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
