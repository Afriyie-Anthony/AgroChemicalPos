import apiClient from '../apiClient';

export const expenseService = {
  getAll: (params) => apiClient.get('/expenses', { params }).then((r) => r.data),
  create: (data) => apiClient.post('/expenses', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/expenses/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/expenses/${id}`).then((r) => r.data),
};
