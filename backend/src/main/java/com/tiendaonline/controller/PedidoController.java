package com.tiendaonline.controller;

import com.tiendaonline.dto.request.PedidoRequest;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.PedidoResponse;
import com.tiendaonline.service.PedidoService;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Gestión de pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @Operation(summary = "Crear pedido desde el carrito actual")
    public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody PedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.crearPedido(SecurityUtils.getUserId(), request));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout directo con PayPal (salta el carrito)")
    public ResponseEntity<PedidoResponse> checkout(@Valid @RequestBody PedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.checkout(SecurityUtils.getUserId(), request));
    }

    @GetMapping("/mis-pedidos")
    @Operation(summary = "Listar pedidos del usuario autenticado")
    public ResponseEntity<PageResponse<PedidoResponse>> misPedidos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano) {
        return ResponseEntity.ok(
                pedidoService.listarPedidosUsuario(SecurityUtils.getUserId(), pagina, tamano));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un pedido")
    public ResponseEntity<PedidoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPedido(id, SecurityUtils.getUserId()));
    }

    // ---- Admin ----
    @GetMapping("/admin/todos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los pedidos (Admin)")
    public ResponseEntity<PageResponse<PedidoResponse>> listarTodos(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return ResponseEntity.ok(pedidoService.listarTodos(estado, pagina, tamano));
    }

    @PutMapping("/admin/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cambiar estado de pedido (Admin)")
    public ResponseEntity<PedidoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            @RequestParam(required = false) String comentario) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado, comentario));
    }
}
