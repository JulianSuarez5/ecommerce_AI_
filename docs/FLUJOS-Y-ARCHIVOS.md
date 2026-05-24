# FLUJOS DE CLIENTE Y ADMIN — MAPEO COMPLETO DE ARCHIVOS

---

## ÍNDICE DE ENDPOINTS API

| Método | Ruta | Controlador | Propósito |
|--------|------|-------------|-----------|
| POST | `/api/auth/login` | AuthController | Iniciar sesión |
| POST | `/api/auth/registro` | AuthController | Registrar usuario |
| POST | `/api/auth/recuperar-password` | AuthController | Solicitar reset de contraseña |
| POST | `/api/auth/cambiar-password` | AuthController | Cambiar contraseña con token |
| GET | `/api/productos` | ProductoController | Listar productos (paginado + filtros) |
| GET | `/api/productos/{id}` | ProductoController | Detalle de producto |
| GET | `/api/productos/destacados` | ProductoController | Productos destacados |
| POST | `/api/productos` | ProductoController | Crear producto (admin) |
| PUT | `/api/productos/{id}` | ProductoController | Actualizar producto (admin) |
| DELETE | `/api/productos/{id}` | ProductoController | Eliminar producto (admin) |
| GET | `/api/categorias` | CategoriaController | Listar categorías |
| GET | `/api/brands` | BrandController | Listar marcas |
| GET | `/api/carrito` | CarritoController | Ver carrito |
| POST | `/api/carrito/items` | CarritoController | Agregar item al carrito |
| PUT | `/api/carrito/items/{id}` | CarritoController | Actualizar cantidad |
| DELETE | `/api/carrito/items/{id}` | CarritoController | Eliminar item del carrito |
| POST | `/api/pedidos` | PedidoController | Crear pedido (desde carrito) |
| GET | `/api/pedidos/mis-pedidos` | PedidoController | Pedidos del cliente |
| GET | `/api/pedidos/{id}` | PedidoController | Detalle del pedido |
| GET | `/api/pedidos/admin/todos` | PedidoController | Todos los pedidos (admin) |
| PUT | `/api/pedidos/{id}/estado` | PedidoController | Cambiar estado (admin) |
| GET | `/api/pedidos/{id}/historial` | PedidoController | Historial de estados |
| GET | `/api/pedidos/exportar/pdf` | PedidoController | Exportar pedidos a PDF |
| GET | `/api/admin/dashboard` | AdminController | Métricas del dashboard |
| GET | `/api/admin/usuarios` | AdminController | Listar usuarios (admin) |
| POST | `/api/admin/usuarios` | AdminController | Crear usuario (admin) |
| PUT | `/api/admin/usuarios/{id}` | AdminController | Editar usuario (admin) |
| GET | `/api/admin/productos/agotados` | AdminController | Productos sin stock |
| GET | `/api/admin/productos/stock-bajo` | AdminController | Productos con stock bajo |
| POST | `/api/ai/chat` | AiController | Chat con IA (Groq) |
| GET | `/api/ai/contexto-cliente` | AiController | Contexto del cliente para IA |
| GET | `/api/ai/contexto-negocio` | AiController | Contexto del negocio para IA |
| GET | `/api/ai/insights` | AiController | Insights automáticos |
| GET | `/api/upload` | UploadController | Subir imágenes |
| GET | `/api/inventory` | InventoryController | Movimientos de inventario |
| GET | `/api/suppliers` | SupplierController | CRUD proveedores |
| GET | `/api/compras` | CompraService (via AdminController) | Órdenes de compra |
| GET | `/api/usuarios/perfil` | UsuarioController | Perfil del usuario |
| PUT | `/api/usuarios/perfil` | UsuarioController | Actualizar perfil |
| GET | `/api/usuarios/direcciones` | UsuarioController | Direcciones del usuario |
| POST | `/api/usuarios/direcciones` | UsuarioController | Agregar dirección |

---

## FLUJO 1: REGISTRO DE CLIENTE

```
RegistroPage.jsx
  ↓ usuario llena formulario (nombre, email, password)
  ↓ api.post('/auth/registro', datos)
  ↓
AuthController.java (/auth/registro)
  ↓ valida datos con @Valid
  ↓
AuthServiceImpl.java
  ↓ verifica que email no exista
  ↓ encode password con BCrypt (costo 12)
  ↓ crea User + asigna ROLE_CLIENT
  ↓
UserRepository.java
  ↓ save(user)
  ↓
AuthServiceImpl.java
  ↓ genera JWT (24h) + refresh token (7d)
  ↓
AuthController.java
  ↓ responde con { token, userId, nombre, email, roles }
  ↓
RegistroPage.jsx
  ↓ AuthContext.registro() → guarda token en localStorage('to_token')
  ↓ guarda user en localStorage('to_user')
  ↓ redirige a home
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `RegistroPage.jsx` | `frontend/src/pages/RegistroPage.jsx` | Formulario de registro |
| `AuthContext.jsx` | `frontend/src/context/AuthContext.jsx` | Estado global de auth + registro() |
| `axios.js` | `frontend/src/api/axios.js` | Petición HTTP con interceptor JWT |
| `AuthController.java` | `backend/.../controller/AuthController.java` | Endpoint REST |
| `AuthServiceImpl.java` | `backend/.../service/impl/AuthServiceImpl.java` | Lógica de registro |
| `User.java` | `backend/.../entity/User.java` | Entidad JPA |
| `Role.java` | `backend/.../entity/Role.java` | Entidad rol |
| `UserRepository.java` | `backend/.../repository/UserRepository.java` | Persistencia |
| `RoleRepository.java` | `backend/.../repository/RoleRepository.java` | Buscar rol por nombre |
| `JwtUtil.java` | `backend/.../security/jwt/JwtUtil.java` | Generar token JWT |
| `RegistroRequest.java` | `backend/.../dto/request/RegistroRequest.java` | DTO de entrada |
| `AuthResponse.java` | `backend/.../dto/response/AuthResponse.java` | DTO de respuesta |

---

## FLUJO 2: LOGIN / AUTENTICACIÓN

```
LoginPageNew.jsx
  ↓ usuario ingresa email + password
  ↓ api.post('/auth/login', credentials)
  ↓
