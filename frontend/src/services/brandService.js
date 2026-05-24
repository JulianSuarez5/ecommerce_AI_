import api from '../api/axios';

export const brandService = {
  getAll: () => {
    return api.get('/marcas');
  },
  create: (data) => {
    return api.post('/marcas', data);
  },
  update: (id, data) => {
    return api.put(`/marcas/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/marcas/${id}`);
  },
};
