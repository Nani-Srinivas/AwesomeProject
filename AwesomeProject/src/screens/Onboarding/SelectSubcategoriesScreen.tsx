import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';

interface SelectSubcategoriesScreenProps {
    navigation: any;
    route: any;
}

interface Subcategory {
    _id: string;
    name: string;
    categoryId: {
        _id: string;
        name: string;
    };
}

export const SelectSubcategoriesScreen = ({ navigation, route }: SelectSubcategoriesScreenProps) => {
    const { selectedBrandIds } = route.params;
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSubcategories();
    }, []);

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/admin/subcategories-by-brands?brandIds=${selectedBrandIds.join(',')}`);
            setSubcategories(response.data.data);
        } catch (err: any) {
            console.error('Failed to fetch subcategories:', err);
            setError(err.message || 'Failed to load subcategories.');
            Alert.alert('Error', err.message || 'Failed to load subcategories.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubcategorySelection = (subcategoryId: string) => {
        setSelectedSubcategoryIds(prev =>
            prev.includes(subcategoryId)
                ? prev.filter(id => id !== subcategoryId)
                : [...prev, subcategoryId]
        );
    };

    const handleNext = () => {
        if (selectedSubcategoryIds.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one subcategory to proceed.');
            return;
        }
        navigation.navigate('SelectProducts', { selectedBrandIds, selectedSubcategoryIds });
    };

    const renderSubcategoryItem = ({ item }: { item: Subcategory }) => (
        <TouchableOpacity
            style={[
                styles.subcategoryChip,
                selectedSubcategoryIds.includes(item._id) && styles.selectedSubcategoryChip,
            ]}
            onPress={() => toggleSubcategorySelection(item._id)}
        >
            <Text style={[
                styles.subcategoryName,
                selectedSubcategoryIds.includes(item._id) && styles.selectedSubcategoryName
            ]}>
                {item.name}
            </Text>
            <Text style={styles.categoryName}>({item.categoryId.name})</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading subcategories...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={fetchSubcategories} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Select Subcategories</Text>
                <Text style={styles.subtitle}>Choose product types from your selected brands</Text>

                {subcategories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No subcategories found for selected brands</Text>
                    </View>
                ) : (
                    <FlatList
                        data={subcategories}
                        renderItem={renderSubcategoryItem}
                        keyExtractor={item => item._id}
                        numColumns={2}
                        contentContainerStyle={styles.subcategoryList}
                    />
                )}

                <Button
                    title={`Next (${selectedSubcategoryIds.length} selected)`}
                    onPress={handleNext}
                    disabled={selectedSubcategoryIds.length === 0}
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
    subcategoryList: {
        flexGrow: 1,
    },
    subcategoryChip: {
        flex: 1,
        margin: 8,
        padding: 15,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.lightGray,
        minHeight: 80,
    },
    selectedSubcategoryChip: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    subcategoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    selectedSubcategoryName: {
        color: COLORS.white,
    },
    categoryName: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
    },
});
