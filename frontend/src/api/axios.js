import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login';
    }
    const mensaje = error.response?.data?.mensaje || error.response?.data?.message || 'Ha ocurrido un error';
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
