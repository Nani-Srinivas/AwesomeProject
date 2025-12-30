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

const importCatalog = async (brandIds: string[], productIds: string[]): Promise<void> => {
  await apiService.post('/store/import-catalog', {
    brandIds,
    productIds,
  });
};

const getBrands = async (): Promise<any[]> => {
  const response = await apiService.get('/product/store-brands');
  return response.data.data;
};

export const storeCatalogService = {
  getCategories,
  getSubcategories,
  getBrands,
  getProducts,
  updateProduct,
  importCatalog,
};