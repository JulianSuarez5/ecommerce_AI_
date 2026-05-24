package com.tiendaonline.service.impl;

import com.tiendaonline.dto.request.ProductoRequest;
import com.tiendaonline.dto.response.PageResponse;
import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.entity.Brand;
import com.tiendaonline.entity.Category;
import com.tiendaonline.entity.Product;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.mapper.ProductoMapper;
import com.tiendaonline.repository.BrandRepository;
import com.tiendaonline.repository.CategoryRepository;
import com.tiendaonline.repository.ProductRepository;
import com.tiendaonline.service.ProductoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Lógica de negocio para el catálogo de productos. Gestión de stock, filtros de
 * búsqueda y operaciones CRUD del administrador.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductoMapper productoMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> listar(
            Long categoryId, BigDecimal precioMin, BigDecimal precioMax,
            String busqueda, boolean soloDisponible, int pagina, int tamano) {

        Page<Product> page = productRepository.buscarConFiltros(
                categoryId, precioMin, precioMax,
                (busqueda != null && !busqueda.isBlank()) ? busqueda.trim() : null,
                soloDisponible,
                PageRequest.of(pagina, tamano)
        );

        return PageResponse.<ProductoResponse>builder()
                .content(page.getContent().stream().map(productoMapper::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .first(page.isFirst())
                .last(page.isLast())
                .size(page.getSize())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductoResponse obtenerPorId(Long id) {
        Product product = productRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
        return productoMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("featuredProducts")
    public List<ProductoResponse> listarDestacados() {
        return productRepository.findByDestacadoTrueAndActivoTrueOrderByFechaCreacionDesc()
                .stream().map(productoMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    public ProductoResponse crear(ProductoRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new ReglaNegocioException("El SKU '" + request.getSku() + "' ya está en uso");
        }

        Category categoria = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Marca", request.getBrandId()));
        }

        Product producto = Product.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .descripcionCorta(request.getDescripcionCorta())
                .precio(request.getPrecio())
                .precioOferta(request.getPrecioOferta())
                .stock(request.getStock())
                .stockMinimo(request.getStockMinimo())
                .sku(request.getSku())
                .imagenPrincipal(request.getImagenPrincipal())
                .modelo3dUrl(request.getModelo3dUrl())
                .category(categoria)
                .brand(brand)
                .colores(request.getColores())
                .especificaciones(request.getEspecificaciones())
                .tags(request.getTags())
                .destacado(Boolean.TRUE.equals(request.getDestacado()))
                .build();

        producto = productRepository.save(producto);
        log.info("Producto creado: {} (SKU: {})", producto.getNombre(), producto.getSku());
        return productoMapper.toResponse(producto);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Product producto = productRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));

        Category categoria = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Marca", request.getBrandId()));
        }

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setDescripcionCorta(request.getDescripcionCorta());
        producto.setPrecio(request.getPrecio());
        producto.setPrecioOferta(request.getPrecioOferta());
        producto.setStock(request.getStock());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setImagenPrincipal(request.getImagenPrincipal());
        producto.setModelo3dUrl(request.getModelo3dUrl());
        producto.setCategory(categoria);
        producto.setBrand(brand);
        producto.setColores(request.getColores());
        producto.setEspecificaciones(request.getEspecificaciones());
        producto.setTags(request.getTags());
        producto.setDestacado(Boolean.TRUE.equals(request.getDestacado()));

        log.info("Producto actualizado: {}", id);
        return productoMapper.toResponse(productRepository.save(producto));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    public void eliminar(Long id) {
        Product producto = productRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
        producto.setActivo(false);
        productRepository.save(producto);
        log.info("Producto desactivado (soft delete): {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> listarAgotados() {
        return productRepository.findProductosAgotados()
                .stream().map(productoMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> listarConStockBajo() {
        return productRepository.findProductosConStockBajo()
                .stream().map(productoMapper::toResponse).collect(Collectors.toList());
    }

}
