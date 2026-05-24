package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class CarritoResponse {
    private Long id;
    private List<CarritoItemResponse> items;
    private BigDecimal subtotal;
    private int totalItems;
}
