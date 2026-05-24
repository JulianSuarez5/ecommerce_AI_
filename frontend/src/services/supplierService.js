import api from '../api/axios';

export const supplierService = {
  getAll: () => {
    return api.get('/proveedores');
  },
  create: (data) => {
    return api.post('/proveedores', data);
  },
  update: (id, data) => {
    return api.put(`/proveedores/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/proveedores/${id}`);
  },
};
