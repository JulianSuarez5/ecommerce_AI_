import api from '../api/axios';

export const configService = {
  get: () => {
    return api.get('/configuracion');
  },
  update: (data) => {
    return api.put('/configuracion', data);
  },
};
