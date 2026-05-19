'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import company from '@/data/company.json';

// Interactive globe for the About page's Access section. Inspired by
// the Osmo Supply Mapbox globe pattern but built with three.js so we
// don't need a Mapbox access token or any external map tiles.
//
// Visual signature:
//   - Dark navy sphere with a lat/lon grid wireframe (reads as a
//     "data globe" without needing an Earth texture asset)
//   - Glowing pulse at Sapporo (the actual GIFT HQ coordinates)
//   - Animated arcs from Sapporo to 4 international cities, signalling
//     "based in Hokkaido, working globally"
//   - Soft additive atmosphere around the edge

// HQ (where the pulse sits).
const SAPPORO = { lat: 43.0642, lon: 141.3469 };

// Destination cities for the arcs. Sapporo → each. Order matters
// only for the animation stagger.
const ARC_TARGETS = [
  { lat: 35.6762, lon: 139.6503 }, // Tokyo
  { lat: 40.7128, lon: -74.006 }, // New York
  { lat: 51.5074, lon: -0.1278 }, // London
  { lat: 1.3521, lon: 103.8198 }, // Singapore
];

// Theme colors — matches the gift-green accent used elsewhere on the
// About page (the original constellation hero used these same hues).
const BASE_COLOR = '#0b1c2b';
const GRID_COLOR = '#3d5670';
const ACCENT_COLOR = '#25D366';
const ATMOSPHERE_COLOR = '#3aa86b';

// Lat/lon → Cartesian on a unit sphere. lon offset of +180 matches the
// equirectangular convention so positive longitudes (Asia) land on the
// +x side as you'd expect.
function latLonToVec3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Build a smooth great-circle arc between two surface points and
// raise its mid-section above the sphere so it reads as a "flight
// path." Returns ordered Vector3 samples ready for a Line / Tube.
function buildArc(from: THREE.Vector3, to: THREE.Vector3, samples = 64): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const distance = from.distanceTo(to);
  // Lift the apex proportionally to chord length — short hops stay
  // low, intercontinental flights bow out more.
  const lift = 0.18 + distance * 0.22;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    // Slerp around origin, then scale outward — bowed great circle.
    const mid = new THREE.Vector3().lerpVectors(from, to, t).normalize();
    // Sine bump: 0 at endpoints, peak at midpoint. Combined with
    // `lift` so the arc never re-enters the sphere.
    const altitude = 1 + Math.sin(Math.PI * t) * lift;
    points.push(mid.multiplyScalar(altitude));
  }
  return points;
}

