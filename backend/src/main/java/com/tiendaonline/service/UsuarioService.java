package com.tiendaonline.service;

import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.UsuarioResponse;

public interface UsuarioService {
    UsuarioResponse obtenerPerfil(String email);
    PageResponse<UsuarioResponse> listarTodos(int pagina, int tamano);
    void activar(Long id);
    void desactivar(Long id);
}
