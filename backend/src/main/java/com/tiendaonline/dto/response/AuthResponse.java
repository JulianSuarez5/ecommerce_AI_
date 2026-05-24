package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tipo = "Bearer";
    private Long userId;
    private String nombre;
    private String email;
    private Set<String> roles;
}
