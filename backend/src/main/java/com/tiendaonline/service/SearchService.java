package com.tiendaonline.service;

public interface SearchService {
    /**
     * Busca información en tiempo real en internet basada en una consulta.
     * @param query Frase o pregunta a buscar.
     * @return Texto consolidado con los resultados de la búsqueda.
     */
    String searchWeb(String query);
}