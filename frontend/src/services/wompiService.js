import api from '../api/axios';

export const wompiService = {
  iniciarPago: (addressId, items) => {
    return api.post('/pagos/wompi/iniciar', { addressId, items });
  },

  confirmarPago: (reference, wompiTransactionId, orderId) => {
    return api.post('/pagos/wompi/confirmar', { reference, wompiTransactionId, orderId });
  },
};
