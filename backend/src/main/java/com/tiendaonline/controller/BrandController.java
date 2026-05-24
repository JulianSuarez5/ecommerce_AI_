package com.tiendaonline.controller;

import com.tiendaonline.entity.Brand;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.BrandRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marcas")
@RequiredArgsConstructor
@Tag(name = "Marcas", description = "Gestión de marcas")
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<List<Brand>> listar() {
        return ResponseEntity.ok(brandRepository.findByActivoTrueOrderByNombreAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(brandRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Marca", id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> crear(@Valid @RequestBody BrandRequest request) {
        if (brandRepository.existsByNombre(request.getNombre())) {
            throw new ReglaNegocioException("La marca '" + request.getNombre() + "' ya existe");
        }
        Brand brand = Brand.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .logoUrl(request.getLogoUrl())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(brandRepository.save(brand));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> actualizar(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Marca", id));
        brand.setNombre(request.getNombre());
        brand.setDescripcion(request.getDescripcion());
        brand.setLogoUrl(request.getLogoUrl());
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Marca", id));
        brand.setActivo(false);
        brandRepository.save(brand);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class BrandRequest {
        @NotBlank @jakarta.validation.constraints.Size(max = 100)
        private String nombre;
        @jakarta.validation.constraints.Size(max = 500)
        private String descripcion;
        private String logoUrl;
    }
}
