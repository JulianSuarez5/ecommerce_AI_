import api from '../api/axios';

export const inventoryService = {
  getMovements: (params = {}) => api.get('/inventario/movimientos', { params }),
  getAlerts: () => api.get('/inventario/alertas'),
  createEntry: (data) => api.post('/inventario/entrada', data),
};
