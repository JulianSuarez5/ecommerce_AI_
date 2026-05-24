package com.tiendaonline.controller;

import com.tiendaonline.dto.request.CompraRequest;
import com.tiendaonline.dto.response.CompraResponse;
import com.tiendaonline.service.CompraService;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/compras")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Compras", description = "Órdenes de compra a proveedores")
public class AdminCompraController {

    private final CompraService compraService;

    @GetMapping
    @Operation(summary = "Listar órdenes de compra a proveedores")
    public ResponseEntity<List<CompraResponse>> listarCompras(
            @RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(compraService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(compraService.listar());
    }

    @PostMapping
    @Operation(summary = "Crear orden de compra a proveedor")
    public ResponseEntity<CompraResponse> crearCompra(@Valid @RequestBody CompraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(compraService.crear(request, SecurityUtils.getEmail()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de orden de compra")
    public ResponseEntity<CompraResponse> obtenerCompra(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de orden de compra")
    public ResponseEntity<CompraResponse> actualizarEstadoCompra(
            @PathVariable Long id,
            @Valid @RequestBody CompraResponse.EstadoRequest request) {
        return ResponseEntity.ok(compraService.actualizarEstado(id, request, SecurityUtils.getEmail()));
    }
}
