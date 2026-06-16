import apiClient from '../apiClient';

export const settingsService = {
  get: () => apiClient.get('/settings').then((r) => r.data),
  update: (data) => apiClient.put('/settings', data).then((r) => r.data),
};
