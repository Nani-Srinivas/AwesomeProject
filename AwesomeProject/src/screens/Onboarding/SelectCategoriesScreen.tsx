import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { storeCatalogService } from '../../services/storeCatalogService';

interface SelectCategoriesScreenProps {
  navigation: any;
}

interface MasterCategory {
  _id: string;
  name: string;
  imageUrl?: string;
}

export const SelectCategoriesScreen = ({ navigation }: SelectCategoriesScreenProps) => {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterCategories();
  }, []);

  const fetchMasterCategories = async () => {
    try {
      setLoading(true);
      const data = await storeCatalogService.getMasterCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch master categories:', err);
      setError(err.message || 'Failed to load categories.');
      Alert.alert('Error', err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (selectedCategoryIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one category to proceed.');
      return;
    }
    navigation.navigate('SelectProducts', { selectedCategoryIds });
  };

  const renderCategoryItem = ({ item }: { item: MasterCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategoryIds.includes(item._id) && styles.selectedCategoryItem,
      ]}
      onPress={() => toggleCategorySelection(item._id)}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      {/* You can add an image here if imageUrl is available */}
      {/* {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />} */}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchMasterCategories} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Categories</Text>
        <Text style={styles.subtitle}>Choose the categories your store deals with.</Text>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item._id}
          numColumns={2} // Display in 2 columns
          contentContainerStyle={styles.categoryList}
        />

        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedCategoryIds.length === 0}
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
  categoryList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  categoryItem: {
    flex: 1,
    margin: 10,
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategoryItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary,
    borderWidth: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 5,
    textAlign: 'center',
  },
  // categoryImage: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   marginBottom: 10,
  // },
});
