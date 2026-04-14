'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
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

    // Add a couple of subtle dents on the front and back faces
    const dents = [
      { cx: 350, cy: 320, r: 40, strength: -1.2 }, // front dent 1
      { cx: 520, cy: 500, r: 30, strength: -0.8 }, // front dent 2
    ];
    const frontZ = depth;
    const backZ = 0;

    for (let i = 0; i < pos.count; i++) {
      const nz = norm.getZ(i);
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Only affect front face (nz > 0.9) or back face (nz < -0.9)
      if (Math.abs(nz) < 0.9) continue;

      const isFront = nz > 0.9;
      const faceZ = isFront ? frontZ : backZ;
      const dir = isFront ? 1 : -1;

      // Check if near face
      if (Math.abs(z - faceZ) > 5) continue;

      for (const dent of dents) {
        const dx = x - dent.cx;
        const dy = y - dent.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < dent.r) {
          // Smooth falloff from center of dent
          const t = 1 - dist / dent.r;
          const push = t * t * dent.strength * dir;
          pos.setZ(i, z + push);
        }
      }
    }

    pos.needsUpdate = true;

    // UVs
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
// This injects a position-based shadow into Three.js's built-in physical material
// so textures work perfectly AND we get the SpaceX half-dark effect
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

    // Blend color texture very subtly onto the base color
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

// --------------- ORBITING ROCKS ---------------
function OrbitingRocks({ count = 6 }: { count?: number }) {
  const rocks = useMemo(() => {
    return Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 2.0 + Math.random() * 1.2,
      y: (Math.random() - 0.5) * 1.5,
      speed: 0.15 + Math.random() * 0.2,
      size: 0.03 + Math.random() * 0.02,
      spinSpeed: 0.5 + Math.random() * 1.5,
    }));
  }, [count]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const BURST = 1.9; // metals burst out at the impact peak
    if (t < BURST) return;

    const since = t - BURST;
    // Ease radius out from 0 to full over ~0.7s
    const radiusEase = Math.min(since / 0.7, 1);
    const r = 1 - Math.pow(1 - radiusEase, 3);

    rocks.forEach((rock, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const angle = rock.angle + since * rock.speed;
      const radius = rock.radius * r;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = rock.y * r + Math.sin(t * 0.5 + i) * 0.1 * r;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.rotation.x = t * rock.spinSpeed;
      mesh.rotation.z = t * rock.spinSpeed * 0.7;
      mesh.visible = true;
    });
  });

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          visible={false}
        >
          <icosahedronGeometry args={[rock.size, 0]} />
          <meshStandardMaterial
            color={'#888888'}
            metalness={0.9}
            roughness={0.15}
            emissive={'#666666'}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

