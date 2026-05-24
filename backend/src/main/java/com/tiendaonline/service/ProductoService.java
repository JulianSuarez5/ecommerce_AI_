package com.tiendaonline.service;

import com.tiendaonline.dto.request.ProductoRequest;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.ProductoResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ProductoService {
    PageResponse<ProductoResponse> listar(Long categoryId, BigDecimal precioMin, BigDecimal precioMax,
                                          String busqueda, boolean soloDisponible, int pagina, int tamano);
    ProductoResponse obtenerPorId(Long id);
    List<ProductoResponse> listarDestacados();
    ProductoResponse crear(ProductoRequest request);
    ProductoResponse actualizar(Long id, ProductoRequest request);
    void eliminar(Long id);
    List<ProductoResponse> listarAgotados();
    List<ProductoResponse> listarConStockBajo();
}
