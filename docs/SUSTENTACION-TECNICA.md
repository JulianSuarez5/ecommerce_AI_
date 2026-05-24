# SUSTENTACIÓN TÉCNICA — CENTROVA E-COMMERCE

---

## 1. VISIÓN GENERAL

**CENTROVA** es una plataforma de comercio electrónico full-stack construida con **Spring Boot 3.3 (Java 21)** en el backend y **React 18 + Vite + Tailwind CSS 3** en el frontend, con base de datos **SQL Server 2019+**. Es una aplicación monolítica moderna con separación clara de responsabilidades, diseñada para ser modular, escalable y mantenible.

---

## 2. METODOLOGÍA ÁGIL

Se utilizó **SCRUM** como marco ágil de trabajo, con las siguientes prácticas:

- **Sprints de 1-2 semanas** con entregables funcionales al final de cada uno
- **Historias de usuario** para capturar requisitos desde la perspectiva del cliente y administrador
- **Daily standups** para sincronización del equipo
- **Sprint reviews** para demostrar funcionalidades completadas
- **Sprint retrospectives** para mejora continua del proceso

**Habilidad ágil clave: Desarrollo Iterativo e Incremental.** Cada funcionalidad (autenticación, carrito, catálogo 3D, dashboard, IA) se desarrolló como un incremento independiente, probado e integrado antes de pasar al siguiente. Esto permitió recibir feedback temprano y ajustar rumbo sin afectar funcionalidades existentes.

---

## 3. LENGUAJES Y TECNOLOGÍAS PRINCIPALES

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Backend** | Java | 21 | Lógica de negocio, APIs REST |
| **Backend Framework** | Spring Boot | 3.3.0 | Inversión de control, DI, seguridad, JPA |
| **Frontend** | JavaScript (ES Modules) | ECMAScript 2022 | UI/UX interactiva |
| **Frontend Framework** | React | 18.3.1 | Componentes reactivos, SPA |
| **Frontend Build** | Vite | 5.4.21 | Bundler ultrarrápido con HMR |
| **Estilos** | Tailwind CSS | 3.4.4 | CSS utility-first, responsive design |
| **Base de datos** | SQL Server | 2019+ | Persistencia transaccional |
| **ORM** | Hibernate / JPA | 6.x | Mapeo objeto-relacional |
| **API Documentation** | Swagger / OpenAPI | 2.3.0 | Documentación interactiva de APIs |

---

