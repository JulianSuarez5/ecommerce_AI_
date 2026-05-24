package com.tiendaonline.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tiendaonline.dto.request.ProductoRequest;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.service.ProductoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Catálogo de productos")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(summary = "Listar productos con filtros y paginación")
    public ResponseEntity<PageResponse<ProductoResponse>> listar(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "false") boolean soloDisponible,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "12") int tamano) {

        // Support both naming conventions (REST standard and legacy)
        Long finalCategoryId = categoryId != null ? categoryId : categoriaId;
        int finalPage = page != 0 ? page : pagina;
        int finalSize = size != 12 ? size : tamano;

        return ResponseEntity.ok(
                productoService.listar(finalCategoryId, precioMin, precioMax, busqueda, soloDisponible, finalPage, finalSize));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @GetMapping("/destacados")
    @Operation(summary = "Listar productos destacados")
    public ResponseEntity<List<ProductoResponse>> destacados() {
        return ResponseEntity.ok(productoService.listarDestacados());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear producto (Admin)")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar producto (Admin)")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar producto (Admin)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
