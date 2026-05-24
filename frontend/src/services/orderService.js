import api from '../api/axios';

export const orderService = {
  create: (data) => {
    return api.post('/pedidos', data);
  },
  getById: (id) => {
    return api.get(`/pedidos/${id}`);
  },
  checkout: (data) => {
    return api.post('/pedidos/checkout', data);
  },
  getMyOrders: (params = {}) => {
    return api.get('/pedidos/mis-pedidos', { params });
  },
  adminGetAll: (params = {}) => {
    return api.get('/pedidos/admin/todos', { params });
  },
  adminUpdateStatus: (id, params) => {
    return api.put(`/pedidos/admin/${id}/estado`, null, { params });
  },
};
