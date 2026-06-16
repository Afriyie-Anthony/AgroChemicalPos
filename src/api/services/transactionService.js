import apiClient from '../apiClient';

export const transactionService = {
  getAll: (params) => apiClient.get('/transactions', { params }).then((r) => r.data),
  checkout: (data) => apiClient.post('/transactions', data).then((r) => r.data),
  voidTransaction: (id, data) => apiClient.put(`/transactions/${id}/void`, data).then((r) => r.data),
};