// Lat/lon grid as a single line-segments mesh. 12 meridians + 6
// parallels reads as a clear "globe" silhouette without overwhelming
// the marker. Single buffer geometry keeps the draw cost minimal.
function GridLines() {
  const geom = useMemo(() => {
    const positions: number[] = [];
    const radius = 1.001;
    const meridianCount = 12;
    const parallelCount = 6;
    const segmentsPerLine = 96;

    // Meridians (vertical great circles).
    for (let m = 0; m < meridianCount; m++) {
      const lon = (m / meridianCount) * 360 - 180;
      for (let s = 0; s < segmentsPerLine; s++) {
        const lat1 = -90 + (s / segmentsPerLine) * 180;
        const lat2 = -90 + ((s + 1) / segmentsPerLine) * 180;
        const p1 = latLonToVec3(lat1, lon, radius);
        const p2 = latLonToVec3(lat2, lon, radius);
        positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    // Parallels (horizontal circles). Skip the poles where rings
    // collapse to a point.
    for (let p = 1; p < parallelCount; p++) {
      const lat = -90 + (p / parallelCount) * 180;
      for (let s = 0; s < segmentsPerLine; s++) {
        const lon1 = -180 + (s / segmentsPerLine) * 360;
        const lon2 = -180 + ((s + 1) / segmentsPerLine) * 360;
        const a = latLonToVec3(lat, lon1, radius);
        const b = latLonToVec3(lat, lon2, radius);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        color={GRID_COLOR}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// Pulsing pin at Sapporo. Two concentric spheres: a solid inner dot
// at fixed size, and a wireframe halo sphere that scales out + fades
// in opacity on a 2.5s loop, reading as a sonar blip. Spheres (not
// rings) keep us from having to orient anything tangent to the
// globe — the pulse looks the same from every viewing angle.
//
// Click target: an invisible larger sphere wrapping the visible
// dot. Raw 0.022-radius dot has ~22px on-screen hit area, which is
// fingertip-impossible. The 0.05 hit sphere brings it up to ~50px,
// comfortable for both cursor and touch.
function SapporoPin({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const haloRef = useRef<THREE.Mesh>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pos = useMemo(() => latLonToVec3(SAPPORO.lat, SAPPORO.lon, 1.005), []);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  useFrame(({ clock }) => {
    if (!haloRef.current || !haloMatRef.current) return;
    // 2.5s pulse cycle: scale 1 → 3, opacity 0.6 → 0.
    const t = (clock.getElapsedTime() % 2.5) / 2.5;
    const scale = 1 + t * 2;
    haloRef.current.scale.setScalar(scale);
    haloMatRef.current.opacity = 0.6 * (1 - t);
  });

  const handlePinClick = (e: ThreeEvent<MouseEvent>) => {
    // stopPropagation so the click doesn't also bubble up to the
    // base sphere underneath, which would immediately close the
    // popup the same tick we opened it.
    e.stopPropagation();
    onToggle();
  };

  return (
    <group position={pos}>
      {/* Hit-target sphere — invisible but raycast-able. Sized so
          fingers and cursors can land on it without precision. */}
      <mesh
        onClick={handlePinClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Solid dot at HQ */}
      <mesh>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={ACCENT_COLOR} toneMapped={false} />
      </mesh>
      {/* Expanding wireframe halo — sonar pulse effect */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial
          ref={haloMatRef}
          color={ACCENT_COLOR}
          transparent
          opacity={0.6}
          wireframe
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {/* Address popup — drei <Html> projects this 3D-anchored
          element to screen-space, so it tracks the pin as the user
          rotates the globe. Offset above the pin so it doesn't
          obscure the marker itself. */}
      {open && (
        <Html
          position={[0, 0.12, 0]}
          center
          // distanceFactor: undefined → fixed pixel size regardless
          // of zoom. We want the address card readable, not scaled.
        >
          {/* Inline-styled card so this component carries its own
              presentation — drei's <Html> portals into a sibling
              of the Canvas, so a separate stylesheet would have to
              be imported globally just for this widget. The address
              line is a real <a> linking to Google Maps with the
              office search query encoded. The pointer triangle below
              the card visually anchors it to the pin. */}
          <div
            style={{
              transform: 'translate(-50%, -100%)',
              minWidth: 220,
              maxWidth: 280,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(8, 14, 24, 0.96)',
              border: `1px solid ${ACCENT_COLOR}`,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              fontFamily: 'var(--font-noto-jp), -apple-system, sans-serif',
              userSelect: 'none',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 6,
                color: ACCENT_COLOR,
              }}
            >
              {company.name}
            </div>
            {/* Address — clickable, opens Google Maps in a new tab.
                Underline-on-hover signals it's a link without it
                looking like a generic blue browser link in default
                state. */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: 12,
                lineHeight: 1.55,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 6,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = ACCENT_COLOR;
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {company.address}
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  marginLeft: 6,
                  fontSize: 10,
                  opacity: 0.7,
                }}
              >
                ↗
              </span>
            </a>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.65)',
                letterSpacing: '0.05em',
              }}
            >
              TEL: {company.phone}
            </div>
            {/* Pointer arrow: small triangle on the bottom edge of
                the card, pointing down at the pin. */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                background: 'rgba(8, 14, 24, 0.96)',
                borderRight: `1px solid ${ACCENT_COLOR}`,
                borderBottom: `1px solid ${ACCENT_COLOR}`,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}

// One arc + its endpoint dot. Each arc's progress is staggered by
// `delay` so the four arcs fire on a rolling cadence instead of
// firing in sync.
function Arc({
  from,
  to,
  delay,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  delay: number;
}) {
  const arcPoints = useMemo(() => buildArc(from, to, 64), [from, to]);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(arcPoints);
    return g;
  }, [arcPoints]);
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const drawCountRef = useRef(0);

  useFrame(({ clock }) => {
    // 4.5s loop. From t=0..0.7 the arc draws in, t=0.7..1 it fades out.
    const t = ((clock.getElapsedTime() + delay) % 4.5) / 4.5;
    let count: number;
    let opacity: number;
    if (t < 0.7) {
      count = Math.floor((t / 0.7) * arcPoints.length);
      opacity = 1;
    } else {
      count = arcPoints.length;
      opacity = 1 - (t - 0.7) / 0.3;
    }
    drawCountRef.current = count;
    geom.setDrawRange(0, count);
    if (lineMatRef.current) lineMatRef.current.opacity = opacity;
  });

  return (
    <group>
      <line>
        <primitive object={geom} attach="geometry" />
        <lineBasicMaterial
          ref={lineMatRef}
          color={ACCENT_COLOR}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </line>
      {/* Endpoint dot at destination city */}
      <mesh position={to.clone().multiplyScalar(1.005)}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color={ACCENT_COLOR} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Outer additive sphere with a thin Fresnel-style gradient to fake
// the atmospheric haze you get on a real Mapbox globe.
const ATMOSPHERE_VS = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const ATMOSPHERE_FS = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3 uColor;
  void main() {
    // Fresnel: edge-on faces glow, head-on faces are transparent.
    float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    rim = pow(rim, 2.5);
    gl_FragColor = vec4(uColor, rim * 0.7);
  }
`;

function Atmosphere() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(ATMOSPHERE_COLOR) } }),
    []
  );
  return (
    <mesh scale={1.15}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={ATMOSPHERE_VS}
        fragmentShader={ATMOSPHERE_FS}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const sapporoVec = useMemo(() => latLonToVec3(SAPPORO.lat, SAPPORO.lon, 1), []);
  const [pinOpen, setPinOpen] = useState(false);

  // The whole point of this widget is to show where the office is —
  // so the globe needs to LAND with Sapporo facing the camera, not
  // somewhere on the far side. We compute a quaternion that rotates
  // Sapporo's surface vector to (0, 0, 1) — the +Z direction the
  // camera is looking down. Once applied to the group's resting
  // quaternion, the office is dead-center on first paint. The user
  // can still drag to spin and explore; OrbitControls writes camera
  // angles independently of this group rotation, so the home pose
  // sticks while still allowing interaction.
  const initialQuat = useMemo(() => {
    const front = new THREE.Vector3(0, 0, 1);
    return new THREE.Quaternion().setFromUnitVectors(
      sapporoVec.clone().normalize(),
      front
    );
  }, [sapporoVec]);

  const arcs = useMemo(
    () =>
      ARC_TARGETS.map((t) => ({
        from: sapporoVec,
        to: latLonToVec3(t.lat, t.lon, 1),
      })),
    [sapporoVec]
  );

  // No auto-rotation: the globe's job here is to point at the office,
  // not to perform. Visual life comes from the pulsing pin and the
  // animated arcs, both of which continue regardless of orientation.

  return (
    <group ref={groupRef} quaternion={initialQuat}>
      {/* Base sphere — also acts as the "click outside the pin to
          dismiss" hit target. We can't rely on Canvas's
          onPointerMissed (the sphere always catches the click first),
          so we attach a close handler here instead. */}
      <mesh onClick={() => setPinOpen(false)}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color={BASE_COLOR} />
      </mesh>
      <GridLines />
      <SapporoPin open={pinOpen} onToggle={() => setPinOpen((v) => !v)} />
      {arcs.map((a, i) => (
        <Arc key={i} from={a.from} to={a.to} delay={i * 1.1} />
      ))}
    </group>
  );
}

export default function AccessGlobe() {
  // Mount guard — R3F's <Canvas> serializes to a <canvas> element on
  // the server but the client hydrator attaches WebGL state, which
  // breaks hydration. Defer Canvas mount until after first client
  // render so SSR output and the initial client output match.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Canvas
      // Camera distance controls the apparent globe size in the
      // frame. Originally z=2.9 with fov=38 — globe filled ~80% of
      // the frame. Pushed back to z=4.2 so the globe reads as a
      // ~55%-of-frame "data viz" sitting in dark space, with room
      // for the address popup to sit above it without crowding.
      camera={{ position: [0, 0.3, 4.2], fov: 38, near: 0.1, far: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
      // touch-action: pan-y so vertical scrolling still works when the
      // user touches the globe area on mobile — only horizontal drags
      // get captured as rotation.
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
    >
      <Suspense fallback={null}>
        <Atmosphere />
        <Globe />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}
