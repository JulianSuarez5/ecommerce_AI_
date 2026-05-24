package com.tiendaonline.controller;

import com.tiendaonline.dto.request.AdminUserRequest;
import com.tiendaonline.dto.response.UsuarioResponse;
import com.tiendaonline.service.AdminUserService;
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
@RequestMapping("/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Usuarios", description = "Gestión de usuarios desde el panel de administración")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(adminUserService.listarUsuarios());
    }

    @PostMapping
    @Operation(summary = "Crear usuario (admin o cliente)")
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.crearUsuario(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.obtenerUsuario(id));
    }
}
