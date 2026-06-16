import apiClient from '../apiClient';

export const purchaseOrderService = {
  getAll: () => apiClient.get('/purchase-orders').then((r) => r.data),
  create: (data) => apiClient.post('/purchase-orders', data).then((r) => r.data),
  receive: (id, data) => apiClient.put(`/purchase-orders/${id}/receive`, data).then((r) => r.data),
};
