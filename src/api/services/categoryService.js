import apiClient from '../apiClient';

export const categoryService = {
  getAll: () => apiClient.get('/categories').then((r) => r.data),
  create: (data) => apiClient.post('/categories', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
