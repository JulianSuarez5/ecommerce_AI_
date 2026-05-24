import api from '../api/axios';

const BASE = '/carrito';

export const cartService = {
  obtener: () => {
    return api.get(BASE);
  },

  agregarItem: (productoId, cantidad) => {
    return api.post(`${BASE}/items`, { productoId, cantidad });
  },

  actualizarCantidad: (itemId, cantidad) => {
    return api.put(`${BASE}/items/${itemId}`, { cantidad });
  },

  eliminarItem: (itemId) => {
    return api.delete(`${BASE}/items/${itemId}`);
  },

  limpiar: () => {
    return api.delete(BASE);
  },
};
