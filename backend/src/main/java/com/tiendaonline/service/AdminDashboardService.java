package com.tiendaonline.service;

import com.tiendaonline.dto.response.DashboardMetricasResponse;
import com.tiendaonline.dto.response.ProductoResponse;

import java.util.List;

public interface AdminDashboardService {
    DashboardMetricasResponse obtenerMetricas();
    List<ProductoResponse> productosAgotados();
    List<ProductoResponse> productosStockBajo();
    String obtenerClientesConPedidos();
}
