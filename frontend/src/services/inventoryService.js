import api from '../api/axios';

export const inventoryService = {
  getMovements: (params = {}) => {
    return api.get('/inventario/movimientos', { params });
  },
  getAlerts: () => {
    return api.get('/inventario/alertas');
  },
  createEntry: (data) => {
    return api.post('/inventario/entrada', data);
  },
};
