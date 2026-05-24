package com.tiendaonline.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones.
 * Centraliza la gestión de errores y devuelve respuestas estructuradas y consistentes.
 * Evita que stacktraces o detalles internos lleguen al cliente.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Recurso no encontrado (404) */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleRecursoNoEncontrado(
            RecursoNoEncontradoException ex, WebRequest request) {
        log.warn("Recurso no encontrado: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    /** Violación de regla de negocio (400) */
    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> handleReglaNegocio(
            ReglaNegocioException ex, WebRequest request) {
        log.warn("Regla de negocio violada: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    /** Validación de campos (400) con detalle por campo */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidacion(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> erroresCampos = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            erroresCampos.put(campo, error.getDefaultMessage());
        });
        log.warn("Errores de validación: {}", erroresCampos);
        String detalles = erroresCampos.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Los datos enviados no son válidos");
        ErrorResponse respuesta = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Error de validación")
                .mensaje(detalles)
                .ruta(request.getDescription(false).replace("uri=", ""))
                .campos(erroresCampos)
                .build();
        return ResponseEntity.badRequest().body(respuesta);
    }

    /** Credenciales incorrectas (401) */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Credenciales inválidas", request);
    }

    /** Acceso denegado (403) */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, "No tiene permisos para realizar esta acción", request);
    }

    /** Cualquier otra excepción no controlada (500) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, WebRequest request) {
        log.error("Error inesperado: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ha ocurrido un error interno. Por favor intente más tarde.", request);
    }

    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status, String mensaje, WebRequest request) {
        ErrorResponse respuesta = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .mensaje(mensaje)
                .ruta(request.getDescription(false).replace("uri=", ""))
                .build();
        return ResponseEntity.status(status).body(respuesta);
    }
}
