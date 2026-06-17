import apiClient from '../apiClient';

export const productService = {
  getAll: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  addBatch: async (id, data) => {
    const response = await apiClient.post(`/products/${id}/batches`, data);
    return response.data;
  },

  adjustStock: async (id, data) => {
    const response = await apiClient.post(`/products/${id}/adjust-stock`, data);
    return response.data;
  }
};
