import api from '../api/axios';

export const brandService = {
  getAll: () => api.get('/marcas'),
  create: (data) => api.post('/marcas', data),
  update: (id, data) => api.put(`/marcas/${id}`, data),
  delete: (id) => api.delete(`/marcas/${id}`),
};
