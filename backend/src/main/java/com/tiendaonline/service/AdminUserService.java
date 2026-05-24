package com.tiendaonline.service;

import com.tiendaonline.dto.request.AdminUserRequest;
import com.tiendaonline.dto.response.UsuarioResponse;

import java.util.List;

public interface AdminUserService {
    List<UsuarioResponse> listarUsuarios();
    UsuarioResponse crearUsuario(AdminUserRequest request);
    UsuarioResponse obtenerUsuario(Long id);
}
