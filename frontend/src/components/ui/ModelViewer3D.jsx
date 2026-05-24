import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, RotateCw, Sun, Box } from 'lucide-react';
import '@google/model-viewer';
import { getCategoryModel } from '../../utils/categoryAssets';

export default function ModelViewer3D({ product }) {
  const viewerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  const categoria = product.categoria?.nombre || '';
  const modelSrc = product.modelo3dUrl || '/NeilArmstrong.glb';
  const poster = product.imagenPrincipal || product.imagenUrl || product.imagen || '';

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onLoad = () => { setModelLoaded(true); setModelError(false); };
    const onError = () => { setModelError(true); setModelLoaded(false); };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => { el.removeEventListener('load', onLoad); el.removeEventListener('error', onError); };
  }, [modelSrc]);

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl border border-border ${fullscreen ? 'fixed inset-0 z-50' : 'aspect-[4/5]'}`}
        style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}
      >
        <model-viewer
          ref={viewerRef}
          src={modelSrc}
          poster={poster || undefined}
          alt={product?.nombre || 'Modelo 3D'}
          auto-rotate={autoRotate}
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          environment-image="neutral"
          exposure="1.5"
          shadow-intensity="0.6"
          shadow-softness="0.4"
          interaction-prompt="auto"
          loading="lazy"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          <div className="slot" slot="progress-bar">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-tertiary">
              <div className="h-full bg-accent-500 transition-all duration-300" style={{ width: 'var(--progress-bar-progress, 0%)' }} />
            </div>
          </div>
        </model-viewer>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
          <button onClick={() => setAutoRotate(!autoRotate)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm text-xs ${autoRotate ? 'bg-accent-500/20 text-accent-500 border border-accent-500/30' : 'bg-surface/80 text-ink-tertiary border border-border hover:text-ink'}`}
            title="Auto rotación">
            <RotateCw size={14} />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)}
            className="w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-ink-tertiary hover:text-ink border border-border transition-colors"
            title="Pantalla completa">
            {fullscreen ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-border text-[10px] font-semibold text-accent-500 uppercase tracking-wider">
            <Box size={12} /> 3D interactivo
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-10 hidden">
          <button slot="ar-button" id="ar-button"
            className="px-3 py-1.5 rounded-lg bg-surface/80 backdrop-blur-sm border border-border text-xs text-ink-secondary hover:text-accent-500 transition-colors flex items-center gap-1.5">
            <Sun size={12} /> Ver en RA
          </button>
        </div>

        {modelError && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <div className="text-center">
              <Box size={48} className="mx-auto text-ink-tertiary mb-3" />
              <p className="text-ink-secondary text-sm font-medium">Modelo 3D no disponible</p>
              <p className="text-ink-tertiary text-xs mt-1">Mostrando vista estándar</p>
            </div>
          </div>
        )}

        {!modelLoaded && !modelError && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-ink-tertiary text-xs">Cargando modelo 3D...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-ink-tertiary">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-border flex items-center justify-center text-[8px]">⌘</span> Arrastrar para rotar</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-border flex items-center justify-center text-[8px]">⌘</span> Scroll para zoom</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-border flex items-center justify-center text-[8px]">⌘</span> Click derecho para mover</span>
      </div>
    </>
  );
}
