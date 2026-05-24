package com.tiendaonline.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaonline.config.WompiConfig;
import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.request.WompiConfirmarRequest;
import com.tiendaonline.dto.response.WompiConfirmarResponse;
import com.tiendaonline.dto.response.WompiIniciarResponse;
import com.tiendaonline.entity.*;
import com.tiendaonline.event.OrderCreatedEvent;
import com.tiendaonline.event.StockLowEvent;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.*;
import com.tiendaonline.service.PedidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WompiService {

    private final WompiConfig wompiConfig;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PedidoService pedidoService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public WompiIniciarResponse iniciarPago(Long userId, Long addressId, List<CarritoItemRequest> items) {
        User user = new User();
        user.setId(userId);

        Order pedido = pedidoService.construirPedidoDesdeItems(userId, addressId, items, null);
        pedido.setUser(user);
        pedido.setEstado(OrderStatus.PENDIENTE);

        BigDecimal total = pedido.getTotal();
        long amountInCents = total.multiply(new BigDecimal("100")).longValue();

        String reference = "WOMPI-" + System.currentTimeMillis() + "-" + RANDOM.nextInt(1_000_000);
        String integrity = generateIntegritySignature(reference, amountInCents, "COP");

        Payment pago = Payment.builder()
                .order(pedido)
                .metodo("WOMPI")
                .monto(total)
                .referenciaExterna(reference)
                .estado("PENDIENTE")
                .build();
        pedido.setPayment(pago);

        orderRepository.save(pedido);
        registrarHistorial(pedido, "PENDIENTE", "Pedido iniciado - pendiente de pago Wompi");

        log.info("Pago Wompi iniciado: pedido={}, referencia={}, monto={}", pedido.getId(), reference, total);

        return WompiIniciarResponse.builder()
                .orderId(pedido.getId())
                .reference(reference)
                .amountInCents(amountInCents)
                .currency("COP")
                .publicKey(wompiConfig.getPublicKey())
                .integritySignature(integrity)
                .redirectUrl(wompiConfig.getRedirectUrl() + "/" + pedido.getId())
                .build();
    }

    @Transactional
    public WompiConfirmarResponse confirmarPago(WompiConfirmarRequest request) {
        Order pedido = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", request.getOrderId()));

        if (pedido.getPayment() == null || !"PENDIENTE".equals(pedido.getPayment().getEstado())) {
            throw new ReglaNegocioException("El pago de este pedido ya fue procesado o no está pendiente");
        }

        JsonNode transactionData = verificarTransaccionWompi(request.getWompiTransactionId());

        String status = transactionData.get("status").asText();
        String dataReference = transactionData.get("reference").asText();
        long dataAmountInCents = transactionData.get("amount_in_cents").asLong();

        if (!"APPROVED".equals(status)) {
            pedido.getPayment().setEstado("RECHAZADO");
            pedido.setEstado(OrderStatus.CANCELADO);
            orderRepository.save(pedido);
            registrarHistorial(pedido, "CANCELADO", "Pago rechazado por Wompi: " + status);
            throw new ReglaNegocioException("El pago no fue aprobado por Wompi: " + status);
        }

        if (!request.getReference().equals(dataReference)) {
            throw new ReglaNegocioException("La referencia de la transacción no coincide");
        }

        long expectedCents = pedido.getTotal().multiply(new BigDecimal("100")).longValue();
        if (dataAmountInCents != expectedCents) {
            throw new ReglaNegocioException("El monto de la transacción no coincide");
        }

        pedido.getPayment().setEstado("APROBADO");
        pedido.getPayment().setFechaPago(LocalDateTime.now());
        pedido.setEstado(OrderStatus.CONFIRMADO);

        for (OrderDetail detalle : pedido.getDetalles()) {
            Product producto = detalle.getProduct();
            producto.setStock(producto.getStock() - detalle.getCantidad());
            productRepository.save(producto);
            if (producto.isStockBajo()) {
                eventPublisher.publishEvent(new StockLowEvent(this, producto));
            }
        }

        orderRepository.save(pedido);
        registrarHistorial(pedido, "CONFIRMADO", "Pago confirmado vía Wompi (tx: " + request.getWompiTransactionId() + ")");
        eventPublisher.publishEvent(new OrderCreatedEvent(this, pedido));

        log.info("Pago Wompi confirmado: pedido={}, transaccion={}", request.getOrderId(), request.getWompiTransactionId());

        return WompiConfirmarResponse.builder()
                .orderId(pedido.getId())
                .estado("CONFIRMADO")
                .build();
    }

    @Transactional
    public void procesarWebhook(Map<String, Object> payload) {
        try {
            String event = (String) payload.get("event");
            if (!"transaction.updated".equals(event)) {
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) return;

            @SuppressWarnings("unchecked")
            Map<String, Object> transaction = (Map<String, Object>) data.get("transaction");
            if (transaction == null) return;

            String transactionId = (String) transaction.get("id");
            String status = (String) transaction.get("status");
            String reference = (String) transaction.get("reference");

            if (reference == null || reference.isBlank()) {
                log.warn("Webhook sin referencia, ignorando");
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> signature = (Map<String, Object>) data.get("signature");
            if (signature != null) {
                @SuppressWarnings("unchecked")
                List<String> properties = (List<String>) signature.get("properties");
                String receivedChecksum = (String) signature.get("checksum");
                String timestamp = String.valueOf(data.get("timestamp"));

                if (receivedChecksum != null && properties != null) {
                    String expectedChecksum = computeWebhookChecksum(transaction, properties, timestamp);
                    if (!expectedChecksum.equals(receivedChecksum)) {
                        log.warn("Checksum de webhook Wompi inválido, ignorando evento");
                        return;
                    }
                }
            }

            Optional<Payment> paymentOpt = paymentRepository.findByReferenciaExterna(reference);
            if (paymentOpt.isEmpty()) {
                log.warn("Webhook para referencia desconocida: {}", reference);
                return;
            }

            Payment payment = paymentOpt.get();
            if (!"PENDIENTE".equals(payment.getEstado())) {
                log.info("Webhook ignorado: pago {} ya procesado", payment.getId());
                return;
            }

            String apiStatus = verificarEstadoTransaccionWompi(transactionId);

            if ("APPROVED".equals(status) && "APPROVED".equals(apiStatus)) {
                Order pedido = payment.getOrder();
                payment.setEstado("APROBADO");
                payment.setFechaPago(LocalDateTime.now());
                pedido.setEstado(OrderStatus.CONFIRMADO);

                for (OrderDetail detalle : pedido.getDetalles()) {
                    Product producto = detalle.getProduct();
                    producto.setStock(producto.getStock() - detalle.getCantidad());
                    productRepository.save(producto);
                }

                orderRepository.save(pedido);
                registrarHistorial(pedido, "CONFIRMADO", "Pago confirmado vía webhook Wompi");
                eventPublisher.publishEvent(new OrderCreatedEvent(this, pedido));
                log.info("Pedido {} confirmado vía webhook Wompi", pedido.getId());
            }

        } catch (Exception e) {
            log.error("Error procesando webhook Wompi", e);
            throw e;
        }
    }

    private JsonNode verificarTransaccionWompi(String transactionId) {
        String url = wompiConfig.getBaseUrl() + "/v1/transactions/" + transactionId;
        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.get("data");
            if (data == null) {
                throw new ReglaNegocioException("Respuesta inválida de Wompi API");
            }
            return data;
        } catch (Exception e) {
            throw new ReglaNegocioException("Error al verificar la transacción con Wompi: " + e.getMessage());
        }
    }

    private String verificarEstadoTransaccionWompi(String transactionId) {
        String url = wompiConfig.getBaseUrl() + "/v1/transactions/" + transactionId;
        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.get("data");
            if (data == null) return null;
            return data.get("status").asText();
        } catch (Exception e) {
            log.error("Error verificando transacción Wompi en webhook", e);
            return null;
        }
    }

    String generateIntegritySignature(String reference, long amountInCents, String currency) {
        String raw = reference + amountInCents + currency + wompiConfig.getIntegritySecret();
        return sha256(raw);
    }

    private String computeWebhookChecksum(Map<String, Object> transaction, List<String> properties, String timestamp) {
        TreeMap<String, String> sortedValues = new TreeMap<>();
        for (String prop : properties) {
            String key = prop.replace("transaction.", "");
            Object value = transaction.get(key);
            if (value != null) {
                sortedValues.put(prop, value.toString());
            }
        }
        StringBuilder sb = new StringBuilder();
        for (String value : sortedValues.values()) {
            sb.append(value);
        }
        sb.append(timestamp);
        sb.append(wompiConfig.getEventSecret());
        return sha256(sb.toString());
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generando SHA-256", e);
        }
    }

    private void registrarHistorial(Order order, String estado, String comentario) {
        OrderStatusHistory historial = OrderStatusHistory.builder()
                .order(order)
                .estado(estado)
                .comentario(comentario)
                .build();
        statusHistoryRepository.save(historial);
    }
}
