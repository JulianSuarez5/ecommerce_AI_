package com.tiendaonline.service;

import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.response.CarritoResponse;

public interface CarritoService {
    CarritoResponse obtenerCarrito(Long userId);
    CarritoResponse agregarItem(Long userId, CarritoItemRequest request);
    CarritoResponse actualizarCantidad(Long userId, Long itemId, int cantidad);
    CarritoResponse eliminarItem(Long userId, Long itemId);
    void limpiarCarrito(Long userId);
}
