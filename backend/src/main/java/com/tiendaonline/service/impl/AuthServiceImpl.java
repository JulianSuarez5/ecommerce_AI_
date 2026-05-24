package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.LoginRequest;
import com.tiendaonline.dto.request.RegistroRequest;
import com.tiendaonline.dto.response.AuthResponse;
import com.tiendaonline.dto.response.UserInfoResponse;
import com.tiendaonline.entity.Address;
import com.tiendaonline.entity.Cart;
import com.tiendaonline.entity.PasswordResetToken;
import com.tiendaonline.entity.Role;
import com.tiendaonline.entity.User;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.AddressRepository;
import com.tiendaonline.repository.CartRepository;
import com.tiendaonline.repository.PasswordResetTokenRepository;
import com.tiendaonline.repository.RoleRepository;
import com.tiendaonline.repository.UserRepository;
import com.tiendaonline.security.jwt.JwtUtil;
import com.tiendaonline.service.AuthService;
import com.tiendaonline.service.impl.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de autenticación.
 * Gestiona registro, login y renovación de tokens JWT.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * Autentica al usuario con email y contraseña.
     * Actualiza la marca de último acceso y genera tokens JWT.
     */
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmailAndActivoTrue(request.getEmail())
                .orElseThrow(() -> new ReglaNegocioException("Usuario no encontrado"));

        userRepository.actualizarUltimoAcceso(request.getEmail(), LocalDateTime.now());

        log.info("Login exitoso para usuario: {}", request.getEmail());
        return construirAuthResponse(user, userDetails);
    }

    /**
     * Registra un nuevo usuario con rol CLIENT por defecto.
     * Crea automáticamente su carrito persistente.
     */
    @Override
    @Transactional
    public AuthResponse registro(RegistroRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ReglaNegocioException("El email ya está registrado en el sistema");
        }

        Role rolCliente = roleRepository.findByNombre("ROLE_CLIENT")
                .orElseThrow(() -> new ReglaNegocioException("Rol CLIENT no configurado"));

        User nuevoUsuario = User.builder()
                .nombre(request.getNombre())
                .segundoNombre(request.getSegundoNombre())
                .apellido(request.getApellido())
                .segundoApellido(request.getSegundoApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telefono(request.getTelefono())
                .roles(Set.of(rolCliente))
                .build();

        nuevoUsuario = userRepository.save(nuevoUsuario);

        // Crear dirección principal si se proporcionaron datos
        if (request.getCalle() != null && !request.getCalle().isBlank()) {
            Address direccion = Address.builder()
                    .user(nuevoUsuario)
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

        // Crear carrito vacío asociado al nuevo usuario
        Cart carrito = Cart.builder().user(nuevoUsuario).build();
        cartRepository.save(carrito);

        log.info("Nuevo usuario registrado: {}", request.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(nuevoUsuario.getEmail());
        return construirAuthResponse(nuevoUsuario, userDetails);
    }

    /**
     * Renueva el access token usando un refresh token válido.
     */
    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validarToken(refreshToken)) {
            throw new ReglaNegocioException("Refresh token inválido o expirado");
        }

        String email = jwtUtil.extraerEmail(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        User user = userRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> new ReglaNegocioException("Usuario no encontrado"));

        return construirAuthResponse(user, userDetails);
    }

    @Override
    @Transactional
    public void recuperarPassword(String email) {
        var optUser = userRepository.findByEmailAndActivoTrue(email);
        if (optUser.isEmpty()) {
            log.warn("Intento de recuperación para email no registrado: {}", email);
            return;
        }

        User user = optUser.get();
        String rawToken = generarToken();
        String hashedToken = hashToken(rawToken);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(hashedToken)
                .user(user)
                .expiryDate(expiry)
                .build();
        passwordResetTokenRepository.save(resetToken);

        emailService.enviarRecuperacionPassword(user.getEmail(), user.getNombre(), rawToken);
        log.info("Token de recuperación generado para: {}", email);
    }

    @Override
    @Transactional
    public void cambiarPassword(String token, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.length() < 8) {
            throw new ReglaNegocioException("La nueva contraseña debe tener al menos 8 caracteres");
        }

        String hashedInput = hashToken(token);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(hashedInput)
                .orElseThrow(() -> new ReglaNegocioException("Token de recuperación inválido"));

        if (resetToken.getUsado()) {
            throw new ReglaNegocioException("Este token ya ha sido utilizado");
        }

        if (resetToken.isExpirado()) {
            throw new ReglaNegocioException("El token de recuperación ha expirado");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(nuevaPassword));
        userRepository.save(user);

        resetToken.setUsado(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Contraseña actualizada para usuario: {}", user.getEmail());
    }

    private String generarToken() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    @Override
    public UserInfoResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> new ReglaNegocioException("Usuario no encontrado"));

        Set<String> roles = user.getRoles().stream()
                .map(Role::getNombre)
                .collect(Collectors.toSet());

        return UserInfoResponse.builder()
                .userId(user.getId())
                .nombre(user.getNombreCompleto())
                .apellido(user.getApellido())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    /** Construye el objeto de respuesta de autenticación con los tokens generados */
    private AuthResponse construirAuthResponse(User user, UserDetails userDetails) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getNombre)
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(jwtUtil.generarToken(userDetails))
                .refreshToken(jwtUtil.generarRefreshToken(userDetails))
                .tipo("Bearer")
                .userId(user.getId())
                .nombre(user.getNombreCompleto())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