AuthController.java (/auth/login)
  ↓
AuthServiceImpl.java
  ↓ AuthenticationManager.authenticate()
  ↓ UserDetailsServiceImpl carga usuario por email
  ↓ verifica BCryptPasswordEncoder.matches()
  ↓
JwtUtil.java
  ↓ genera accessToken (exp: 24h) + refreshToken (exp: 7d)
  ↓
AuthController.java → responde con tokens + datos usuario
  ↓
AuthContext.jsx (login())
  ↓ guarda to_token + to_user en localStorage
  ↓ setUser() + setToken() → React re-renderiza
  ↓
  A partir de aquí, CADA petición axios:
  ↓
axios.js (request interceptor)
  ↓ lee to_token de localStorage
  ↓ agrega header "Authorization: Bearer <token>"
  ↓
JwtAuthenticationFilter.java (en cada request)
  ↓ extrae token del header
  ↓ valida firma con HMAC-SHA256
  ↓ verifica expiración
  ↓ extrae email del subject
  ↓
UserDetailsServiceImpl.java
  ↓ carga usuario desde DB
  ↓
SecurityContextHolder.getContext().setAuthentication()
  ↓
Si token expira → 401 → axios response interceptor
  ↓ borra localStorage → redirige a /login
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `LoginPageNew.jsx` | `frontend/src/pages/LoginPageNew.jsx` | Formulario login |
| `AuthContext.jsx` | `frontend/src/context/AuthContext.jsx` | login() + estado global |
| `axios.js` | `frontend/src/api/axios.js` | Interceptor JWT (request + response) |
| `AuthController.java` | `backend/.../controller/AuthController.java` | Endpoint /auth/login |
| `AuthServiceImpl.java` | `backend/.../service/impl/AuthServiceImpl.java` | Lógica de autenticación |
| `UserDetailsServiceImpl.java` | `backend/.../security/service/UserDetailsServiceImpl.java` | Carga usuario para Spring Security |
| `JwtUtil.java` | `backend/.../security/jwt/JwtUtil.java` | Generación y validación de tokens |
| `JwtAuthenticationFilter.java` | `backend/.../security/jwt/JwtAuthenticationFilter.java` | Filtro que intercepta cada request |
| `LoginRateLimitFilter.java` | `backend/.../security/LoginRateLimitFilter.java` | Límite de 5 intentos/minuto por IP |
| `SecurityConfig.java` | `backend/.../config/SecurityConfig.java` | Configura rutas públicas/protegidas |
| `User.java` | `backend/.../entity/User.java` | Entidad con credenciales |
| `LoginRequest.java` | `backend/.../dto/request/LoginRequest.java` | DTO email + password |
| `App.jsx` | `frontend/src/App.jsx` | Protección de rutas con ProtectedRoute |

---

## FLUJO 3: RECUPERACIÓN DE CONTRASEÑA

```
ForgotPasswordPage.jsx
  ↓ usuario ingresa email
  ↓ api.post('/auth/recuperar-password', { email })
  ↓
AuthController.java
  ↓
AuthServiceImpl.java
  ↓ busca usuario por email
  ↓ genera token único UUID
  ↓ guarda PasswordResetToken (expira en 1h)
  ↓
EmailService.java
  ↓ envía email vía Gmail SMTP con link:
    http://localhost:3000/reset-password?token=xxx
  ↓
Usuario hace clic en el link →
ResetPasswordPage.jsx
  ↓ usuario ingresa nueva contraseña
  ↓ api.post('/auth/cambiar-password', { token, password })
  ↓
AuthController.java
  ↓
AuthServiceImpl.java
  ↓ valida token (existencia, no expirado, no usado)
  ↓ actualiza password con BCrypt
  ↓ marca token como usado
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `ForgotPasswordPage.jsx` | `frontend/src/pages/ForgotPasswordPage.jsx` | Solicitar reset |
| `ResetPasswordPage.jsx` | `frontend/src/pages/ResetPasswordPage.jsx` | Cambiar contraseña |
| `PasswordResetToken.java` | `backend/.../entity/PasswordResetToken.java` | Entidad token |
| `PasswordResetTokenRepository.java` | `backend/.../repository/PasswordResetTokenRepository.java` | Persistencia de tokens |
| `EmailService.java` | `backend/.../service/impl/EmailService.java` | Envío de emails SMTP |

---

## FLUJO 4: CATÁLOGO Y BÚSQUEDA

```
CatalogoPageNew.jsx
  ↓
  useEffect al montar:
  ↓ api.get('/productos', { params: { page, size, sort, categoria, precioMin, precioMax, search } })
  ↓
ProductoController.java (/api/productos)
  ↓
ProductoServiceImpl.java
  ↓ construye Specification dinámica con criterios:
    - categoriaId, precioMin/Max, search (nombre), tags, color, destacado
  ↓
ProductRepository.java
  ↓ findAll(spec, pageable) → Page<Product>
  ↓
ProductoServiceImpl.java
  ↓ convierte cada Product → ProductoResponse (incluye precioEfectivo, imágenes)
  ↓
ProductoController.java
  ↓ responde PageResponse<ProductoResponse>
  ↓
CatalogoPageNew.jsx
  ↓ renderiza grid de ProductCardNew
  ↓ cada card muestra: imagen, nombre, precio, badge oferta, rating
  ↓
  Al hacer clic en "Agregar al carrito":
  ↓ ProductCardNew.jsx → CartContext.addItem(product)
  ↓ api.post('/carrito/items', { productId, cantidad: 1 })
