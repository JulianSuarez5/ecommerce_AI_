import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { ArrowRight } from 'lucide-react';
import RobotGreeting from './RobotGreeting';

const SPLINE_URL = 'https://prod.spline.design/3c3rOBJxzYuK8lDA/scene.splinecode';
const FALLBACK_IMG = 'https://cdn.prod.website-files.com/6501f1891917bde75ab542ee/653e8be9ae6bc59344b62ff3_robot-phunk%201.webp';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function SplineScene() {
  const splineRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isInView = useInView(containerRef, { once: true, margin: '200px' });
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  const onLoad = useCallback((splineApp) => {
    splineRef.current = splineApp;
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (isMobile || !loaded || !splineRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mousePos.current = { x, y };
      try {
        splineRef.current?.emitEvent('mouseMove', { x, y });
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, loaded]);

  if (isMobile || error) return null;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {isInView && (
        <Spline
          scene={SPLINE_URL}
          onLoad={onLoad}
          onError={() => setError(true)}
          className="w-full h-full"
        />
      )}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function SplineRobotIntro() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <section className="relative w-full min-h-screen overflow-hidden pt-16"
      style={{ background: 'var(--bg-primary, linear-gradient(135deg, #0a1a1a 0%, #0d2b2b 50%, #051515 100%))' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(20,184,166,0.05), transparent, rgba(16,185,129,0.05))' }} />
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(20,184,166,0.05)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.05)' }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 min-h-screen flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 pt-24 md:pt-0 md:pr-12 lg:pr-16 z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-emerald-200">
                CENTRO
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                VA
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-zinc-400 font-light leading-relaxed max-w-xl">
              Donde cada producto cobra vida. Explora en 3D, descubre cada ángulo y vive una experiencia de compra
              verdaderamente inmersiva.
            </p>

            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <a
                href="/catalogo"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm tracking-wide shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Explorar productos
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </a>
              <a
                href="/catalogo?ofertas=true"
                className="inline-flex items-center px-8 py-4 rounded-full border border-zinc-700/50 text-zinc-300 font-medium text-sm hover:bg-white/5 hover:border-zinc-600 transition-all duration-300"
              >
                Ver ofertas
              </a>
            </motion.div>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative flex-shrink-0">
          {isMobile ? (
            <div className="w-full h-full flex items-center justify-center p-8 relative">
              <img
                src={FALLBACK_IMG}
                alt="Robot Centrova"
                className="w-full h-full object-contain"
                loading="lazy"
              />
              <RobotGreeting />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <SplineScene />
              <RobotGreeting />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
