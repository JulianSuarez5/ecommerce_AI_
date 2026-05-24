# SISTEMA DE IA Y ROBOT 3D — EXPLICACIÓN COMPLETA

---

## PARTE 1: SISTEMA DE INTELIGENCIA ARTIFICIAL (GROQ)

### 1.1 ARQUITECTURA GENERAL DE LA IA

```
┌──────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE IA                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND (React)                     BACKEND (Spring Boot)      │
│                                                                  │
│  AIChatModal.jsx                      AiController.java          │
│  (cliente)                            (/api/ai/chat)             │
│       ↓                                      ↓                   │
│       → POST /api/ai/chat              AiServiceImpl.java        │
│         { question, contextData }           ↓                    │
│                                            → buildPrompt()       │
│  AIInsightsPanel.jsx                         ↓                  │
│  (admin)                               → callGroq()              │
│       ↓                                      ↓                   │
│       → POST /api/ai/chat              GROQ API                  │
│       → GET /api/ai/insights           (LLaMA 3.3 70B)           │
│       → GET /api/ai/contexto-negocio        ↓                    │
│                                            → responde texto      │
│       → GET /api/ai/contexto-cliente        ↓                    │
│                                            → { response }        │
│                                      AiContextServiceImpl.java    │
│                                            ↓                     │
│       ← contexto                        OrderRepository          │
│       ← insights                      ProductRepository          │
│                                        UserRepository            │
│                                            ↓                     │
│                                       SQL Server                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 ¿CÓMO SABE LA IA QUÉ INVESTIGAR Y DÓNDE BUSCARLO?

La IA **no busca nada por sí sola**. El sistema funciona con un patrón **Context-Query-Response**:

#### PASO 1: El backend construye un "contexto" consultando la base de datos

El archivo **`AiContextServiceImpl.java`** es el cerebro de la recolección de datos. Tiene 3 métodos que consultan la base de datos ANTES de llamar a la IA:

**A) `buildBusinessContext()` — Contexto de negocio (para admin):**
```java
// Cada línea es una consulta a la base de datos real:
BigDecimal ventasMes = orderRepository.calcularVentasMensuales(mes, anio);
long pendientes = orderRepository.countByEstado(OrderStatus.PENDIENTE);
long confirmados = orderRepository.countByEstado(OrderStatus.CONFIRMADO);
long enviados = orderRepository.countByEstado(OrderStatus.ENVIADO);
long entregados = orderRepository.countByEstado(OrderStatus.ENTREGADO);
long nuevosClientes = userRepository.countByFechaRegistroBetween(...);
long clientesActivos = userRepository.countByActivoTrue();
var stockBajo = productRepository.findProductosConStockBajo();
var agotados = productRepository.findProductosAgotados();
var ventasCat = orderRepository.ventasPorCategoria();
```

Esto genera un string como este:
```
VENTAS DEL MES: $12500000
PEDIDOS POR ESTADO: Pendientes=5 | Confirmados=12 | Enviados=8 | Entregados=45
PRODUCTOS CON STOCK BAJO (3):
- Laptop Pro 15: 2 unidades (minimo: 5)
- Audifonos Bluetooth: 1 unidades (minimo: 10)
- Mouse Inalambrico: 3 unidades (minimo: 8)
PRODUCTOS AGOTADOS (1):
- Camara 4K (SKU: CAM-001)
CATEGORIA CON MAS VENTAS: Electronica ($8500000)
CLIENTES ACTIVOS: 234
NUEVOS CLIENTES DEL MES: 12
```

**B) `buildClientContext(userId)` — Contexto del cliente:**
```java
var orders = orderRepository.findByUserIdOrderByFechaPedidoDesc(userId, PageRequest.of(0, 3));
// Solo los últimos 3 pedidos del cliente autenticado
```
Genera:
```
- Pedido #15: ENTREGADO | Total: $250000 | Fecha: 2026-05-10
- Pedido #12: ENVIADO | Total: $180000 | Fecha: 2026-04-28
```

**C) `buildInsights()` — Insights automáticos (sin IA):**
No llama a Groq. Es lógica puramente Java que analiza los datos y genera tarjetas con tipo (danger, warning, positive, info).

#### PASO 2: El contexto se inyecta en el prompt de la IA

En **`AiServiceImpl.java`**, el método `buildPrompt()` toma la pregunta del usuario + el contexto y construye un prompt como este:

```
Eres el asistente de analisis de negocio de CENTROVA, un e-commerce.
Tu trabajo es analizar los datos reales del negocio y dar
recomendaciones CONCRETAS y ACCIONABLES.

