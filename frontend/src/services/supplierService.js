import api from '../api/axios';

export const supplierService = {
  getAll: () => api.get('/proveedores'),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  delete: (id) => api.delete(`/proveedores/${id}`),
};
