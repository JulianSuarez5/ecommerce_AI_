import api from '../api/axios';

export const aiService = {
  chat: (question, contextData) => {
    return api.post('/ai/chat', { question, contextData });
  },

  adminChat: (question) => {
    return api.post('/ai/admin/chat', { question });
  },

  getClientContext: () => {
    return api.get('/ai/contexto-cliente');
  },

  getBusinessInfo: () => {
    return api.get('/ai/info-negocio');
  },

  getBusinessContext: () => {
    return api.get('/ai/contexto-negocio');
  },

  getInsights: () => {
    return api.get('/ai/insights');
  },
};
