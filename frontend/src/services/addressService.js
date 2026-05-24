import api from '../api/axios';

export const addressService = {
  getAll: () => {
    return api.get('/usuarios/direcciones');
  },

  create: (data) => {
    return api.post('/usuarios/direcciones', data);
  },

  update: (id, data) => {
    return api.put(`/usuarios/direcciones/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/usuarios/direcciones/${id}`);
  },
};