```

**Componente de búsqueda predictiva:**
```
PredictiveSearch.jsx (en NavbarNew)
  ↓ usuario escribe → debounce 300ms
  ↓ api.get('/productos', { params: { search: texto, page: 0, size: 5 } })
  ↓ muestra dropdown con sugerencias en vivo
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `CatalogoPageNew.jsx` | `frontend/src/pages/CatalogoPageNew.jsx` | Página principal del catálogo |
| `ProductCardNew.jsx` | `frontend/src/components/ui/ProductCardNew.jsx` | Card individual de producto |
| `PredictiveSearch.jsx` | `frontend/src/components/ui/PredictiveSearch.jsx` | Búsqueda en vivo |
| `NavbarNew.jsx` | `frontend/src/components/layout/NavbarNew.jsx` | Navbar con search + carrito |
| `useProducts.js` | `frontend/src/hooks/useProducts.js` | Hook para lista de productos |
| `useCategories.js` | `frontend/src/hooks/useCategories.js` | Hook para categorías |
| `ProductoController.java` | `backend/.../controller/ProductoController.java` | Endpoints CRUD productos |
| `ProductoServiceImpl.java` | `backend/.../service/impl/ProductoServiceImpl.java` | Lógica con filtros |
| `ProductRepository.java` | `backend/.../repository/ProductRepository.java` | JPA + queries nativas |
| `Product.java` | `backend/.../entity/Product.java` | Entidad (21 campos) |
| `ProductImage.java` | `backend/.../entity/ProductImage.java` | Imágenes del producto |
| `Category.java` | `backend/.../entity/Category.java` | Categoría con jerarquía |
| `Brand.java` | `backend/.../entity/Brand.java` | Marca del producto |
| `ProductoResponse.java` | `backend/.../dto/response/ProductoResponse.java` | DTO de respuesta |

---

## FLUJO 5: DETALLE DE PRODUCTO + VISTA 3D

```
ProductoPage.jsx
  ↓ recibe id de la URL: /producto/:id
  ↓ api.get(`/productos/${id}`)
  ↓
ProductoController.java
  ↓
ProductoServiceImpl.java
  ↓ busca producto por id, lanza RecursoNoEncontradoException si no existe
  ↓
ProductoPage.jsx
  ↓ renderiza:
    - Galería de imágenes (ProductImage)
    - Información del producto (nombre, precio, descripción)
    - Selector de color (ColorSelector.jsx)
    - Selector de cantidad (QuantitySelector.jsx)
    - Vista 3D (ModelViewer3D.jsx) si tiene modelo3dUrl
    - Botón "Agregar al carrito"
  ↓
  Si el producto tiene modelo3dUrl:
  ↓
ModelViewer3D.jsx
  ↓ usa <model-viewer> web component de Google
  ↓ carga el GLB desde modelo3dUrl
  ↓ permite rotación 360°, zoom, auto-rotate
  ↓
  Si NO tiene modelo 3D:
  ↓
ImmersiveProductViewer.jsx
  ↓ vista 360 con imágenes del producto
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `ProductoPage.jsx` | `frontend/src/pages/ProductoPage.jsx` | Página detalle del producto |
| `ModelViewer3D.jsx` | `frontend/src/components/ui/ModelViewer3D.jsx` | Visor 3D con model-viewer |
| `ImmersiveProductViewer.jsx` | `frontend/src/components/ui/ImmersiveProductViewer.jsx` | Vista 360 sin modelo 3D |
| `ColorSelector.jsx` | `frontend/src/components/ui/ColorSelector.jsx` | Selector de color |
| `QuantitySelector.jsx` | `frontend/src/components/ui/QuantitySelector.jsx` | Selector de cantidad |
| `categoryAssets.js` | `frontend/src/utils/categoryAssets.js` | Modelos 3D por categoría |

---

## FLUJO 6: CARRITO DE COMPRAS

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DEL CARRITO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. ProductCardNew.jsx / ProductoPage.jsx                        │
│    → onClick "Agregar al carrito"                               │
│    → CartContext.addItem(product, cantidad)                     │
│    → api.post('/carrito/items', { productId, cantidad })        │
│    → toast.success("Producto agregado al carrito")              │
│                                                                 │
│ 2. CarritoController.java (/api/carrito/items)                  │
│    → obtiene usuario autenticado del SecurityContext             │
│                                                                 │
│ 3. CarritoServiceImpl.java                                      │
│    → busca o crea Cart para el usuario                          │
│    → verifica stock disponible                                  │
│    → si el producto ya está en el carrito, suma cantidad        │
│    → si no, crea nuevo CartItem                                 │
│    → recalcula precioUnitario (toma precioOferta si aplica)     │
│                                                                 │
│ 4. CartRepository.java → save(cart)                             │
│                                                                 │
│ 5. SlideCart.jsx (sidebar lateral)                              │
│    → muestra items del carrito con imagen, nombre, cantidad     │
│    → botones + / - para ajustar cantidad                        │
│    → botón eliminar item                                        │
│    → total calculado en tiempo real                             │
│    → botón "Ir al carrito" → CarritoPage.jsx                    │
│                                                                 │
│ 6. CarritoPage.jsx (página completa)                            │
│    → lista todos los items                                       │
│    → resumen con subtotal, envío, total                         │
│    → botón "Proceder al pago" → CheckoutPage.jsx                │
│                                                                 │
│ Al actualizar cantidad:                                         │
│   CartContext.updateItem(id, cantidad)                          │
│   → api.put(`/carrito/items/${itemId}`, { cantidad })           │
│                                                                 │
│ Al eliminar item:                                               │
│   CartContext.removeItem(id)                                    │
│   → api.delete(`/carrito/items/${itemId}`)                     │
└─────────────────────────────────────────────────────────────────┘
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `CartContext.jsx` | `frontend/src/context/CartContext.jsx` | Estado global del carrito + sync con backend |
| `SlideCart.jsx` | `frontend/src/components/ui/SlideCart.jsx` | Sidebar del carrito |
| `CarritoPage.jsx` | `frontend/src/pages/CarritoPage.jsx` | Página completa del carrito |
| `CarritoController.java` | `backend/.../controller/CarritoController.java` | Endpoints REST |
| `CarritoServiceImpl.java` | `backend/.../service/impl/CarritoServiceImpl.java` | Lógica de negocio |
| `Cart.java` | `backend/.../entity/Cart.java` | Entidad carrito (1:1 con User) |
| `CartItem.java` | `backend/.../entity/CartItem.java` | Item del carrito |
| `CartRepository.java` | `backend/.../repository/CartRepository.java` | Persistencia |

---

## FLUJO 7: CHECKOUT Y PAGO

```
CheckoutPage.jsx
  ↓ verifica: autenticado + carrito no vacío
  ↓ usuario llena: nombre, dirección, ciudad, teléfono
  ↓ selecciona método de pago: "tarjeta" o "paypal"
  ↓
  onClick "Confirmar pedido":
  ↓ api.post('/pedidos', {
       direccionEntrega: { ...form },
       metodoPago: metodo
     })
  ↓
