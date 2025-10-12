
import {create} from 'zustand';
import {Category, Product} from '../types/catalog';
import {storeCatalogService} from '../services/storeCatalogService';

interface CatalogState {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
}

export const useCatalogStore = create<CatalogState>(set => ({
  categories: [],
  products: [],
  selectedCategory: 'All',
  loading: false,
  error: null,
  fetchCategories: async () => {
    set({loading: true, error: null});
    try {
      const fetchedCategories: Category[] = await storeCatalogService.getCategories();
      // Add 'All' category with dummy values for new required fields
      const allCategory: Category = {
        _id: 'All',
        name: 'All',
        imageUrl: 'https://picsum.photos/id/101/80/80',
        storeId: '', // Dummy value
        createdBy: '', // Dummy value
        createdByModel: '', // Dummy value
        isActive: true, // Dummy value
      };
      set({categories: [allCategory, ...fetchedCategories], loading: false});
    } catch (error) {
      set({error: 'Failed to fetch categories', loading: false});
    }
  },
  fetchProducts: async () => {
    set({loading: true, error: null});
    try {
      const fetchedProducts: Product[] = await storeCatalogService.getProducts();
      const productsWithCategory: Product[] = fetchedProducts.map(product => ({
        ...product,
        category: product.storeCategoryId.name, // Map storeCategoryId.name to category
        tag: 'Dummy Tag', // Dummy value
        weight: 'Dummy Weight', // Dummy value
        time: 'Dummy Time', // Dummy value
        discount: 'Dummy Discount', // Dummy value
        mrp: product.price + 10, // Dummy value based on price
      }));
      set({products: productsWithCategory, loading: false});
    } catch (error) {
      set({error: 'Failed to fetch products', loading: false});
    }
  },
  setSelectedCategory: category => set({selectedCategory: category}),
}));