REGLAS OBLIGATORIAS:
- Nunca digas 'revisa la seccion de' ni 've al dashboard'
- Siempre usa los numeros del contexto en tu respuesta
- Si el stock de un producto esta bajo, di cuanto esta bajo y que accion tomar
- Si las ventas subieron o bajaron, di el porcentaje exacto
- Responde en maximo 3 parrafos cortos

Datos actuales del negocio:
VENTAS DEL MES: $12500000
PEDIDOS POR ESTADO: Pendientes=5 | Confirmados=12 | Enviados=8 | Entregados=45
...

Pregunta: ¿Qué productos necesito reabastecer?
```

#### PASO 3: Se envía a Groq API

```java
// AiServiceImpl.java línea 67-72
Map<String, Object> requestBody = Map.of(
    "model", "llama-3.3-70b-versatile",
    "messages", List.of(message),  // el prompt completo
    "temperature", 0.5
);
// POST a https://api.groq.com/openai/v1/chat/completions
ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, request, Map.class);
```

Groq recibe el prompt con TODOS los datos reales del negocio y el LLM (LLaMA 3.3 70B) genera una respuesta basada en esos datos.

#### PASO 4: La respuesta se devuelve al frontend

La IA **nunca toca la base de datos directamente**. Solo analiza el texto que le pasamos. Todo el acceso a datos ocurre en Java, antes de llamar a la IA.

### 1.3 MAPA COMPLETO DE ARCHIVOS DE IA

#### Backend

| Archivo | Ruta | Qué hace |
|---------|------|----------|
| `AiController.java` | `backend/.../controller/AiController.java` | 4 endpoints REST: chat, contexto-negocio, contexto-cliente, insights |
| `AiService.java` | `backend/.../service/AiService.java` | Interfaz del servicio de IA |
| `AiServiceImpl.java` | `backend/.../service/impl/AiServiceImpl.java` | Construye prompts, llama a Groq API, maneja errores |
| `AiContextService.java` | `backend/.../service/AiContextService.java` | Interfaz del servicio de contexto |
| `AiContextServiceImpl.java` | `backend/.../service/impl/AiContextServiceImpl.java` | Consulta la BD y construye contexto + insights |
| `OrderRepository.java` | `backend/.../repository/OrderRepository.java` | Queries: calcularVentasMensuales, ingresosPorDia, ventasPorCategoria, distribucionEstados |
| `ProductRepository.java` | `backend/.../repository/ProductRepository.java` | Queries: findProductosAgotados, findProductosConStockBajo |
| `UserRepository.java` | `backend/.../repository/UserRepository.java` | Queries: countByActivoTrue, countByFechaRegistroBetween |

#### Frontend

| Archivo | Ruta | Qué hace |
|---------|------|----------|
| `AIChatModal.jsx` | `frontend/src/components/ui/AIChatModal.jsx` | Modal flotante del chat (cliente) |
| `AIInsightsPanel.jsx` | `frontend/src/components/admin/AIInsightsPanel.jsx` | Panel de insights + chat (admin) |
| `axios.js` | `frontend/src/api/axios.js` | Peticiones HTTP con JWT |

### 1.4 FLUJO COMPLETO: CHAT DEL CLIENTE

```
Usuario abre AIChatModal
  ↓
