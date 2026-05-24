import api from '../api/axios';

export const purchaseService = {
  getAll: (params = {}) => api.get('/admin/compras', { params }),
  getById: (id) => api.get(`/admin/compras/${id}`),
  create: (data) => api.post('/admin/compras', data),
  updateStatus: (id, data) => api.put(`/admin/compras/${id}/estado`, data),
};
