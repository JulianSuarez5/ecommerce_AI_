import api from '../api/axios';

export const wompiService = {
  iniciarPago: (addressId, items) => api.post('/pagos/wompi/iniciar', { addressId, items }),

  confirmarPago: (reference, wompiTransactionId, orderId) =>
    api.post('/pagos/wompi/confirmar', { reference, wompiTransactionId, orderId }),
};