PedidoController.java (/api/pedidos)
  ↓
PedidoServiceImpl.java
  ↓ 1. Obtiene carrito del usuario
  ↓ 2. Valida stock de CADA producto
  ↓ 3. Crea entidad Order (estado: PENDIENTE)
  ↓ 4. Crea OrderDetail por cada item (snapshot de precios)
  ↓ 5. Crea Payment según método
  ↓ 6. Registra OrderStatusHistory ("Pedido creado")
  ↓ 7. Publica OrderCreatedEvent (→ OrderEventListener.java → log)
  ↓ 8. Verifica stock bajo → publica StockLowEvent si aplica
  ↓ 9. Vacía el carrito
  ↓ 10. Descuenta stock de cada producto
  ↓
PedidoController.java → responde con PedidoResponse
  ↓
CheckoutPage.jsx
  ↓ redirige a OrderConfirmationPage.jsx con el ID del pedido

  Si método = "paypal":
  ↓ se integra @paypal/react-paypal-js
  ↓ PaymentPage.jsx maneja el flujo de PayPal
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `CheckoutPage.jsx` | `frontend/src/pages/CheckoutPage.jsx` | Formulario de checkout |
| `PaymentPage.jsx` | `frontend/src/pages/PaymentPage.jsx` | Pago con PayPal |
| `OrderConfirmationPage.jsx` | `frontend/src/pages/OrderConfirmationPage.jsx` | Confirmación post-pago |
| `PedidoController.java` | `backend/.../controller/PedidoController.java` | Endpoint crear pedido |
| `PedidoServiceImpl.java` | `backend/.../service/impl/PedidoServiceImpl.java` | Lógica completa del pedido |
| `Order.java` | `backend/.../entity/Order.java` | Entidad pedido |
| `OrderDetail.java` | `backend/.../entity/OrderDetail.java` | Detalle del pedido (snapshot) |
| `OrderStatus.java` | `backend/.../entity/OrderStatus.java` | Enum: PENDIENTE, CONFIRMADO, ENVIADO, ENTREGADO, CANCELADO |
| `OrderStatusHistory.java` | `backend/.../entity/OrderStatusHistory.java` | Historial de cambios de estado |
| `Payment.java` | `backend/.../entity/Payment.java` | Entidad pago |
| `Address.java` | `backend/.../entity/Address.java` | Dirección de envío |
| `OrderCreatedEvent.java` | `backend/.../event/OrderCreatedEvent.java` | Evento de dominio |
| `StockLowEvent.java` | `backend/.../event/StockLowEvent.java` | Evento stock bajo |
| `OrderEventListener.java` | `backend/.../event/OrderEventListener.java` | Listener de eventos |
| `PedidoRequest.java` | `backend/.../dto/request/PedidoRequest.java` | DTO de entrada |
| `PedidoResponse.java` | `backend/.../dto/response/PedidoResponse.java` | DTO de respuesta |

---

## FLUJO 8: SEGUIMIENTO DE PEDIDOS (CLIENTE)

```
MisPedidosPage.jsx
  ↓ useEffect:
  ↓ api.get('/pedidos/mis-pedidos', { params: { page, size } })
  ↓
PedidoController.java
  ↓ obtiene usuario autenticado
  ↓
PedidoServiceImpl.java
  ↓ OrderRepository.findByUserIdOrderByFechaPedidoDesc()
  ↓
MisPedidosPage.jsx
  ↓ renderiza lista de pedidos con:
    - número de seguimiento
    - fecha
    - total
    - badge con estado (color según estado)
    - link a detalle

  Al hacer clic en un pedido →
PedidoClienteDetailPage.jsx
  ↓ api.get(`/pedidos/${id}`)
  ↓
PedidoController.java
  ↓ verifica que el pedido pertenezca al usuario autenticado
  ↓
PedidoClienteDetailPage.jsx
  ↓ muestra:
    - productos del pedido (imagen, nombre, cantidad, precio)
    - historial de estados (OrderStatusHistory)
    - información de pago
    - dirección de envío
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `MisPedidosPage.jsx` | `frontend/src/pages/MisPedidosPage.jsx` | Lista de pedidos del cliente |
| `PedidoClienteDetailPage.jsx` | `frontend/src/pages/PedidoClienteDetailPage.jsx` | Detalle del pedido |
| `OrderRepository.java` | `backend/.../repository/OrderRepository.java` | Queries de pedidos |
| `OrderStatusHistoryRepository.java` | `backend/.../repository/OrderStatusHistoryRepository.java` | Historial de estados |

---

## FLUJO 9: SPLINE ROBOT 3D (HOME)

```
HomePage.jsx
  ↓ importa e inserta <SplineRobotIntro />
  ↓
