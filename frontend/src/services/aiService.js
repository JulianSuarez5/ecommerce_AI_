import api from '../api/axios';

export const aiService = {
  chat: (question, contextData) => api.post('/ai/chat', { question, contextData }),

  adminChat: (question) => api.post('/ai/admin/chat', { question }),

  getClientContext: () => api.get('/ai/contexto-cliente'),

  getBusinessInfo: () => api.get('/ai/info-negocio'),

  getBusinessContext: () => api.get('/ai/contexto-negocio'),

  getInsights: () => api.get('/ai/insights'),
};
