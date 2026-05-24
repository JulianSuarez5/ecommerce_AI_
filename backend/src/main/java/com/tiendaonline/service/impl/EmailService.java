package com.tiendaonline.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Servicio de envío de correos usando Gmail SMTP.
 * Equivalente al clsN_Recursos.EnviarCorreo() de C#.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Envía un correo HTML.
     * @param destinatario email del destinatario
     * @param asunto       asunto del correo
     * @param cuerpoHtml   contenido HTML del correo
     * @return true si se envió correctamente
     */
    public boolean enviarCorreo(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setFrom("juakosuarez12@gmail.com");
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML

            mailSender.send(mensaje);
            log.info("Correo enviado a: {}", destinatario);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar correo a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }

    /**
     * Genera una contraseña temporal aleatoria de 8 caracteres.
     * Equivalente al GenerarClave() de C#.
     */
    public String generarClaveTemporal() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    /**
     * Envía correo de bienvenida al registrarse.
     */
    public void enviarBienvenida(String destinatario, String nombre) {
        String asunto = "¡Bienvenido a CENTROVA!";
        String cuerpo = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e1e1e; border-radius: 12px; overflow: hidden;">
              <div style="background: #141414; padding: 32px; text-align: center; border-bottom: 3px solid #e8c97e;">
                <h1 style="color: #e8c97e; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px;">CENTROVA</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #f0f0f0; margin: 0 0 8px; font-size: 20px;">¡Bienvenido, %s!</h2>
                <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6;">Tu cuenta ha sido creada exitosamente. Ya puedes explorar nuestro catálogo y hacer tus primeras compras.</p>
                <a href="http://localhost:3000" style="display: inline-block; background: #e8c97e; color: #141414; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; font-size: 14px;">
                  Ir a la tienda →
                </a>
              </div>
              <div style="background: #141414; padding: 16px 32px; text-align: center;">
                <p style="color: #686868; font-size: 11px; margin: 0;">© 2025 CENTROVA. Todos los derechos reservados.</p>
              </div>
            </div>
            """.formatted(nombre);

        enviarCorreo(destinatario, asunto, cuerpo);
    }

    /**
     * Envía correo de recuperación de contraseña con clave temporal.
     */
    public void enviarRecuperacionPassword(String destinatario, String nombre, String claveTemporal) {
        String asunto = "Recuperación de contraseña - CENTROVA";
        String resetLink = "http://localhost:3000/reset-password";
        String cuerpo = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e1e1e; border-radius: 12px; overflow: hidden;">
              <div style="background: #141414; padding: 32px; text-align: center; border-bottom: 3px solid #e8c97e;">
                <h1 style="color: #e8c97e; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px;">CENTROVA</h1>
                <p style="color: #f0f0f0; font-size: 14px; margin: 8px 0 0;">Recuperación de contraseña</p>
              </div>
              <div style="padding: 32px;">
                <p style="color: #f0f0f0; font-size: 15px;">Hola <strong style="color: #e8c97e;">%s</strong>,</p>
                <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6;">Hemos generado un código temporal para restablecer tu contraseña. Ingresa este código en la página de recuperación junto con tu nueva contraseña:</p>
                <div style="background: #141414; border: 2px dashed #e8c97e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #e8c97e; letter-spacing: 8px; font-family: monospace;">%s</span>
                </div>
                <p style="color: #686868; font-size: 13px;">Este código expira en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.</p>
                <a href="%s" style="display: inline-block; background: #e8c97e; color: #141414; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 16px; font-size: 14px;">
                  Restablecer contraseña →
                </a>
              </div>
              <div style="background: #141414; padding: 16px 32px; text-align: center;">
                <p style="color: #686868; font-size: 11px; margin: 0;">© 2025 CENTROVA. Todos los derechos reservados.</p>
              </div>
            </div>
            """.formatted(nombre, claveTemporal, resetLink);

        enviarCorreo(destinatario, asunto, cuerpo);
    }
}