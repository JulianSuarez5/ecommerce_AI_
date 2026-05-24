package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserInfoResponse {
    private Long userId;
    private String nombre;
    private String apellido;
    private String email;
    private Set<String> roles;
}
