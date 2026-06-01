'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const BRAND_GREEN = '#2d6b3f';
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

// --------------- HALF-SHADOW MATERIAL ---------------
function useHalfShadowMaterial(
  color: string,
  metalness: number,
  roughness: number,
  normalMap: THREE.Texture,
  roughnessMap: THREE.Texture,
  colorMap: THREE.Texture,
  normalStrength: number,
): THREE.MeshPhysicalMaterial {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      metalness,
      roughness,
      normalMap,
      normalScale: new THREE.Vector2(normalStrength, normalStrength),
      roughnessMap,
      clearcoat: 0.15,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.02,
    });

    m.userData.colorMap = colorMap;
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uColorMap = { value: colorMap };

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        '#include <common>\nuniform sampler2D uColorMap;',
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec2 colorUV = gl_FragCoord.xy / 512.0;
        vec3 texColor = texture2D(uColorMap, colorUV).rgb;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * texColor, 0.1);

        #include <dithering_fragment>
        `,
      );
    };

    return m;
  }, [color, metalness, roughness, normalMap, roughnessMap, normalStrength]);

  return mat;
}

// --------------- MAIN SCENE ---------------
function ShieldScene({ onFirstFrame }: { onFirstFrame?: () => void }) {
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

  const [normalMap, roughnessMap, colorMap] = useLoader(THREE.TextureLoader, [
    '/textures/NormalGL.webp',
    '/textures/Roughness.webp',
    '/textures/Color.webp',
  ]);

  useMemo(() => {
    [normalMap, roughnessMap, colorMap].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
    });
  }, [normalMap, roughnessMap, colorMap]);

  const shieldMat = useHalfShadowMaterial(
    BRAND_GREEN,
    0.75,
    0.35,
    normalMap,
    roughnessMap,
    colorMap,
    1.5,
  );
  const goldMat = useHalfShadowMaterial(GOLD, 0.85, 0.25, normalMap, roughnessMap, colorMap, 1.0);

  const wholeGroupRef = useRef<THREE.Group>(null);
  // The shared Canvas (RootCanvas) has been running since app boot, so
  // clock.getElapsedTime() is wall-clock from boot, not from when this
  // scene mounted. Capture the first-frame offset so the entrance
  // animation always starts at t=0 when the user lands on the page.
  const startTimeRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !wholeGroupRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = clock.getElapsedTime();
    }
    const t = clock.getElapsedTime() - startTimeRef.current;

    // Defensive: pin Y and Z to exactly 0 every frame. The animation only
    // ever drives X (slide), scale, and rotation.y — but if anything
    // upstream (drei <Bounds>, a parent transform, a stale tween) ever
    // touches Y/Z, this overwrites it before it can paint.
    let posX = 0;
    let scaleS = 1;

    if (t < 1.6) {
      const s = Math.min(t / 1.6, 1);
      scaleS = 1 - Math.pow(1 - s, 3);
      groupRef.current.rotation.y = 0;
    } else if (t < 1.9) {
      const p = (t - 1.6) / 0.3;
      const eased = 1 - Math.pow(1 - p, 2);
      scaleS = 1 + eased * 0.28;
      groupRef.current.rotation.y = 0;
    } else if (t < 2.3) {
      const p = (t - 1.9) / 0.4;
      const decay = Math.exp(-4 * p);
      const osc = Math.cos(p * Math.PI * 2.2);
      scaleS = 1 + 0.28 * decay * osc;
      groupRef.current.rotation.y = 0;
    } else if (t < 4) {
      const p = (t - 2.3) / 1.7;
      const eased = 1 - Math.pow(1 - p, 3);
      posX = eased * -0.8;
      groupRef.current.rotation.y = 0;
    } else if (t < 19) {
      const p = (t - 4) / 15;
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      posX = -0.8;
      groupRef.current.rotation.y = eased * Math.PI;
    } else {
      posX = -0.8;
      groupRef.current.rotation.y = Math.PI;
    }

    wholeGroupRef.current.position.set(posX, 0, 0);
    wholeGroupRef.current.scale.setScalar(scaleS);
  });

  const cx = 414,
    cy = 400,
    scale = 0.003;

  return (
    <>
      <group ref={wholeGroupRef}>
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
      </group>
    </>
  );
}

// --------------- EXPORT ---------------
interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Called when the WebGL context is lost. Parent should remount this
   *  component (via key change) to recover. After too many losses the
   *  parent should show a static fallback instead. */
  onContextLost?: () => void;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-[260px] sm:h-[320px] lg:h-[400px]',
  md: 'h-[320px] sm:h-[400px] lg:h-[500px]',
  lg: 'h-[360px] sm:h-[460px] lg:h-[640px]',
};

// `onContextLost` is accepted for API compatibility with HeroLogoDelayed
// but is unused: context loss is now handled by the shared RootCanvas,
// which remounts the entire canvas on loss. Per-View remount can't
// recover from a lost surface — there is no surface left.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GiftLogo3D_PremiumBadge({ className, size = 'lg', onContextLost: _onContextLost }: Props) {
  const [ready, setReady] = useState(false);
  // "IFT INC." lives in the DOM, not inside the WebGL canvas, so it can
  // never lose context. It fades in at the same time the 3D animation
  // slides the shield left (t = 2.3s after the scene first renders).
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setTextVisible(true), 2300);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div
      className={`relative ${className ?? ''} ${SIZE_CLASSES[size]}`}
      style={{ width: '100%', backgroundColor: 'transparent' }}
    >
      {/* Cover div fades away once three.js has painted its first frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />
      {/* drei's <View>, when rendered OUTSIDE a Canvas, ignores any `track`
          prop and renders its OWN <div> as the tracker. The shared Canvas
          (mounted in app/layout.tsx via RootCanvasMount) scissors itself
          to this <View>'s bounding rect and paints the scene there. So
          this <View> element IS the rectangle the 3D logo occupies. */}
      <View
        className="absolute inset-0"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 400ms ease-out',
          // Force the tracker div onto its own compositor layer + isolate
          // its layout. Without this, drei <View> reads the tracker's
          // getBoundingClientRect every frame and any sub-pixel shift —
          // smooth-scroll snapping, fractional layout settling, mobile
          // address-bar collapse — moves the scissored paint rect on the
          // shared canvas by ≤1px, which reads as the 3D logo "hopping"
          // vertically while otherwise idle. translateZ(0) promotes the
          // element so the browser pixel-snaps its painted position;
          // `contain` stops layout/paint side-effects from rippling in.
          transform: 'translateZ(0)',
          contain: 'layout style paint',
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[-4, 3, 5]} intensity={3.5} color={'#fff0e0'} />
        <directionalLight position={[3, 0, 3]} intensity={1.0} color={'#b0c0e0'} />
        <directionalLight position={[0, 1, -4]} intensity={2.0} color={'#ffffff'} />
        <ShieldScene
          onFirstFrame={() => {
            setTimeout(() => {
              setReady(true);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('gift:logo-ready'));
              }
            }, 250);
          }}
        />
      </View>

      {/* "IFT INC." rendered as DOM — not WebGL — so context loss never
          makes the text disappear. Fades in sync with the 3D shield slide. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="absolute font-bold tracking-[0.05em] text-[35px] sm:text-[44px] lg:text-[62px]"
          style={{
            left: '58%',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#111B21',
            opacity: textVisible ? 0.88 : 0,
            transition: 'opacity 1700ms cubic-bezier(0.33, 1, 0.68, 1)',
            fontFamily: 'var(--font-poppins), "Poppins", sans-serif',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          IFT INC.
        </span>
      </div>
    </div>
  );
}
