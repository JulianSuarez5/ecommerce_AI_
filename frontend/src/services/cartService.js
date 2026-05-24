import api from '../api/axios';

const BASE = '/carrito';

export const cartService = {
  obtener: () => api.get(BASE),

  agregarItem: (productoId, cantidad) =>
    api.post(`${BASE}/items`, { productoId, cantidad }),

  actualizarCantidad: (itemId, cantidad) =>
    api.put(`${BASE}/items/${itemId}`, { cantidad }),

  eliminarItem: (itemId) =>
    api.delete(`${BASE}/items/${itemId}`),

  limpiar: () => api.delete(BASE),
};
