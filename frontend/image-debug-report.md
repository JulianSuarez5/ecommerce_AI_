# Diagnóstico de imágenes de producto

## Causa encontrada

Las imágenes no se veían de forma consistente en cards, carrusel, catálogo y detalle porque el frontend trataba rutas de media como si fueran endpoints JSON de API.

- `axios` usa `baseURL: '/api'`.
- `vite.config.js` solo proxyeaba `/api` hacia `http://localhost:8080`.
- Muchos backends Spring Boot sirven archivos estáticos en rutas como `/uploads/...`, `/images/...` o `/imagenes/...`, no en `/api/uploads/...`.
- El resolver anterior podía convertir rutas como `uploads/producto.jpg` en `/api/uploads/producto.jpg`, lo que provoca 404 si el backend no expone media bajo `/api`.
- Además, algunos productos pueden venir con nombres de campo distintos (`ruta`, `path`, `nombreArchivo`, `urlImagen`, etc.), y esos campos no siempre estaban contemplados.
- En detalle de producto había un fallback visual frágil; ahora usa `SafeImg` y fallback por categoría.

## Cambios aplicados sin tocar backend

1. `src/utils/imageUrl.js`
   - Se separó API JSON de media estática.
   - `uploads/`, `images/`, `imagenes/`, `media/` y `files/` ya no se fuerzan a `/api`.
   - Se agregó soporte para más nombres de campos de imagen.
   - Se agregó `VITE_MEDIA_BASE_URL` opcional para despliegues donde frontend y backend estén en dominios distintos.

2. `vite.config.js`
   - Se agregaron proxies de desarrollo para `/uploads`, `/images` y `/imagenes` hacia `http://localhost:8080`.
   - Esto permite que Vite cargue archivos de Spring Boot sin cambiar controladores ni endpoints.

3. `src/pages/ProductoPage.jsx`
   - Se reconstruyó la galería con `SafeImg`.
   - Se eliminaron rutas de fallback frágiles.
   - Se normalizaron imágenes de galería con múltiples nombres de campo.

## Cómo verificar

1. Reinicia Vite después de cambiar `vite.config.js`.
2. Abre DevTools → Network → Img.
3. Si una imagen sigue fallando, revisa la URL exacta:
   - Correcto en desarrollo: `/uploads/...`, `/images/...` o `/imagenes/...` proxyeado a `localhost:8080`.
   - Si tu backend sirve media en otro host, define `VITE_MEDIA_BASE_URL=http://localhost:8080`.
4. Verifica que Spring Boot realmente sirva el archivo físico y no solo guarde el nombre en base de datos.

## Nota para producción

Si el frontend se despliega separado del backend, configura una variable de entorno:

`VITE_MEDIA_BASE_URL=https://tu-backend.com`

Así las imágenes estáticas se resolverán contra el backend real sin modificar lógica de negocio.
