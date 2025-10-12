import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useUserStore } from '../../store/userStore';

type SelectCategoryScreenProps = StackScreenProps<MainStackParamList, 'SelectCategory'>;

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
}

export const SelectCategoryScreen = ({ navigation }: SelectCategoryScreenProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/store/onboarding/master-categories');
      console.log('API raw response:', JSON.stringify(response, null, 2));

      // 👇 Adjust depending on apiService response format
      const categoryData = response.data?.data || response.data;

      if (categoryData && Array.isArray(categoryData)) {
        setCategories(categoryData);
        console.log('Categories set in state:', categoryData.length);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch categories.');
      }
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while fetching categories.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  const { user, setUser } = useUserStore();

  const handleNext = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one category.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.post('/store/onboarding/update-categories-selection', {
        categories: selectedCategories,
      });
      console.log('API response for update-categories-selection:', JSON.stringify(response, null, 2));

      if (response.data.success) {
        if (user && response.data?.storeManager) {
          setUser({ ...user, hasSelectedCategories: true, selectedCategoryIds: response.data.storeManager.selectedCategoryIds });
        }
        navigation.navigate('SelectProduct', { selectedCategories });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update category selection.');
      }
    } catch (error: any) {
      console.error('Update category selection error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while updating category selection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading Categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategories.includes(item._id) && styles.selectedCategoryItem,
            ]}
            onPress={() => toggleCategorySelection(item._id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.categoryImage}
                />
              ) : null}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategories.includes(item._id) && styles.selectedCategoryText,
                ]}
              >
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Next: Select Products"
        onPress={handleNext}
        disabled={submitting || selectedCategories.length === 0}
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
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.text,
  },
  categoryItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 18,
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 6,
  },
});
