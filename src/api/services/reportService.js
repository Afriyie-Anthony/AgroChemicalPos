import apiClient from '../apiClient';

export const reportService = {
  getSummary: () => apiClient.get('/reports/summary').then((r) => r.data),
  getSales: (params) => apiClient.get('/reports/sales', { params }).then((r) => r.data),
  getInventory: () => apiClient.get('/reports/inventory').then((r) => r.data),
  getExpenses: (params) => apiClient.get('/reports/expenses', { params }).then((r) => r.data),
  getProfitLoss: (params) => apiClient.get('/reports/profit-loss', { params }).then((r) => r.data),
  getAdjustments: (params) => apiClient.get('/reports/adjustments', { params }).then((r) => r.data),
};
