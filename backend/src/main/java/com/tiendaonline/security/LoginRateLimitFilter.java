package com.tiendaonline.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
@Order(1)
@Slf4j
public class LoginRateLimitFilter implements Filter {

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = TimeUnit.MINUTES.toMillis(1);

    record Attempt(int count, long windowStart) {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI();

        if (path.equals("/auth/login") && "POST".equalsIgnoreCase(req.getMethod())) {
            String ip = req.getRemoteAddr();
            long now = System.currentTimeMillis();
            Attempt current = attempts.get(ip);

            if (current != null && (now - current.windowStart) < WINDOW_MS) {
                if (current.count >= MAX_ATTEMPTS) {
                    log.warn("Rate limit excedido para IP: {}", ip);
                    ((HttpServletResponse) response).sendError(429, "Demasiados intentos. Espera 1 minuto.");
                    return;
                }
                attempts.put(ip, new Attempt(current.count + 1, current.windowStart));
            } else {
                attempts.put(ip, new Attempt(1, now));
            }
        }

        chain.doFilter(request, response);
    }
}
