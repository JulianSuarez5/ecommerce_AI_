package com.tiendaonline.controller;

import com.tiendaonline.dto.request.LoginRequest;
import com.tiendaonline.dto.request.RegistroRequest;
import com.tiendaonline.dto.response.AuthResponse;
import com.tiendaonline.dto.response.UserInfoResponse;
import com.tiendaonline.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacion", description = "Endpoints de registro y login")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.cookie-name:access_token}")
    private String jwtCookieName;

    @Value("${app.jwt.cookie-path:/}")
    private String jwtCookiePath;

    @Value("${app.jwt.cookie-max-age-seconds:86400}")
    private int jwtCookieMaxAge;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean jwtCookieSecure;

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuario")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<AuthResponse> registro(
            @Valid @RequestBody RegistroRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.registro(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token")
    public ResponseEntity<AuthResponse> refresh(
            @RequestHeader("X-Refresh-Token") String refreshToken,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener datos del usuario autenticado via cookie")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserInfoResponse> me(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesion y limpiar cookies")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("mensaje", "Sesion cerrada exitosamente"));
    }

    @PostMapping("/recuperar-password")
    @Operation(summary = "Solicitar recuperacion de contrasena")
    public ResponseEntity<Map<String, String>> recuperarPassword(
            @RequestBody Map<String, @NotBlank @Email String> body) {
        authService.recuperarPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("mensaje", "Si el email existe, recibiras instrucciones para recuperar tu contrasena"));
    }

    @PostMapping("/cambiar-password")
    @Operation(summary = "Cambiar contrasena con token de recuperacion")
    public ResponseEntity<Map<String, String>> cambiarPassword(@RequestBody Map<String, String> body) {
        authService.cambiarPassword(body.get("token"), body.get("nuevaPassword"));
        return ResponseEntity.ok(Map.of("mensaje", "Contrasena actualizada exitosamente"));
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        Cookie accessCookie = new Cookie(jwtCookieName, authResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(jwtCookieSecure);
        accessCookie.setPath(jwtCookiePath);
        accessCookie.setMaxAge(jwtCookieMaxAge);
        accessCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessCookie);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie(jwtCookieName, "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(jwtCookieSecure);
        accessCookie.setPath(jwtCookiePath);
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);
    }
}
