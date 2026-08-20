# CENTROVA — Sistema de E-Commerce Profesional

Sistema completo de e-commerce construido con **Spring Boot 3.x** (backend) y **React 18 + Tailwind CSS** (frontend), usando **PostgresSQL** como base de datos.

---

## Arquitectura

```
├── backend/          # API REST (Spring Boot 3.2 + Java 21)
│   └── src/main/java/com/tiendaonline/
│       ├── entity/           # Entidades JPA
│       ├── repository/       # Interfaces Spring Data
│       ├── service/          # Contratos de servicio
│       ├── service/impl/     # Implementaciones
│       ├── controller/       # Controladores REST
│       ├── security/jwt/     # Filtro y utilidades JWT
│       ├── config/           # Security, CORS, Swagger, Web
│       ├── dto/              # Request / Response DTOs
│       ├── exception/        # Manejo global de errores
│       └── util/             # SecurityUtils
├── frontend/         # SPA React 18 + Tailwind CSS
│   └── src/
│       ├── components/       # Navbar, Footer, ProductCard, etc.
│       ├── pages/            # Vistas por rol (client / admin / auth)
│       ├── context/          # AuthContext, CartContext
│       ├── hooks/            # Custom hooks
│       └── utils/            # Formatters
└── database/
    └── 01_create_database.sql  # Script SQL Server completo
```

---

## Endpoints Principales

### Públicos
| Método | Ruta                          | Descripción                     |
|--------|-------------------------------|----------------------------------|
| POST   | /auth/login                   | Iniciar sesión                  |
| POST   | /auth/registro                | Registrar usuario               |
| POST   | /auth/recuperar-password      | Solicitar recuperación          |
| POST   | /auth/cambiar-password        | Cambiar contraseña con token    |
| GET    | /productos                    | Listar con filtros y paginación |
| GET    | /productos/{id}               | Detalle de producto             |
| GET    | /productos/destacados         | Productos destacados            |
| GET    | /categorias                   | Listar categorías               |
| POST   | /upload/imagen                | Subir imagen                    |
| GET    | /imagenes/{filename}          | Servir imagen estática          |

### Cliente (requiere JWT)
| Método | Ruta                          | Descripción             |
|--------|-------------------------------|--------------------------|
| GET    | /carrito                      | Ver carrito             |
| POST   | /carrito/items                | Agregar al carrito      |
| PUT    | /carrito/items/{id}           | Actualizar cantidad     |
| DELETE | /carrito/items/{id}           | Eliminar ítem           |
| POST   | /pedidos                      | Crear pedido            |
| GET    | /pedidos/mis-pedidos          | Mis pedidos             |
| GET    | /pedidos/{id}                 | Detalle de pedido       |
| GET    | /usuarios/perfil              | Ver perfil              |
| GET    | /usuarios/direcciones         | Mis direcciones         |
| POST   | /usuarios/direcciones         | Agregar dirección       |

### Admin (requiere JWT con ROLE_ADMIN)
| Método | Ruta                          | Descripción                 |
|--------|-------------------------------|-------------------------------|
| GET    | /admin/dashboard              | Métricas del panel          |
| POST   | /productos                    | Crear producto              |
| PUT    | /productos/{id}               | Actualizar producto         |
| DELETE | /productos/{id}               | Eliminar producto           |
| GET    | /pedidos/admin/todos          | Todos los pedidos           |
| GET    | /pedidos/admin/{id}           | Detalle de pedido (admin)   |
| PUT    | /pedidos/admin/{id}/estado    | Cambiar estado de pedido    |

---

## Modelo de Datos

```
users ──────── user_roles ─── roles
  │
  ├── addresses
  ├── cart ────── cart_items ─── products ─── categories
  └── orders ──── order_details             └── product_images
          │
          ├── payments
          └── order_status_history
```

---

## Decisiones Técnicas

| Decisión                     | Justificación                                                   |
|-------------------------------|-------------------------------------------------------------------|
| JWT Stateless                | Escalabilidad horizontal; sin estado de sesión en servidor      |
| Soft Delete                  | Preservar integridad histórica de pedidos                       |
| Carrito persistente (BD)     | Recuperación de carritos abandonados, multi-dispositivo         |
| Snapshot precio en pedido    | Integridad histórica ante cambios de catálogo                   |
| BCrypt cost=12               | Balance seguridad/performance en autenticación                  |
| Refresh Token                | Access token de corta vida (24h) + renovación automática (7d)   |
| PageResponse genérico        | DTO de paginación reutilizable en toda la API                   |
