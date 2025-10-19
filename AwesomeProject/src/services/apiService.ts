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

};