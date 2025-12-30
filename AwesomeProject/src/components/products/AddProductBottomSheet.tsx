import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';

interface AddProductBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

export const AddProductBottomSheet: React.FC<AddProductBottomSheetProps> = ({
    isVisible,
    onClose,
    onSuccess,
}) => {
    // Product fields - matching StoreProduct model
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive' | 'out_of_stock'>('active');
    const [isAvailable, setIsAvailable] = useState(true);

    // Category fields
    const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

    // Subcategory fields
    const [isCreatingNewSubcategory, setIsCreatingNewSubcategory] = useState(false);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isVisible) {
            fetchCategories();
            resetForm();
        }
    }, [isVisible]);

    useEffect(() => {
        if (selectedCategoryId && !isCreatingNewCategory) {
            fetchSubcategories(selectedCategoryId);
        } else {
            setSubcategories([]);
            setSelectedSubcategoryId('');
        }
    }, [selectedCategoryId, isCreatingNewCategory]);

    const resetForm = () => {
        setProductName('');
        setDescription('');
        setCostPrice('');
        setSellingPrice('');
        setStock('');
        setStatus('active');
        setIsAvailable(true);
        setIsCreatingNewCategory(false);
        setNewCategoryName('');
        setSelectedCategoryId('');
        setIsCreatingNewSubcategory(false);
        setNewSubcategoryName('');
        setSelectedSubcategoryId('');
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await apiService.getStoreCategories();
            if (response.data?.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const response = await apiService.getStoreSubcategories(categoryId);
            if (response.data?.success) {
                const filtered = response.data.data.filter(
                    (sub: Subcategory) => sub.storeCategoryId === categoryId
                );
                setSubcategories(filtered);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const validateForm = (): boolean => {
        if (!productName.trim()) {
            Alert.alert('Validation Error', 'Product name is required');
            return false;
        }
        if (!costPrice || parseFloat(costPrice) <= 0) {
            Alert.alert('Validation Error', 'Cost price must be greater than 0');
            return false;
        }
        if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
            Alert.alert('Validation Error', 'Selling price must be greater than 0');
            return false;
        }
        if (parseFloat(sellingPrice) < parseFloat(costPrice)) {
            Alert.alert('Validation Error', 'Selling price should be greater than or equal to cost price');
            return false;
        }
        if (isCreatingNewCategory) {
            if (!newCategoryName.trim()) {
                Alert.alert('Validation Error', 'New brand name is required');
                return false;
            }
        } else {
            if (!selectedCategoryId) {
                Alert.alert('Validation Error', 'Please select a brand');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        let createdCategoryId: string | null = null;
        let createdSubcategoryId: string | null = null;
        let shouldCleanup = false;

        try {
            let categoryId = selectedCategoryId;
            let subcategoryId = selectedSubcategoryId;

            // Step 1: Create new category if needed
            if (isCreatingNewCategory) {
                const categoryResponse = await apiService.post('/store/categories', {
                    name: newCategoryName.trim(),
                });
                if (categoryResponse.data?.success) {
                    categoryId = categoryResponse.data.data._id;
                    createdCategoryId = categoryId;
                    shouldCleanup = true; // Mark for cleanup if product fails
                }
            }

            // Step 2: Create new subcategory if needed
            if (isCreatingNewSubcategory && newSubcategoryName.trim()) {
                const subcategoryResponse = await apiService.post('/store/subcategories', {
                    name: newSubcategoryName.trim(),
                    storeCategoryId: categoryId,
                });
                if (subcategoryResponse.data?.success) {
                    subcategoryId = subcategoryResponse.data.data._id;
                    createdSubcategoryId = subcategoryId;
                    shouldCleanup = true; // Mark for cleanup if product fails
                }
            }

            // Step 3: Create product with correct field names
            const productData = {
                name: productName.trim(),
                description: description.trim() || undefined,
                costPrice: parseFloat(costPrice),
                sellingPrice: parseFloat(sellingPrice),
                stock: stock ? parseInt(stock, 10) : 0,
                status,
                isAvailable,
                storeCategoryId: categoryId,
                storeSubcategoryId: subcategoryId || undefined,
            };

            const productResponse = await apiService.createStoreProduct(productData);

            if (productResponse.data?.success) {
                Alert.alert('Success', 'Product created successfully!');
                shouldCleanup = false; // Success! Don't cleanup
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating product:', error);

            // Rollback: Clean up orphaned records
            if (shouldCleanup) {
                try {
                    if (createdSubcategoryId) {
                        await apiService.delete(`/store/subcategories/${createdSubcategoryId}`);
                        console.log('Cleaned up orphaned subcategory');
                    }
                    if (createdCategoryId) {
                        await apiService.delete(`/store/categories/${createdCategoryId}`);
                        console.log('Cleaned up orphaned category');
                    }
                    Alert.alert(
                        'Error',
                        'Product creation failed. Newly created category/subcategory have been removed.\n\n' +
                        (error.response?.data?.message || 'Failed to create product')
                    );
                } catch (cleanupError) {
                    console.error('Error during cleanup:', cleanupError);
                    Alert.alert(
                        'Error',
                        'Product creation failed and cleanup also failed. Please contact support.\n\n' +
                        (error.response?.data?.message || 'Failed to create product')
                    );
                }
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to create product');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.bottomSheet}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Product</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Product Information */}
                        <Text style={styles.sectionTitle}>Product Information</Text>

                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={productName}
                            onChangeText={setProductName}
                            placeholder="Enter product name"
                            placeholderTextColor={COLORS.gray}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter description (optional)"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Cost Price (₹) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={costPrice}
                                    onChangeText={setCostPrice}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={COLORS.gray}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Selling Price (₹) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={sellingPrice}
                                    onChangeText={setSellingPrice}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={COLORS.gray}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Stock</Text>
                                <TextInput
                                    style={styles.input}
                                    value={stock}
                                    onChangeText={setStock}
                                    placeholder="0"
                                    keyboardType="number-pad"
                                    placeholderTextColor={COLORS.gray}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Status</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={status}
                                        onValueChange={(value) => setStatus(value as any)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Active" value="active" />
                                        <Picker.Item label="Inactive" value="inactive" />
                                        <Picker.Item label="Out of Stock" value="out_of_stock" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Product Available</Text>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>

                        {/* Brand Section (Previously Category) */}
                        <Text style={styles.sectionTitle}>Brand</Text>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Create new brand</Text>
                            <Switch
                                value={isCreatingNewCategory}
                                onValueChange={setIsCreatingNewCategory}
                                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>

                        {isCreatingNewCategory ? (
                            <>
                                <Text style={styles.label}>New Brand Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    placeholder="Enter brand name (e.g., Amul, Nestle)"
                                    placeholderTextColor={COLORS.gray}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Select Brand *</Text>
                                <View style={styles.pickerWrapper}>
                                    {loading ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <Picker
                                            selectedValue={selectedCategoryId}
                                            onValueChange={setSelectedCategoryId}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select a brand" value="" />
                                            {categories.map((cat) => (
                                                <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                                            ))}
                                        </Picker>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Subcategory Section */}
                        {(selectedCategoryId || isCreatingNewCategory) && (
                            <>
                                <Text style={styles.sectionTitle}>Subcategory (Optional)</Text>

                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Create new subcategory</Text>
                                    <Switch
                                        value={isCreatingNewSubcategory}
                                        onValueChange={setIsCreatingNewSubcategory}
                                        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                                        thumbColor={COLORS.white}
                                    />
                                </View>

                                {isCreatingNewSubcategory ? (
                                    <>
                                        <Text style={styles.label}>New Subcategory Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={newSubcategoryName}
                                            onChangeText={setNewSubcategoryName}
                                            placeholder="Enter subcategory name"
                                            placeholderTextColor={COLORS.gray}
                                        />
                                    </>
                                ) : subcategories.length > 0 ? (
                                    <>
                                        <Text style={styles.label}>Select Subcategory</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={selectedSubcategoryId}
                                                onValueChange={setSelectedSubcategoryId}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="No subcategory" value="" />
                                                {subcategories.map((sub) => (
                                                    <Picker.Item key={sub._id} label={sub.name} value={sub._id} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </>
                                ) : null}
                            </>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Product</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.gray,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleLabel: {
        fontSize: 14,
        color: COLORS.text,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: COLORS.white,
    },
    picker: {
        height: 50,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
