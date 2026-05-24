import api from '../api/axios';

export const orderService = {
  create: (data) => api.post('/pedidos', data),
  getById: (id) => api.get(`/pedidos/${id}`),
  checkout: (data) => api.post('/pedidos/checkout', data),
  getMyOrders: (params = {}) => api.get('/pedidos/mis-pedidos', { params }),
  adminGetAll: (params = {}) => api.get('/pedidos/admin/todos', { params }),
  adminUpdateStatus: (id, params) => api.put(`/pedidos/admin/${id}/estado`, null, { params }),
};
