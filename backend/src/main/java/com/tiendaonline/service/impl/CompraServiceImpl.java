package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.CompraRequest;
import com.tiendaonline.dto.response.CompraResponse;
import com.tiendaonline.dto.response.CompraResponse.EstadoRequest;
import com.tiendaonline.entity.*;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.*;
import com.tiendaonline.service.CompraService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderStatusHistoryRepository statusHistoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponse> listar() {
        return purchaseOrderRepository.findAllByOrderByFechaCreacionDesc()
                .stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponse> listarPorEstado(String estado) {
        PurchaseOrderStatus status;
        try { status = PurchaseOrderStatus.valueOf(estado.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new ReglaNegocioException("Estado inválido: " + estado); }
        return purchaseOrderRepository.findByEstadoOrderByFechaCreacionDesc(status)
                .stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompraResponse obtenerPorId(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden de compra", id));
        return mapearAResponse(order);
    }

    @Override
    @Transactional
    public CompraResponse crear(CompraRequest request, String emailUsuario) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", request.getSupplierId()));

        PurchaseOrder order = PurchaseOrder.builder()
                .supplier(supplier)
                .estado(PurchaseOrderStatus.PENDIENTE)
                .notas(request.getNotas())
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CompraRequest.Item itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", itemReq.getProductId()));

            BigDecimal subtotal = itemReq.getCostoUnitario().multiply(BigDecimal.valueOf(itemReq.getCantidad()));
            total = total.add(subtotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .product(product)
                    .cantidad(itemReq.getCantidad())
                    .costoUnitario(itemReq.getCostoUnitario())
                    .subtotal(subtotal)
                    .build();
            order.getItems().add(item);
        }
        order.setTotal(total);
        order = purchaseOrderRepository.save(order);

        registrarHistorial(order, PurchaseOrderStatus.PENDIENTE.name(), "Orden creada", emailUsuario);

        log.info("Orden de compra #{} creada con proveedor: {}, total: {}", order.getId(), supplier.getNombre(), total);
        return mapearAResponse(order);
    }

    @Override
    @Transactional
    public CompraResponse actualizarEstado(Long id, EstadoRequest request, String emailUsuario) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden de compra", id));

        PurchaseOrderStatus nuevoEstado;
        try { nuevoEstado = PurchaseOrderStatus.valueOf(request.getEstado().toUpperCase()); }
        catch (IllegalArgumentException e) { throw new ReglaNegocioException("Estado inválido: " + request.getEstado()); }

        validarTransicion(order.getEstado(), nuevoEstado);
        order.setEstado(nuevoEstado);

        if (nuevoEstado == PurchaseOrderStatus.RECIBIDO) {
            order.setFechaRecepcion(LocalDateTime.now());
            registrarEntradaInventario(order, emailUsuario);
        }

        order = purchaseOrderRepository.save(order);
        registrarHistorial(order, nuevoEstado.name(), request.getComentario(), emailUsuario);

        log.info("Orden de compra #{} cambió a: {}", order.getId(), nuevoEstado);
        return mapearAResponse(order);
    }

    private void validarTransicion(PurchaseOrderStatus actual, PurchaseOrderStatus nuevo) {
        if (actual == PurchaseOrderStatus.CANCELADO || actual == PurchaseOrderStatus.RECIBIDO) {
            throw new ReglaNegocioException("No se puede cambiar el estado de una orden " + actual);
        }
        if (actual == PurchaseOrderStatus.PENDIENTE && nuevo != PurchaseOrderStatus.CONFIRMADO && nuevo != PurchaseOrderStatus.CANCELADO) {
            throw new ReglaNegocioException("De PENDIENTE solo puede pasar a CONFIRMADO o CANCELADO");
        }
        if (actual == PurchaseOrderStatus.CONFIRMADO && nuevo != PurchaseOrderStatus.ENVIADO && nuevo != PurchaseOrderStatus.CANCELADO) {
            throw new ReglaNegocioException("De CONFIRMADO solo puede pasar a ENVIADO o CANCELADO");
        }
        if (actual == PurchaseOrderStatus.ENVIADO && nuevo != PurchaseOrderStatus.RECIBIDO && nuevo != PurchaseOrderStatus.CANCELADO) {
            throw new ReglaNegocioException("De ENVIADO solo puede pasar a RECIBIDO o CANCELADO");
        }
    }

    private void registrarEntradaInventario(PurchaseOrder order, String emailUsuario) {
        for (PurchaseOrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getCantidad());
            productRepository.save(product);

            InventoryMovement movimiento = InventoryMovement.builder()
                    .product(product)
                    .tipo("ENTRADA")
                    .cantidad(item.getCantidad())
                    .costoUnitario(item.getCostoUnitario())
                    .supplier(order.getSupplier())
                    .referencia("Orden de compra #" + order.getId())
                    .usuarioRegistro(emailUsuario)
                    .build();
            inventoryMovementRepository.save(movimiento);
        }
    }

    private void registrarHistorial(PurchaseOrder order, String estado, String comentario, String usuario) {
        PurchaseOrderStatusHistory historial = PurchaseOrderStatusHistory.builder()
                .purchaseOrder(order)
                .estado(estado)
                .comentario(comentario)
                .usuario(usuario)
                .build();
        statusHistoryRepository.save(historial);
    }

    private CompraResponse mapearAResponse(PurchaseOrder order) {
        List<CompraResponse.ItemResponse> items = order.getItems().stream().map(i ->
            CompraResponse.ItemResponse.builder()
                    .id(i.getId())
                    .productId(i.getProduct().getId())
                    .productNombre(i.getProduct().getNombre())
                    .productSku(i.getProduct().getSku())
                    .productImagen(i.getProduct().getImagenPrincipal())
                    .cantidad(i.getCantidad())
                    .costoUnitario(i.getCostoUnitario())
                    .subtotal(i.getSubtotal())
                    .build()
        ).collect(Collectors.toList());

        List<CompraResponse.StatusHistoryResponse> historial = statusHistoryRepository
                .findByPurchaseOrderIdOrderByFechaAsc(order.getId()).stream().map(h ->
                    CompraResponse.StatusHistoryResponse.builder()
                            .estado(h.getEstado())
                            .comentario(h.getComentario())
                            .usuario(h.getUsuario())
                            .fecha(h.getFecha())
                            .build()
        ).collect(Collectors.toList());

        return CompraResponse.builder()
                .id(order.getId())
                .supplierId(order.getSupplier().getId())
                .supplierNombre(order.getSupplier().getNombre())
                .estado(order.getEstado().name())
                .total(order.getTotal())
                .notas(order.getNotas())
                .fechaCreacion(order.getFechaCreacion())
                .fechaRecepcion(order.getFechaRecepcion())
                .items(items)
                .historial(historial)
                .build();
    }
}
