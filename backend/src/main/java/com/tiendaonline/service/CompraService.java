package com.tiendaonline.service;

import com.tiendaonline.dto.request.CompraRequest;
import com.tiendaonline.dto.response.CompraResponse;
import com.tiendaonline.dto.response.CompraResponse.EstadoRequest;

import java.util.List;

public interface CompraService {
    List<CompraResponse> listar();
    List<CompraResponse> listarPorEstado(String estado);
    CompraResponse obtenerPorId(Long id);
    CompraResponse crear(CompraRequest request, String emailUsuario);
    CompraResponse actualizarEstado(Long id, EstadoRequest request, String emailUsuario);
}
