import apiClient from '../apiClient';

export const supplierService = {
  getAll: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  update: async ({ id, data }) => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};
