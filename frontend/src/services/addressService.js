import api from '../api/axios';

export const addressService = {
  getAll: () => api.get('/usuarios/direcciones'),

  create: (data) => api.post('/usuarios/direcciones', data),

  update: (id, data) => api.put(`/usuarios/direcciones/${id}`, data),

  delete: (id) => api.delete(`/usuarios/direcciones/${id}`),
};
