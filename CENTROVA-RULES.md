# CENTROVA — Reglas Globales del Proyecto

## 1. No Modificar Funcionalidades Existentes
No modificar funcionalidades que ya funcionan sin justificar técnicamente el cambio. Si hay que tocar algo existente, explicar por qué y demostrar que no se rompe nada.

## 2. Reutilizar Antes de Crear
Antes de crear nuevos archivos:
- Revisar si ya existe lógica reusable (services, utils, helpers)
- Revisar si ya existe un componente reusable (UI, layout)
- Revisar si ya existe un hook reusable
- Revisar si ya existe un service/API call reusable

## 3. Consistencia Visual Absoluta
Mantener en toda la UI:
- **Spacing**: usar sistema Tailwind (p-4, p-6, gap-4, gap-5, etc.)
- **Tipografía**: Inter 400-900, text-xs/sm/base/lg/xl/2xl/3xl/4xl
- **Sombras**: shadow-card, shadow-card-hover, shadow-glow
- **Bordes**: border-white/[0.08], border-white/[0.12], border-white/[0.14]
- **Animaciones**: animate-fade-in, animate-slide-down, animate-slide-up, scroll-reveal
- **Colores**: gold (#e8c97e) como único acento. Sin azul/índigo/morado/gradientes
- **Hover cards**: translateY(-6px) + shadow-card-hover
- **Transiciones**: duration-200, duration-300, duration-500 según contexto

## 4. Sistema de Diseño Reusable
- Usar clases utilitarias de `index.css`: `.btn-primary`, `.btn-outline`, `.card`, `.input-field`, `.badge`
- No duplicar estilos. Si un patrón se repite 2+ veces, crear clase reusable
- Mantener tokens en `tailwind.config.js` (colores, sombras, border-radius, font-family)

## 5. No Usar Estilos Inline Innecesarios
Preferir clases Tailwind sobre inline styles. Solo usar inline para:
- Valores dinámicos (colores desde datos, porcentajes calculados)
- Background images

## 6. Toda Nueva Página Debe Tener
- **Loading state**: spinner o skeleton mientras carga
- **Skeleton**: para dar sensación de carga inmediata
- **Error handling**: mostrar mensaje claro al usuario, con opción de reintentar
- **Responsive**: mobile-first, probar en sm/md/lg/xl
- **Empty state**: cuando no hay datos, mostrar mensaje + acción
- **Fallback de imágenes**: usar FALLBACK constante en cada página

## 7. Antes de Implementar Cualquier Módulo
Revisar:
- **Dependencias**: qué librerías nuevas se necesitan, si aportan valor real
- **Impacto en arquitectura**: cómo afecta al flujo actual, si requiere refactors
- **Impacto en performance**: bundles, renders, queries N+1
- **Impacto en seguridad**: exponer datos sensibles, validación, ownership

## 8. Backend — Estándares
- **DTOs en toda comunicación** con el cliente. Nunca exponer entidades JPA directamente
- **Bean Validation** en todos los request DTOs
- **Manejo global de excepciones** via GlobalExceptionHandler
- **Respuestas consistentes**: misma estructura de error en toda la API
- **Paginación** donde aplique listados (PageResponse)
- **Logs**: usar SLF4J, nivel DEBUG en servicios, WARN en reglas de negocio, ERROR en excepciones

## 9. Frontend — Estándares
- **Evitar prop drilling**: useContext o composición antes de pasar props 3+ niveles
- **Separar lógica de UI**: hooks para lógica, componentes para presentación
- **Hooks reutilizables**: extraer lógica repetida a custom hooks
- **Componentes pequeños**: si un componente pasa 200+ líneas, dividir

## 10. Seguridad
- Validar ownership de recursos: un usuario solo ve/edita sus propios datos (pedidos, direcciones)
- Validar roles correctamente en backend con @PreAuthorize
- Proteger endpoints admin con hasRole('ADMIN')
- No exponer datos sensibles en respuestas (passwords, tokens)
- Validar inputs en frontend (antes de enviar) y backend (Bean Validation)

## 11. Verificación Antes de Cerrar Cada Fase
- Verificar compilación frontend (npm run build) y backend (mvn compile)
- Verificar que no se rompieron rutas existentes
- Verificar imports correctos
- Verificar responsive en los breakpoints
- Verificar dark theme en todas las pantallas nuevas
- Verificar consistencia visual con el resto del proyecto

## 12. Deuda Técnica Crítica
Si se detecta deuda técnica crítica durante la implementación:
- Detener la implementación
- Explicar la deuda y su impacto
- Proponer refactor antes de continuar

## 13. Mantenibilidad Sobre Velocidad
No generar código espagueti para avanzar más rápido. Priorizar:
- Código limpio y legible
- Mantenibilidad a largo plazo
- Escalabilidad de la solución
- Componentes pequeños y enfocados

## Stack Tecnológico del Proyecto

### Backend
- Java 21 + Spring Boot 3.2
- Spring Security + JWT
- SQL Server Express (JULIAN\SQLEXPRESS:1433)
- Spring Data JPA / Hibernate (ddl-auto: update)
- JavaMailSender (Gmail SMTP)
- MapStruct + Lombok

### Frontend
- React 18 + Vite
- React Router v6
- Axios con interceptores JWT
- Tailwind CSS v3
- React Hot Toast
- Chart.js + react-chartjs-2

### Identidad Visual CENTROVA
- **Dark theme total**: bg #141414, card #1e1e1e
- **Acento**: #e8c97e (dorado) — único color de acento
- **Tipografía**: Inter 400-900
- **Sin azul, índigo, morado o gradientes de colores vivos**
- **Sin gradientes de colores en fondos o botones**
- **Botón primario**: bg-gold, text-dark-900
- **Cards**: bg-dark-700, border-white/[0.08], hover translateY(-6px) + shadow-card-hover
