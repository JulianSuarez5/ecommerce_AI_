package com.tiendaonline.controller;

import com.tiendaonline.entity.InventoryMovement;
import com.tiendaonline.entity.Product;
import com.tiendaonline.entity.Supplier;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.InventoryMovementRepository;
import com.tiendaonline.repository.ProductRepository;
import com.tiendaonline.repository.SupplierRepository;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/inventario")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Inventario", description = "Gestión de inventario y movimientos")
public class InventoryController {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping("/movimientos")
    public ResponseEntity<Page<InventoryMovement>> listarMovimientos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return ResponseEntity.ok(
                movementRepository.findAllByOrderByFechaMovimientoDesc(PageRequest.of(pagina, tamano)));
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<Product>> alertasStock() {
        return ResponseEntity.ok(productRepository.findProductosConStockBajo());
    }

    @PostMapping("/entrada")
    public ResponseEntity<InventoryMovement> registrarEntrada(@Valid @RequestBody MovimientoRequest request) {
        Product product = productRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", request.getProductoId()));

        Supplier supplier = null;
        if (request.getProveedorId() != null) {
            supplier = supplierRepository.findById(request.getProveedorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", request.getProveedorId()));
        }

        product.setStock(product.getStock() + request.getCantidad());
        productRepository.save(product);

        InventoryMovement movement = InventoryMovement.builder()
                .product(product)
                .tipo("ENTRADA")
                .cantidad(request.getCantidad())
                .costoUnitario(request.getCostoUnitario())
                .supplier(supplier)
                .referencia(request.getReferencia())
                .usuarioRegistro(SecurityUtils.getEmail())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(movementRepository.save(movement));
    }

    @PostMapping("/ajuste")
    public ResponseEntity<InventoryMovement> registrarAjuste(@Valid @RequestBody MovimientoRequest request) {
        Product product = productRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", request.getProductoId()));

        int nuevoStock = product.getStock() + request.getCantidad();
        if (nuevoStock < 0) {
            throw new ReglaNegocioException("El stock no puede ser negativo");
        }
        product.setStock(nuevoStock);
        productRepository.save(product);

        InventoryMovement movement = InventoryMovement.builder()
                .product(product)
                .tipo(request.getCantidad() >= 0 ? "AJUSTE+" : "AJUSTE-")
                .cantidad(Math.abs(request.getCantidad()))
                .costoUnitario(request.getCostoUnitario())
                .referencia(request.getReferencia())
                .usuarioRegistro(SecurityUtils.getEmail())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(movementRepository.save(movement));
    }

    @Data
    public static class MovimientoRequest {
        @NotNull private Long productoId;
        @NotNull @Min(1) private Integer cantidad;
        private BigDecimal costoUnitario;
        private Long proveedorId;
        private String referencia;
    }
}
