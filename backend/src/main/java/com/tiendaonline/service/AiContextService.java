package com.tiendaonline.service;

import java.util.List;
import java.util.Map;

public interface AiContextService {
    String buildBusinessContext();
    String buildBusinessInfo();
    String buildBusinessStats();
    String buildInventoryAlerts();
    String buildClientContext(Long userId);
    List<Map<String, Object>> buildInsights();
}
