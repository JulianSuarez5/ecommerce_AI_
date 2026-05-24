# CHANGELOG — Refactorización Estructural CENTROVA

## [1.0.0] — 2026-05-24

### P0 — Seguridad Crítica

#### PayPal como Pasarela de Pagos
- **`PayPalConfig.java`** — Propiedades vía `@ConfigurationProperties` (client-id, client-secret, base-url).
- **`PayPalService.java`** — OAuth2 `client_credentials` + verificación de orden (`GET /v2/checkout/orders/{id}`). Valida status `APPROVED`/`COMPLETED` y monto contra total del pedido (COP→USD tasa 4000).
- **`application.yml`** + **`.env.example`** — Sección `paypal:` con variables de entorno.
- **`PedidoServiceImpl.checkout()`** — Invoca `payPalService.verificarOrden()` antes de aprobar pago.

#### JWT Reforzado
- **`JwtUtil.java`** — `obtenerClave()` simplificado con `Keys.hmacShaKeyFor()`. Nuevo `@PostConstruct init()` valida `jwtSecret.length() >= 32` en startup.

#### Token de Recuperación con Hash
- **`AuthServiceImpl.java`** — Almacena tokens SHA-256 (hash) en BD; envía token raw por email; hashea input antes de lookup en `cambiarPassword()`.
- **`01_create_database.sql`** — Comentario actualizado indicando hashing de tokens.

### P1 — Refactorización Backend (Clean Architecture / SRP)

#### Desacoplamiento de AdminController (clase monstruo eliminada)
- **`AdminController.java`** — ELIMINADO (246 líneas, 6 repositorios inyectados).
- **`AdminDashboardService.java`** + **`AdminDashboardServiceImpl.java`** — Métricas: órdenes hoy, ventas mes, productos agotados/stock-bajo, categorías más vendidas.
- **`AdminUserService.java`** + **`AdminUserServiceImpl.java`** — CRUD usuarios admin con creación atómica (User + Address + Cart).
- **`AdminDashboardController.java`** — Endpoints `GET /admin/dashboard`, `/admin/productos/agotados`, `/admin/productos/stock-bajo`.
- **`AdminUserController.java`** — Endpoints `GET/POST /admin/usuarios`, `GET /admin/usuarios/{id}`.
- **`AdminCompraController.java`** — Endpoints CRUD para `/admin/compras/**`.

#### Método Compartido de Construcción de Pedido
- **`PedidoService.java`** + **`PedidoServiceImpl.java`** — Método `construirPedidoDesdeItems()` validado (stock, subtotal, envío, total). Usado por `checkout()` e `iniciarPago()`.
- **`WompiService.java`** — Ya no duplica lógica; inyecta `PedidoService`. `procesarWebhook()` con `@Transactional` + re-throw para rollback automático.

#### MapStruct — Mappers
- **`ProductoMapper.java`** — `Product → ProductoResponse` con mappings a categoría, marca, imágenes, stock-bajo.
- **`CarritoMapper.java`** — `Cart/CartItem → CarritoResponse/CarritoItemResponse` con cálculo de subtotal/totalItems vía `default` methods.
- **`ProductoServiceImpl.java`** — Reemplazado método manual `mapearAResponse()` por `productoMapper::toResponse`.
- **`CarritoServiceImpl.java`** — Reemplazado método manual `mapearAResponse()` por `carritoMapper::toResponse`.

### P2 — Frontend y Calidad de Datos

#### Componente ProductCard Unificado
- **`components/ui/ProductCard.jsx`** — Único componente (skeleton, SafeImg, animaciones, hover con segunda imagen, badges, stock display).
- **`components/home/ProductCard.jsx`** — ELIMINADO (redundante).
- **`components/ui/ProductCardNew.jsx`** — ELIMINADO (redundante).
- **`FeaturedSection.jsx`** — Import actualizado a `../ui/ProductCard`.
- **`OffersSection.jsx`** — Import actualizado a `../ui/ProductCard`.
- **`CatalogoPageNew.jsx`** — Import actualizado a `../components/ui/ProductCard`.

#### Eliminación de localStorage Redundante
- **`AuthContext.jsx`** — Eliminado almacenamiento/limpieza de `to_token`/`to_user` (JWT ya en httpOnly cookie).
- **`axios.js`** — Eliminada limpieza de `to_token`/`to_user` en interceptor 401.

#### Sincronización Carrito Backend
- **`services/cartService.js`** — Nuevo: API calls (GET, POST, PUT, DELETE) del carrito.
- **`context/CartContext.jsx`** — Reescribito: sincroniza con backend cuando el usuario está autenticado; eventos `auth:login` migran carrito local al servidor; guest en localStorage.

### Cambios de Configuración
- **`application.yml`** — Nueva sección `paypal:`.
- **`.env.example`** — Variables `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_BASE_URL`.

### Deuda Técnica Identificada (futuros sprints)
- Tasa de cambio COP/USD hardcodeada (4000) en backend y frontend.
- `RestTemplate` creado por instancia en `PayPalService` y `WompiService` (migrar a beans singleton).
- Carrito sincronizado envía items uno por uno (considerar endpoint batch para > 20 items).
- `PedidoServiceImpl` y `CompraServiceImpl` aún usan mapeo manual (`mapearAResponse`); migrar a MapStruct.
- Sin tests unitarios para nuevos servicios/controladores.
- Migrar frontend a TypeScript.
