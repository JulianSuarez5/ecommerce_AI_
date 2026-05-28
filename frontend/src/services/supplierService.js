import api from '../api/axios';

export const supplierService = {
  getAll: () => {
    return api.get('/proveedores');
  },
  create: (data) => {
    return api.post('/proveedores', data);
  },
  update: (id, data) => {
    return api.put(`/proveedores/${id}`, data);
  },
  delete: (id) => {
    // 1. Limpiar espacios y asegurar formato string
    const sanitizedId = String(id).trim();
    
    // 2. Bloquear explícitamente intentos de saltos de directorio
    if (!sanitizedId || sanitizedId.includes('..') || sanitizedId.includes('/')) {
      throw new Error('Formato de ID de proveedor inválido o inseguro');
    }
    
    // 3. Codificar el componente de la URL para máxima seguridad
    return api.delete(`/proveedores/${encodeURIComponent(sanitizedId)}`);
  },
};