AIChatModal.jsx useEffect:
  ↓ api.get('/api/ai/contexto-cliente')
  ↓
AiController.contextoCliente()
  ↓ SecurityUtils.getUserId() → obtiene ID del JWT
  ↓ AiContextServiceImpl.buildClientContext(userId)
    → OrderRepository.findByUserIdOrderByFechaPedidoDesc(userId, top 3)
  ↓ Devuelve string con últimos 3 pedidos
  ↓
Usuario escribe: "¿Dónde está mi pedido?"
  ↓
AIChatModal.sendMessage()
  ↓ api.post('/api/ai/chat', { question, contextData })
  ↓
AiController.chat()
  ↓ AiServiceImpl.chatWithContext(question, contextData)
    → buildPrompt(question, contextData)
    → prompt = "Eres el asistente... Datos del cliente: Pedido #15... Pregunta: ¿Dónde está mi pedido?"
    → callGroq(prompt)
    → POST https://api.groq.com/openai/v1/chat/completions
    → LLaMA 3.3 70B genera respuesta
  ↓ Devuelve { response: "Tu pedido #15 fue entregado el 10 de mayo..." }
  ↓
AIChatModal renderiza burbuja del asistente
```

### 1.5 FLUJO COMPLETO: CHAT DEL ADMIN (AI Insights)

```
Admin abre Dashboard → AIInsightsPanel
  ↓
useEffect:
  ↓ api.get('/api/ai/insights')
    → AiContextServiceImpl.buildInsights()
      → Consulta stock bajo, agotados, pedidos pendientes, ventas
      → Genera tarjetas con tipo (danger/warning/positive)
    → NO llama a Groq, es lógica Java pura
  ↓
  ↓ api.get('/api/ai/contexto-negocio')
    → AiContextServiceImpl.buildBusinessContext()
      → Consulta 10+ métricas de la BD
      → Construye string de contexto
  ↓
Admin cambia a modo Chat IA:
  ↓ Escribe pregunta
  ↓ api.post('/api/ai/chat', { question, contextData: contexto })
  ↓ Mismo flujo que el chat de cliente
```

### 1.6 LAS CONSULTAS SQL QUE ALIMENTAN LA IA

**OrderRepository.java** — Queries nativas SQL:

```sql
-- calcularVentasMensuales (JPQL)
SELECT COALESCE(SUM(o.total), 0) FROM Order o
WHERE o.estado != 'CANCELADO'
  AND MONTH(o.fechaPedido) = :mes
  AND YEAR(o.fechaPedido) = :anio

-- ingresosPorDia (SQL nativo)
SELECT CAST(o.fecha_pedido AS DATE) as dia, COALESCE(SUM(o.total), 0) as total
FROM orders o
WHERE o.estado != 'CANCELADO'
  AND o.fecha_pedido >= :fechaInicio
GROUP BY CAST(o.fecha_pedido AS DATE)
ORDER BY dia ASC

-- ventasPorCategoria (SQL nativo)
SELECT c.nombre, COALESCE(SUM(od.subtotal), 0) as total
FROM order_details od
INNER JOIN orders o ON od.order_id = o.id
INNER JOIN products p ON od.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE o.estado != 'CANCELADO'
GROUP BY c.nombre
ORDER BY total DESC

-- distribucionEstados (JPQL)
SELECT o.estado, COUNT(o) FROM Order o GROUP BY o.estado
```

**ProductRepository.java:**

```sql
-- findProductosAgotados (JPQL)
SELECT p FROM Product p WHERE p.activo = true AND p.stock = 0

-- findProductosConStockBajo (JPQL)
SELECT p FROM Product p WHERE p.activo = true AND p.stock > 0 AND p.stock <= p.stockMinimo

