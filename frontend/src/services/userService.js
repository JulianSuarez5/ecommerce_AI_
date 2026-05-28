import api from '../api/axios';

export const userService = {
  getAll: () => {
    return api.get('/admin/usuarios');
  },
  create: (data) => {
    return api.post('/admin/usuarios', data);
  },
  update: (id, data) => {
    return api.put(`/admin/usuarios/${id}`, data);
  },
  delete: (id) => {
    // 1. Limpiar espacios y asegurar formato string
    const sanitizedId = String(id).trim();
    
    // 2. Validar que no contenga caracteres de escape de directorios
    if (!sanitizedId || sanitizedId.includes('..') || sanitizedId.includes('/')) {
      throw new Error('Formato de ID de usuario inválido o inseguro');
    }
    
    // 3. Construir la petición de forma segura
    return api.delete(`/admin/usuarios/${encodeURIComponent(sanitizedId)}`);
  },
};
