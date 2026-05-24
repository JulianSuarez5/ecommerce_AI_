import api from '../api/axios';

export const dashboardService = {
  get: () => api.get('/admin/dashboard'),
};
