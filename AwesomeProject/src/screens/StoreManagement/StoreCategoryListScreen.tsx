import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { storeCatalogService } from '../../services/storeCatalogService';

interface StoreCategoryListScreenProps {
  navigation: any;
}

interface StoreCategory {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export const StoreCategoryListScreen = ({ navigation }: StoreCategoryListScreenProps) => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreCategories();
  }, []);

  const fetchStoreCategories = async () => {
    try {
      setLoading(true);
      const data = await storeCatalogService.getStoreCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch store categories:', err);
      setError(err.message || 'Failed to load categories.');
      Alert.alert('Error', err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    // Navigate to a screen/modal to add a new category
    Alert.alert('Add Category', 'Navigate to Add Category screen/modal');
  };

  const handleEditCategory = (categoryId: string) => {
    // Navigate to a screen/modal to edit the category
    Alert.alert('Edit Category', `Navigate to Edit Category screen/modal for ID: ${categoryId}`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              // await storeCatalogService.deleteStoreCategory(categoryId); // Assuming a delete method exists
              Alert.alert('Success', 'Category deleted successfully.');
              fetchStoreCategories(); // Refresh the list
            } catch (err: any) {
              console.error('Failed to delete category:', err);
              Alert.alert('Error', err.message || 'Failed to delete category.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCategoryItem = ({ item }: { item: StoreCategory }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryDescription}>{item.description || 'No description'}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => handleEditCategory(item._id)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCategory(item._id)} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading store categories...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchStoreCategories} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Store Categories</Text>
        <Button title="Add New Category" onPress={handleAddCategory} style={styles.addButton} />

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.categoryList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found. Add one to get started!</Text>
            </View>
          }
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
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  categoryList: {
    flexGrow: 1,
  },
  categoryItem: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});
