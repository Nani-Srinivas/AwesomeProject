import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import CustomButton from '../../components/ui/CustomButton';

type SelectSubcategoryScreenProps = StackScreenProps<MainStackParamList, 'SelectSubcategory'>;

interface Subcategory {
    _id: string;
    name: string;
    categoryId: string;
}

export const SelectSubcategoryScreen = ({ navigation, route }: SelectSubcategoryScreenProps) => {
    const { selectedCategories } = route.params;
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubcategories();
    }, []);

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const response = await apiService.post('/store/onboarding/subcategories-by-categories', {
                categoryIds: selectedCategories,
            });

            const subcategoryData = response.data?.data || response.data;

            if (subcategoryData && Array.isArray(subcategoryData)) {
                setSubcategories(subcategoryData);
            } else {
                Alert.alert('Error', 'Failed to fetch subcategories.');
            }
        } catch (error: any) {
            console.error('Fetch subcategories error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'An error occurred while fetching subcategories.'
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleSubcategorySelection = (subcategoryId: string) => {
        setSelectedSubcategories((prevSelected) =>
            prevSelected.includes(subcategoryId)
                ? prevSelected.filter((id) => id !== subcategoryId)
                : [...prevSelected, subcategoryId]
        );
    };

    const handleNext = async () => {
        try {
            setLoading(true);
            // Save selected subcategories to backend
            await apiService.post('/store/onboarding/update-selected-subcategories', {
                subcategories: selectedSubcategories
            });

            // Navigate to SelectProduct with both categories and subcategories
            navigation.navigate('SelectProduct', {
                selectedCategories,
                selectedSubcategories
            });
        } catch (error: any) {
            console.error('Error saving subcategories:', error);
            Alert.alert('Error', 'Failed to save selection. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Loading Subcategories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Subcategories</Text>
            <Text style={styles.subtitle}>Select subcategories to filter products (Optional)</Text>

            <FlatList
                data={subcategories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.item,
                            selectedSubcategories.includes(item._id) && styles.selectedItem,
                        ]}
                        onPress={() => toggleSubcategorySelection(item._id)}
                    >
                        <Text
                            style={[
                                styles.itemText,
                                selectedSubcategories.includes(item._id) && styles.selectedItemText,
                            ]}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No subcategories found for selected categories.</Text>}
            />

            <CustomButton
                title="Next: Select Products"
                onPress={handleNext}
                disabled={false}
                loading={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.white,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.grey,
        marginBottom: 20,
        textAlign: 'center',
    },
    item: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    selectedItem: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    itemText: {
        fontSize: 18,
        color: COLORS.text,
    },
    selectedItemText: {
        color: COLORS.white,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: COLORS.grey,
        fontSize: 16,
    }
});
