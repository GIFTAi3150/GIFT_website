import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type EarthScene = { setActive(active: boolean): void; dispose(): void };

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export async function createEarthScene(
  canvas: HTMLCanvasElement,
  onFailure: () => void,
): Promise<EarthScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.25, 1.25, 1.25, -1.25, 0.1, 20);
  camera.position.set(0, 0.4, 5);
  camera.lookAt(0, 0, 0);
  // A small camera-facing component gives the central boundary a gentle curve.
  const light = new THREE.Vector3(-1, 0, 0)
    .addScaledVector(camera.position.clone().normalize(), 0.1)
    .normalize();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let frame = 0;
  let active = false;
  let disposed = false;
  let lastTime = 0;
  let observer: ResizeObserver | undefined;
  const lost = (event: Event) => {
    event.preventDefault();
    active = false;
    cancelAnimationFrame(frame);
    onFailure();
  };
  canvas.addEventListener('webglcontextlost', lost);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    canvas.removeEventListener('webglcontextlost', lost);
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => {
      t.dispose();
      const image = t.source.data;
      if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
    });
    renderer.dispose();
  };
  try {
    const gltf = await new GLTFLoader().loadAsync('/models/earth/earth.glb');
    const globe = gltf.scene;
    globe.rotation.y = (-Math.PI * 130) / 180;
    globe.rotation.z = -0.14;
    scene.add(globe);
    let clouds: THREE.Mesh | undefined;
    globe.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const source = object.material as THREE.MeshStandardMaterial;
      materials.add(source);
      for (const value of Object.values(source))
        if (value instanceof THREE.Texture) {
          textures.add(value);
          value.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        }
      if (object.name.startsWith('Earth_Surface')) {
        if (!source.map || !source.emissiveMap) throw new Error('Earth texture layers missing');
        object.material = new THREE.ShaderMaterial({
          uniforms: {
            dayMap: { value: source.map },
            nightMap: { value: source.emissiveMap },
            sunDirection: { value: light },
          },
          vertexShader: vertex,
          fragmentShader: `
            uniform sampler2D dayMap;
            uniform sampler2D nightMap;
            uniform vec3 sunDirection;
            varying vec2 vUv;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 n = normalize(vWorldNormal);
              vec3 view = normalize(cameraPosition - vWorldPosition);
              float sunlight = dot(n, sunDirection);
              vec3 day = texture2D(dayMap, vUv).rgb;
              vec3 night = texture2D(nightMap, vUv).rgb;
              float nightMask = 1.0 - smoothstep(-0.16, 0.15, sunlight);
              vec3 color = day * (0.028 + max(sunlight, 0.0) * 1.5);
              color += night * nightMask * vec3(2.8, 2.3, 1.8);
              float ocean = smoothstep(0.01, 0.12, day.b - max(day.r, day.g));
              float specular = pow(max(dot(n, normalize(sunDirection + view)), 0.0), 65.0);
              color += vec3(0.35, 0.55, 0.8) * specular * ocean;
              float rim = pow(1.0 - max(dot(n, view), 0.0), 3.5);
              color += vec3(0.018, 0.12, 0.38) * rim * smoothstep(-0.35, 0.5, sunlight);
              gl_FragColor = vec4(color, 1.0);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }
          `,
        });
      } else if (object.name.startsWith('Earth_Clouds')) {
        clouds = object;
        object.material = new THREE.ShaderMaterial({
          uniforms: { cloudMap: { value: source.map }, sunDirection: { value: light } },
          vertexShader: vertex,
          transparent: true,
          depthWrite: false,
          fragmentShader: `
            uniform sampler2D cloudMap;
            uniform vec3 sunDirection;
            varying vec2 vUv;
            varying vec3 vWorldNormal;
            void main() {
              vec4 cloud = texture2D(cloudMap, vUv);
              float light = max(dot(normalize(vWorldNormal), sunDirection), 0.0);
              gl_FragColor = vec4(vec3(0.72, 0.83, 1.0) * (0.045 + light * 1.35), cloud.a * 0.88);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }
          `,
        });
      } else if (object.name.startsWith('Earth_Atmosphere')) {
        object.scale.setScalar(0.985);
        object.material = new THREE.ShaderMaterial({
          uniforms: { sunDirection: { value: light } },
          vertexShader: vertex,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fragmentShader: `
            uniform vec3 sunDirection;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 n = normalize(vWorldNormal);
              vec3 view = normalize(cameraPosition - vWorldPosition);
              float edge = pow(1.0 - abs(dot(n, view)), 4.0);
              float day = smoothstep(-0.5, 0.8, dot(n, sunDirection));
              gl_FragColor = vec4(vec3(0.12, 0.4, 1.0), edge * (0.18 + day * 0.55));
              #include <colorspace_fragment>
            }
          `,
        });
      }
      materials.add(object.material);
    });
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height || disposed) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -1.25 * Math.max(1, aspect);
      camera.right = -camera.left;
      camera.top = 1.25 * Math.max(1, 1 / aspect);
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const tick = (time: number) => {
      if (!active || disposed) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      globe.rotation.y += delta * 0.035;
      if (clouds) clouds.rotation.y += delta * 0.006;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return {
      setActive(value) {
        if (disposed || value === active) return;
        active = value;
        cancelAnimationFrame(frame);
        lastTime = 0;
        if (active) frame = requestAnimationFrame(tick);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
