package com.tiendaonline.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Se lanza cuando un recurso solicitado no existe en la base de datos. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String recurso, Long id) {
        super(recurso + " no encontrado con id: " + id);
    }
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
