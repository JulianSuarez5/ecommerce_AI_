package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.AdminUserRequest;
import com.tiendaonline.dto.response.UsuarioResponse;
import com.tiendaonline.entity.Address;
import com.tiendaonline.entity.Cart;
import com.tiendaonline.entity.Role;
import com.tiendaonline.entity.User;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.AddressRepository;
import com.tiendaonline.repository.CartRepository;
import com.tiendaonline.repository.RoleRepository;
import com.tiendaonline.repository.UserRepository;
import com.tiendaonline.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return userRepository.findAll().stream()
                .map(this::mapearUsuario)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UsuarioResponse crearUsuario(AdminUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ReglaNegocioException("El email ya está registrado");
        }

        Role rol = roleRepository.findByNombre(request.getRol())
                .orElseThrow(() -> new ReglaNegocioException("Rol inválido: " + request.getRol()));

        User usuario = User.builder()
                .nombre(request.getNombre())
                .segundoNombre(request.getSegundoNombre())
                .apellido(request.getApellido())
                .segundoApellido(request.getSegundoApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telefono(request.getTelefono())
                .roles(Set.of(rol))
                .build();

        usuario = userRepository.save(usuario);

        if (request.getCalle() != null && !request.getCalle().isBlank()) {
            Address direccion = Address.builder()
                    .user(usuario)
                    .alias("Principal")
                    .calle(request.getCalle())
                    .numero(request.getNumero())
                    .ciudad(request.getCiudad())
                    .departamento(request.getDepartamento())
                    .codigoPostal(request.getCodigoPostal())
                    .referencia(request.getReferencia())
                    .esPrincipal(true)
                    .build();
            addressRepository.save(direccion);
        }

        Cart carrito = Cart.builder().user(usuario).build();
        cartRepository.save(carrito);

        log.info("Admin creó usuario: {}", request.getEmail());
        return mapearUsuario(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuario(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
        return mapearUsuario(user);
    }

    private UsuarioResponse mapearUsuario(User u) {
        return UsuarioResponse.builder()
                .id(u.getId()).nombre(u.getNombre())
                .segundoNombre(u.getSegundoNombre())
                .apellido(u.getApellido())
                .segundoApellido(u.getSegundoApellido())
                .email(u.getEmail()).telefono(u.getTelefono()).activo(u.getActivo())
                .roles(u.getRoles().stream().map(Role::getNombre).collect(Collectors.toSet()))
                .fechaRegistro(u.getFechaRegistro()).ultimoAcceso(u.getUltimoAcceso())
                .build();
    }
}
