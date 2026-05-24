import api from '../api/axios';

export const paymentService = {
  processPayPal: (data) => api.post('/pedidos/checkout', data),
};
