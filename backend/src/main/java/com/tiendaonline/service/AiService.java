package com.tiendaonline.service;

public interface AiService {
    String chat(String question);
    String chatWithContext(String question, String contextData);
    String chatConRol(String question, String contextData, AiRole role);
}
