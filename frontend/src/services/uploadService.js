import api from '../api/axios';

export const uploadService = {
  uploadImage: (formData) => api.post('/upload/imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  uploadModel: (formData) => api.post('/upload/modelo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
