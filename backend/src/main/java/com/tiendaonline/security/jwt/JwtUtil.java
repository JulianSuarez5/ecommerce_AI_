package com.tiendaonline.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utilidad para generación, validación y extracción de información de tokens JWT.
 * Utiliza HMAC-SHA256 con clave derivada de la configuración de la aplicación.
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            log.error("JWT_SECRET inseguro: solo {} bytes. Debe tener al menos 32 bytes (256 bits) " +
                       "para HMAC-SHA256. Genere una clave con: openssl rand -hex 32", keyBytes.length);
            throw new IllegalArgumentException(
                    "La clave JWT debe tener al menos 32 bytes (256 bits) para HMAC-SHA256. " +
                    "Tamaño actual: " + keyBytes.length + " bytes.");
        }
        Keys.hmacShaKeyFor(keyBytes);
        log.info("Clave JWT validada correctamente ({} bytes)", keyBytes.length);
    }

    // ---- Generación de tokens ----

    /** Genera un token de acceso para el usuario autenticado */
    public String generarToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .toList());
        return construirToken(claims, userDetails.getUsername(), jwtExpirationMs);
    }

    /** Genera un refresh token con mayor duración */
    public String generarRefreshToken(UserDetails userDetails) {
        return construirToken(new HashMap<>(), userDetails.getUsername(), refreshExpirationMs);
    }

    private String construirToken(Map<String, Object> claims, String subject, long expiracion) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiracion))
                .signWith(obtenerClave())
                .compact();
    }

    // ---- Validación ----

    /** Verifica que el token sea válido y pertenezca al usuario indicado */
    public boolean esTokenValido(String token, UserDetails userDetails) {
        final String email = extraerEmail(token);
        return email.equals(userDetails.getUsername()) && !estaExpirado(token);
    }

    /** Verifica la firma y estructura del token sin contexto de usuario */
    public boolean validarToken(String token) {
        try {
            Jwts.parser().verifyWith(obtenerClave()).build().parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.warn("Token JWT malformado: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims vacíos: {}", e.getMessage());
        }
        return false;
    }

    // ---- Extracción de datos ----

    public String extraerEmail(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    // ---- Internos ----

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    private SecretKey obtenerClave() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