-- buscarConFiltros (JPQL con filtros dinámicos)
SELECT p FROM Product p WHERE p.activo = true
  AND (:categoryId IS NULL OR p.category.id = :categoryId)
  AND (:precioMin IS NULL OR p.precio >= :precioMin)
  AND (:precioMax IS NULL OR p.precio <= :precioMax)
  AND (:busqueda IS NULL OR LOWER(p.nombre) LIKE...)
  AND (:soloDisponible = false OR p.stock > 0)
```

### 1.7 MODELO DE IA Y CONFIGURACIÓN

```yaml
# application.yml (línea ~80)
groq:
  api-key: "gsk_tu-groq-api-key-aqui"
```

- **Modelo:** `llama-3.3-70b-versatile` (Meta LLaMA 3.3 con 70B parámetros)
- **API:** `https://api.groq.com/openai/v1/chat/completions` (compatible con API de OpenAI)
- **Temperatura:** 0.5 (balance entre creatividad y precisión)
- **Autenticación:** Bearer token en header HTTP
- **Costo:** Gratuito (Groq ofrece inferencia gratuita con límites)

### 1.8 DIAGRAMA DE DATOS QUE FLUYEN HACIA LA IA

```
                  ┌──────────────────────────┐
                  │   USUARIO PREGUNTA       │
                  │   "¿Qué restockear?"     │
                  └────────────┬─────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────┐
│           AiContextServiceImpl.java                   │
│                                                       │
│  OrderRepository: ──────────────────────────────────┐ │
│  ├─ calcularVentasMensuales() → "$12,500,000"       │ │
│  ├─ countByEstado(PENDIENTE) → "5 pendientes"      │ │
│  ├─ countByEstado(CONFIRMADO) → "12 confirmados"   │ │
│  ├─ ventasPorCategoria() → "Electrónica lider"     │ │
│  └─ ingresosPorDia() → gráfico de línea            │ │
│                                                       │ │
│  ProductRepository: ───────────────────────────────┐ │ │
│  ├─ findProductosConStockBajo() → "Laptop: 2 uds"  │ │ │
│  └─ findProductosAgotados() → "Cámara 4K: 0 uds"  │ │ │
│                                                       │ │
│  UserRepository: ─────────────────────────────────┐ │ │
│  ├─ countByActivoTrue() → "234 clientes activos"  │ │ │
│  └─ countByFechaRegistroBetween() → "12 nuevos"   │ │ │
│                                                       │ │
│  → CONSTRUYE STRING DE CONTEXTO:                    │ │
│    "VENTAS DEL MES: $12500000\n                      │ │
│     PEDIDOS PENDIENTES: 5\n                          │ │
│     STOCK BAJO: Laptop Pro 15: 2 unidades..."        │ │
└──────────────────────┬───────────────────────────────┘ │
                       │                                  │
                       ▼                                  │
┌──────────────────────────────────────┐                  │
│      AiServiceImpl.java              │                  │
│  prompt = contexto + pregunta        │                  │
│  → POST a Groq API (LLaMA 70B)      │                  │
│  → Recibe respuesta en texto         │                  │
└──────────────┬───────────────────────┘                  │
               │                                          │
               ▼                                          │
┌──────────────────────────────┐                          │
│  "Basado en los datos,      │                          │
│   necesitas reabastecer:    │                          │
│   - Laptop Pro 15 (stock:2) │                          │
│   - Audifonos BT (stock:1)  │                          │
│   La categoría líder es     │                          │
│   Electrónica con $8.5M..." │                          │
└──────────────────────────────┘                          │
```

---

## PARTE 2: ROBOT 3D CON SPLINE

### 2.1 ¿QUÉ ES SPLINE?

**Spline** es una herramienta de diseño 3D basada en web que permite crear escenas 3D interactivas sin conocimientos de programación 3D. A diferencia de Three.js (donde todo se escribe en código), Spline ofrece un editor visual tipo Figma pero en 3D.

