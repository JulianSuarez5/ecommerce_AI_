import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, Environment, ContactShadows } from '@react-three/drei';
import { motion, useScroll as useFramerScroll, useMotionValueEvent } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

const MODEL_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

function ProductModel() {
  const { scene } = useGLTF(MODEL_URL);
  const scroll = useScroll();
  const groupRef = useRef();

  const { meshes, originalPositions } = useMemo(() => {
    const cloned = scene.clone(true);
    const m = [];
    cloned.traverse((obj) => { if (obj.isMesh) m.push(obj); });
    const positions = m.map((mesh) => mesh.position.clone());
    return { meshes: m, originalPositions: positions };
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current || meshes.length === 0) return;
    const t = scroll.offset;

    const phase1 = Math.min(t / 0.2, 1);
    groupRef.current.rotation.y = phase1 * Math.PI * 0.5;
    groupRef.current.position.y = -0.5 + phase1 * 0.5;
    groupRef.current.scale.setScalar(0.6 + phase1 * 0.4);

    if (t >= 0.2 && t < 0.5) {
      const phase = (t - 0.2) / 0.3;
      meshes.forEach((mesh, i) => {
        const orig = originalPositions[i];
        if (!orig) return;
        const dir = new THREE.Vector3(
          orig.x + (i % 2 === 0 ? 1 : -1) * 0.3,
          orig.y,
          orig.z + (i % 3 === 0 ? 1 : -1) * 0.3,
        ).normalize();
        if (dir.length() === 0) dir.set(1, 0, 0);
        mesh.position.set(
          orig.x + dir.x * phase * 2.5,
          orig.y + dir.y * phase * 1.8,
          orig.z + dir.z * phase * 2.5,
        );
        mesh.rotation.x = phase * 0.4 * (i % 2 === 0 ? 1 : -1);
        mesh.rotation.z = phase * 0.3 * (i % 3 === 0 ? 1 : -1);
      });
      groupRef.current.rotation.y = Math.PI * 0.5 + phase * 0.5;
    }

    if (t >= 0.5 && t < 0.7) {
      groupRef.current.rotation.y += delta * 0.3;
    }

    if (t >= 0.7 && t < 0.9) {
      const phase = 1 - (t - 0.7) / 0.2;
      meshes.forEach((mesh, i) => {
        const orig = originalPositions[i];
        if (!orig) return;
        const dir = new THREE.Vector3(
          orig.x + (i % 2 === 0 ? 1 : -1) * 0.3,
          orig.y,
          orig.z + (i % 3 === 0 ? 1 : -1) * 0.3,
        ).normalize();
        if (dir.length() === 0) dir.set(1, 0, 0);
        mesh.position.set(
          orig.x + dir.x * phase * 2.5,
          orig.y + dir.y * phase * 1.8,
          orig.z + dir.z * phase * 2.5,
        );
        mesh.rotation.x = phase * 0.4 * (i % 2 === 0 ? 1 : -1);
        mesh.rotation.z = phase * 0.3 * (i % 3 === 0 ? 1 : -1);
      });
    }

    if (t >= 0.9) {
      const phase = (t - 0.9) / 0.1;
      meshes.forEach((mesh, i) => {
        const orig = originalPositions[i];
        if (!orig) return;
        mesh.position.copy(orig);
        mesh.rotation.set(0, 0, 0);
      });
      groupRef.current.scale.setScalar(1 + phase * 0.15);
      groupRef.current.position.y = phase * -0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone(true)} />
    </group>
  );
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#080808]">
      <img
        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85"
        alt="Producto destacado"
        className="w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808]" />
    </div>
  );
}

