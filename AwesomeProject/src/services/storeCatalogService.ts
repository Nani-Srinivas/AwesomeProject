import { apiService } from './apiService';

export const storeCatalogService = {
  /**
   * Fetches all master categories for store onboarding.
   * @returns A Promise that resolves with the master categories data.
   */
  getMasterCategories: async () => {
    return apiService.get('/store/onboarding/master-categories');
  },

  /**
   * Fetches master products and their associated subcategories for selected master categories.
   * @param categoryIds An array of master category IDs.
   * @returns A Promise that resolves with the master products and subcategories data.
   */
  getMasterProductsByCategories: async (categoryIds: string[]) => {
    const params = { categoryIds: categoryIds.join(',') };
    return apiService.get('/store/onboarding/master-products-by-categories', params);
  },

  /**
   * Imports selected master categories and products into the store's catalog.
   * @param selectedMasterCategoryIds An array of selected master category IDs.
   * @param selectedMasterProductIds An array of selected master product IDs.
   * @returns A Promise that resolves with the import catalog response.
   */
  importCatalog: async (selectedMasterCategoryIds: string[], selectedMasterProductIds: string[]) => {
    const data = { selectedMasterCategoryIds, selectedMasterProductIds };
    return apiService.post('/store/onboarding/import-catalog', data);
  },

  /**
   * Fetches all store categories for the current store.
   * @returns A Promise that resolves with the store categories data.
   */
  getStoreCategories: async () => {
    return apiService.get('/store/categories');
  },

  /**
   * Creates a new store category.
   * @param categoryData The data for the new store category.
   * @returns A Promise that resolves with the created store category data.
   */
  createStoreCategory: async (categoryData: any) => {
    return apiService.post('/store/categories', categoryData);
  },

  /**
   * Updates an existing store category.
   * @param categoryId The ID of the store category to update.
   * @param categoryData The updated data for the store category.
   * @returns A Promise that resolves with the updated store category data.
   */
  updateStoreCategory: async (categoryId: string, categoryData: any) => {
    return apiService.put(`/store/categories/${categoryId}`, categoryData);
  },

  /**
   * Fetches all store products for the current store.
   * @returns A Promise that resolves with the store products data.
   */
  getStoreProducts: async () => {
    return apiService.get('/store/products');
  },

  /**
   * Creates a new store product.
   * @param productData The data for the new store product.
   * @returns A Promise that resolves with the created store product data.
   */
  createStoreProduct: async (productData: any) => {
    return apiService.post('/store/products', productData);
  },

  /**
   * Updates an existing store product.
   * @param productId The ID of the store product to update.
   * @param productData The updated data for the store product.
   * @returns A Promise that resolves with the updated store product data.
   */
  updateStoreProduct: async (productId: string, productData: any) => {
    return apiService.put(`/store/products/${productId}`, productData);
  },

  /**
   * Deletes a store product.
   * @param productId The ID of the store product to delete.
   * @returns A Promise that resolves when the product is deleted.
   */
  deleteStoreProduct: async (productId: string) => {
    return apiService.delete(`/store/products/${productId}`);
  },
};
