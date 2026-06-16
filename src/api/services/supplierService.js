import apiClient from '../apiClient';

export const supplierService = {
  getAll: () => apiClient.get('/suppliers').then((r) => r.data),
  create: (data) => apiClient.post('/suppliers', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/suppliers/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/suppliers/${id}`).then((r) => r.data),
};
