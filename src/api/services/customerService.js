import apiClient from '../apiClient';

export const customerService = {
  getAll: () => apiClient.get('/customers').then((r) => r.data),
  create: (data) => apiClient.post('/customers', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data).then((r) => r.data),
  adjustCredit: (id, data) => apiClient.put(`/customers/${id}/credit`, data).then((r) => r.data),
  recordRepayment: (id, data) => apiClient.post(`/customers/${id}/repayment`, data).then((r) => r.data),
};
