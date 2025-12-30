
import { create } from 'zustand';
import { Category, Product } from '../types/catalog';
import { storeCatalogService } from '../services/storeCatalogService';

interface Subcategory {
  _id: string;
  name: string;
  storeCategoryId: string;
}

interface CatalogState {
  categories: Category[];
  brands: any[]; // Add brands
  subcategories: Subcategory[];
  products: Product[];
  selectedCategory: string;
  selectedBrand: string; // Add selectedBrand
  selectedSubcategory: string;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>; // Add fetchBrands
  fetchSubcategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brandId: string) => void; // Add setSelectedBrand
  setSelectedSubcategory: (subcategory: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  brands: [],
  subcategories: [],
  products: [],
  selectedCategory: 'All',
  selectedBrand: 'All', // Default to 'All'
  selectedSubcategory: 'All',
  loading: false,
  error: null,
  fetchCategories: async () => {
    set({ loading: true, error: null });
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
      set({ categories: [allCategory, ...fetchedCategories], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch categories', loading: false });
    }
  },
  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedBrands: any[] = await storeCatalogService.getBrands();
      // Add 'All' brand
      const allBrand: any = {
        _id: 'All',
        name: 'All',
        // Use a generic image or the first brand's image if available, or placeholder
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/8827/8827054.png',
      };
      set({ brands: [allBrand, ...fetchedBrands], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch brands', loading: false });
    }
  },
  fetchSubcategories: async () => {
    try {
      const fetchedSubcategories: Subcategory[] = await storeCatalogService.getSubcategories();
      set({ subcategories: fetchedSubcategories });
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  },
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedProducts: Product[] = await storeCatalogService.getProducts();
      const productsWithCategory: Product[] = fetchedProducts.map(product => ({
        ...product,
        category: product.storeCategoryId?.name || 'Uncategorized', // Safely access name
        tag: 'Fresh', // Dummy value
        weight: '1 kg', // Dummy value
        time: '15 MINS', // Dummy value
        discount: '10% OFF', // Dummy value
        price: product.sellingPrice, // Map sellingPrice to price for UI compatibility
        mrp: (product.sellingPrice || 0) + 10, // Dummy value based on sellingPrice
      }));
      set({ products: productsWithCategory, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch products', loading: false });
    }
  },
  setSelectedCategory: category => {
    set({ selectedCategory: category, selectedSubcategory: 'All' });
  },
  setSelectedBrand: brandId => {
    set({ selectedBrand: brandId, selectedCategory: 'All', selectedSubcategory: 'All' });
  },
  setSelectedSubcategory: subcategory => set({ selectedSubcategory: subcategory }),
  updateProduct: async (productId, updates) => {
    try {
      // Update backend
      await storeCatalogService.updateProduct(productId, updates);

      // Update local state on success
      set(state => ({
        products: state.products.map(p =>
          p._id === productId ? { ...p, ...updates } : p
        ),
      }));
    } catch (error) {
      console.error('Failed to update product:', error);
      set({ error: 'Failed to update product' });
    }
  },
}));
