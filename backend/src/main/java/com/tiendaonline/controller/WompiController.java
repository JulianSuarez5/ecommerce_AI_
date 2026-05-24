package com.tiendaonline.controller;

import com.tiendaonline.dto.request.WompiConfirmarRequest;
import com.tiendaonline.dto.request.WompiIniciarRequest;
import com.tiendaonline.dto.response.WompiConfirmarResponse;
import com.tiendaonline.dto.response.WompiIniciarResponse;
import com.tiendaonline.service.WompiService;
import com.tiendaonline.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/pagos/wompi")
@RequiredArgsConstructor
@Tag(name = "Wompi", description = "Pagos con Wompi (Bancolombia, PSE, Nequi)")
public class WompiController {

    private final WompiService wompiService;

    @PostMapping("/iniciar")
    @Operation(summary = "Iniciar pago Wompi - crea pedido y devuelve datos para el widget")
    public ResponseEntity<WompiIniciarResponse> iniciarPago(@Valid @RequestBody WompiIniciarRequest request) {
        Long userId = SecurityUtils.getUserId();
        WompiIniciarResponse response = wompiService.iniciarPago(userId, request.getAddressId(), request.getItems());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/confirmar")
    @Operation(summary = "Confirmar pago Wompi - verifica transacción y confirma pedido")
    public ResponseEntity<WompiConfirmarResponse> confirmarPago(@Valid @RequestBody WompiConfirmarRequest request) {
        WompiConfirmarResponse response = wompiService.confirmarPago(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook de Wompi - recibe notificaciones de eventos de transacción")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload) {
        log.debug("Webhook Wompi recibido: {}", payload);
        wompiService.procesarWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
