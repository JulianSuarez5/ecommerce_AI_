package com.tiendaonline.config;

import com.tiendaonline.entity.*;
import com.tiendaonline.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Iniciando carga de datos iniciales ===");
        crearRoles();
        crearUsuarioAdmin();
        var juan = crearUsuarioCliente();
        crearProductosDePrueba();
        if (juan != null) {
            crearPedidoPendiente(juan);
        }
        log.info("=== Datos iniciales cargados correctamente ===");
    }

    private void crearRoles() {
        crearRolSiNoExiste("ROLE_ADMIN");
        crearRolSiNoExiste("ROLE_CLIENT");
    }

    private void crearRolSiNoExiste(String nombre) {
        if (roleRepository.findByNombre(nombre).isEmpty()) {
            roleRepository.save(Role.builder().nombre(nombre).build());
            log.info("Rol creado: {}", nombre);
        }
    }

    private void crearUsuarioAdmin() {
        Role rolAdmin = roleRepository.findByNombre("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN no encontrado"));

        Optional<User> existe = userRepository.findByEmail("admin@tienda.com");
        if (existe.isPresent()) {
            User admin = existe.get();
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRoles(new HashSet<>(Set.of(rolAdmin)));
            userRepository.save(admin);
            log.info("Admin actualizado con contrasena fresca");
            return;
        }

        User admin = User.builder()
                .nombre("Admin")
                .apellido("Tienda")
                .email("admin@tienda.com")
                .password(passwordEncoder.encode("Admin123!"))
                .roles(new HashSet<>(Set.of(rolAdmin)))
                .build();

        userRepository.save(admin);
        log.info("Usuario admin creado: admin@tienda.com / Admin123!");
    }

    private User crearUsuarioCliente() {
        Role rolCliente = roleRepository.findByNombre("ROLE_CLIENT")
                .orElseThrow(() -> new RuntimeException("ROLE_CLIENT no encontrado"));

        Optional<User> existe = userRepository.findByEmail("juan@cliente.com");
        if (existe.isPresent()) {
            User cliente = existe.get();
            cliente.setPassword(passwordEncoder.encode("Admin123!"));
            cliente.setRoles(new HashSet<>(Set.of(rolCliente)));
            userRepository.save(cliente);
            log.info("Cliente actualizado con contrasena fresca");

            if (cartRepository.findByUserId(cliente.getId()).isEmpty()) {
                Cart carrito = Cart.builder().user(cliente).build();
                cartRepository.save(carrito);
            }

            return cliente;
        }

        User cliente = User.builder()
                .nombre("Juan")
                .apellido("Cliente")
                .email("juan@cliente.com")
                .password(passwordEncoder.encode("Admin123!"))
                .roles(new HashSet<>(Set.of(rolCliente)))
                .build();

        cliente = userRepository.save(cliente);

        if (cartRepository.findByUserId(cliente.getId()).isEmpty()) {
            Cart carrito = Cart.builder().user(cliente).build();
            cartRepository.save(carrito);
        }

        log.info("Usuario cliente creado: juan@cliente.com / Admin123!");
        return cliente;
    }

    private void crearProductosDePrueba() {
        List<Product> conStockBajo = productRepository.findProductosConStockBajo();
        if (!conStockBajo.isEmpty()) {
            log.info("Ya existen {} productos con stock bajo, se omite creacion", conStockBajo.size());
            return;
        }

        List<Product> todos = productRepository.findAll();
        if (todos.isEmpty()) {
            log.warn("No hay productos en la BD, no se puede crear data de prueba");
            return;
        }

        for (int i = 0; i < todos.size() && i < 3; i++) {
            Product p = todos.get(i);
            int stockNuevo = switch (i) {
                case 0 -> 15;
                case 1 -> 8;
                case 2 -> 5;
                default -> 10;
            };
            int stockMinimo = switch (i) {
                case 0 -> 5;
                case 1 -> 3;
                case 2 -> 2;
                default -> 5;
            };
            p.setStock(stockNuevo);
            p.setStockMinimo(stockMinimo);
            productRepository.save(p);
            log.info("Producto '{}' actualizado: stock={}, minimo={}", p.getNombre(), stockNuevo, stockMinimo);
        }
    }

    private void crearPedidoPendiente(User juan) {
        long pendientes = orderRepository.countByEstado(OrderStatus.PENDIENTE);
        if (pendientes > 0) {
            log.info("Ya existen {} pedidos pendientes, se omite creacion", pendientes);
            return;
        }

        Optional<Address> dir = addressRepository.findByUserIdAndEsPrincipalTrue(juan.getId());
        if (dir.isEmpty()) {
            log.warn("Juan no tiene direccion principal, no se puede crear pedido");
            return;
        }

        // usar solo productos con stock >= 2 por si el trigger viejo aun existe
        List<Product> conStock = productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() >= 2)
                .toList();
        if (conStock.size() < 2) {
            log.warn("No hay suficientes productos con stock >= 2 para crear pedido");
            return;
        }

        Product p1 = conStock.get(0);
        Product p2 = conStock.get(1);
        BigDecimal precio1 = p1.getPrecioOferta() != null ? p1.getPrecioOferta() : p1.getPrecio();
        BigDecimal precio2 = p2.getPrecio();
        BigDecimal subtotal = precio1.add(precio2);
        BigDecimal envio = new BigDecimal("10.00");

        Order order = Order.builder()
                .user(juan)
                .address(dir.get())
                .estado(OrderStatus.PENDIENTE)
                .subtotal(subtotal)
                .costoEnvio(envio)
                .total(subtotal.add(envio))
                .notas("Pedido de prueba generado automaticamente")
                .build();

        OrderDetail d1 = OrderDetail.builder()
                .order(order)
                .product(p1)
                .cantidad(1)
                .precioUnitario(precio1)
                .subtotal(precio1)
                .build();

        OrderDetail d2 = OrderDetail.builder()
                .order(order)
                .product(p2)
                .cantidad(1)
                .precioUnitario(precio2)
                .subtotal(precio2)
                .build();

        order.setDetalles(List.of(d1, d2));
        order = orderRepository.save(order);

        OrderStatusHistory hist = OrderStatusHistory.builder()
                .order(order)
                .estado("PENDIENTE")
                .comentario("Pedido de prueba creado por DataInitializer")
                .build();
        orderStatusHistoryRepository.save(hist);

        log.info("Pedido pendiente de prueba #{} creado para Juan (${})", order.getId(), order.getTotal());
    }
}
