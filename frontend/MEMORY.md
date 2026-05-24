---
schemaVersion: 1
scope: workspace
updatedAt: "2026-05-18T00:19:17.383Z"
workspaceName: "frontend"
---

# Project Memory

## Project Overview
- Workspace para rediseñar la UI de una app React/Vite con backend Spring Boot.
- El diseño activo se titula "Mobile App Onboarding Flow", aunque el trabajo real es el rediseño general de una app e-commerce/admin existente.
- Objetivo actual: aplicar un rediseño completo y reusable directamente en componentes React, guiado por `DESIGN.md`, con foco en e-commerce premium profesional, minimalista e inmersivo.

## Current State
- App React/Vite inspeccionada con rutas, layout público, carrito/autenticación, chatbot y área admin.
- `DESIGN.md` existe y sigue siendo la fuente autoritativa del sistema visual.
- La app usa Tailwind, React Router, `react-hot-toast`, `lucide-react`, contextos de auth/carrito y componentes e-commerce existentes.
- La dirección anterior mint/coral/glow fue rechazada parcialmente por el usuario por verse demasiado brillante/neón.
- Se cambió hacia una visión más sobria y profesional: graphite/champagne, menos glow, superficies satinadas, contraste alto y animación más controlada.
- Se corrigieron puntos señalados por el usuario: carrusel con botones laterales más claros, animación interactiva menos invasiva, panel flotante “Preview / Gira, compara, decide” reubicado para no tapar selección activa, tarjetas de producto más retail premium y chatbot más discreto.
- Archivos editados en la última iteración: `tailwind.config.js`, `src/index.css`, `src/designTweaks.js`, `src/components/ui/Carousel3D.jsx`, `src/pages/HomePage.jsx`, `src/components/ui/AIChatModal.jsx`, `DESIGN.md`.
- La verificación final sigue limitada por advertencia externa del host/inspector: `ERR_BLOCKED_BY_CLIENT.Inspector`. La validación aislada de un componente React marcó errores esperados por evaluarlo fuera del entrypoint Vite.

## Artifacts
- `DESIGN.md`: sistema visual/baton autoritativo; actualizado hacia premium sobrio graphite/champagne y patrones minimalistas.
- `ui-redesign-recommendations.md`: recomendaciones iniciales de rediseño para la UI actual.
- `src/designTweaks.js`: valores tweakables para ajustes rápidos; ahora reduce glow y define acentos sobrios.
- `src/index.css`: estilos globales Tailwind/base con fondos, shells, botones, chips y motion del sistema actual.
- `tailwind.config.js`: configuración Tailwind con paleta y sombras actualizadas.
- `src/App.jsx`: estructura principal de rutas, providers y toaster; conserva layout admin.
- `src/components/layout/Navbar.jsx`: navegación pública premium existente; pendiente de revisión final.
- `src/pages/HomePage.jsx`: home tipo flagship e-commerce, ahora menos neón y con paneles flotantes más contenidos.
- `src/components/ui/Carousel3D.jsx`: carrusel reutilizable con navegación por botones laterales, transición interactiva y tarjetas 3D CSS sobrias.
- `src/components/ui/AIChatModal.jsx`: chatbot ajustado a una presencia más discreta, accesible y profesional.
- `src/components/layout/Footer.jsx`: footer reconstruido previamente para estética premium.
- `src/components/admin/AdminSidebar.jsx`: sidebar admin reconstruido previamente con jerarquía y estados activos.
- `index.html`: entrada Vite; recursos externos de fuentes removidos previamente.

## Design Direction
- Nueva dirección: e-commerce premium minimalista para tiendas online, con sensación profesional y cuidada, no neón.
- Inspiración aún cercana a Apple/Mazda, pero más sobria: superficies graphite, champagne cálido, sombras suaves, respiración visual y foco en producto.
- Productos como protagonistas mediante 3D CSS moderado: perspectiva, profundidad, selección activa clara y controles laterales visibles.
- Evitar brillos saturados, halos exagerados y overlays atravesados sobre contenido importante.
- Tarjetas de producto deben sentirse retail premium: imagen limpia, jerarquía clara, badges discretos, precio legible y CTA directo.
- Chatbot debe ser útil sin invadir: botón flotante sobrio, modal limpio, quick questions claras y estados accesibles.
- En admin: mantener shell productivo, jerarquía, densidad útil y separación visual.