El robot de CENTROVA fue diseñado en Spline Editor y exportado como un "scene.splinecode" que se renderiza en el navegador usando `@splinetool/react-spline`.

### 2.2 ARCHIVO DEL ROBOT

**Archivo único:** `frontend/src/components/ui/SplineRobotIntro.jsx`

### 2.3 ¿CÓMO FUNCIONA LA ANIMACIÓN?

#### Paso 1: Carga diferida (Lazy Loading)

```jsx
// Línea 26: No se carga hasta que está cerca del viewport
const isInView = useInView(containerRef, { once: true, margin: '200px' });
```

El robot solo comienza a cargarse cuando el usuario se acerca a 200px de la sección. Esto evita descargar los 2.87MB del modelo 3D si el usuario nunca scrollea hasta ahí.

#### Paso 2: Detección de dispositivo móvil

```jsx
// Línea 9-18: Hook personalizado
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  // ...
}

// Línea 23: Solo se usa en desktop
const isMobile = useMediaQuery('(max-width: 768px)');
```

En móvil no se renderiza el canvas 3D. Se muestra una imagen estática del robot en su lugar.

#### Paso 3: Renderizado del Spline Scene

```jsx
// Línea 57-63: Solo si está en desktop + en viewport
{isInView && (
  <Spline
    scene={SPLINE_URL}           // URL del modelo .splinecode
    onLoad={onLoad}              // Callback cuando carga
    onError={() => setError(true)} // Fallback si falla
    className="w-full h-full"
  />
)}
```

El SDK de Spline descarga el archivo `.splinecode` desde `https://prod.spline.design/3c3rOBJxzYuK8lDA/scene.splinecode` y lo renderiza en un canvas WebGL.

Mientras carga, muestra un spinner animado:
```jsx
{!loaded && !error && (
  <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
)}
```

#### Paso 4: Seguimiento del cursor (la magia)

```jsx
// Líneas 34-51: El efecto que hace que el robot mire al cursor
useEffect(() => {
  if (isMobile || !loaded || !splineRef.current) return;
  const container = containerRef.current;
  if (!container) return;

  const handleMouseMove = (e) => {
    // 1. Obtiene la posición del mouse RELATIVA al contenedor
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0 a 1
    const y = (e.clientY - rect.top) / rect.height;    // 0 a 1

    mousePos.current = { x, y };

    // 2. Envía la posición al Spline scene mediante un evento
    try {
      splineRef.current?.emitEvent('mouseMove', { x, y });
    } catch {}
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [isMobile, loaded]);
```

**¿Cómo sabe el robot que debe mover la cabeza?**

El modelo 3D fue diseñado en el editor visual de Spline con un **evento de mouse** configurado en el objeto "cabeza". Dentro de Spline Editor:

1. Se selecciona el grupo "cabeza" del robot
2. Se agrega un evento "Mouse Move" (no "Mouse Enter", sino "Mouse Move" global)
3. Se configura para que la cabeza rote en X e Y en función de la posición del mouse
4. Al exportar, ese comportamiento se incluye en el archivo `.splinecode`

Cuando el frontend llama a `splineRef.current.emitEvent('mouseMove', { x, y })`, el runtime de Spline ejecuta la animación configurada en el editor: la cabeza del robot sigue el cursor.

### 2.4 ESTRUCTURA COMPLETA DEL COMPONENTE

