---
version: alpha
name: Centrova UI System
---

## Overview

Centrova es una experiencia e-commerce premium, clara e inmersiva. La interfaz debe sentirse profesional y ligera: fondos claros satinados, acentos champagne, producto como protagonista, microinteracciones visibles y elementos flotantes de electrónica con baja opacidad para acompañar sin generar ruido visual.

## Visual direction

- Sensación principal: showroom editorial claro, minimalista, de alta confianza.
- Evitar estética neón, saturada o demasiado oscura.
- Usar profundidad con sombras suaves, bordes finos, blur controlado y capas claras.
- Los productos nunca deben quedar tapados por overlays, paneles o chips flotantes.
- Los elementos flotantes deben ser decorativos o de ayuda contextual; nunca bloquear CTAs.

## Colors

```yaml
colors:
  background: "#F7F2E8"
  backgroundSoft: "#FBFAF7"
  surface: "#FFFFFF"
  surfaceRaised: "#F2EADD"
  text: "#1A1A2E"
  muted: "#6F6A60"
  subtle: "#9B9488"
  border: "#E5DAC8"
  accent: "#D6C18A"
  accentText: "#7A5A24"
  aura: "#B9826B"
  success: "#4F9B7B"
  warning: "#B7791F"
  danger: "#B95E50"
```

Use `accent` para foco, CTA secundario, indicadores de carrusel y highlights. Use `text` para CTAs oscuros y contraste alto. `aura` solo debe aparecer como calidez secundaria, no como fondo dominante.

## Typography

```yaml
typography:
  display:
    fontFamily: "ui-serif, Georgia, serif"
    fontWeight: 700
    lineHeight: 1.02
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 400
    lineHeight: 1.6
```

Los titulares de marketing pueden ser editoriales; admin, formularios, tablas y tarjetas deben usar sistema sans para lectura rápida.

## Rounded

```yaml
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "34px"
```

Controles: 16px. Cards retail: 24px. Showroom/carrusel: 30–34px.

## Spacing

```yaml
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  page: "clamp(1rem, 4vw, 3rem)"
```

Mantener aire entre bloques; evitar grids apretados. En móvil, el carrusel debe reducir profundidad antes que cortar contenido.

## Components

### Product cards

- Fondo blanco o marfil, borde `border`, sombra suave.
- Imagen protagonista con fallback local SVG si el backend no entrega ruta válida.
- Badges pequeños, CTA visible al hover/focus y precio claro.
- No usar imágenes externas hotlinkeadas como fallback.

### Carousel 3D

- Movimiento profesional: transición 420–700ms, perspectiva moderada, cards laterales atenuadas.
- Controles laterales grandes y visibles, dots inferiores y navegación por teclado.
- Autoavance pausado al hover; respetar `prefers-reduced-motion` desde CSS global.
- El panel de “selección activa” vive dentro de la card, nunca sobre otra tarjeta.

### Floating commerce elements

- Usar iconografía o formas CSS de audífonos, laptops, chips, cámaras, cajas o controles.
- Opacidad baja, blur suave y movimiento lento.
- Máximo 2–4 elementos por pantalla principal para no saturar.

### Image handling

- Todas las imágenes de producto deben pasar por `getProductImage(product)` + `resolveImageUrl(path)`.
- `resolveImageUrl` normaliza rutas relativas, `/api`, `uploads/`, `imagenes/`, `images/`, `blob:` y `data:`.
- Si no hay imagen, usar `getCategoryFallback(categoria)`.
- No construir URLs manualmente dentro de cards, carrusel, detalle o admin.

## TWEAK_DEFAULTS

El archivo `src/designTweaks.js` mantiene controles editables:

```json
{
  "accentColor": "#D6C18A",
  "auraColor": "#B9826B",
  "cornerRadius": "22px",
  "heroGlow": 0.34,
  "interfaceDensity": 0.98,
  "showroomDepth": 1.06
}
```

## Accessibility

- Focos visibles con `outline` en acento champagne.
- Botones mínimos de 44px.
- No depender solo del color para descuentos o estados.
- Texto sobre fondos claros con contraste fuerte.
- Carrusel operable con teclado y botones reales.

## Backend boundary

Este rediseño no cambia backend, autenticación, pagos ni endpoints. Los cambios de imagen se limitan a normalización frontend, previsualización y fallback visual.


## Image and media handling

- Product imagery must be resolved through `src/utils/imageUrl.js`; do not concatenate backend paths inside cards, carousels, catalog, or detail pages.
- Treat API JSON and static media as separate surfaces: `/api` is for data; `/uploads`, `/images`, `/imagenes`, `/media`, and `/files` are media candidates.
- Use `SafeImg` for customer-facing product imagery so broken backend media falls back to category-aware local SVG visuals.
- In development, Vite proxies media folders to Spring Boot; in production use `VITE_MEDIA_BASE_URL` when frontend and backend are deployed on different origins.
- Never hotlink product fallback imagery from external placeholder services.