## 4. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (React SPA)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Auth     │  │ Catálogo │  │ Admin Dashboard   │  │
│  │ Context  │  │ + 3D     │  │ + Charts + AI     │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       └──────────────┼──────────────────┘             │
│                      │ Axios + JWT Interceptor        │
├──────────────────────┼────────────────────────────────┤
│              REST API (HTTP/JSON)                     │
├──────────────────────┼────────────────────────────────┤
│              SPRING BOOT BACKEND                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Security │  │ Services │  │ Controllers REST  │  │
│  │ Layer    │  │ Layer    │  │ Layer             │  │
│  ├──────────┤  ├──────────┤  ├───────────────────┤  │
│  │ JWT Auth │  │ Business │  │ DTOs / Mappers    │  │
│  │ Filter   │  │ Logic    │  │ MapStruct         │  │
│  └──────────┘  └────┬─────┘  └───────────────────┘  │
│                      │                                │
│              ┌───────┴────────┐                       │
│              │  JPA Repositorios                      │
│              │  (Spring Data) │                       │
│              └───────┬────────┘                       │
├──────────────────────┼────────────────────────────────┤
│         JDBC (HikariCP Pool)                          │
├──────────────────────┼────────────────────────────────┤
│              SQL SERVER 2019+                         │
│              ┌────────────────────┐                   │
│              │   CentrovaDB       │                   │
│              │   21 tablas        │                   │
│              └────────────────────┘                   │
└──────────────────────────────────────────────────────┘
```

**Patrón arquitectónico principal: Arquitectura en Capas (Layered Architecture)** con:

1. **Capa de Presentación** (Controllers REST) — Recibe peticiones HTTP, delega a servicios
2. **Capa de Negocio** (Services) — Contiene toda la lógica de negocio y reglas
3. **Capa de Persistencia** (Repositories) — Acceso a datos vía Spring Data JPA
4. **Capa de Base de Datos** — SQL Server con 21 tablas normalizadas

---

## 5. PATRONES DE DISEÑO IMPLEMENTADOS

### 5.1 Patrones de Creación

**DTO (Data Transfer Object) Pattern**
- *Dónde:* `backend/src/main/java/com/tiendaonline/dto/` (20 DTOs)
- *Por qué:* Separar la representación interna de las entidades JPA de los datos que viajan por la red. Evita exponer detalles de persistencia, lazy loading y serialización circular. Cada DTO se adapta específicamente a su caso de uso (request vs response).

**Builder Pattern**
- *Dónde:* `ErrorResponse.java` (uso del patrón builder manual), Lombok `@Builder` en varias entidades
- *Por qué:* Construir objetos complejos con múltiples campos opcionales de forma legible y segura.

**Singleton Pattern**
- *Dónde:* Beans de Spring (`@Service`, `@Repository`, `@Component`)
- *Por qué:* Spring maneja una única instancia por bean, compartida por toda la aplicación. Ahorro de memoria y consistencia.

### 5.2 Patrones Estructurales

**MVC (Model-View-Controller)**
- *Dónde:* Todo el backend (Entity = Model, Controller = Controller, Response DTOs = View)
- *Por qué:* Separación clara de responsabilidades. Los controladores manejan HTTP, los servicios contienen lógica, las entidades modelan datos.

**DAO (Data Access Object) Pattern**
- *Dónde:* `backend/src/main/java/com/tiendaonline/repository/` (15 interfaces)
- *Por qué:* Spring Data JPA implementa este pattern automáticamente. Cada repositorio encapsula el acceso a datos de una entidad, permitiendo cambiar la implementación de persistencia sin afectar el negocio.

**Adapter Pattern**
- *Dónde:* `SecurityConfig.java`, `CorsConfig.java`, `WebConfig.java`
- *Por qué:* Adaptan configuraciones de Spring Security, CORS y servidor web a los requisitos específicos de la aplicación sin acoplar el código de negocio a estos frameworks.

### 5.3 Patrones de Comportamiento

**Strategy Pattern**
- *Dónde:* `OrderStatus` enum, `PurchaseOrderStatus` enum
- *Por qué:* Cada estado representa una estrategia diferente de comportamiento. El flujo de pedidos (PENDIENTE → CONFIRMADO → ENVIADO → ENTREGADO) se modela como transiciones entre estrategias.

**Observer Pattern (Event-Driven)**
- *Dónde:* `OrderCreatedEvent`, `StockLowEvent`, `OrderEventListener`
- *Por qué:* Spring Events permiten que acciones secundarias (logging, notificaciones) ocurran como reacción a eventos del dominio sin acoplar el código principal. Cuando se crea una orden, el listener registra el evento sin que el servicio de pedidos tenga que saberlo.

**Template Method Pattern**
- *Dónde:* `JwtAuthenticationFilter` extiende `OncePerRequestFilter`
- *Por qué:* Spring Security define el esqueleto del filtro (template method) y nosotros implementamos solo la lógica específica (`doFilterInternal`).

**Chain of Responsibility Pattern**
- *Dónde:* Cadena de filtros en Spring Security
- *Por qué:* Cada filtro (autenticación JWT, rate limiting, CORS) maneja un aspecto específico de seguridad. Si no puede procesar la petición, la pasa al siguiente filtro.

### 5.4 Patrones de Arquitectura

**Inversión de Control (IoC) / Dependency Injection**
- *Dónde:* Toda la aplicación Spring Boot
- *Por qué:* Spring maneja el ciclo de vida de los objetos y sus dependencias. Los servicios no instancian sus repositorios — se los inyecta el contenedor. Esto facilita pruebas, desacoplamiento y mantenibilidad.

**Proxy Pattern**
- *Dónde:* `@Transactional`, `@Cacheable`
- *Por qué:* Spring crea proxies alrededor de los servicios para manejar transacciones y caché de forma transparente.

**Front Controller Pattern**
- *Dónde:* `DispatcherServlet` de Spring MVC
- *Por qué:* Todas las peticiones HTTP pasan por un controlador frontal centralizado que las dirige al handler adecuado.

**Facade Pattern**
- *Dónde:* `AiContextServiceImpl.java`
- *Por qué:* Oculta la complejidad de construir el contexto de negocio (múltiples consultas a diferentes repositorios) detrás de una interfaz simple: `buildBusinessContext()`.

---

## 6. COMUNICACIÓN FRONTEND-BACKEND

```
┌────────────────────────────────────────────────────────────┐
│                   COMUNICACIÓN API                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. El frontend (React) hace peticiones HTTP mediante Axios│
│ 2. El interceptor de Axios agrega automáticamente el      │
│    token JWT del localStorage al header Authorization     │
│ 3. Si el token expira (HTTP 401), el interceptor intenta  │
│    refrescarlo automáticamente usando el refresh token     │
│ 4. Spring Security valida el token en cada petición       │
│    mediante el JwtAuthenticationFilter                    │
│ 5. Si es válido, establece el contexto de seguridad       │
│ 6. El controller procesa la petición y devuelve JSON      │
│                                                            │
│ Métodos HTTP usados: GET, POST, PUT, DELETE, PATCH        │
│ Formato: application/json                                  │
│ Paginación: ?page=0&size=20 (Spring Pageable)             │
│ Errores: JSON consistente con {status, error, mensaje,    │
│          timestamp, ruta}                                 │
└────────────────────────────────────────────────────────────┘
```

**Flujo de autenticación JWT:**

```
Registro/Login → Backend valida credenciales → Genera JWT (24h) + Refresh Token (7d)
         ↓
