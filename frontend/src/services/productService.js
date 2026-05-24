import api from '../api/axios';

export const productService = {
  getAll: (params = {}, config = {}) => api.get('/productos', { ...config, params }),
  getById: (id) => api.get(`/productos/${id}`),
  getReviews: (productId) => api.get(`/productos/${productId}/resenas`),
  createReview: (productId, formData) => api.post(`/productos/${productId}/resenas`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
};