## User Feedback
- El usuario pidió en español rediseñar la UI de una app React/Spring Boot.
- Prefiere cambios completos aplicados directamente, no solo recomendaciones.
- Pidió una experiencia interactiva, agradable, diferente y profesional.
- Luego pidió UX/UI tipo Apple/Mazda con productos en 3D e inmersión para e-commerce.
- Último feedback: “no me gustó, se ve muy brillante neón”; quiere “otra visión, algo más profesional”.
- Solicitó que el carrusel pueda pasarse con botones laterales, tenga animación interactiva, se arregle el cuadro “Selección activa” superpuesto con el preview, y se mejoren chatbot y tarjetas de productos.
- Quiere que se piense como un desarrollador front-end profesional con años de experiencia en UX/UI minimalista para tiendas online.

## Decisions
- Se preservó el título de diseño existente; no se llamó a rebuild ni cambio de título.
- Se leyó `DESIGN.md` antes de modificar tokens o componentes.
- `DESIGN.md` sigue siendo la única fuente autoritativa del sistema visual.
- Se aplican cambios directamente sobre archivos existentes.
- Se evita depender de imágenes o assets externos; se usan CSS, componentes internos e iconos ya instalados.
- La experiencia 3D sigue siendo simulada con CSS, sin WebGL/Three.js ni modelos reales.
- `src/designTweaks.js` se mantiene como capa controlada para ajustes visuales rápidos.
- Se decidió abandonar la lectura neón/mint-coral dominante y moverse a graphite/champagne profesional.

## Open Questions
- Confirmar visualmente si el usuario aprueba la nueva dirección sobria graphite/champagne.
- Revisar en entorno local real si `ERR_BLOCKED_BY_CLIENT.Inspector` es solo del inspector/extensión.
- Recorrer catálogo, detalle, carrito, checkout, login, pedidos y admin para detectar estilos antiguos.
- Confirmar si más adelante se usarán renders, videos, modelos 3D reales o solo CSS.
- Confirmar estados reales de carga/error/datos del backend Spring Boot para diseñarlos mejor.
- Revisar responsive móvil/tablet del hero, carrusel, cards, chatbot y navegación.

## Next Steps
- Probar la app localmente con Vite y revisar consola real.
- Hacer QA visual del carrusel: botones laterales, foco, hover, transición, mobile y selección activa.
- Revisar `AIChatModal.jsx` en navegador real para confirmar layout, scrolling y accesibilidad.
- Rediseñar detalle de producto con galería premium, especificaciones, comparador y CTA fijo.
- Rediseñar catálogo, carrito y checkout con el nuevo sistema sobrio.
- Revisar `Navbar.jsx` y `Footer.jsx` para alinearlos completamente con la nueva visión.
- Sincronizar decisiones estables en `DESIGN.md` sin copiar tablas completas.
- Pedir feedback puntual al usuario sobre home, carrusel, cards, chatbot, colores y sensación profesional.

## Promotion Candidates For DESIGN.md
- Dirección visual graphite/champagne premium sobria, sustituyendo la lectura neón.
- Carrusel 3D CSS con botones laterales visibles, selección activa clara y animación moderada.
- Regla anti-overlay: paneles flotantes no deben tapar contenido principal ni CTAs.
- Tarjetas retail premium minimalistas con imagen limpia, badges discretos, precio claro y CTA directo.
- Chatbot flotante sobrio, accesible y no invasivo.
- Uso de `src/designTweaks.js` para controlar glow, profundidad 3D, radio, densidad y acentos.

## Recent History
- 2026-05-17: Se inspeccionó el workspace React existente y archivos clave de layout, home, admin y configuración visual.
- 2026-05-17: Se creó `ui-redesign-recommendations.md` y `DESIGN.md`; la validación inicial de baton quedó corregida.
- 2026-05-17: El usuario pidió aplicar el rediseño completo directamente.
- 2026-05-17: Se aplicó rediseño premium inicial en CSS, Tailwind, Navbar, Home, AdminSidebar, App, index y tweaks.
- 2026-05-17: El usuario pidió una experiencia más interactiva, agradable, diferente, profesional, con otros colores y elementos flotantes.
- 2026-05-17: Se actualizó a dirección mint/coral premium con glass, glows, home y footer reconstruidos.
- 2026-05-17: El usuario pidió UX/UI tipo Apple/Mazda con productos 3D y showroom inmersivo.
- 2026-05-17: Se actualizó Home y `Carousel3D.jsx` con showroom 3D CSS y se extendió `DESIGN.md`.
- 2026-05-18: El usuario rechazó el look por demasiado brillante/neón y pidió una visión más profesional, carrusel por botones, animación interactiva, arreglo de overlays, chatbot y cards.
- 2026-05-18: Se actualizó a estética graphite/champagne sobria, se ajustaron carrusel, home, product cards, chatbot, tokens, tweaks y `DESIGN.md`.
- 2026-05-18: La validación final quedó limitada por `ERR_BLOCKED_BY_CLIENT.Inspector`; validación aislada de componente no aplica al flujo Vite.