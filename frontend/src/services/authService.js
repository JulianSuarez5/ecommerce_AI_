import api from '../api/axios';

export const authService = {
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  registro: (datos) => {
    return api.post('/auth/registro', datos);
  },
  logout: () => {
    return api.post('/auth/logout');
  },
  me: () => {
    return api.get('/auth/me');
  },
  recuperarPassword: (email) => {
    return api.post('/auth/recuperar-password', { email });
  },
  cambiarPassword: (token, nuevaPassword) => {
    return api.post('/auth/cambiar-password', { token, nuevaPassword });
  },
};
