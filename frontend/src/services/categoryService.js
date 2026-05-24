import api from '../api/axios';

export const categoryService = {
  getAll: () => {
    return api.get('/categorias');
  },

  getById: (id) => {
    return api.get(`/categorias/${id}`);
  },

  // Admin
  create: (data) => {
    return api.post('/admin/categorias', data);
  },

  update: (id, data) => {
    return api.put(`/admin/categorias/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/admin/categorias/${id}`);
  },
};
