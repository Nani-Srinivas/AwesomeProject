import axiosInstance from '../api/axiosInstance';

export const apiService = {
  /**
   * Performs a GET request to the specified URL.
   * @param url The API endpoint URL.
   * @param params Optional: Query parameters for the request.
   * @param signal Optional: AbortSignal to cancel the request.
   * @returns A Promise that resolves with the response data.
   */
  get: async (url: string, params?: object, signal?: AbortSignal) => {
    const response = await axiosInstance.get(url, { params, signal });
    return response;
  },
  post: async (url: string, data: object, signal?: AbortSignal) => {
    const response = await axiosInstance.post(url, data, { signal });
    return response;
  },
  put: async (url: string, data: object, signal?: AbortSignal) => {
    const response = await axiosInstance.put(url, data, { signal });
    return response;
  },
  patch: async (url: string, data: object, signal?: AbortSignal) => {
    const response = await axiosInstance.patch(url, data, { signal });
    return response;
  },
  delete: async (url: string, params?: object, signal?: AbortSignal) => {
    const response = await axiosInstance.delete(url, { params, signal });
    return response;
  },
  postWithConfig: async (url: string, data: object, config?: object) => {
    const response = await axiosInstance.post(url, data, config);
    return response;
  },

  // ===== Product Management APIs =====

  /**
   * Get all store products with optional filters
   */
  getStoreProducts: async (filters?: { search?: string; storeCategoryId?: string; storeSubcategoryId?: string }) => {
    const response = await axiosInstance.get('/store/products', { params: filters });
    return response;
  },

  /**
   * Create a new store product
   */
  createStoreProduct: async (productData: {
    name: string;
    description?: string;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    status?: 'active' | 'inactive' | 'out_of_stock';
    isAvailable?: boolean;
    storeCategoryId: string;
    storeSubcategoryId?: string;
    images?: string[];
    masterProductId?: string;
  }) => {
    const response = await axiosInstance.post('/store/products', productData);
    return response;
  },

  /**
   * Update an existing store product
   */
  updateStoreProduct: async (productId: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    storeCategoryId?: string;
    storeSubcategoryId?: string;
    images?: string[];
    isAvailable?: boolean;
  }) => {
    const response = await axiosInstance.put(`/store/products/${productId}`, productData);
    return response;
  },

  /**
   * Delete a store product
   */
  deleteStoreProduct: async (productId: string) => {
    const response = await axiosInstance.delete(`/store/products/${productId}`);
    return response;
  },

  /**
   * Get all store categories
   */
  getStoreCategories: async () => {
    const response = await axiosInstance.get('/store/categories');
    return response;
  },

  /**
   * Get all store subcategories (optionally filtered by category)
   */
  getStoreSubcategories: async (categoryId?: string) => {
    const params = categoryId ? { storeCategoryId: categoryId } : {};
    const response = await axiosInstance.get('/store/subcategories', { params });
    return response;
  },

};