package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.response.CarritoResponse;
import com.tiendaonline.entity.Cart;
import com.tiendaonline.entity.CartItem;
import com.tiendaonline.entity.Product;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.mapper.CarritoMapper;
import com.tiendaonline.repository.CartRepository;
import com.tiendaonline.repository.ProductRepository;
import com.tiendaonline.service.CarritoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Servicio de carrito de compras persistente.
 * El precio se captura al momento de agregar el ítem (no al momento del checkout)
 * para reflejar el precio vigente cuando el usuario añadió el producto.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CarritoServiceImpl implements CarritoService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CarritoMapper carritoMapper;

    @Override
    @Transactional(readOnly = true)
    public CarritoResponse obtenerCarrito(Long userId) {
        Cart carrito = obtenerOCrearCarrito(userId);
        return carritoMapper.toResponse(carrito);
    }

    @Override
    @Transactional
    public CarritoResponse agregarItem(Long userId, CarritoItemRequest request) {
        Cart carrito = obtenerOCrearCarrito(userId);
        Product producto = productRepository.findByIdAndActivoTrue(request.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", request.getProductoId()));

        if (producto.getStock() < request.getCantidad()) {
            throw new ReglaNegocioException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        Optional<CartItem> itemExistente = carrito.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductoId()))
                .findFirst();

        if (itemExistente.isPresent()) {
            int nuevaCantidad = itemExistente.get().getCantidad() + request.getCantidad();
            if (nuevaCantidad > producto.getStock()) {
                throw new ReglaNegocioException("No hay suficiente stock para esa cantidad");
            }
            itemExistente.get().setCantidad(nuevaCantidad);
        } else {
            CartItem nuevoItem = CartItem.builder()
                    .cart(carrito)
                    .product(producto)
                    .cantidad(request.getCantidad())
                    .precioUnitario(producto.getPrecioEfectivo())
                    .build();
            carrito.getItems().add(nuevoItem);
        }

        return carritoMapper.toResponse(cartRepository.save(carrito));
    }

    @Override
    @Transactional
    public CarritoResponse actualizarCantidad(Long userId, Long itemId, int cantidad) {
        Cart carrito = obtenerOCrearCarrito(userId);
        CartItem item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("Ítem del carrito", itemId));

        if (cantidad <= 0) {
            carrito.getItems().remove(item);
        } else {
            if (item.getProduct().getStock() < cantidad) {
                throw new ReglaNegocioException("Stock insuficiente");
            }
            item.setCantidad(cantidad);
        }

        return carritoMapper.toResponse(cartRepository.save(carrito));
    }

    @Override
    @Transactional
    public CarritoResponse eliminarItem(Long userId, Long itemId) {
        Cart carrito = obtenerOCrearCarrito(userId);
        carrito.getItems().removeIf(i -> i.getId().equals(itemId));
        return carritoMapper.toResponse(cartRepository.save(carrito));
    }

    @Override
    @Transactional
    public void limpiarCarrito(Long userId) {
        Cart carrito = obtenerOCrearCarrito(userId);
        carrito.getItems().clear();
        cartRepository.save(carrito);
    }

    /** Obtiene el carrito del usuario o crea uno nuevo si no existe */
    private Cart obtenerOCrearCarrito(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    log.info("Creando carrito nuevo para usuario: {}", userId);
                    Cart nuevo = new Cart();
                    nuevo.setUser(new com.tiendaonline.entity.User());
                    nuevo.getUser().setId(userId);
                    return cartRepository.save(nuevo);
                });
    }

}
