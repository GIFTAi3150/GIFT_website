'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';

const SHIELD_COLOR = '#2563EB';
const GOLD = '#eeebe3';

// --------------- SVG PATHS ---------------
const SHIELD_PATH =
  'M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z';
const G_PATH_1 =
  'M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z';
const G_PATH_2 =
  'M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z';

// --------------- HELPERS ---------------
function parsePath(d: string): THREE.Shape[] {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
  const loader = new SVGLoader();
  const shapes: THREE.Shape[] = [];
  loader.parse(svg).paths.forEach((p) => p.toShapes(true).forEach((s) => shapes.push(s)));
  return shapes;
}

function buildGeometry(shapes: THREE.Shape[], depth: number): THREE.BufferGeometry[] {
  return shapes.map((shape) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 4,
      bevelSegments: 10,
      curveSegments: 24,
    });

    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;

    const dents = [
      { cx: 350, cy: 320, r: 40, strength: -1.2 },
      { cx: 520, cy: 500, r: 30, strength: -0.8 },
    ];
    const frontZ = depth;
    const backZ = 0;

    for (let i = 0; i < pos.count; i++) {
      const nz = norm.getZ(i);
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(nz) < 0.9) continue;

      const isFront = nz > 0.9;
      const faceZ = isFront ? frontZ : backZ;
      const dir = isFront ? 1 : -1;

      if (Math.abs(z - faceZ) > 5) continue;

      for (const dent of dents) {
        const dx = x - dent.cx;
        const dy = y - dent.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < dent.r) {
          const t = 1 - dist / dent.r;
          const push = t * t * dent.strength * dir;
          pos.setZ(i, z + push);
        }
      }
    }

    pos.needsUpdate = true;

    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = pos.getX(i) / 800;
      uvs[i * 2 + 1] = pos.getY(i) / 800;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  });
}

// --------------- MATERIAL ---------------
function useMaterial(color: string, metalness: number, roughness: number): THREE.MeshPhysicalMaterial {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
      }),
    [color, metalness, roughness],
  );
}

// --------------- MAIN SCENE ---------------
function ShieldScene({
  onFirstFrame,
  mouseRef,
}: {
  onFirstFrame?: () => void;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const frameCountRef = useRef(0);
  const firedRef = useRef(false);
  useFrame(() => {
    if (firedRef.current) return;
    frameCountRef.current += 1;
    if (frameCountRef.current >= 3) {
      firedRef.current = true;
      onFirstFrame?.();
    }
  });

  const groupRef = useRef<THREE.Group>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  // Smoothly lerp rotation toward cursor position each frame.
  // MAX_Y / MAX_X cap the angle so the shield never hits bad-quality side angles.
  useFrame(() => {
    if (!groupRef.current) return;
    const MAX_Y = 0.5; // ~29°
    const MAX_X = 0.38; // ~22°
    tiltRef.current.x += (mouseRef.current.y * -MAX_X - tiltRef.current.x) * 0.08;
    tiltRef.current.y += (mouseRef.current.x * MAX_Y - tiltRef.current.y) * 0.08;
    groupRef.current.rotation.x = tiltRef.current.x;
    groupRef.current.rotation.y = tiltRef.current.y;
  });

  const { shieldShapes, g1Shapes, g2Shapes } = useMemo(
    () => ({
      shieldShapes: parsePath(SHIELD_PATH),
      g1Shapes: parsePath(G_PATH_1),
      g2Shapes: parsePath(G_PATH_2),
    }),
    [],
  );

  const shieldGeos = useMemo(() => buildGeometry(shieldShapes, 30), [shieldShapes]);
  const g1Geos = useMemo(() => buildGeometry(g1Shapes, 35), [g1Shapes]);
  const g2Geos = useMemo(() => buildGeometry(g2Shapes, 35), [g2Shapes]);

  const shieldMat = useMaterial(SHIELD_COLOR, 0.75, 0.3);
  const goldMat = useMaterial(GOLD, 0.85, 0.15);

  const cx = 414,
    cy = 400,
    scale = 0.003;

  return (
    <>
      <group ref={groupRef}>
        <group scale={[scale, -scale, scale]}>
          <group position={[-cx, -cy, 0]}>
            {shieldGeos.map((geo, i) => (
              <mesh key={`s${i}`} geometry={geo} material={shieldMat} />
            ))}
            {g1Geos.map((geo, i) => (
              <mesh key={`g1${i}`} geometry={geo} material={goldMat} position={[0, 0, 5]} />
            ))}
            {g2Geos.map((geo, i) => (
              <mesh key={`g2${i}`} geometry={geo} material={goldMat} position={[0, 0, 5]} />
            ))}

            <group position={[828, 0, 30]} scale={[-1, 1, -1]}>
              {g1Geos.map((geo, i) => (
                <mesh key={`g1b${i}`} geometry={geo} material={goldMat} position={[0, 0, 5]} />
              ))}
              {g2Geos.map((geo, i) => (
                <mesh key={`g2b${i}`} geometry={geo} material={goldMat} position={[0, 0, 5]} />
              ))}
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

// --------------- EXPORT ---------------
interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onContextLost?: () => void;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-[260px] sm:h-[320px] lg:h-[400px]',
  md: 'h-[320px] sm:h-[400px] lg:h-[500px]',
  lg: 'h-[360px] sm:h-[460px] lg:h-[640px]',
};

const MAX_CANVAS_LOSSES = 3;

export default function GiftLogo3D_PremiumBadge({ className, size = 'lg', onContextLost }: Props) {
  const [ready, setReady] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const lossCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track mouse position normalized to [-1, 1] relative to the canvas container.
  // On leave, reset to center so the logo smoothly returns to front-facing.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouseRef.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Failsafe: release the page cover after 6s if onFirstFrame never fires.
  useEffect(() => {
    const t = setTimeout(() => {
      if (ready) return;
      setReady(true);
      window.dispatchEvent(new Event('gift:logo-ready'));
    }, 6000);
    return () => clearTimeout(t);
  }, [ready]);

  const handleContextLost = () => {
    lossCountRef.current += 1;
    setReady(false);
    if (lossCountRef.current >= MAX_CANVAS_LOSSES) {
      onContextLost?.();
      return;
    }
    setCanvasKey((k) => k + 1);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ''} ${SIZE_CLASSES[size]}`}
      style={{ width: '100%', backgroundColor: 'transparent' }}
    >
      <Canvas
        key={canvasKey}
        className="absolute inset-0"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 400ms ease-out',
        }}
        dpr={[1, 1.5]}
        gl={makeSafeRenderer(
          {
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.5,
            powerPreference: 'default',
            stencil: false,
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false,
          },
          handleContextLost,
        )}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[-4, 3, 5]} intensity={2.2} color={'#fff0e0'} />
        <directionalLight position={[3, 0, 3]} intensity={0.7} color={'#b0c0e0'} />
        <directionalLight position={[0, 1, -4]} intensity={1.2} color={'#ffffff'} />
          <ShieldScene
            mouseRef={mouseRef}
            onFirstFrame={() => {
              setTimeout(() => {
                setReady(true);
                window.dispatchEvent(new Event('gift:logo-ready'));
              }, 250);
            }}
          />
      </Canvas>
    </div>
  );
}