// --------------- MAIN SCENE ---------------
function ShieldScene() {
  const groupRef = useRef<THREE.Group>(null);

  // Parse SVG shapes
  const { shieldShapes, g1Shapes, g2Shapes } = useMemo(
    () => ({
      shieldShapes: parsePath(SHIELD_PATH),
      g1Shapes: parsePath(G_PATH_1),
      g2Shapes: parsePath(G_PATH_2),
    }),
    [],
  );

  // Build geometry
  const shieldGeos = useMemo(() => buildGeometry(shieldShapes, 30), [shieldShapes]);
  const g1Geos = useMemo(() => buildGeometry(g1Shapes, 35), [g1Shapes]);
  const g2Geos = useMemo(() => buildGeometry(g2Shapes, 35), [g2Shapes]);

  // Load textures — base layer + clearcoat layer
  const [normalMap, roughnessMap, colorMap] = useLoader(THREE.TextureLoader, [
    '/textures/NormalGL.webp',
    '/textures/Roughness.webp',
    '/textures/Color.webp',
  ]);

  // Configure texture tiling
  useMemo(() => {
    [normalMap, roughnessMap, colorMap].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
    });
  }, [normalMap, roughnessMap, colorMap]);

  // Create materials — base: Metal056B, clearcoat scratches: PaintedMetal002
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

  const textMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wholeGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !wholeGroupRef.current || !textMatRef.current) return;

    const t = clock.getElapsedTime();

    // Phase 1 (0-2s): Logo sits centered, gentle scale up from 0
    // Phase 2 (2-4s): Logo slides left, "ift Inc." fades in
    // Phase 3 (4s+): Gentle rock animation

    if (t < 1.6) {
      // Spin in — fast 360° rotation while scaling up to 1.0
      const s = Math.min(t / 1.6, 1);
      const eased = 1 - Math.pow(1 - s, 3);
      wholeGroupRef.current.scale.setScalar(eased);
      wholeGroupRef.current.position.x = 0;
      textMatRef.current.opacity = 0;
      groupRef.current.rotation.y = (1 - eased) * Math.PI * 2;
    } else if (t < 1.9) {
      // HARD PUNCH — zoom in fast to 1.28
      const p = (t - 1.6) / 0.3;
      const eased = 1 - Math.pow(1 - p, 2);
      wholeGroupRef.current.scale.setScalar(1 + eased * 0.28);
      wholeGroupRef.current.position.x = 0;
      textMatRef.current.opacity = 0;
      groupRef.current.rotation.y = 0;
    } else if (t < 2.3) {
      // SETTLE — snap back to 1.0 with a tiny overshoot bounce
      const p = (t - 1.9) / 0.4;
      // damped oscillation from 1.28 down to 1.0
      const decay = Math.exp(-4 * p);
      const osc = Math.cos(p * Math.PI * 2.2);
      const s = 1 + 0.28 * decay * osc;
      wholeGroupRef.current.scale.setScalar(s);
      wholeGroupRef.current.position.x = 0;
      textMatRef.current.opacity = 0;
      groupRef.current.rotation.y = 0;
    } else if (t < 4) {
      // Slide left + fade in text
      wholeGroupRef.current.scale.setScalar(1);
      const p = (t - 2.3) / 1.7;
      const eased = 1 - Math.pow(1 - p, 3);
      wholeGroupRef.current.position.x = eased * -0.8;
      textMatRef.current.opacity = eased * 0.9;
      groupRef.current.rotation.y = 0;
    } else {
      // Settled — slow Y rotation
      wholeGroupRef.current.position.x = -0.8;
      textMatRef.current.opacity = 0.9;
      groupRef.current.rotation.y += 0.003;
    }
  });

  const cx = 414,
    cy = 400,
    scale = 0.003;

  return (
    <>
      {/* Scene background — guarantees no white flash between canvas init and first render */}
      <color attach="background" args={['#141414']} />
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

              {/* Back face G — mirrored on Z axis */}
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

        {/* "ift Inc." text that appears to the right of the logo */}
        <Text
          position={[1.05, 0, 0]}
          fontSize={0.42}
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.05}
          font="/fonts/Poppins-Bold.ttf"
        >
          IFT INC.
          <meshStandardMaterial
            ref={textMatRef}
            color={'#e8e4de'}
            metalness={0.6}
            roughness={0.3}
            transparent
            opacity={0}
          />
        </Text>
      </group>
      <OrbitingRocks />
    </>
  );
}

// --------------- EXPORT ---------------
interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-[260px] sm:h-[320px] lg:h-[400px]',
  md: 'h-[320px] sm:h-[400px] lg:h-[500px]',
  lg: 'h-[360px] sm:h-[460px] lg:h-[640px]',
};

export default function GiftLogo3D_PremiumBadge({ className, size = 'lg' }: Props) {
  const [ready, setReady] = useState(false);

  return (
    <div
      className={`relative ${className ?? ''} ${SIZE_CLASSES[size]}`}
      style={{ width: '100%', backgroundColor: '#141414' }}
    >
      {/* Dark cover above the canvas — fades away once we know three.js has painted.
          Protects against any initial white flash during WebGL context creation. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          backgroundColor: '#141414',
          opacity: ready ? 0 : 1,
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#141414', 1);
          // Wait 2 animation frames to guarantee at least one scene paint
          // has landed before we reveal the canvas.
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
        style={{ background: '#141414' }}
      >
        {/* Light hitting the surface at an angle — this is what makes textures visible */}
        {/* Cinematic three-point lighting */}

        <ambientLight intensity={0.15} />

        {/* KEY — main light, warm, from upper-left */}
        <directionalLight position={[-4, 3, 5]} intensity={3.5} color={'#fff0e0'} />

        {/* FILL — softer, cool, from opposite side */}
        <directionalLight position={[3, 0, 3]} intensity={1.0} color={'#b0c0e0'} />

        {/* RIM — behind the object, edge separation */}
        <directionalLight position={[0, 1, -4]} intensity={2.0} color={'#ffffff'} />

        <ShieldScene />
      </Canvas>
    </div>
  );
}
