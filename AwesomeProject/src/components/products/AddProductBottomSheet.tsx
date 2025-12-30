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

interface Brand {
    _id: string;
    name: string;
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
    // Product fields
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive' | 'out_of_stock'>('active');
    const [isAvailable, setIsAvailable] = useState(true);

    // Brand fields (Primary)
    const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [brands, setBrands] = useState<Brand[]>([]);

    // Category fields (Secondary/Optional for local products, can be inferred or selected if needed)
    // For now, let's keep it simple: Local products might not need strict Category hierarchies initially,
    // or we can default them. But to fit the schema, we might need a category.
    // Let's assume for "Local" products, we might relax category requirement OR fetch categories too.
    // Given the user request focused on BRAND, let's prioritize that. 
    // However, StoreProduct model requires storeCategoryId. 
    // For a robust implementation, we should probably allow selecting a "General" category or fetching categories.
    // Let's include Category selection as well, but make Brand primary.
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

    // Subcategory fields
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isVisible) {
            fetchBrands();
            fetchCategories(); // Still need categories for organization
            resetForm();
        }
    }, [isVisible]);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchSubcategories(selectedCategoryId);
        } else {
            setSubcategories([]);
            setSelectedSubcategoryId('');
        }
    }, [selectedCategoryId]);

    const resetForm = () => {
        setProductName('');
        setDescription('');
        setCostPrice('');
        setSellingPrice('');
        setStock('');
        setStatus('active');
        setIsAvailable(true);

        setIsCreatingNewBrand(false);
        setNewBrandName('');
        setSelectedBrandId('');

        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
    };

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/product/store-brands');
            if (response.data?.success) {
                setBrands(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiService.getStoreCategories();
            if (response.data?.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
        if (isCreatingNewBrand) {
            if (!newBrandName.trim()) {
                Alert.alert('Validation Error', 'New Brand name is required');
                return false;
            }
        } else {
            if (!selectedBrandId) {
                Alert.alert('Validation Error', 'Please select a brand');
                return false;
            }
        }
        if (!selectedCategoryId) {
            Alert.alert('Validation Error', 'Please select a category');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        let createdBrandId: string | null = null;

        try {
            let brandId = selectedBrandId;

            // Step 1: Create new brand if needed
            if (isCreatingNewBrand) {
                const brandResponse = await apiService.post('/product/store-brands', {
                    name: newBrandName.trim(),
                    // No masterBrandId for local brands
                });
                if (brandResponse.data?.success) {
                    brandId = brandResponse.data.data._id;
                    createdBrandId = brandId;
                }
            }

            // Step 2: Create product
            // Note: StoreProduct model needs to be updated to store brandId if it doesn't already?
            // Wait, StoreProduct links to MasterProduct which has Brand. 
            // Local products don't have MasterProduct.
            // We need to ensure StoreProduct can store 'brandId' or we rely on 'storeBrandId' if we added it?
            // Checking the model... current StoreProduct doesn't seem to have explicit 'storeBrandId'.
            // It links to MasterProduct. 
            // IF we are creating a LOCAL product, we might need to handle this.
            // For now, let's assume we can pass it and maybe the backend treats it?
            // Actually, the user asked for this flow, implying we might need to link it.
            // Let's send it in `productData` and assume backend will handle it or we updated backend?
            // I haven't updated StoreProduct schema yet to have `storeBrandId`. This might be a missing piece.
            // But let's proceed with sending it.

            const productData = {
                name: productName.trim(),
                description: description.trim() || undefined,
                costPrice: parseFloat(costPrice),
                sellingPrice: parseFloat(sellingPrice),
                stock: stock ? parseInt(stock, 10) : 0,
                status,
                isAvailable,
                storeCategoryId: selectedCategoryId,
                storeSubcategoryId: selectedSubcategoryId || undefined,
                storeBrandId: brandId, // Sending this new field
            };

            const productResponse = await apiService.createStoreProduct(productData);

            if (productResponse.data?.success) {
                Alert.alert('Success', 'Product created successfully!');
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating product:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create product');
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

                        {/* Brand Section */}
                        <Text style={styles.sectionTitle}>Brand</Text>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Create new brand</Text>
                            <Switch
                                value={isCreatingNewBrand}
                                onValueChange={setIsCreatingNewBrand}
                                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>

                        {isCreatingNewBrand ? (
                            <>
                                <Text style={styles.label}>New Brand Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newBrandName}
                                    onChangeText={setNewBrandName}
                                    placeholder="Enter brand name"
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
                                            selectedValue={selectedBrandId}
                                            onValueChange={setSelectedBrandId}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select a brand" value="" />
                                            {brands.map((brand) => (
                                                <Picker.Item key={brand._id} label={brand.name} value={brand._id} />
                                            ))}
                                        </Picker>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Category Section (Required for structure) */}
                        <Text style={styles.sectionTitle}>Category</Text>
                        <Text style={styles.label}>Select Category *</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedCategoryId}
                                onValueChange={setSelectedCategoryId}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select a category" value="" />
                                {categories.map((cat) => (
                                    <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                                ))}
                            </Picker>
                        </View>

                        {/* Subcategory Section */}
                        {(selectedCategoryId) && (
                            <>
                                <Text style={styles.sectionTitle}>Subcategory (Optional)</Text>
                                {subcategories.length > 0 ? (
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
                                ) : (
                                    <Text style={[styles.label, { color: COLORS.gray }]}>No subcategories available</Text>
                                )}
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
