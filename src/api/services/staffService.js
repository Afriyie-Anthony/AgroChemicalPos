import apiClient from '../apiClient';

export const staffService = {
  getAll: () => apiClient.get('/staff').then((r) => r.data),
  create: (data) => apiClient.post('/staff', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/staff/${id}`, data).then((r) => r.data),
  deactivate: (id) => apiClient.delete(`/staff/${id}`).then((r) => r.data),
};
