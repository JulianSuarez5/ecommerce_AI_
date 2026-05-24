package com.tiendaonline.mapper;

import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.entity.Product;
import com.tiendaonline.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductoMapper {

    @Mapping(target = "categoriaId", source = "category.id")
    @Mapping(target = "categoriaNombre", source = "category.nombre")
    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandNombre", source = "brand.nombre")
    @Mapping(target = "stockBajo", expression = "java(producto.getStock() != null && producto.getStock() <= (producto.getStockMinimo() != null ? producto.getStockMinimo() : 0))")
    @Mapping(target = "imagenes", source = "imagenes", qualifiedByName = "mapImagenes")
    @Mapping(target = "precioOferta", source = "precioOferta")
    ProductoResponse toResponse(Product producto);

    @Named("mapImagenes")
    default List<String> mapImagenes(List<ProductImage> imagenes) {
        if (imagenes == null) return Collections.emptyList();
        return imagenes.stream()
                .map(ProductImage::getUrl)
                .toList();
    }

    List<ProductoResponse> toResponseList(List<Product> productos);
}
