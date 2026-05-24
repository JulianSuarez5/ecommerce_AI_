package com.tiendaonline.controller;

import com.tiendaonline.dto.request.DireccionRequest;
import com.tiendaonline.dto.response.DireccionResponse;
import com.tiendaonline.dto.response.UsuarioResponse;
import com.tiendaonline.entity.Address;
import com.tiendaonline.entity.User;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.repository.AddressRepository;
import com.tiendaonline.repository.UserRepository;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios")
public class UsuarioController {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponse> perfil() {
        User user = userRepository.findByEmailAndActivoTrue(SecurityUtils.getEmail())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        return ResponseEntity.ok(mapearUsuario(user));
    }

    @GetMapping("/direcciones")
    public ResponseEntity<List<DireccionResponse>> direcciones() {
        Long userId = SecurityUtils.getUserId();
        return ResponseEntity.ok(
                addressRepository.findByUserIdOrderByEsPrincipalDesc(userId)
                        .stream().map(this::mapearDireccion).collect(Collectors.toList())
        );
    }

    @PostMapping("/direcciones")
    public ResponseEntity<DireccionResponse> crearDireccion(@Valid @RequestBody DireccionRequest req) {
        Long userId = SecurityUtils.getUserId();
        User user = userRepository.findById(userId).orElseThrow();

        if (Boolean.TRUE.equals(req.getEsPrincipal())) {
            addressRepository.findByUserIdAndEsPrincipalTrue(userId).ifPresent(d -> {
                d.setEsPrincipal(false);
                addressRepository.save(d);
            });
        }

        Address address = Address.builder()
                .user(user).alias(req.getAlias()).calle(req.getCalle())
                .numero(req.getNumero()).ciudad(req.getCiudad()).departamento(req.getDepartamento())
                .codigoPostal(req.getCodigoPostal()).referencia(req.getReferencia())
                .esPrincipal(Boolean.TRUE.equals(req.getEsPrincipal()))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(mapearDireccion(addressRepository.save(address)));
    }

    @DeleteMapping("/direcciones/{id}")
    public ResponseEntity<Void> eliminarDireccion(@PathVariable Long id) {
        Long userId = SecurityUtils.getUserId();
        addressRepository.findByIdAndUserId(id, userId).ifPresent(addressRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private UsuarioResponse mapearUsuario(User u) {
        return UsuarioResponse.builder()
                .id(u.getId()).nombre(u.getNombre())
                .segundoNombre(u.getSegundoNombre())
                .apellido(u.getApellido())
                .segundoApellido(u.getSegundoApellido())
                .email(u.getEmail()).telefono(u.getTelefono()).activo(u.getActivo())
                .roles(u.getRoles().stream().map(r -> r.getNombre()).collect(java.util.stream.Collectors.toSet()))
                .fechaRegistro(u.getFechaRegistro()).ultimoAcceso(u.getUltimoAcceso())
                .build();
    }

    private DireccionResponse mapearDireccion(Address a) {
        return DireccionResponse.builder()
                .id(a.getId()).alias(a.getAlias()).calle(a.getCalle())
                .numero(a.getNumero()).ciudad(a.getCiudad()).departamento(a.getDepartamento())
                .codigoPostal(a.getCodigoPostal()).referencia(a.getReferencia())
                .esPrincipal(a.getEsPrincipal())
                .build();
    }
}
