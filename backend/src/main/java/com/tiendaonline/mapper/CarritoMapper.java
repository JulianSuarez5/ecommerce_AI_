package com.tiendaonline.mapper;

import com.tiendaonline.dto.response.CarritoItemResponse;
import com.tiendaonline.dto.response.CarritoResponse;
import com.tiendaonline.entity.Cart;
import com.tiendaonline.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CarritoMapper {

    @Mapping(target = "productoId", source = "product.id")
    @Mapping(target = "productoNombre", source = "product.nombre")
    @Mapping(target = "imagenPrincipal", source = "product.imagenPrincipal")
    @Mapping(target = "stockDisponible", source = "product.stock")
    @Mapping(target = "subtotal", expression = "java(item.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(item.getCantidad())))")
    CarritoItemResponse toItemResponse(CartItem item);

    List<CarritoItemResponse> toItemResponseList(List<CartItem> items);

    default CarritoResponse toResponse(Cart carrito) {
        List<CarritoItemResponse> items = toItemResponseList(carrito.getItems());
        BigDecimal subtotal = items.stream()
                .map(CarritoItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = items.stream().mapToInt(CarritoItemResponse::getCantidad).sum();
        return CarritoResponse.builder()
                .id(carrito.getId())
                .items(items)
                .subtotal(subtotal)
                .totalItems(totalItems)
                .build();
    }
}
