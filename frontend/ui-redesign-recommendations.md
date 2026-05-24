# Recomendación de rediseño UI — Centrova

## Diagnóstico rápido

La app ya tiene una base funcional clara: navegación por rutas, panel admin, ecommerce, carrito, autenticación y componentes reutilizables. Visualmente, el sistema actual se apoya en un tema oscuro con acento dorado, pero todavía se siente más como una plantilla de dashboard/tienda que como una experiencia de producto terminada.

Los principales puntos a mejorar son:

1. **Sistema visual demasiado rígido**: casi todo depende de `dark-*`, `gold` e `Inter`; falta una jerarquía más rica para superficies, estados y prioridades.
2. **Navegación admin densa**: el sidebar lista muchas áreas sin agrupación por flujo de trabajo.
3. **Componentes base insuficientes**: botones, cards e inputs existen, pero faltan variantes para estados, tablas, filtros, empty states, banners, badges y acciones destructivas.
4. **Diferencia débil entre tienda y admin**: conviene separar el tono comercial del storefront y el tono operativo del panel interno.
5. **Accesibilidad a reforzar**: algunos contrastes grises/dorados pueden quedar justos; también conviene estandarizar focus rings, touch targets y estados disabled/loading.

## Dirección recomendada

Recomiendo mantener una estética **premium técnica**: fondo oscuro cálido, dorado menos brillante, superficies con profundidad controlada, tipografía más editorial en titulares comerciales y una UI admin más compacta y legible.

No haría un cambio radical a blanco/colores vivos, porque el código ya está construido alrededor de un universo dark premium. Sí rediseñaría el sistema para que se sienta más moderno, consistente y vendible.

## Cambios prioritarios

### 1. Crear tokens de diseño reales

Centralizar colores, radios, sombras, focus, estados y tamaños en `tailwind.config.js` y `src/index.css`.

Propuesta:

- `background`: base oscura cálida.
- `surface`: tarjetas y paneles.
- `surfaceRaised`: modales, dropdowns y drawers.
- `accent`: dorado más sobrio.
- `accentSoft`: fondo sutil para estados activos.
- `borderSubtle`: separadores.
- `textPrimary`, `textSecondary`, `textMuted`.
- `success`, `warning`, `danger`, `info` con variantes soft.

### 2. Rediseñar el app shell admin

El sidebar debería agrupar navegación por intención:

- **Operación**: Dashboard, Pedidos, Inventario.
- **Catálogo**: Productos, Categorías, Marcas.
- **Compras**: Proveedores, Compras.
- **Gestión**: Usuarios, Reportes.

También recomiendo:

- Header superior por página con título, descripción corta y acción principal.
- Búsqueda global o command palette.
- Estados activos más claros sin depender solo del color.
- Sidebar colapsable en desktop y drawer en mobile/tablet.

### 3. Separar storefront y admin

La tienda puede ser más emocional:

- Home con hero comercial más fuerte.
- Cards de producto con mejor jerarquía de precio, disponibilidad y CTA.
- Categorías visuales sin depender de imágenes externas.
- Checkout con pasos, resumen persistente y estados de validación.

El admin debe ser más operativo:

- Tablas densas pero limpias.
- Filtros persistentes.
- KPIs con contexto, no solo números.
- Empty states accionables.
- Estados de carga/error por panel.

### 4. Mejorar componentes base

Componentes que recomiendo crear o consolidar:

- `PageHeader`
- `SectionCard`
- `DataTable`
- `StatusBadge`
- `MetricCard`
- `FilterBar`
- `EmptyState`
- `ConfirmDialog`
- `FormField`
- `PrimaryActionButton`, `SecondaryButton`, `DestructiveButton`

### 5. Accesibilidad y usabilidad

Reglas mínimas:

- Botones y enlaces interactivos: mínimo 44px en móvil, 40px en desktop.
- Focus visible consistente en teclado.
- No usar solo color para estados activos o errores.
- Inputs con label persistente, helper text y error text.
- Contraste AA para texto normal.
- Reducir animaciones si `prefers-reduced-motion` está activo.

## Orden de implementación sugerido

1. **Semana 1 — Sistema base**
   - Ajustar tokens en Tailwind.
   - Reescribir `index.css` con componentes base.
   - Crear `PageHeader`, `SectionCard`, `StatusBadge` y botones.

2. **Semana 2 — Admin shell**
   - Rediseñar `AdminSidebar`.
   - Crear header admin.
   - Aplicar layout consistente a Dashboard, Productos, Pedidos e Inventario.

3. **Semana 3 — Storefront**
   - Rediseñar Navbar, Home, Product Cards y Product Detail.
   - Mejorar carrito y checkout.

4. **Semana 4 — Estados y polish**
   - Empty/loading/error states.
   - Responsive pass.
   - Accesibilidad.
   - Microinteracciones y revisión visual.

## Primera intervención que haría

Empezaría por el **admin shell + tokens**, porque eso desbloquea consistencia en toda la app. Después llevaría la misma calidad al storefront.

Concretamente, el primer PR debería incluir:

- Nuevo sistema de colores y sombras.
- Sidebar admin agrupado.
- Header admin reutilizable.
- Botones y badges normalizados.
- Una pantalla admin rediseñada como referencia para replicar.

## Riesgo principal

El riesgo es rediseñar pantalla por pantalla sin sistema. Eso suele terminar en una app más bonita pero igual de inconsistente. Mi recomendación es empezar por el lenguaje visual y componentes compartidos, no por decorar la home.
