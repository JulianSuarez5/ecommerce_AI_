package com.tiendaonline.controller;

import com.tiendaonline.exception.ReglaNegocioException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/upload")
@Tag(name = "Archivos", description = "Subida y gestión de imágenes")
public class UploadController {

    @Value("${app.upload.dir:${user.home}/centrova/uploads}")
    private String uploadDir;

    @PostMapping("/imagen")
    @Operation(summary = "Subir una imagen")
    public ResponseEntity<Map<String, String>> subirImagen(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo.isEmpty()) {
            throw new ReglaNegocioException("El archivo está vacío");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ReglaNegocioException("Solo se permiten archivos de imagen");
        }

        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new ReglaNegocioException("El archivo no puede superar los 5MB");
        }

        try {
            String extension = obtenerExtension(contentType);
            String nombreArchivo = UUID.randomUUID().toString() + extension;

            Path directorio = Paths.get(uploadDir);
            Files.createDirectories(directorio);

            Path rutaDestino = directorio.resolve(nombreArchivo);
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            String url = "/api/imagenes/" + nombreArchivo;
            log.info("Imagen subida: {}", url);

            return ResponseEntity.ok(Map.of("url", url, "filename", nombreArchivo));
        } catch (IOException e) {
            log.error("Error al subir imagen: {}", e.getMessage());
            throw new ReglaNegocioException("Error al procesar la imagen");
        }
    }

    @PostMapping("/modelo")
    @Operation(summary = "Subir un modelo 3D (.glb / .gltf)")
    public ResponseEntity<Map<String, String>> subirModelo(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo.isEmpty()) {
            throw new ReglaNegocioException("El archivo está vacío");
        }

        String originalFilename = archivo.getOriginalFilename();
        if (originalFilename == null || !(originalFilename.toLowerCase().endsWith(".glb") || originalFilename.toLowerCase().endsWith(".gltf"))) {
            throw new ReglaNegocioException("Solo se permiten archivos .glb o .gltf");
        }

        if (archivo.getSize() > 50 * 1024 * 1024) {
            throw new ReglaNegocioException("El archivo no puede superar los 50MB");
        }

        try {
            String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String nombreArchivo = UUID.randomUUID().toString() + extension;

            Path directorio = Paths.get(uploadDir, "models");
            Files.createDirectories(directorio);

            Path rutaDestino = directorio.resolve(nombreArchivo);
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            String url = "/api/modelos/" + nombreArchivo;
            log.info("Modelo 3D subido: {}", url);

            return ResponseEntity.ok(Map.of("url", url, "filename", nombreArchivo));
        } catch (IOException e) {
            log.error("Error al subir modelo 3D: {}", e.getMessage());
            throw new ReglaNegocioException("Error al procesar el modelo 3D");
        }
    }

    private String obtenerExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            default -> ".jpg";
        };
    }
}
