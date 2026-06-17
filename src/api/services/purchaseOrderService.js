import apiClient from '../apiClient';

export const purchaseOrderService = {
  getAll: async () => {
    const response = await apiClient.get('/purchase-orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/purchase-orders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/purchase-orders/${id}`, data);
    return response.data;
  },

  receive: async (id, data) => {
    // Expected to mark it received and potentially record stock batches
    const response = await apiClient.put(`/purchase-orders/${id}/receive`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/purchase-orders/${id}`);
    return response.data;
  }
};
