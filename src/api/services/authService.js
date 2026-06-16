import apiClient from '../apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data).then((r) => r.data),
  login: (data) => apiClient.post('/auth/login', data).then((r) => r.data),
  getMe: () => apiClient.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => apiClient.put('/auth/me', data).then((r) => r.data),
  changePassword: (data) => apiClient.put('/auth/me/password', data).then((r) => r.data),
};
