import apiClient from '../apiClient';

export const staffService = {
  getAll: async () => {
    const response = await apiClient.get('/staff');
    return response.data;
  },

  create: async (staffData) => {
    const response = await apiClient.post('/staff', staffData);
    return response.data;
  },

  update: async ({ id, data }) => {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },
};
