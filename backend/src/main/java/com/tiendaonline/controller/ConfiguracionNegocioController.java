package com.tiendaonline.controller;

import com.tiendaonline.entity.ConfiguracionNegocio;
import com.tiendaonline.service.ConfiguracionNegocioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracion")
@RequiredArgsConstructor
public class ConfiguracionNegocioController {

    private final ConfiguracionNegocioService configuracionNegocioService;

    @GetMapping
    public ResponseEntity<ConfiguracionNegocio> obtener() {
        return ResponseEntity.ok(configuracionNegocioService.obtener());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionNegocio> actualizar(@RequestBody ConfiguracionNegocio config) {
        return ResponseEntity.ok(configuracionNegocioService.guardar(config));
    }
}
