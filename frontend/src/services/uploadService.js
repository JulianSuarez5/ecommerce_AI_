import api from '../api/axios';

export const uploadService = {
  uploadImage: (formData) => {
    return api.post('/upload/imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadModel: (formData) => {
    return api.post('/upload/modelo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
