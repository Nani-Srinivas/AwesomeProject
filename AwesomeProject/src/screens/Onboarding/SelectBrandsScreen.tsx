import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';

interface SelectBrandsScreenProps {
    navigation: any;
}

interface Brand {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
}

export const SelectBrandsScreen = ({ navigation }: SelectBrandsScreenProps) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/admin/brands');
            setBrands(response.data.data);
        } catch (err: any) {
            console.error('Failed to fetch brands:', err);
            setError(err.message || 'Failed to load brands.');
            Alert.alert('Error', err.message || 'Failed to load brands.');
        } finally {
            setLoading(false);
        }
    };

    const toggleBrandSelection = (brandId: string) => {
        setSelectedBrandIds(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
    };

    const handleNext = () => {
        if (selectedBrandIds.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one brand to proceed.');
            return;
        }
        navigation.navigate('SelectSubcategories', { selectedBrandIds });
    };

    const renderBrandItem = ({ item }: { item: Brand }) => (
        <TouchableOpacity
            style={[
                styles.brandItem,
                selectedBrandIds.includes(item._id) && styles.selectedBrandItem,
            ]}
            onPress={() => toggleBrandSelection(item._id)}
        >
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.brandImage} />
            ) : (
                <View style={styles.brandImagePlaceholder}>
                    <Text style={styles.brandImagePlaceholderText}>{item.name.charAt(0)}</Text>
                </View>
            )}
            <Text style={styles.brandName}>{item.name}</Text>
            {item.description && <Text style={styles.brandDescription} numberOfLines={2}>{item.description}</Text>}
            {selectedBrandIds.includes(item._id) && (
                <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading brands...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={fetchBrands} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Select Brands</Text>
                <Text style={styles.subtitle}>Choose the brands your store will carry</Text>

                <FlatList
                    data={brands}
                    renderItem={renderBrandItem}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.brandList}
                />

                <Button
                    title={`Next (${selectedBrandIds.length} selected)`}
                    onPress={handleNext}
                    disabled={selectedBrandIds.length === 0}
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
    brandList: {
        flexGrow: 1,
    },
    brandItem: {
        flex: 1,
        margin: 10,
        padding: 15,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.lightGray,
        minHeight: 150,
        position: 'relative',
    },
    selectedBrandItem: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.lightPrimary,
    },
    brandImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    brandImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    brandImagePlaceholderText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    brandName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 5,
    },
    brandDescription: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: 5,
    },
    checkmark: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