const textSections = [
  {
    id: 1, range: [0, 0.2],
    title: 'Descubre Centrova',
    subtitle: 'La tienda que te da la vuelta al producto antes de comprarlo',
    align: 'left',
  },
  {
    id: 2, range: [0.2, 0.45],
    title: 'Cada detalle importa',
    subtitle: 'Explora cada componente como nunca antes',
    specs: ['Polígonos optimizados', 'Materiales PBR', 'Iluminación HDRI'],
    align: 'left',
  },
  {
    id: 3, range: [0.5, 0.65],
    title: 'Ingeniería de precisión',
    subtitle: 'Cada pieza diseñada al milímetro',
    align: 'right',
  },
  {
    id: 4, range: [0.7, 0.85],
    title: 'Todo vuelve a su lugar',
    subtitle: 'La perfección está en los detalles que se ensamblan',
    align: 'right',
  },
  {
    id: 5, range: [0.9, 1.0],
    title: '¿Listo para el tuyo?',
    subtitle: 'Tecnología que transforma tu día a día',
    align: 'center',
    cta: true,
  },
];

function OverlayManager() {
  const { scrollYProgress } = useFramerScroll();
  const [activeId, setActiveId] = useState(1);
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setProgress(latest);
    for (const section of textSections) {
      if (latest >= section.range[0] && latest < section.range[1]) {
        setActiveId(section.id);
        break;
      }
    }
  });

  const activeSection = textSections.find((s) => s.id === activeId) || textSections[0];

  const opacity = Math.min(
    Math.max((progress - activeSection.range[0]) / 0.05, 0),
    Math.max((activeSection.range[1] - progress) / 0.05, 0),
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {textSections.map((section) => {
        const isActive = section.id === activeId;
        const sectionProgress = (progress - section.range[0]) / (section.range[1] - section.range[0]);
        const sectionOpacity = Math.max(0, Math.min(
          Math.min(sectionProgress / 0.15, 1),
          Math.min((1 - sectionProgress) / 0.15, 1),
        ));

        return (
          <div
            key={section.id}
            className="absolute inset-0 flex items-center px-8 lg:px-16"
            style={{
              opacity: isActive ? opacity : 0,
              pointerEvents: isActive && opacity > 0.1 ? 'auto' : 'none',
            }}
          >
            <div className={`w-full ${
              section.align === 'center' ? 'text-center' :
              section.align === 'right' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block max-w-xl ${
                section.align === 'center' ? 'mx-auto' :
                section.align === 'right' ? 'ml-auto' : ''
              }`}>
                {section.specs && (
                  <div className="flex flex-wrap gap-2 mb-6 justify-start">
                    {section.specs.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full border text-[10px] font-medium uppercase tracking-[0.12em]"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#888' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <h2
                  className="font-['Space_Grotesk'] font-bold text-white leading-[0.95] mb-4"
                  style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)' }}
                >
                  {section.title}
                </h2>
                <p className="text-sm lg:text-base leading-relaxed max-w-md" style={{ color: '#888' }}>
                  {section.subtitle}
                </p>
                {section.cta && (
                  <motion.div
                    className="mt-10 pointer-events-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <a
                      href="/catalogo"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 hover:brightness-110 group"
                      style={{ background: '#f0c040', color: '#080808' }}
                    >
                      Explorar catálogo
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ScrollytellingHero() {
  const hasWebGL = typeof WebGLRenderingContext !== 'undefined';

  return (
    <div className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: '#080808' }}>
        {hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 40 }}
            style={{ background: '#080808' }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 1.5]}
            onCreated={({ gl }) => { gl.setClearColor('#080808'); }}
          >
            <ambientLight intensity={0.15} />
            <spotLight position={[8, 8, 8]} angle={0.15} penumbra={1} intensity={3} color="#ffffff" />
            <spotLight position={[-6, -4, -6]} angle={0.2} penumbra={1} intensity={0.8} color="#4080ff" />
            <spotLight position={[0, 6, -4]} angle={0.3} penumbra={1} intensity={0.5} color="#f0c040" />
            <Environment preset="studio" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={12} blur={2.5} />
            <ScrollControls pages={5} damping={0.15}>
              <ProductModel />
            </ScrollControls>
          </Canvas>
        ) : (
          <SceneFallback />
        )}

        <OverlayManager />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: '#444' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} style={{ color: '#666' }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
