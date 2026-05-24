package com.tiendaonline.controller;

import com.tiendaonline.entity.Category;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.CategoryRepository;
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
@RequestMapping("/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Gestión de categorías")
public class CategoriaController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> listar() {
        return ResponseEntity.ok(categoryRepository.findByActivoTrueOrderByNombreAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(categoryRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> crear(@Valid @RequestBody CategoriaRequest request) {
        if (categoryRepository.existsByNombre(request.getNombre())) {
            throw new ReglaNegocioException("La categoría '" + request.getNombre() + "' ya existe");
        }
        Category categoria = Category.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .imagenUrl(request.getImagenUrl())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(categoria));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        Category categoria = categoryRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));
        categoria.setNombre(request.getNombre());
        categoria.setDescripcion(request.getDescripcion());
        categoria.setImagenUrl(request.getImagenUrl());
        return ResponseEntity.ok(categoryRepository.save(categoria));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Category categoria = categoryRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));
        categoria.setActivo(false);
        categoryRepository.save(categoria);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class CategoriaRequest {
        @NotBlank @Size(max = 100)
        private String nombre;
        @Size(max = 500)
        private String descripcion;
        private String imagenUrl;
    }
}
