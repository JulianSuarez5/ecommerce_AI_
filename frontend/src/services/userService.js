import api from '../api/axios';

export const userService = {
  getAll: () => {
    return api.get('/admin/usuarios');
  },
  create: (data) => {
    return api.post('/admin/usuarios', data);
  },
  update: (id, data) => {
    return api.put(`/admin/usuarios/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/admin/usuarios/${id}`);
  },
};
