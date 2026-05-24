import api from '../api/axios';

export const configService = {
  get: () => api.get('/configuracion'),
  update: (data) => api.put('/configuracion', data),
};
