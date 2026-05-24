import api from '../api/axios';

export const purchaseService = {
  getAll: (params = {}) => {
    return api.get('/admin/compras', { params });
  },
  getById: (id) => {
    return api.get(`/admin/compras/${id}`);
  },
  create: (data) => {
    return api.post('/admin/compras', data);
  },
  updateStatus: (id, data) => {
    return api.put(`/admin/compras/${id}/estado`, data);
  },
};
