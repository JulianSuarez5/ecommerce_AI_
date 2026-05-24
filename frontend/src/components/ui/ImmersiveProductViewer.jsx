import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { PLACEHOLDER_SVG } from '../../utils/categoryAssets';

const FALLBACK = PLACEHOLDER_SVG;

export default function ImmersiveProductViewer({ images = [], selectedColor, onColorChange, productName, hasDiscount, discountPercent }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [currentImg, setCurrentImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const tiltX = (mouseY / (rect.height / 2)) * -12;
    const tiltY = (mouseX / (rect.width / 2)) * 12;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
    setIsHovering(false);
  };

  const imgSrc = images[currentImg] || FALLBACK;

  return (
    <>
      <div
        ref={containerRef}
        className="relative group"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-white"
          style={{
            transform: isHovering ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)` : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            boxShadow: isHovering
              ? `${tilt.y * 0.5}px ${tilt.x * -0.5}px 60px rgba(232, 184, 109, 0.15), 0 30px 80px rgba(0,0,0,0.08)`
              : '0 20px 60px rgba(0,0,0,0.08)',
          }}
          onClick={() => setZoom(true)}
        >
          <img
            src={imgSrc}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{
              transform: isHovering ? `scale(1.08) translateX(${tilt.y * 0.3}px) translateY(${tilt.x * -0.3}px)` : 'scale(1)',
            }}
            onError={(e) => { console.warn('ImmersiveViewer img failed:', e.target.src); e.target.src = FALLBACK; }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isHovering
                ? `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(232,184,109,0.08) 0%, transparent 60%)`
                : 'none',
              transition: 'background 0.2s ease',
            }}
          />

          {hasDiscount && (
            <span className="absolute top-4 left-4 badge bg-[var(--error)] text-white text-sm font-bold px-3 py-1 z-10">-{discountPercent}% OFF</span>
          )}

          {/* Color overlay effect */}
          {selectedColor && selectedColor !== '#111111' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-hue opacity-30"
              style={{ backgroundColor: selectedColor }}
            />
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`w-16 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  i === currentImg ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-white scale-105' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  transform: isHovering ? `rotateX(${tilt.x * 0.3}deg) rotateY(${tilt.y * 0.3}deg)` : 'none',
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { console.warn('ImmersiveViewer thumb failed:', e.target.src); e.target.src = FALLBACK; }} />
              </button>
            ))}
          </div>
        )}

        {/* Glow edge on hover */}
        <div
          className="absolute -inset-[1px] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(600px circle at ${glare.x}% ${glare.y}%, rgba(232,184,109,0.06), transparent 50%)`
              : 'none',
          }}
        />
      </div>

      {/* Fullscreen zoom */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center" onClick={() => setZoom(false)}>
          <button className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-ink hover:text-accent-500 transition-colors z-10">
            <X size={20} />
          </button>
          <img src={imgSrc} alt={productName} className="max-w-[90vw] max-h-[90vh] object-contain" onError={(e) => { console.warn('ImmersiveViewer zoom failed:', e.target.src); e.target.src = FALLBACK; }} />
        </div>
      )}
    </>
  );
}
