function encode(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function productSvg(label, accent = '#D6C18A', bg = '#F7F2E8') {
  return encode(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="820" viewBox="0 0 640 820" role="img" aria-label="${label}">
    <defs>
      <radialGradient id="halo" cx="50%" cy="34%" r="55%"><stop offset="0" stop-color="${accent}" stop-opacity=".26"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient>
      <linearGradient id="device" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#E9E2D3"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#1A1A2E" flood-opacity=".18"/></filter>
    </defs>
    <rect width="640" height="820" rx="42" fill="${bg}"/>
    <rect width="640" height="820" fill="url(#halo)"/>
    <ellipse cx="320" cy="648" rx="150" ry="32" fill="#1A1A2E" opacity=".10"/>
    <g filter="url(#shadow)">
      <rect x="210" y="148" width="220" height="390" rx="34" fill="#171B27"/>
      <rect x="230" y="178" width="180" height="314" rx="22" fill="url(#device)"/>
      <circle cx="320" cy="514" r="10" fill="${accent}"/>
      <rect x="268" y="214" width="104" height="13" rx="7" fill="#D7CFBF"/>
      <rect x="260" y="262" width="120" height="120" rx="26" fill="#FFFFFF" opacity=".72"/>
      <path d="M285 338l35-58 36 58h-71z" fill="${accent}" opacity=".88"/>
    </g>
    <g opacity=".42" stroke="#1A1A2E" stroke-width="2" fill="none">
      <path d="M126 260c46-48 86-56 121-24"/>
      <path d="M438 238c42 16 66 48 70 96"/>
      <path d="M126 560c38 30 82 34 130 10"/>
    </g>
    <text x="320" y="704" text-anchor="middle" fill="#6B604E" font-family="Georgia,serif" font-size="24" font-weight="700">${label}</text>
  </svg>`);
}

const CATEGORY_FALLBACKS = {
  'electronica': productSvg('Electrónica'),
  'electrónica': productSvg('Electrónica'),
  'laptops': productSvg('Laptop', '#9DB7D8'),
  'computadores': productSvg('Computador', '#9DB7D8'),
  'monitores': productSvg('Monitor', '#9DB7D8'),
  'camaras': productSvg('Cámara', '#B9826B'),
  'cámaras': productSvg('Cámara', '#B9826B'),
  'audifonos': productSvg('Audio', '#D6C18A'),
  'audífonos': productSvg('Audio', '#D6C18A'),
  'accesorios': productSvg('Accesorio'),
  'relojes': productSvg('Reloj', '#B9826B'),
  'zapatos': productSvg('Producto', '#D6C18A'),
  'zapatillas': productSvg('Producto', '#D6C18A'),
  'calzado': productSvg('Producto', '#D6C18A'),
  'ropa': productSvg('Moda', '#B9826B'),
};

export const PLACEHOLDER_SVG = productSvg('Sin imagen');

export function getCategoryFallback(categoryName) {
  if (!categoryName) return PLACEHOLDER_SVG;
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_FALLBACKS[key] || PLACEHOLDER_SVG;
}

const GOOGLE_3D_MODELS = {
  'electronica': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'electrónica': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'tecnología': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'tecnologia': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'moda': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'hogar': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'deportes': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'belleza': 'https://modelviewer.dev/shared-assets/models/MaterialBottle.glb',
  'juguetes': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'libros': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'musica': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'instrumentos': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'muebles': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'iluminación': 'https://modelviewer.dev/shared-assets/models/MaterialBottle.glb',
  'iluminacion': 'https://modelviewer.dev/shared-assets/models/MaterialBottle.glb',
};

const UNIQUE_MODELS = [...new Set(Object.values(GOOGLE_3D_MODELS))];

export function getRandomModel(seed = 0) {
  return UNIQUE_MODELS[Math.abs(seed) % UNIQUE_MODELS.length];
}

export function getCategoryModel(categoryName, producto3d) {
  if (producto3d) return producto3d;
  if (!categoryName) return GOOGLE_3D_MODELS['electronica'];
  const key = categoryName.toLowerCase().trim();
  return GOOGLE_3D_MODELS[key] || GOOGLE_3D_MODELS['electronica'];
}
