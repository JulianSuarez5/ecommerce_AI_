import api from '../api/axios';

export const categoryService = {
  getAll: () => api.get('/categorias'),

  getById: (id) => api.get(`/categorias/${id}`),

  // Admin
  create: (data) => api.post('/admin/categorias', data),

  update: (id, data) => api.put(`/admin/categorias/${id}`, data),

  delete: (id) => api.delete(`/admin/categorias/${id}`),
};
