package com.tiendaonline.service;

import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.request.PedidoRequest;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.PedidoResponse;
import com.tiendaonline.entity.Address;
import com.tiendaonline.entity.Order;

import java.util.List;

public interface PedidoService {
    PedidoResponse crearPedido(Long userId, PedidoRequest request);
    PedidoResponse checkout(Long userId, PedidoRequest request);
    PageResponse<PedidoResponse> listarPedidosUsuario(Long userId, int pagina, int tamano);
    PedidoResponse obtenerPedido(Long pedidoId, Long userId);
    PedidoResponse cambiarEstado(Long pedidoId, String nuevoEstado, String comentario);
    PageResponse<PedidoResponse> listarTodos(String estado, int pagina, int tamano);

    Order construirPedidoDesdeItems(Long userId, Long addressId, List<CarritoItemRequest> items, String notas);
}
