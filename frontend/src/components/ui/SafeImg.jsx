import { useState } from 'react';

const ULTIMATE_FALLBACK =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22533%22%3E%3Crect%20fill%3D%22%23F3F4F6%22%20width%3D%22400%22%20height%3D%22533%22%2F%3E%3Crect%20x%3D%22160%22%20y%3D%22220%22%20width%3D%2280%22%20height%3D%2260%22%20rx%3D%224%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22310%22%20text-anchor%3D%22middle%22%20fill%3D%22%239CA3AF%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%3ESin%20imagen%3C%2Ftext%3E%3C%2Fsvg%3E';

export default function SafeImg({ src, fallback, alt, className = '', ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback || ULTIMATE_FALLBACK);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallback && fallback) {
          setCurrentSrc(fallback);
        } else if (currentSrc !== ULTIMATE_FALLBACK) {
          setCurrentSrc(ULTIMATE_FALLBACK);
        }
      }}
      {...props}
    />
  );
}
