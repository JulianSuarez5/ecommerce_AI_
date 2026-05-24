package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.CarritoItemRequest;
import com.tiendaonline.dto.request.PedidoRequest;
import com.tiendaonline.dto.response.DireccionResponse;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.PedidoDetalleResponse;
import com.tiendaonline.dto.response.PedidoResponse;
import com.tiendaonline.dto.response.StatusHistoryResponse;
import com.tiendaonline.entity.*;
import com.tiendaonline.exception.AccesoDenegadoException;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.*;
import com.tiendaonline.service.CarritoService;
import com.tiendaonline.service.PedidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.tiendaonline.event.OrderCreatedEvent;
import com.tiendaonline.event.StockLowEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CarritoService carritoService;
    private final PayPalService payPalService;

    @Override
    @Transactional
    public PedidoResponse crearPedido(Long userId, PedidoRequest request) {
        Cart carrito = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ReglaNegocioException("El carrito está vacío"));

        if (carrito.getItems().isEmpty()) {
            throw new ReglaNegocioException("No puedes realizar un pedido con el carrito vacío");
        }

        Address direccion = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Dirección", request.getAddressId()));

        // Verificar stock disponible
        for (CartItem item : carrito.getItems()) {
            if (item.getProduct().getStock() < item.getCantidad()) {
                throw new ReglaNegocioException("Stock insuficiente para: " + item.getProduct().getNombre());
            }
        }

        BigDecimal subtotal = carrito.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costoEnvio = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("10.00");

        Order pedido = Order.builder()
                .user(carrito.getUser())
                .address(direccion)
                .subtotal(subtotal)
                .costoEnvio(costoEnvio)
                .total(subtotal.add(costoEnvio))
                .notas(request.getNotas())
                .build();

        // Crear detalles del pedido con snapshot de precios
        List<OrderDetail> detalles = carrito.getItems().stream()
                .map(item -> OrderDetail.builder()
                .order(pedido)
                .product(item.getProduct())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(item.getSubtotal())
                .build())
                .collect(Collectors.toList());
        pedido.setDetalles(detalles);

        // Crear registro de pago
        Payment pago = Payment.builder()
                .order(pedido)
                .metodo(request.getMetodoPago())
                .monto(pedido.getTotal())
                .build();
        pedido.setPayment(pago);

        // Descontar stock de cada producto
        carrito.getItems().forEach(item -> {
            Product producto = item.getProduct();
            producto.setStock(producto.getStock() - item.getCantidad());
            if (producto.isStockBajo()) {
                eventPublisher.publishEvent(new StockLowEvent(this, producto));
            }
        });

        Order pedidoGuardado = orderRepository.save(pedido);

        // Registrar historial de estado inicial
        registrarHistorial(pedidoGuardado, "PENDIENTE", "Pedido creado");

        // Limpiar carrito tras el pedido exitoso
        carritoService.limpiarCarrito(userId);

        // Publicar evento de dominio
        eventPublisher.publishEvent(new OrderCreatedEvent(this, pedidoGuardado));

        log.info("Pedido #{} creado para usuario {}", pedidoGuardado.getId(), userId);
        return mapearAResponse(pedidoGuardado);
    }

    @Override
    @Transactional
    public PedidoResponse checkout(Long userId, PedidoRequest request) {
        Order pedido = construirPedidoDesdeItems(userId, request.getAddressId(), request.getItems(), request.getNotas());
        User user = new User();
        user.setId(userId);
        pedido.setUser(user);

        if (request.getPaypalOrderId() != null && !request.getPaypalOrderId().isBlank()) {
            if (paymentRepository.existsByReferenciaExterna(request.getPaypalOrderId())) {
                throw new ReglaNegocioException("Este pago de PayPal ya fue procesado anteriormente");
            }
            payPalService.verificarOrden(request.getPaypalOrderId(), pedido.getTotal());
        }

        Payment pago = Payment.builder()
                .order(pedido)
                .metodo(request.getMetodoPago() != null ? request.getMetodoPago() : "PAYPAL")
                .referenciaExterna(request.getPaypalOrderId())
                .monto(pedido.getTotal())
                .estado("APROBADO")
                .fechaPago(java.time.LocalDateTime.now())
                .build();
        pedido.setPayment(pago);

        request.getItems().forEach(itemReq -> {
            Product producto = productRepository.findById(itemReq.getProductoId()).orElseThrow();
            producto.setStock(producto.getStock() - itemReq.getCantidad());
            productRepository.save(producto);
            if (producto.isStockBajo()) {
                eventPublisher.publishEvent(new StockLowEvent(this, producto));
            }
        });

        Order pedidoGuardado = orderRepository.save(pedido);
        registrarHistorial(pedidoGuardado, "CONFIRMADO", "Pago recibido vía PayPal");
        eventPublisher.publishEvent(new OrderCreatedEvent(this, pedidoGuardado));
        log.info("Checkout #{} completado para usuario {}", pedidoGuardado.getId(), userId);
        return mapearAResponse(pedidoGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PedidoResponse> listarPedidosUsuario(Long userId, int pagina, int tamano) {
        Page<Order> page = orderRepository.findByUserIdOrderByFechaPedidoDesc(userId, PageRequest.of(pagina, tamano));
        return construirPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedido(Long pedidoId, Long userId) {
        Order pedido = orderRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));

        boolean esAdmin = userRepository.findById(userId)
                .map(u -> u.getRoles().stream().anyMatch(r -> r.getNombre().equals("ROLE_ADMIN")))
                .orElse(false);

        if (!esAdmin && !pedido.getUser().getId().equals(userId)) {
            throw new AccesoDenegadoException("No tienes acceso a este pedido");
        }

        return mapearAResponse(pedido);
    }

    @Override
    @Transactional
    public PedidoResponse cambiarEstado(Long pedidoId, String nuevoEstado, String comentario) {
        Order pedido = orderRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));

        OrderStatus estadoNuevo;
        try {
            estadoNuevo = OrderStatus.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ReglaNegocioException("Estado inválido: " + nuevoEstado);
        }

        validarTransicionEstado(pedido.getEstado(), estadoNuevo);

        if (estadoNuevo == OrderStatus.ENVIADO) {
            pedido.setFechaEnvio(java.time.LocalDateTime.now());
        } else if (estadoNuevo == OrderStatus.ENTREGADO) {
            pedido.setFechaEntrega(java.time.LocalDateTime.now());
            if (pedido.getPayment() != null) {
                pedido.getPayment().setEstado("APROBADO");
                pedido.getPayment().setFechaPago(java.time.LocalDateTime.now());
            }
        }

        pedido.setEstado(estadoNuevo);
        orderRepository.save(pedido);
        registrarHistorial(pedido, estadoNuevo.name(), comentario);
        log.info("Pedido #{} cambió a estado: {}", pedidoId, estadoNuevo);
        return mapearAResponse(pedido);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PedidoResponse> listarTodos(String estado, int pagina, int tamano) {
        Page<Order> page;
        if (estado != null && !estado.isBlank()) {
            OrderStatus orderStatus = OrderStatus.valueOf(estado.toUpperCase());
            page = orderRepository.findByEstadoOrderByFechaPedidoDesc(orderStatus, PageRequest.of(pagina, tamano));
        } else {
            page = orderRepository.findAll(PageRequest.of(pagina, tamano,
                    org.springframework.data.domain.Sort.by("fechaPedido").descending()));
        }
        return construirPageResponse(page);
    }

    /**
     * Valida que la transición de estado sea permitida según las reglas del
     * negocio
     */
    private void validarTransicionEstado(OrderStatus actual, OrderStatus nuevo) {
        boolean valida = switch (actual) {
            case PENDIENTE ->
                nuevo == OrderStatus.CONFIRMADO || nuevo == OrderStatus.CANCELADO;
            case CONFIRMADO ->
                nuevo == OrderStatus.ENVIADO || nuevo == OrderStatus.CANCELADO;
            case ENVIADO ->
                nuevo == OrderStatus.ENTREGADO;
            default ->
                false;
        };

        if (!valida) {
            throw new ReglaNegocioException(
                    "No se puede pasar de " + actual + " a " + nuevo);
        }
    }

    private PageResponse<PedidoResponse> construirPageResponse(Page<Order> page) {
        return PageResponse.<PedidoResponse>builder()
                .content(page.getContent().stream().map(this::mapearAResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .first(page.isFirst())
                .last(page.isLast())
                .size(page.getSize())
                .build();
    }

    private PedidoResponse mapearAResponse(Order o) {
        List<PedidoDetalleResponse> detalles = o.getDetalles().stream()
                .map(d -> PedidoDetalleResponse.builder()
                .productoId(d.getProduct().getId())
                .productoNombre(d.getProduct().getNombre())
                .imagenPrincipal(d.getProduct().getImagenPrincipal())
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotal(d.getSubtotal())
                .build())
                .collect(Collectors.toList());

        Address addr = o.getAddress();
        DireccionResponse direccion = DireccionResponse.builder()
                .id(addr.getId()).alias(addr.getAlias()).calle(addr.getCalle())
                .numero(addr.getNumero()).ciudad(addr.getCiudad())
                .departamento(addr.getDepartamento()).codigoPostal(addr.getCodigoPostal())
                .referencia(addr.getReferencia()).esPrincipal(addr.getEsPrincipal())
                .build();

        List<StatusHistoryResponse> historial = statusHistoryRepository.findByOrderIdOrderByFechaAsc(o.getId())
                .stream().map(h -> StatusHistoryResponse.builder()
                        .estado(h.getEstado())
                        .comentario(h.getComentario())
                        .fecha(h.getFecha())
                        .build())
                .collect(Collectors.toList());

        User usuario = o.getUser();

        return PedidoResponse.builder()
                .id(o.getId())
                .estado(o.getEstado().name())
                .subtotal(o.getSubtotal())
                .costoEnvio(o.getCostoEnvio())
                .total(o.getTotal())
                .notas(o.getNotas())
                .fechaPedido(o.getFechaPedido())
                .fechaEnvio(o.getFechaEnvio())
                .fechaEntrega(o.getFechaEntrega())
                .numeroSeguimiento(o.getNumeroSeguimiento())
                .direccion(direccion)
                .detalles(detalles)
                .metodoPago(o.getPayment() != null ? o.getPayment().getMetodo() : null)
                .estadoPago(o.getPayment() != null ? o.getPayment().getEstado() : null)
                .userId(usuario.getId())
                .userNombre(usuario.getNombreCompleto())
                .userEmail(usuario.getEmail())
                .userTelefono(usuario.getTelefono())
                .historialEstados(historial)
                .build();
    }

    @Override
    @Transactional
    public Order construirPedidoDesdeItems(Long userId, Long addressId, List<CarritoItemRequest> items, String notas) {
        if (items == null || items.isEmpty()) {
            throw new ReglaNegocioException("El pedido debe contener al menos un producto");
        }

        Address direccion = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Dirección", addressId));

        for (CarritoItemRequest itemReq : items) {
            Product producto = productRepository.findByIdAndActivoTrue(itemReq.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", itemReq.getProductoId()));

            if (producto.getStock() < itemReq.getCantidad()) {
                throw new ReglaNegocioException("Stock insuficiente para: " + producto.getNombre());
            }
        }

        List<OrderDetail> detalles = items.stream().map(itemReq -> {
            Product producto = productRepository.findById(itemReq.getProductoId()).orElseThrow();
            BigDecimal precio = producto.getPrecioOferta() != null ? producto.getPrecioOferta() : producto.getPrecio();
            BigDecimal itemSubtotal = precio.multiply(BigDecimal.valueOf(itemReq.getCantidad()));

            return OrderDetail.builder()
                    .product(producto)
                    .cantidad(itemReq.getCantidad())
                    .precioUnitario(precio)
                    .subtotal(itemSubtotal)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = detalles.stream()
                .map(OrderDetail::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costoEnvio = subtotal.compareTo(new BigDecimal("100000")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("15000");

        Order pedido = Order.builder()
                .subtotal(subtotal)
                .costoEnvio(costoEnvio)
                .total(subtotal.add(costoEnvio))
                .notas(notas)
                .build();

        detalles.forEach(d -> d.setOrder(pedido));
        pedido.setDetalles(detalles);

        return pedido;
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
