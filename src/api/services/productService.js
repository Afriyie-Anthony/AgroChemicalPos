import apiClient from '../apiClient';

export const productService = {
  getAll: () => apiClient.get('/products').then((r) => r.data),
  getOne: (id) => apiClient.get(`/products/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/products', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/products/${id}`, data).then((r) => r.data),
  addBatch: (id, data) => apiClient.post(`/products/${id}/batches`, data).then((r) => r.data),
  adjustStock: (id, data) => apiClient.post(`/products/${id}/adjust-stock`, data).then((r) => r.data),
};
