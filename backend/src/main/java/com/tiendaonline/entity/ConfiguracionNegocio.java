package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_negocio")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionNegocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metodos_pago", length = 500)
    private String metodosPago;

    @Column(name = "politicas_envio", length = 2000)
    private String politicasEnvio;

    @Column(name = "politicas_devolucion", length = 2000)
    private String politicasDevolucion;

    @Column(name = "horario_atencion", length = 500)
    private String horarioAtencion;

    @Column(name = "telefono_contacto", length = 100)
    private String telefonoContacto;

    @Column(name = "email_contacto", length = 200)
    private String emailContacto;

    @Column(name = "direccion_tienda", length = 500)
    private String direccionTienda;

    @Column(name = "dias_entrega", length = 100)
    private String diasEntrega;

    @Column(name = "info_adicional", length = 3000)
    private String infoAdicional;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
}
