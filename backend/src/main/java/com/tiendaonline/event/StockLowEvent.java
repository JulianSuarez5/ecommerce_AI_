package com.tiendaonline.event;

import com.tiendaonline.entity.Product;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class StockLowEvent extends ApplicationEvent {
    private final Product product;

    public StockLowEvent(Object source, Product product) {
        super(source);
        this.product = product;
    }
}
