package com.tiendaonline.controller;

import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.response.CarritoResponse;
import com.tiendaonline.service.CarritoService;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrito")
@RequiredArgsConstructor
@Tag(name = "Carrito", description = "Gestión del carrito de compras")
@SecurityRequirement(name = "bearerAuth")
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    @Operation(summary = "Obtener carrito del usuario autenticado")
    public ResponseEntity<CarritoResponse> obtener() {
        return ResponseEntity.ok(carritoService.obtenerCarrito(SecurityUtils.getUserId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Agregar ítem al carrito")
    public ResponseEntity<CarritoResponse> agregar(@Valid @RequestBody CarritoItemRequest request) {
        return ResponseEntity.ok(carritoService.agregarItem(SecurityUtils.getUserId(), request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Actualizar cantidad de un ítem")
    public ResponseEntity<CarritoResponse> actualizar(
            @PathVariable Long itemId, @RequestParam int cantidad) {
        return ResponseEntity.ok(carritoService.actualizarCantidad(SecurityUtils.getUserId(), itemId, cantidad));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Eliminar ítem del carrito")
    public ResponseEntity<CarritoResponse> eliminar(@PathVariable Long itemId) {
        return ResponseEntity.ok(carritoService.eliminarItem(SecurityUtils.getUserId(), itemId));
    }

    @DeleteMapping
    @Operation(summary = "Vaciar carrito completo")
    public ResponseEntity<Void> vaciar() {
        carritoService.limpiarCarrito(SecurityUtils.getUserId());
        return ResponseEntity.noContent().build();
    }
}
