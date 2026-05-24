package com.tiendaonline;

import com.tiendaonline.dto.request.ProductoRequest;
import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.entity.Category;
import com.tiendaonline.entity.Product;
import com.tiendaonline.exception.RecursoNoEncontradoException;
import com.tiendaonline.exception.ReglaNegocioException;
import com.tiendaonline.repository.CategoryRepository;
import com.tiendaonline.repository.ProductRepository;
import com.tiendaonline.service.impl.ProductoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductoService - Pruebas unitarias")
class ProductoServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @InjectMocks private ProductoServiceImpl productoService;

    private ProductoRequest requestValido;
    private Category categoria;

    @BeforeEach
    void setUp() {
        categoria = Category.builder().id(1L).nombre("Electrónica").activo(true).build();
        requestValido = new ProductoRequest();
        requestValido.setNombre("Laptop Test");
        requestValido.setSku("LAP-TEST-001");
        requestValido.setPrecio(new BigDecimal("999.99"));
        requestValido.setStock(10);
        requestValido.setStockMinimo(3);
        requestValido.setCategoryId(1L);
        requestValido.setDestacado(false);
    }

    @Test
    @DisplayName("Crear producto exitosamente cuando SKU no existe")
    void crearProducto_skuNuevo_debeCrearCorrectamente() {
        when(productRepository.existsBySku("LAP-TEST-001")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductoResponse resp = productoService.crear(requestValido);

        assertThat(resp.getNombre()).isEqualTo("Laptop Test");
        assertThat(resp.getPrecio()).isEqualByComparingTo("999.99");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Crear producto falla cuando SKU duplicado")
    void crearProducto_skuDuplicado_debeArrojarReglaNegocio() {
        when(productRepository.existsBySku("LAP-TEST-001")).thenReturn(true);

        assertThatThrownBy(() -> productoService.crear(requestValido))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("SKU");

        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Obtener producto existente por ID")
    void obtenerPorId_existente_debeRetornarProducto() {
        Product producto = Product.builder()
                .id(1L).nombre("Laptop").precio(new BigDecimal("999")).stock(5)
                .sku("LAP-001").category(categoria).activo(true).destacado(false)
                .build();
        when(productRepository.findByIdAndActivoTrue(1L)).thenReturn(Optional.of(producto));

        ProductoResponse resp = productoService.obtenerPorId(1L);
        assertThat(resp.getId()).isEqualTo(1L);
        assertThat(resp.getNombre()).isEqualTo("Laptop");
    }

    @Test
    @DisplayName("Obtener producto inexistente lanza RecursoNoEncontrado")
    void obtenerPorId_inexistente_debeArrojarExcepcion() {
        when(productRepository.findByIdAndActivoTrue(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productoService.obtenerPorId(99L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    @DisplayName("Eliminar producto aplica soft delete")
    void eliminarProducto_existente_debeSoftDelete() {
        Product producto = Product.builder().id(1L).activo(true).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productRepository.save(any())).thenReturn(producto);

        productoService.eliminar(1L);

        assertThat(producto.getActivo()).isFalse();
        verify(productRepository, times(1)).save(producto);
    }
}
