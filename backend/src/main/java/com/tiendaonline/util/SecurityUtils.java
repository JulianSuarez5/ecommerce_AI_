package com.tiendaonline.util;

import com.tiendaonline.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilidades para acceder al contexto de seguridad en cualquier capa.
 * Evita inyectar HttpServletRequest o SecurityContext directamente en los servicios.
 */
@Component
public class SecurityUtils {

    private static UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }

    /** Retorna el email del usuario autenticado en el contexto actual */
    public static String getEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No hay usuario autenticado en el contexto");
        }
        return auth.getName();
    }

    /** Retorna el ID del usuario autenticado consultando la base de datos */
    public static Long getUserId() {
        String email = getEmail();
        return userRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado: " + email))
                .getId();
    }
}