Frontend almacena tokens en localStorage
         ↓
Cada petición → Axios interceptor agrega "Bearer <token>"
         ↓
JwtAuthenticationFilter valida firma HMAC-SHA256, expiración, email
         ↓
SecurityContextHolder.getContext().setAuthentication(authenticated)
         ↓
Controller puede acceder al usuario autenticado vía @AuthenticationPrincipal
```

---

## 7. CONEXIÓN A BASE DE DATOS

```
┌────────────────────────────────────────────────────────────┐
│                 CONEXIÓN A BASE DE DATOS                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Driver: Microsoft JDBC Driver para SQL Server              │
│ Pool: HikariCP (el pool de conexiones más rápido de Java) │
│                                                            │
│ Configuración del Pool:                                    │
│   ├─ Máximo de conexiones: 10                              │
│   ├─ Mínimo de conexiones inactivas: 5                     │
│   ├─ Timeout de conexión: 30 segundos                     │
│   └─ Timeout de idle: 10 minutos                          │
│                                                            │
│ JPA / Hibernate:                                           │
│   ├─ ddl-auto: update (esquema automático en desarrollo)   │
│   ├─ Dialect: SQLServerDialect                             │
│   ├─ Show SQL: true (DEBUG en desarrollo)                  │
│   └─ Formateo SQL: habilitado                             │
│                                                            │
│ La conexión se configura en application.yml:               │
│   spring.datasource.url: jdbc:sqlserver://localhost:1433;  │
│     databaseName=CentrovaDB                                │
│   spring.datasource.username: JulianSuarez                 │
│   spring.datasource.password: [variable de entorno]        │
│                                                            │
│ Cada repositorio (Spring Data JPA) hereda de               │
│ JpaRepository<T, ID> y obtiene automáticamente:            │
│   ├─ CRUD básico (save, findById, findAll, delete)        │
│   ├─ Paginación (findAll(Pageable))                       │
│   ├─ Queries derivadas del nombre del método              │
│   │   (findByEmailAndActivoTrue, countByEstado, etc.)    │
│   └─ Queries nativas (@Query con SQL nativo)              │
│       para reportes complejos (ingresosPorDia,             │
│       ventasPorCategoria, distribucionEstados)             │
└────────────────────────────────────────────────────────────┘
```

---

## 8. POR QUÉ SE USÓ CADA TECNOLOGÍA

| Tecnología | Decisión | Alternativa | Por qué esta |
|-----------|----------|-------------|--------------|
| **Spring Boot 3.3 + Java 21** | Backend | Node.js/Express, Django, Laravel | Ecosistema maduro para e-commerce, seguridad integrada (Spring Security), JPA maduro, tipado fuerte, rendimiento transaccional superior. Java 21 aporta records, pattern matching, virtual threads |
| **React 18** | Frontend | Angular, Vue, Svelte | Ecosistema más grande de componentes, React Three Fiber para 3D, hooks para estado complejo, curva de aprendizaje del equipo |
| **Vite** | Bundler | Webpack, CRA | HMR instantáneo, builds 10x más rápidos que Webpack, configuración cero para React |
| **SQL Server** | Base de datos | PostgreSQL, MySQL, MongoDB | Requisito del cliente/usuario final, integración con herramientas empresariales existentes |
| **Tailwind CSS** | Estilos | Bootstrap, Material UI, CSS Modules | Utility-first permite diseños únicos sin sobreescribir estilos de librerías, build con purga de CSS no usado, consistencia atómica |
| **Framer Motion** | Animaciones | CSS animations, GSAP | API declarativa para React, animate/presence, layout animations, scroll-linked animations |
| **JWT** | Autenticación | Sesiones con cookies, OAuth2 completo | Stateless, sin almacenamiento en servidor, portable entre servicios, ideal para SPA + API REST |
| **Chart.js** | Gráficos | Recharts, D3.js, ApexCharts | Ligero, reactivo con react-chartjs-2, suficiente para dashboards administrativos |
| **Groq AI** | Chatbot IA | OpenAI, Claude, Gemini | API de inferencia más rápida del mercado (hasta 10x), costos reducidos, baja latencia para chat en tiempo real |
| **@react-three/fiber** | 3D | Three.js puro, Babylon.js | API declarativa al estilo React para Three.js, integración con el ecosistema React (hooks, suspense, estado) |
| **Spline** | Robot 3D | Three.js, Blender + export | Herramienta visual de diseño 3D, exporta a React directamente, interacciones integradas (cursor follow) |
| **Lombok** | Boilerplate | Kotlin, record classes Java | Reduce el código repetitivo (getters, setters, constructores) en un 40%+ |
| **MapStruct** | Mapeo DTO | Manual, ModelMapper, Orika | Genera código en tiempo de compilación (sin reflexión), más rápido que ModelMapper, type-safe |
| **PayPal** | Pagos | Stripe, Mercado Pago, Transbank | Preferencia del cliente, cobertura internacional, SDK oficial para React |

---

## 9. PRINCIPIOS SOLID APLICADOS

**S — Single Responsibility:** Cada clase tiene una única razón de cambio. Los controladores solo manejan HTTP, los servicios solo lógica de negocio, los repos solo acceso a datos.

**O — Open/Closed:** Las entidades y servicios están abiertos a extensión (nuevos estados de orden, nuevos tipos de insight) pero cerrados a modificación. Se añaden comportamientos mediante nuevos enums, eventos y listeners.

**L — Liskov Substitution:** Las implementaciones de servicios (`CarritoServiceImpl`, `PedidoServiceImpl`) pueden reemplazar a sus interfaces sin afectar a los controladores que las usan.

**I — Interface Segregation:** 9 interfaces de servicio pequeñas y específicas (`AuthService`, `CarritoService`, `CompraService`, etc.) en lugar de un solo "God Service".

**D — Dependency Inversion:** Los controladores dependen de interfaces de servicio, no de implementaciones concretas. Spring DI inyecta la implementación en tiempo de ejecución.

---

## 10. SEGURIDAD

```
┌────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. CORS: Solo orígenes permitidos (localhost:3000, 3001)  │
│ 2. Rate Limiting: Máximo 5 intentos de login/minuto/IP    │
│ 3. JWT: Tokens firmados con HMAC-SHA256, expiración 24h   │
│ 4. BCrypt: Contraseñas hasheadas con costo 12             │
│    (~250ms por hash, computacionalmente costoso)          │
│ 5. Rutas protegidas por rol:                              │
│    ├─ /api/admin/** → solo ROLE_ADMIN                     │
│    ├─ /api/auth/** → público                              │
│    ├─ /api/productos/** → público (lectura)               │
│    ├─ /api/carrito/** → autenticado                       │
│    └─ /api/pedidos/** → autenticado + dueño del recurso  │
│ 6. Sanitización de inputs en frontend (regex)            │
│ 7. Validación con Bean Validation (@NotBlank, @Email...) │
│ 8. Manejo global de excepciones (GlobalExceptionHandler) │
│    con respuestas JSON consistentes                       │
└────────────────────────────────────────────────────────────┘
```

---

## 11. FUNCIONALIDADES DIFERENCIADORAS

1. **Visualización 3D de productos** con model-viewer de Google + Three.js
2. **Robot interactivo con Spline** en la página principal (sigue el cursor)
3. **Asistente IA con Groq** — chatbot con contexto de negocio para clientes y admin
4. **AI Insights** — panel de inteligencia de negocio con recomendaciones automáticas
5. **Scroll-telling hero** con animaciones 3D sincronizadas al scroll
6. **Catálogo predictivo** con búsqueda en vivo y filtros
7. **Carrito persistente** en base de datos (no solo localStorage)
8. **Dashboard administrativo** con métricas, gráficos y exportación a PDF/Excel
9. **Gestión de inventario** con movimientos, alertas de stock bajo y órdenes de compra a proveedores
10. **Flujo completo de pedidos** con historial de estados, tracking y notificaciones por email

---

## 12. MODELO DE DATOS (21 TABLAS)

```
users ──── user_roles ──── roles
  │
  ├── addresses
  ├── cart ──── cart_items ──── products
  ├── orders ──── order_details ──── products
  │     ├── order_status_history
  │     └── payments
  ├── password_reset_tokens
  │
categories ──── products ──── product_images
brands ──── products
                  │
                  ├── inventory_movements
                  ├── purchase_order_items ──── purchase_orders ──── suppliers
                  └── purchase_order_status_history
```

### Estructura de capas del backend

```
backend/src/main/java/com/tiendaonline/
├── config/              # Seguridad, CORS, Swagger, Web
├── controller/          # 12 controladores REST
├── dto/                 # 20 DTOs de request/response
├── entity/              # 21 entidades JPA
├── exception/           # Excepciones personalizadas + GlobalExceptionHandler
├── repository/          # 15 interfaces Spring Data JPA
├── security/            # JWT util, filtros, UserDetailsService
├── service/             # 9 interfaces + 8 implementaciones
└── events/              # Eventos de dominio + listeners
```

### Estructura del frontend

```
frontend/src/
├── api/                 # Axios instance + JWT interceptor
├── components/
│   ├── ui/              # Primitivas (Button, Input, Card, Modal, etc.)
│   ├── layout/          # Navbar, Footer
│   ├── admin/           # AdminSidebar, AIInsightsPanel
│   ├── scenes/          # ScrollytellingHero (Three.js)
│   └── ...              # SplineRobotIntro, AIChatModal, etc.
├── context/             # AuthContext, CartContext
├── hooks/               # useProducts, useCategories
├── pages/               # Home, Catálogo, Producto, Checkout, Admin...
└── utils/               # format, sanitize, placeholders, categoryAssets
```

---

## 13. PRUEBAS Y CALIDAD

- **Backend:** Pruebas unitarias con JUnit 5 + Mockito, perfil de test con H2 en memoria
- **Frontend:** Build con ESLint + Vite, purga de CSS no usado con Tailwind
- **Documentación:** Swagger UI en `/api/swagger-ui.html`, diagramas PlantUML en `/docs/`
- **Logging:** Logback con rotación de archivos, niveles DEBUG/INFO por paquete
- **Control de versiones:** Git con GitHub Actions para CI

---

## 14. CONCLUSIÓN

CENTROVA no es un e-commerce genérico. Es una plataforma que combina **arquitectura empresarial robusta** (Spring Boot, SQL Server, JWT, capas, DTOs, eventos) con **experiencias de usuario modernas** (3D, Spline, IA, scroll-telling, dark mode). Cada decisión técnica está justificada por un requisito concreto:

- La experiencia 3D existe porque queremos que los usuarios exploren productos como si los tuvieran en sus manos
- El chatbot con IA existe para reducir la carga del soporte humano
- Los patrones de diseño existen porque garantizan que el código sea mantenible cuando el proyecto crezca a 50,000 líneas
- La arquitectura en capas existe porque permite cambiar cualquier componente sin afectar al resto

La aplicación está construida para **crecer**: los eventos y listeners permiten añadir notificaciones sin tocar el core, los DTOs permiten cambiar la API sin romper el frontend, y los repositorios con Spring Data JPA permiten añadir consultas en una línea.
