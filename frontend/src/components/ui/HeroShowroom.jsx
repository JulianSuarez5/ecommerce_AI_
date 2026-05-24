import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, ContactShadows, Environment, OrbitControls, useGLTF, Html, useProgress } from '@react-three/drei';
import ModelViewer3D from './ModelViewer3D';
import { resolveImageUrl, getProductImage } from '../../utils/imageUrl';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="p-3 rounded-lg bg-surface border border-border shadow-card text-sm text-ink">Cargando 3D {Math.round(progress)}%</div>
    </Html>
  );
}

function GltfModel({ url }) {
  const gltf = useGLTF(url, true);
  return <primitive object={gltf.scene} dispose={null} />;
}

export default function HeroShowroom({ product }) {
  const modelUrl = product?.modelo3dUrl ? resolveImageUrl(product.modelo3dUrl) : null;
  const poster = resolveImageUrl(getProductImage(product)) || '';

  const isGltf = modelUrl && /\.(glb|gltf)(\?.*)?$/i.test(modelUrl);

  if (!modelUrl) {
    return (
      <div className="relative w-full max-w-[420px]" style={{ aspectRatio: '3/4' }}>
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-accent-500/8 via-transparent to-accent-500/4" />
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-border bg-surface shadow-elevated">
          {poster ? (
            <img src={poster} alt={product?.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full"><div className="text-ink-tertiary">Sin vista 3D</div></div>
          )}
        </div>
      </div>
    );
  }

  if (!isGltf) {
    return <ModelViewer3D product={product} />;
  }

  return (
    <div className="relative w-full max-w-[560px]" style={{ aspectRatio: '3/4' }}>
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-accent-500/10 via-transparent to-accent-500/6" />
      <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-border bg-transparent shadow-elevated">
        <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.9} />
          <Suspense fallback={<Loader />}>
            <PresentationControls global rotation={[0, Math.PI / 6, 0]} polar={[-0.2, 0.2]} azimuth={[-Math.PI / 3, Math.PI / 3]} config={{ mass: 1.2, tension: 170 }}>
              <GltfModel url={modelUrl} />
            </PresentationControls>
            <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={6} blur={1.8} />
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={true} />
        </Canvas>
        <div className="absolute bottom-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1.5 text-[10px] font-semibold text-accent-500 border border-accent-500/30 backdrop-blur-sm">3D interactivo</span>
        </div>
      </div>
    </div>
  );
}
