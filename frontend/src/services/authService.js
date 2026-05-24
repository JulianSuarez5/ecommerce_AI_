import api from '../api/axios';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registro: (datos) => api.post('/auth/registro', datos),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  recuperarPassword: (email) => api.post('/auth/recuperar-password', { email }),
  cambiarPassword: (token, nuevaPassword) => api.post('/auth/cambiar-password', { token, nuevaPassword }),
};
