const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL || '').replace(/\/$/, '');
const MEDIA_FOLDERS = ['uploads/', 'imagenes/', 'images/', 'media/', 'files/'];

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function isMediaFolder(path) {
  return MEDIA_FOLDERS.some((folder) => path.startsWith(folder));
}

export function resolveImageUrl(path) {
  if (!path || typeof path !== 'string') return null;
  const clean = path.trim();
  if (!clean) return null;
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;

  let normalized = clean.replace(/^\.?\//, '').replace(/^static\//, '');
  if (!normalized) return null;

  // Strip /api prefix — backend WebConfig serves static media via /imagenes/**
  // (not /api/imagenes/**), but the UploadController returns paths prefixed
  // with /api/imagenes/. Strip api/ so the URL hits the resource handler.
  if (normalized.startsWith('api/')) {
    normalized = normalized.replace(/^api\//, '');
  }

  // Product media served as static Spring resources via WebConfig ResourceHandler.
  if (isMediaFolder(normalized)) {
    return `/${normalized}`.replace(/([^:]\/)\/+/g, '$1');
  }

  return `/${normalized}`.replace(/([^:]\/)\/+/g, '$1');
}

export function getProductImage(product) {
  if (!product) return null;
  const galleryItem = Array.isArray(product.imagenes) ? product.imagenes.find(Boolean) : null;
  return firstString(
    product.imagenPrincipal,
    product.imagenUrl,
    product.imagen,
    product.urlImagen,
    product.foto,
    product.thumbnail,
    product.image,
    product.imageUrl,
    product.portada,
    product.rutaImagen,
    galleryItem?.url,
    galleryItem?.imagenUrl,
    galleryItem?.urlImagen,
    galleryItem?.ruta,
    galleryItem?.path,
    galleryItem?.filename,
    galleryItem?.nombreArchivo,
    typeof galleryItem === 'string' ? galleryItem : null
  );
}