SplineRobotIntro.jsx
  ↓ Detecta si es mobile con useMediaQuery('(max-width: 768px)')
  ↓
  Si es MOBILE:
  ↓   Muestra imagen estática (FALLBACK_IMG.webp)
  ↓
  Si es DESKTOP:
  ↓   useInView con margin '200px' (carga diferida / lazy loading)
  ↓   Cuando entra en viewport → monta <Spline scene={SPLINE_URL}>
  ↓
  @splinetool/react-spline
  ↓   Descarga el scene.splinecode desde:
      https://prod.spline.design/3c3rOBJxzYuK8lDA/scene.splinecode
  ↓   Renderiza el canvas 3D con el robot
  ↓
  Al cargar (onLoad):
  ↓   Agrega event listener de mousemove
  ↓   Calcula posición relativa del mouse (x, y normalizado 0-1)
  ↓   Emite evento 'mouseMove' al Spline scene
  ↓
  El robot (modelado en Spline Editor) tiene un evento de mouse
  que hace que la cabeza siga la posición del cursor
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `SplineRobotIntro.jsx` | `frontend/src/components/ui/SplineRobotIntro.jsx` | Componente del robot 3D |
| `HomePage.jsx` | `frontend/src/pages/HomePage.jsx` | Página principal que lo importa |
| `@splinetool/react-spline` | `node_modules/` | SDK React de Spline |

---

## FLUJO 10: CHATBOT IA (CLIENTE)

