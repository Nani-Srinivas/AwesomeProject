import { apiService } from './apiService';
import { Category, Product } from '../types/catalog';

interface Subcategory {
  _id: string;
  name: string;
  storeCategoryId: string;
}

const getCategories = async (): Promise<Category[]> => {
  const response = await apiService.get('/store/categories');
  return response.data.data;
};

const getSubcategories = async (): Promise<Subcategory[]> => {
  const response = await apiService.get('/store/subcategories');
  return response.data.data || [];
};

const getProducts = async (): Promise<Product[]> => {
  const response = await apiService.get('/store/products');
  return response.data.data;
};

const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product> => {
  const response = await apiService.updateStoreProduct(productId, updates);
  return response.data.data;
};

export const storeCatalogService = {
  getCategories,
  getSubcategories,
  getProducts,
  updateProduct,
};