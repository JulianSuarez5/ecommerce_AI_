import api from '../api/axios';

export const productService = {
  getAll: (params = {}, config = {}) => {
    return api.get('/productos', { ...config, params });
  },
  getById: (id) => {
    return api.get(`/productos/${id}`);
  },
  getReviews: (productId) => {
    return api.get(`/productos/${productId}/resenas`);
  },
  createReview: (productId, formData) => {
    return api.post(`/productos/${productId}/resenas`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (data) => {
    return api.post('/productos', data);
  },
  update: (id, data) => {
    return api.put(`/productos/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/productos/${id}`);
  },
};
