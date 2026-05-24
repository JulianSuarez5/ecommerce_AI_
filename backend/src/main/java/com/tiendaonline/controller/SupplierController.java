package com.tiendaonline.controller;

import com.tiendaonline.entity.Supplier;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.repository.SupplierRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Proveedores", description = "Gestión de proveedores")
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<Supplier>> listar() {
        return ResponseEntity.ok(supplierRepository.findByActivoTrueOrderByNombreAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(supplierRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", id)));
    }

    @PostMapping
    public ResponseEntity<Supplier> crear(@Valid @RequestBody SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .nombre(request.getNombre())
                .contacto(request.getContacto())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .direccion(request.getDireccion())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierRepository.save(supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> actualizar(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", id));
        supplier.setNombre(request.getNombre());
        supplier.setContacto(request.getContacto());
        supplier.setEmail(request.getEmail());
        supplier.setTelefono(request.getTelefono());
        supplier.setDireccion(request.getDireccion());
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", id));
        supplier.setActivo(false);
        supplierRepository.save(supplier);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class SupplierRequest {
        @NotBlank @Size(max = 200) private String nombre;
        @Size(max = 100) private String contacto;
        @Size(max = 150) private String email;
        @Size(max = 20) private String telefono;
        @Size(max = 500) private String direccion;
    }
}
