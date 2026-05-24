import api from '../api/axios';

export const userService = {
  getAll: () => api.get('/admin/usuarios'),
  create: (data) => api.post('/admin/usuarios', data),
  update: (id, data) => api.put(`/admin/usuarios/${id}`, data),
  delete: (id) => api.delete(`/admin/usuarios/${id}`),
};
