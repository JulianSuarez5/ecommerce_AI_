package com.tiendaonline.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaonline.config.PayPalConfig;
import com.tiendaonline.exception.ReglaNegocioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayPalService {

    private static final BigDecimal TASA_USD_COP = new BigDecimal("4000");
    private static final String GRANT_TYPE = "client_credentials";

    private final PayPalConfig payPalConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void verificarOrden(String paypalOrderId, BigDecimal montoEsperadoCOP) {
        String accessToken = obtenerAccessToken();
        JsonNode orderData = obtenerOrden(paypalOrderId, accessToken);
        validarEstadoOrden(orderData, paypalOrderId);
        validarMontoOrden(orderData, montoEsperadoCOP, paypalOrderId);
        log.info("Orden PayPal {} verificada exitosamente", paypalOrderId);
    }

    private String obtenerAccessToken() {
        String url = payPalConfig.getBaseUrl() + "/v1/oauth2/token";

        HttpHeaders headers = new HttpHeaders();
        String auth = payPalConfig.getClientId() + ":" + payPalConfig.getClientSecret();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", GRANT_TYPE);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());
            String token = json.get("access_token").asText();
            log.debug("Access token de PayPal obtenido exitosamente");
            return token;
        } catch (Exception e) {
            log.error("Error obteniendo access token de PayPal", e);
            throw new ReglaNegocioException("Error de autenticación con PayPal");
        }
    }

    private JsonNode obtenerOrden(String orderId, String accessToken) {
        String url = payPalConfig.getBaseUrl() + "/v2/checkout/orders/" + orderId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, String.class);
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            log.error("Error verificando orden PayPal {}: {}", orderId, e.getMessage());
            throw new ReglaNegocioException(
                    "No se pudo verificar la orden de PayPal: " + orderId);
        }
    }

    private void validarEstadoOrden(JsonNode orderData, String orderId) {
        String status = orderData.get("status").asText();
        if (!"APPROVED".equals(status) && !"COMPLETED".equals(status)) {
            log.warn("Orden PayPal {} con estado inválido: {}", orderId, status);
            throw new ReglaNegocioException(
                    "La orden de PayPal no está aprobada (estado: " + status + ")");
        }
    }

    private void validarMontoOrden(JsonNode orderData, BigDecimal montoEsperadoCOP, String orderId) {
        JsonNode purchaseUnits = orderData.get("purchase_units");
        if (purchaseUnits == null || !purchaseUnits.isArray() || purchaseUnits.isEmpty()) {
            throw new ReglaNegocioException("La orden de PayPal no contiene unidades de compra");
        }

        JsonNode amount = purchaseUnits.get(0).get("amount");
        String currency = amount.get("currency_code").asText();
        String valueStr = amount.get("value").asText();
        BigDecimal montoPayPal = new BigDecimal(valueStr);

        if (!"USD".equals(currency)) {
            log.warn("Orden PayPal {} en moneda no soportada: {}", orderId, currency);
            throw new ReglaNegocioException("La orden de PayPal debe estar en USD");
        }

        BigDecimal montoEsperadoUSD = montoEsperadoCOP.divide(TASA_USD_COP, 2, RoundingMode.HALF_UP);
        BigDecimal diferencia = montoPayPal.subtract(montoEsperadoUSD).abs();

        if (diferencia.compareTo(new BigDecimal("0.50")) > 0) {
            log.warn("Orden PayPal {}: monto {} USD no coincide con lo esperado {} USD",
                    orderId, montoPayPal, montoEsperadoUSD);
            throw new ReglaNegocioException(
                    "El monto de la orden de PayPal no coincide con el valor del pedido");
        }
    }
}
