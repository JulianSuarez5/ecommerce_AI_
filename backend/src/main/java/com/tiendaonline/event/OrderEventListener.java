package com.tiendaonline.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        var order = event.getOrder();
        log.info("Evento: Pedido #{} creado - Total: ${} - Usuario: {}",
                order.getId(), order.getTotal(), order.getUser().getEmail());
    }

    @EventListener
    public void handleStockLow(StockLowEvent event) {
        var product = event.getProduct();
        log.warn("Evento: Stock bajo para producto #{} '{}' - Stock actual: {} (mínimo: {})",
                product.getId(), product.getNombre(), product.getStock(), product.getStockMinimo());
    }
}