```
SplineRobotIntro.jsx
│
├── CONSTANTES
│   ├── SPLINE_URL = "https://prod.spline.design/.../scene.splinecode"
│   └── FALLBACK_IMG = "https://cdn.../robot-phunk%201.webp"
│
├── HOOK: useMediaQuery(query)
│   └── Detecta si la pantalla es ≤ 768px
│
├── COMPONENTE: SplineScene (renderiza el 3D)
│   ├── useRef → splineRef (referencia al objeto Spline)
│   ├── useRef → containerRef (referencia al div contenedor)
│   ├── useState → loaded, error
│   ├── useInView → carga diferida (margin 200px)
│   ├── onLoad → guarda splineApp en splineRef
│   ├── useEffect mouseMove:
│   │   - Calcula posición relativa del mouse
│   │   - Emite evento 'mouseMove' al Spline scene
│   │   - Solo activo en desktop
│   └── Render:
│       ├── Spline (el canvas 3D)
│       └── Spinner de carga
│
└── COMPONENTE PRINCIPAL: SplineRobotIntro
    ├── Section con gradient background (oscuro teal/emerald)
    ├── Lado izquierdo: Texto + botones (CENTROVA branding)
    └── Lado derecho:
        ├── Mobile: imagen estática (FALLBACK_IMG)
        └── Desktop: <SplineScene />
```

### 2.5 DETALLES TÉCNICOS DEL RENDER 3D

| Aspecto | Detalle |
|---------|---------|
| **SDK** | `@splinetool/react-spline` + `@splinetool/runtime` |
| **Formato** | `.splinecode` (formato propietario de Spline) |
| **Modelo** | Diseñado en Spline Editor (similar a Blender pero web) |
| **Interactividad** | Evento mouseMove configurado en el editor |
| **Peso** | ~2.87 MB (se descarga una vez, se cachea) |
| **Carga** | Diferida con IntersectionObserver (useInView) |
| **Responsive** | Imagen estática en < 768px |
| **Fallback** | Imagen webp si el canvas falla |
| **Posición** | `absolute inset-0` dentro del contenedor derecho |
| **Z-index** | z-10 para el texto, z-20 para el canvas |

### 2.6 FLUJO COMPLETO DE CARGA DEL ROBOT

```
1. Usuario abre la página Home
2. HomePage.jsx renderiza <SplineRobotIntro />
3. El componente mide la pantalla con useMediaQuery
4. Si es móvil (< 768px):
   → Muestra imagen estática (FALLBACK_IMG)
   → Fin del flujo
5. Si es desktop:
   → useInView monitorea si la sección está cerca
   → El usuario comienza a scrollear
6. Cuando la sección está a 200px del viewport:
   → Se monta el componente <Spline scene={SPLINE_URL} />
   → El SDK descarga el .splinecode (2.87MB)
   → Mientras descarga, muestra spinner animado
7. La descarga completa:
   → onLoad() guarda la referencia
   → Se activa el useEffect de mousemove
8. Usuario mueve el mouse:
   → Se calcula (x, y) normalizado (0-1) relativo al contenedor
   → Se emite evento 'mouseMove' con esos valores
   → El runtime de Spline ejecuta la animación de la cabeza
9. Si ocurre algún error de carga:
   → onError → setError(true)
   → No se muestra nada en esa sección (el texto y botones siguen visibles)
```

### 2.7 RELACIÓN CONOTROS COMPONENTES 3D

| Componente | Tecnología | Propósito |
|------------|-----------|-----------|
| `SplineRobotIntro.jsx` | Spline | Robot interactivo en home |
| `ScrollytellingHero.jsx` | Three.js (@react-three/fiber) | Modelo 3D del astronauta con scroll |
| `ModelViewer3D.jsx` | Google model-viewer | Vista 3D de productos en catálogo |
| `ImmersiveProductViewer.jsx` | Three.js | Vista 360 de productos |
| `HeroShowroom.jsx` | Three.js | Showroom 3D de productos destacados |

Cada uno usa una tecnología diferente porque resuelven problemas distintos:
- **Spline**: Rápido para diseñar interacciones complejas (seguimiento de cursor) sin código
- **Three.js**: Control total sobre la escena 3D, útil para animaciones personalizadas con scroll
- **model-viewer**: Optimizado para e-commerce, carga GLB, AR, auto-rotate
