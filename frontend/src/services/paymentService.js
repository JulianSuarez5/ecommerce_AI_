import api from '../api/axios';

export const paymentService = {
  processPayPal: (data) => {
    return api.post('/pedidos/checkout', data);
  },
};
