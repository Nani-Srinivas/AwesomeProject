import {apiService} from './apiService';
import {Category, Product} from '../types/catalog';

const getCategories = async (): Promise<Category[]> => {
  const response = await apiService.get('/store/categories');
  return response.data.data;
};

const getProducts = async (): Promise<Product[]> => {
  const response = await apiService.get('/store/products');
  return response.data.data;
};

export const storeCatalogService = {
  getCategories,
  getProducts,
};