```
AIChatModal.jsx
  ↓ Botón flotante (bg-teal-500, bottom-6 right-6)
  ↓ onClick → abre modal (390px, fixed)
  ↓
  Al abrir:
  ↓ api.get('/ai/contexto-cliente')
  ↓
AiController.java
  ↓
AiContextServiceImpl.java
  ↓ buildClientContext():
    - obtiene usuario autenticado
    - busca sus pedidos recientes
    - busca items en su carrito
    - construye string de contexto
  ↓
  El contexto se pasa al chat para respuestas personalizadas
  ↓
  Usuario escribe pregunta →
  ↓ api.post('/ai/chat', { question, contextData })
  ↓
AiController.java
  ↓
AiServiceImpl.java
  ↓ construye prompt con contexto del negocio
  ↓ llama a API de Groq (LLM) con el prompt
  ↓ recibe respuesta en texto
  ↓
AiController.java → responde { response: "..." }
  ↓
AIChatModal.jsx
  ↓ renderiza burbuja del asistente
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `AIChatModal.jsx` | `frontend/src/components/ui/AIChatModal.jsx` | Modal del chat flotante |
| `AiController.java` | `backend/.../controller/AiController.java` | Endpoints de IA |
| `AiServiceImpl.java` | `backend/.../service/impl/AiServiceImpl.java` | Llamada a Groq API |
| `AiContextServiceImpl.java` | `backend/.../service/impl/AiContextServiceImpl.java` | Construcción de contexto |

---

## FLUJO 11: ADMIN — LAYOUT Y PROTECCIÓN

```
App.jsx (router)
  ↓ Ruta: /admin/* envuelta en:
    <ProtectedRoute roles={['ROLE_ADMIN']}>
      <AdminLayout>
        <AdminPage />
      </AdminLayout>
    </ProtectedRoute>
  ↓
ProtectedRoute.jsx (en App.jsx)
  ↓ si no autenticado → redirige a /login
  ↓ si autenticado pero no tiene ROLE_ADMIN → redirige a /
  ↓ si autenticado + admin → renderiza children
  ↓
AdminLayout.jsx (en App.jsx)
  ↓ estructura:
    <div class="flex min-h-screen bg-gradient...">
      <AdminSidebar />         ← sidebar fijo (w-64)
      <main class="flex-1 ml-64 p-6 lg:p-8">
        <AnimatedPage>         ← animación de entrada
          {children}
        </AnimatedPage>
      </main>
    </div>
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `App.jsx` | `frontend/src/App.jsx` | Definición de rutas + AdminLayout + ProtectedRoute |
| `AdminSidebar.jsx` | `frontend/src/components/admin/AdminSidebar.jsx` | Sidebar de navegación admin |

---

## FLUJO 12: ADMIN — DASHBOARD

```
DashboardPage.jsx
  ↓ useEffect al montar:
  ↓ api.get('/admin/dashboard')
  ↓
AdminController.java (/api/admin/dashboard)
  ↓
  Construye DashboardMetricasResponse con:
  ↓
  OrderRepository.calcularVentasMensuales()
  ↓ total ventas del mes actual
  ↓
  OrderRepository.countByFechaPedidoBetween()
  ↓ total ventas del mes anterior (para calcular cambio %)
  ↓
  OrderRepository.ingresosPorDia()
  ↓ datos para el gráfico de línea (últimos 14 días)
  ↓
  OrderRepository.ventasPorCategoria()
  ↓ datos para el gráfico de barras
  ↓
  OrderRepository.distribucionEstados()
  ↓ datos para el gráfico de donut
  ↓
  ProductRepository.countByStockLessThanEqual()
  ↓ productos agotados + stock bajo
  ↓
  UserRepository.countByRolesNombreAndActivoTrue()
  ↓ clientes activos
  ↓
  UserRepository.countByFechaRegistroBetween()
  ↓ nuevos clientes del mes
  ↓
AdminController.java → responde DashboardMetricasResponse
  ↓
DashboardPage.jsx
  ↓ renderiza:
    - 4 tarjetas de métricas (ventas, ingresos, clientes, pedidos)
    - AIInsightsPanel
    - Gráfico de líneas (Chart.js) → ingresos diarios
    - Gráfico de barras (Chart.js) → ventas por categoría
    - Gráfico de donut (Chart.js) → distribución de pedidos
    - 4 tarjetas pequeñas (agotados, stock bajo, nuevos clientes, pedidos mes)
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `DashboardPage.jsx` | `frontend/src/pages/admin/DashboardPage.jsx` | Página del dashboard |
| `AIInsightsPanel.jsx` | `frontend/src/components/admin/AIInsightsPanel.jsx` | Panel de insights + chat IA admin |
| `AdminController.java` | `backend/.../controller/AdminController.java` | Endpoint /admin/dashboard |
| `OrderRepository.java` | `backend/.../repository/OrderRepository.java` | Queries complejas (ingresosPorDia, etc.) |
| `DashboardMetricasResponse.java` | `backend/.../dto/response/DashboardMetricasResponse.java` | DTO con datos anidados |
| `Chart.js` | `node_modules/` | Librería de gráficos |

---

## FLUJO 13: ADMIN — GESTIÓN DE PRODUCTOS

```
ProductosAdminPage.jsx
  ↓ useEffect:
  ↓ api.get('/productos', { params: { page, size, sort } })
  ↓ api.get('/categorias')
  ↓ api.get('/brands')
  ↓
  Renderiza tabla con todos los productos
  ↓
  Crear producto:
  ↓ Modal con formulario (nombre, sku, precio, stock, categoría, marca, etc.)
  ↓ ImageUploader.jsx para subir imagen principal
  ↓ ModelUploader.jsx para subir modelo 3D GLB
  ↓ api.post('/productos', productoRequest)
  ↓
  Editar producto:
  ↓ api.put(`/productos/${id}`, productoRequest)
  ↓
  Eliminar producto:
  ↓ confirm → api.delete(`/productos/${id}`)
  ↓ (soft delete: activo = false)
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `ProductosAdminPage.jsx` | `frontend/src/pages/admin/ProductosAdminPage.jsx` | CRUD productos admin |
| `ImageUploader.jsx` | `frontend/src/components/ui/ImageUploader.jsx` | Subida de imágenes |
| `ModelUploader.jsx` | `frontend/src/components/ui/ModelUploader.jsx` | Subida de modelos 3D |
| `UploadController.java` | `backend/.../controller/UploadController.java` | Manejo de archivos subidos |

---

## FLUJO 14: ADMIN — GESTIÓN DE PEDIDOS

```
PedidosAdminPage.jsx
  ↓ useEffect:
  ↓ api.get('/pedidos/admin/todos', { params: { pagina, tamano, estado } })
  ↓
PedidoController.java (/pedidos/admin/todos)
  ↓
PedidoServiceImpl.java
  ↓ OrderRepository.findAll(Pageable) (filtrado por estado si aplica)
  ↓
PedidosAdminPage.jsx
  ↓ tabla con: ID, cliente, fecha, total, estado, acciones
  ↓ filtro por estado (Select)
  ↓ búsqueda por término

  Al hacer clic en un pedido →
PedidoDetailAdminPage.jsx
  ↓ api.get(`/pedidos/${id}`)
  ↓ api.get(`/pedidos/${id}/historial`)
  ↓
  Muestra:
    - información del cliente
    - productos del pedido
    - totales
    - historial de cambios de estado
    - selector para cambiar estado (PENDIENTE → CONFIRMADO → ENVIADO → ENTREGADO)
  ↓
  Al cambiar estado:
  ↓ api.put(`/pedidos/${id}/estado`, { estado: "ENVIADO", comentario: "..." })
  ↓
PedidoController.java
  ↓
PedidoServiceImpl.java
  ↓ valida transición de estado permitida
  ↓ actualiza Order.estado
  ↓ crea OrderStatusHistory
  ↓ si estado = ENVIADO → asigna numSeguimiento
  ↓ si estado = ENTREGADO → registra fechaEntrega

  Exportar a PDF:
  ↓ api.get('/pedidos/exportar/pdf', { params: { estado, fechaDesde, fechaHasta } })
  ↓ genera PDF con jsPDF
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `PedidosAdminPage.jsx` | `frontend/src/pages/admin/PedidosAdminPage.jsx` | Lista de pedidos admin |
| `PedidoDetailAdminPage.jsx` | `frontend/src/pages/admin/PedidoDetailAdminPage.jsx` | Detalle + cambio de estado |
| `OrderStatusHistory.java` | `backend/.../entity/OrderStatusHistory.java` | Entidad historial |

---

## FLUJO 15: ADMIN — GESTIÓN DE USUARIOS

```
UsuariosAdminPage.jsx
  ↓ useEffect:
  ↓ api.get('/admin/usuarios', { params: { page, size } })
  ↓
AdminController.java (/admin/usuarios)
  ↓
UserRepository.findAll(Pageable)
  ↓
UsuariosAdminPage.jsx
  ↓ tabla con: nombre, email, roles, activo, fecha registro
  ↓
  Crear usuario:
  ↓ modal → api.post('/admin/usuarios', { nombre, email, password, roles })
  ↓
  Editar usuario:
  ↓ modal → api.put(`/admin/usuarios/${id}`, { nombre, email, roles, activo })
```

---

## FLUJO 16: ADMIN — GESTIÓN DE CATEGORÍAS Y MARCAS

```
CategoriasAdminPage.jsx
  ↓ api.get('/categorias')
  ↓ CRUD con modal: nombre, descripción, imagen, categoría padre
  ↓ api.post/put/delete → CategoriaController

MarcasAdminPage.jsx
  ↓ api.get('/brands')
  ↓ CRUD con modal: nombre, descripción, logo
  ↓ api.post/put/delete → BrandController
```

---

## FLUJO 17: ADMIN — ÓRDENES DE COMPRA Y PROVEEDORES

```
ProveedoresAdminPage.jsx
  ↓ CRUD de proveedores (Supplier)
  ↓ api.get/post/put → SupplierController

ComprasAdminPage.jsx / CompraDetailAdminPage.jsx
  ↓ Órdenes de compra a proveedores (PurchaseOrder)
  ↓
CompraServiceImpl.java
  ↓ crea orden de compra con items
  ↓ al recibir (ENTREGADO) → genera InventoryMovement de ENTRADA
  ↓ actualiza stock de productos
```

**Archivos involucrados:**
| Archivo | Ruta | Rol |
|---------|------|-----|
| `CompraServiceImpl.java` | `backend/.../service/impl/CompraServiceImpl.java` | Lógica de órdenes de compra |
| `PurchaseOrder.java` | `backend/.../entity/PurchaseOrder.java` | Orden de compra |
| `PurchaseOrderItem.java` | `backend/.../entity/PurchaseOrderItem.java` | Items de la orden |
| `Supplier.java` | `backend/.../entity/Supplier.java` | Proveedor |
| `InventoryMovement.java` | `backend/.../entity/InventoryMovement.java` | Movimiento de inventario |

---

## FLUJO 18: ADMIN — INVENTARIO

```
InventarioAdminPage.jsx
  ↓ api.get('/productos', { params: { page, size, sort: 'stock_asc' } })
  ↓ api.get('/admin/productos/agotados')
  ↓ api.get('/admin/productos/stock-bajo')
  ↓ api.get('/inventory', { params: { page, size } })
  ↓
  Muestra:
  - tabla de productos con stock
  - alertas de productos agotados y stock bajo
  - historial de movimientos de inventario
  - exportación a Excel (xlsx)
```

---

## FLUJO 19: ADMIN — AI INSIGHTS

```
AIInsightsPanel.jsx (dentro del Dashboard)
  ↓ useEffect:
  ↓ api.get('/ai/insights')
  ↓ api.get('/ai/contexto-negocio')
  ↓
AiController.java
  ↓
AiContextServiceImpl.java
  ↓ buildBusinessContext():
    - ventas del mes
    - productos agotados
    - stock bajo
    - pedidos pendientes
    - clientes nuevos
    - construye string de contexto
  ↓
  Insights se generan del lado del backend
  combinando datos del dashboard con lógica de negocio
  ↓
  Chat IA dentro del panel:
  ↓ api.post('/ai/chat', { question, contextData })
  ↓ mismo flujo que el chat de cliente, pero con contexto de negocio
```

---

## FLUJO 20: EXPORTACIÓN PDF / EXCEL

```
Exportación PDF (Pedidos):
  ↓ api.get('/pedidos/exportar/pdf', { params, responseType: 'blob' })
  ↓ backend genera PDF con jsPDF (librería Java iText alternativa)
  ↓ frontend descarga el blob como archivo

Exportación Excel (Inventario):
  ↓ frontend genera Excel con librería xlsx
  ↓ toma datos del estado y genera .xlsx
  ↓ descarga directa desde el navegador
```

---

## ESTRUCTURA COMPLETA DE ARCHIVOS DEL PROYECTO

### Backend (72 archivos fuente)

```
backend/src/main/java/com/tiendaonline/
├── TiendaOnlineApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── WebConfig.java
│   ├── SwaggerConfig.java
│   └── DataInitializer.java
├── controller/
│   ├── AuthController.java
│   ├── ProductoController.java
│   ├── CarritoController.java
│   ├── PedidoController.java
│   ├── AdminController.java
│   ├── AiController.java
│   ├── CategoriaController.java
│   ├── BrandController.java
│   ├── InventoryController.java
│   ├── SupplierController.java
│   ├── UploadController.java
│   └── UsuarioController.java
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegistroRequest.java
│   │   ├── ProductoRequest.java
│   │   ├── PedidoRequest.java
│   │   ├── CarritoItemRequest.java
│   │   ├── DireccionRequest.java
│   │   ├── CompraRequest.java
│   │   └── AdminUserRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── ProductoResponse.java
│       ├── PedidoResponse.java
│       ├── PedidoDetalleResponse.java
│       ├── CarritoResponse.java
│       ├── CarritoItemResponse.java
│       ├── UsuarioResponse.java
│       ├── DireccionResponse.java
│       ├── CompraResponse.java
│       ├── DashboardMetricasResponse.java
│       ├── PageResponse.java
│       └── StatusHistoryResponse.java
├── entity/
│   ├── User.java
│   ├── Role.java
│   ├── Product.java
│   ├── ProductImage.java
│   ├── Category.java
│   ├── Brand.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   ├── OrderDetail.java
│   ├── OrderStatus.java (enum)
│   ├── OrderStatusHistory.java
│   ├── Payment.java
│   ├── Address.java
│   ├── PasswordResetToken.java
│   ├── Supplier.java
│   ├── InventoryMovement.java
│   ├── PurchaseOrder.java
│   ├── PurchaseOrderItem.java
│   ├── PurchaseOrderStatus.java (enum)
│   └── PurchaseOrderStatusHistory.java
├── event/
│   ├── OrderCreatedEvent.java
│   ├── StockLowEvent.java
│   └── OrderEventListener.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ErrorResponse.java
│   ├── RecursoNoEncontradoException.java
│   ├── ReglaNegocioException.java
│   └── AccesoDenegadoException.java
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── ProductRepository.java
│   ├── ProductImageRepository.java
│   ├── CategoryRepository.java
│   ├── BrandRepository.java
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   ├── OrderRepository.java
│   ├── OrderStatusHistoryRepository.java
│   ├── PaymentRepository.java
│   ├── AddressRepository.java
│   ├── PasswordResetTokenRepository.java
│   ├── SupplierRepository.java
│   ├── InventoryMovementRepository.java
│   ├── PurchaseOrderRepository.java
│   └── PurchaseOrderStatusHistoryRepository.java
├── security/
│   ├── jwt/
│   │   ├── JwtUtil.java
│   │   └── JwtAuthenticationFilter.java
│   ├── service/
│   │   └── UserDetailsServiceImpl.java
│   └── LoginRateLimitFilter.java
├── service/
│   ├── AuthService.java
│   ├── ProductoService.java
│   ├── CarritoService.java
│   ├── PedidoService.java
│   ├── CompraService.java
│   ├── UsuarioService.java
│   ├── AiService.java
│   ├── AiContextService.java
│   └── impl/
│       ├── AuthServiceImpl.java
│       ├── ProductoServiceImpl.java
│       ├── CarritoServiceImpl.java
│       ├── PedidoServiceImpl.java
│       ├── CompraServiceImpl.java
│       ├── AiServiceImpl.java
│       ├── AiContextServiceImpl.java
│       └── EmailService.java
└── util/
    └── SecurityUtils.java
```

### Frontend (45+ archivos fuente)

```
frontend/src/
├── App.jsx (router + layouts + protected routes)
├── main.jsx (entry point)
├── index.css (Tailwind + variables CSS)
├── api/
│   └── axios.js (instancia Axios + interceptores JWT)
├── context/
│   ├── AuthContext.jsx (login, registro, logout, sesión)
│   └── CartContext.jsx (carrito global, sync con backend)
├── hooks/
│   ├── useProducts.js (lista de productos con filtros)
│   └── useCategories.js (lista de categorías)
├── utils/
│   ├── motion.js (variantes de animación Framer Motion)
│   ├── format.js (formatPrecio, formatFecha)
│   ├── imageUrl.js (construcción de URLs de imágenes)
│   ├── categoryAssets.js (fallbacks SVG + modelos 3D)
│   ├── placeholders.js (datos de relleno para desarrollo)
│   ├── sanitize.js (sanitización de inputs)
│   └── designTweaks.js (utilidades de diseño)
├── pages/
│   ├── HomePage.jsx / HomePageNew.jsx
│   ├── CatalogoPage.jsx / CatalogoPageNew.jsx
│   ├── ProductoPage.jsx
│   ├── CarritoPage.jsx
│   ├── CheckoutPage.jsx
│   ├── PaymentPage.jsx
│   ├── OrderConfirmationPage.jsx
│   ├── LoginPage.jsx / LoginPageNew.jsx
│   ├── RegistroPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── MisPedidosPage.jsx
│   ├── PedidoClienteDetailPage.jsx
│   └── admin/
│       ├── DashboardPage.jsx
│       ├── ProductosAdminPage.jsx
│       ├── PedidosAdminPage.jsx
│       ├── PedidoDetailAdminPage.jsx
│       ├── UsuariosAdminPage.jsx
│       ├── CategoriasAdminPage.jsx
│       ├── MarcasAdminPage.jsx
│       ├── ProveedoresAdminPage.jsx
│       ├── ComprasAdminPage.jsx
│       ├── CompraDetailAdminPage.jsx
│       ├── InventarioAdminPage.jsx
│       └── ReportesAdminPage.jsx
└── components/
    ├── ui/
    │   ├── Button.jsx, Input.jsx, Select.jsx
    │   ├── Modal.jsx, Card.jsx, Badge.jsx
    │   ├── Tabs.jsx, Accordion.jsx, Alert.jsx
    │   ├── Skeleton.jsx, EmptyState.jsx, LoadingSpinner.jsx
    │   ├── ProductCard.jsx, ProductCardNew.jsx
    │   ├── QuantitySelector.jsx, ColorSelector.jsx
    │   └── SafeImg.jsx
    ├── layout/
    │   ├── Navbar.jsx / NavbarNew.jsx
    │   └── Footer.jsx / FooterNew.jsx
    ├── admin/
    │   ├── AdminSidebar.jsx
    │   └── AIInsightsPanel.jsx
    ├── scenes/
    │   └── ScrollytellingHero.jsx
    ├── ui/
    │   ├── ThemeToggle.jsx
    │   ├── AIChatModal.jsx
    │   ├── SlideCart.jsx
    │   ├── PredictiveSearch.jsx
    │   ├── SplineRobotIntro.jsx
    │   ├── CustomCursor.jsx
    │   ├── ModelViewer3D.jsx
    │   ├── ImageUploader.jsx
    │   ├── ModelUploader.jsx
    │   ├── HeroShowroom.jsx
    │   └── ImmersiveProductViewer.jsx
    └── ...
```

---

## MAPA DE NAVEGACIÓN — CLIENTE

```
Home (/)                          ← SplineRobotIntro + HeroSection + Ofertas + Categorías + Productos
  │
  ├── Catálogo (/catalogo)        ← Grid productos + filtros + búsqueda + paginación
  │     └── Producto (/producto/:id)  ← Detalle + imágenes + 3D + agregar al carrito
  │
  ├── Carrito (/carrito)          ← Items + cantidades + total
  │     └── Checkout (/checkout)  ← Formulario envío + método pago
  │           └── Confirmación (/order-confirmation/:id)
  │
  ├── Login (/login)
  ├── Registro (/registro)
  ├── Recuperar (/forgot-password)
  ├── Reset (/reset-password?token=xxx)
  │
  └── Mis Pedidos (/mis-pedidos)
        └── Detalle (/pedido/:id)
```

## MAPA DE NAVEGACIÓN — ADMIN

```
Admin Dashboard (/admin)                            ← Métricas + gráficos + AI Insights
  │
  ├── Pedidos (/admin/pedidos)                      ← Lista + filtros
  │     └── Detalle (/admin/pedidos/:id)            ← Info + cambio estado + historial
  │
  ├── Inventario (/admin/inventario)                ← Stock + alertas + movimientos
  │
  ├── Compras (/admin/compras)                      ← Órdenes de compra
  │     └── Detalle (/admin/compras/:id)
  │
  ├── Productos (/admin/productos)                  ← CRUD + imágenes + modelos 3D
  ├── Categorías (/admin/categorias)                ← CRUD + jerarquía
  ├── Marcas (/admin/marcas)                        ← CRUD
  ├── Proveedores (/admin/proveedores)              ← CRUD
  ├── Usuarios (/admin/usuarios)                    ← CRUD + roles
  └── Reportes (/admin/reportes)                    ← Exportaciones
```
