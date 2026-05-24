import api from '../api/axios';

export const dashboardService = {
  get: () => {
    return api.get('/admin/dashboard');
  },
};
