package com.tiendaonline.controller;

import com.tiendaonline.dto.response.DashboardMetricasResponse;
import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Métricas y reportes del panel de administración")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "Métricas completas del dashboard")
    public ResponseEntity<DashboardMetricasResponse> dashboard() {
        return ResponseEntity.ok(adminDashboardService.obtenerMetricas());
    }

    @GetMapping("/productos/agotados")
    @Operation(summary = "Productos sin stock")
    public ResponseEntity<List<ProductoResponse>> productosAgotados() {
        return ResponseEntity.ok(adminDashboardService.productosAgotados());
    }

    @GetMapping("/productos/stock-bajo")
    @Operation(summary = "Productos con stock bajo")
    public ResponseEntity<List<ProductoResponse>> productosStockBajo() {
        return ResponseEntity.ok(adminDashboardService.productosStockBajo());
    }
}
