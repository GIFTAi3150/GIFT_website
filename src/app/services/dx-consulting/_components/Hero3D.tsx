'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  useGLTF,
  Environment,
  Center,
  Bounds,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Models live in /public/models/. Both .glb files are preloaded on
// mount so the canvas doesn't have to wait for them sequentially.
const MODEL_RAMEN_URL = '/models/5427b7333c244dafb7c339f6b2e695d0.glb';
const MODEL_MONITOR_URL = '/models/monitor_vi.glb';
useGLTF.preload(MODEL_RAMEN_URL);
useGLTF.preload(MODEL_MONITOR_URL);

// Scale + placement for each model. The ramen .glb has a native bbox
// of ~534 units (likely millimeters), while the monitor is ~1.19 units.
// We scale the ramen way down so it reads as a small object beside the
// PC. Both sit at y=0 (same ground level) and are offset on x so they
// stand side-by-side instead of overlapping.
const RAMEN_SCALE = 0.0006;
const RAMEN_POS: [number, number, number] = [0.25, 0, 0]; // right of monitor
const RAMEN_ROT: [number, number, number] = [0, 0, 0];

const MONITOR_POS: [number, number, number] = [-0.25, 0, 0]; // left, makes room
const MONITOR_SCALE = 1;
const MONITOR_ROT: [number, number, number] = [0, 0, 0];

// Specific meshes inside monitor_vi.glb the user identified by clicking
// each part and reading the tooltip. Change these if the model's mesh
// names ever change in a re-export.
//   tv003 = the screen face (where we paint the screen content)
//   tv004 = power button → toggles GIFT logo on the screen
//   tv005 = secondary button → toggles interactive pixel grid mode
const LOGO_BUTTON_MESH_NAME = 'tv004_low_tv_0';
const PIXEL_BUTTON_MESH_NAME = 'tv005_low_tv_0';
const SCREEN_MESH_NAME = 'tv003_low_tv_0';

// Logo asset path. Drawn into a canvas texture (brand-recolored, on a
// retro CRT background) and applied as the screen mesh's `map` when
// the TV is "on".
const LOGO_SRC = '/GIFT_logo.svg';

// DX page brand colors (mirrors DX_CONSULTING_THEME in lib/navTheme.ts).
// Hardcoded here because we can't import the theme constant from a
// client-only WebGL component without paying for the whole nav layer.
const BRAND_SHIELD = '#635bff'; // blurple
const BRAND_INNER = '#f5f7ff';  // paper
const SCREEN_BG_DARK = '#0b1340';
const SCREEN_BG_GLOW = '#1c2870';



type ClickPayload = { name: string; clientX: number; clientY: number };

// ============================================================
// DESK SCENE
// ============================================================
// OrbitControls type without pulling in three-stdlib types directly —
// we only access .target and .update().
type OrbitLike = { target: THREE.Vector3; update: () => void };

type ScreenMode = 'off' | 'logo' | 'pixels';

function DeskScene({
  onClickMesh,
  onButtonPress,
  screenMode,
  onCameraLockChange,
}: {
  onClickMesh: (p: ClickPayload) => void;
  onButtonPress: (which: 'logo' | 'pixels') => void;
  screenMode: ScreenMode;
  onCameraLockChange: (locked: boolean) => void;
}) {
  const { scene: ramenScene } = useGLTF(MODEL_RAMEN_URL);
  const { scene: monitorScene } = useGLTF(MODEL_MONITOR_URL);
  const { camera, controls, size: viewportSize } = useThree();
  // Screen logo position is now a manual offset relative to MONITOR_POS
  // (see SCREEN_LOGO_* constants up top). The mesh-lookup approach was
  // unreliable because the screen mesh's bbox extended past the visible
  // screen face, throwing position and size off.
  const [hovered, setHovered] = useState(false);

  // Snapshot of the camera/target after Bounds fits — what we restore
  // to when the user double-clicks to zoom out.
  const initialCamPos = useRef<THREE.Vector3 | null>(null);
  const initialTarget = useRef<THREE.Vector3 | null>(null);
  // Whichever mesh is currently focused (zoomed in on). null = at rest.
  const focusedRef = useRef<THREE.Object3D | null>(null);

  // Log both models' bounding boxes so we can compare scales and
  // position the monitor relative to the desk accordingly.
  useEffect(() => {
    const fmt = (v: THREE.Vector3) =>
      `${v.x.toFixed(2)} × ${v.y.toFixed(2)} × ${v.z.toFixed(2)}`;
    const ramenBox = new THREE.Box3().setFromObject(ramenScene);
    const ramenSize = new THREE.Vector3();
    ramenBox.getSize(ramenSize);
    const monitorBox = new THREE.Box3().setFromObject(monitorScene);
    const monitorSize = new THREE.Vector3();
    monitorBox.getSize(monitorSize);
    // eslint-disable-next-line no-console
    console.log(
      `[Hero3D] ramen native: ${fmt(ramenSize)} (× ${RAMEN_SCALE} scale) — monitor: ${fmt(monitorSize)}`
    );
    // Dump the monitor's mesh names so we can identify clickable parts
    // (power button, screen, etc.) and wire interactions to them.
    // eslint-disable-next-line no-console
    console.log('[Hero3D] monitor meshes:');
    monitorScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        // eslint-disable-next-line no-console
        console.log(`  · ${obj.name || '(unnamed)'} [${obj.type}]`);
      }
    });
  }, [ramenScene, monitorScene]);

  // Capture the default camera/target once Bounds has fitted them.
  // Bounds runs its fit on the next frame after mount, so wait a tick.
  useEffect(() => {
    if (!controls) return;
    const oc = controls as unknown as OrbitLike;
    const id = setTimeout(() => {
      initialCamPos.current = camera.position.clone();
      initialTarget.current = oc.target.clone();
    }, 300);
    return () => clearTimeout(id);
  }, [controls, camera]);

  // ============================================================
  // SCREEN LOGO via mesh material swap. The screen mesh keeps its
  // original geometry — we just swap its `material` to one that
  // uses a canvas-rendered logo as its `map` when the TV is "on",
  // and restore the original material when "off." This way the
  // logo IS the screen — same exact size/shape/position, zero gap.
  // ============================================================
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(null);
  const originalUvsRef = useRef<THREE.BufferAttribute | null>(null);
  const planarUvsRef = useRef<THREE.BufferAttribute | null>(null);
  const logoTextureRef = useRef<THREE.Texture | null>(null);
  const screenOnMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Locate the screen mesh, stash its native material, and compute a
  // PLANAR UV set we can swap in when the screen is "on." The mesh's
  // original UVs (if any) are degenerate — they map to a single point,
  // so a textured material shows only one pixel of the texture as a
  // flat color. Planar UVs project the mesh's vertex positions onto
  // the two axes with the largest spread (the "flat" of the screen),
  // giving a clean 0..1 mapping that fills the texture across the mesh.
  useEffect(() => {
    const m = monitorScene.getObjectByName(SCREEN_MESH_NAME) as THREE.Mesh | undefined;
    if (!m || !m.isMesh) return;
    screenMeshRef.current = m;
    originalMaterialRef.current = m.material;

    const geom = m.geometry as THREE.BufferGeometry;
    const positions = geom.attributes.position as THREE.BufferAttribute;
    // Save the original UVs (cloned) so we can restore them on screen off.
    const existingUv = geom.attributes.uv as THREE.BufferAttribute | undefined;
    originalUvsRef.current = existingUv ? existingUv.clone() : null;

    // Bounding box in local space — used to normalize positions to UV space.
    const box = new THREE.Box3().setFromBufferAttribute(positions);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Pick the two axes with the largest extent — that's the screen's flat plane.
    const axes: Array<{ index: 0 | 1 | 2; size: number }> = [
      { index: 0, size: size.x },
      { index: 1, size: size.y },
      { index: 2, size: size.z },
    ];
    axes.sort((a, b) => b.size - a.size);
    const uIdx = axes[0].index;
    const vIdx = axes[1].index;

    const uvData = new Float32Array(positions.count * 2);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      tmp.fromBufferAttribute(positions, i);
      const u =
        (tmp.getComponent(uIdx) - box.min.getComponent(uIdx)) /
        (size.getComponent(uIdx) || 1);
      const v =
        (tmp.getComponent(vIdx) - box.min.getComponent(vIdx)) /
        (size.getComponent(vIdx) || 1);
      uvData[i * 2] = u;
      uvData[i * 2 + 1] = v;
    }
    planarUvsRef.current = new THREE.BufferAttribute(uvData, 2);
    // eslint-disable-next-line no-console
    console.log(
      `[Hero3D] planar UVs computed for screen mesh (axes ${uIdx},${vIdx}, ${positions.count} verts)`
    );
  }, [monitorScene]);

  // Build the "screen on" texture once. Fetches the GIFT logo SVG,
  // swaps its hardcoded fill colors for the DX page's brand palette
  // (so the shield matches navbar blurple), then draws it onto a
  // canvas styled like an old CRT screen — radial dark-blue glow,
  // horizontal scanlines, soft vignette at the edges.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch and recolor the SVG before rasterizing. The source SVG
        // declares fills via .cls-1 (#fff) and .cls-2 (#234a2d) — swap
        // those for our brand palette so the rendered logo matches the
        // navbar's themed colors instead of the original green. Also
        // inject explicit width/height — without them, an <svg> with
        // only a viewBox often rasterizes to a 0×0 image when loaded
        // via <img>, so the logo draws as nothing.
        const res = await fetch(LOGO_SRC);
        const raw = await res.text();
        const themed = raw
          .replace(/<svg\b([^>]*)>/i, '<svg$1 width="1676.61" height="800">')
          .replace(/#234a2d/gi, BRAND_SHIELD)
          .replace(/#ffffff/gi, BRAND_INNER)
          .replace(/#fff(?![0-9a-f])/gi, BRAND_INNER);
        // eslint-disable-next-line no-console
        console.log('[Hero3D] themed SVG length:', themed.length, 'first 240 chars:', themed.slice(0, 240));
        const dataUrl =
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(themed);

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`[Hero3D] logo image loaded: ${img.naturalWidth}×${img.naturalHeight}`);
            resolve();
          };
          img.onerror = () => reject(new Error('logo image load failed'));
          img.src = dataUrl;
        });
        if (cancelled) return;

        const W = 1024;
        const H = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Retro CRT background — radial glow from center, dark
        //    navy edges. Reads like the inside of a phosphor tube.
        const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.75);
        bg.addColorStop(0, SCREEN_BG_GLOW);
        bg.addColorStop(1, SCREEN_BG_DARK);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 2. Logo, centered with a manual nudge so it sits visually
        //    on the screen face's center. The planar UVs were built
        //    from the mesh's bbox, but the mesh extends past the
        //    visible screen on one side — so we shift the logo right
        //    in canvas space to compensate. Tweak LOGO_NUDGE_X / _Y
        //    if it still looks off after centering.
        const LOGO_NUDGE_X = W * 0.18; // positive = right
        const LOGO_NUDGE_Y = 0;
        const logoW = W * 0.72;
        const logoH = logoW * (800 / 1676.61);
        ctx.drawImage(
          img,
          (W - logoW) / 2 + LOGO_NUDGE_X,
          (H - logoH) / 2 + LOGO_NUDGE_Y,
          logoW,
          logoH
        );

        // 3. Horizontal scanlines — subtle 1px lines every 4px.
        //    Classic CRT artifact. Low alpha so they texture without
        //    overwhelming.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        for (let y = 0; y < H; y += 4) {
          ctx.fillRect(0, y, W, 1);
        }

        // 4. Vignette — darkening at the corners, like a curved CRT
        //    tube absorbing light at the edges.
        const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        // flipY = true so the texture reads right-side-up on this mesh.
        // The mesh's planar UVs we computed go bottom-to-top in V, so
        // we need the texture flipped vertically to match (otherwise
        // the logo appears upside-down — 180° on the X axis).
        tex.flipY = true;
        if (cancelled) {
          tex.dispose();
          return;
        }
        logoTextureRef.current = tex;
        screenOnMaterialRef.current = new THREE.MeshBasicMaterial({
          map: tex,
          toneMapped: false,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[Hero3D] failed to build screen texture:', err);
      }
    })();
    return () => {
      cancelled = true;
      logoTextureRef.current?.dispose();
      screenOnMaterialRef.current?.dispose();
    };
  }, []);

  // ============================================================
  // SNAKE CHANNEL — when screenMode === 'pixels', the TV plays a
  // classic Nokia-style Snake game. Arrow keys steer; space restarts
  // after game over. Game state lives in refs (not state) so we can
  // mutate at 60fps without triggering React re-renders.
  // ============================================================
  const SNAKE_COLS = 20;
  const SNAKE_ROWS = 20;
  const SNAKE_CANVAS_W = 1024;
  const SNAKE_CANVAS_H = 1024;
  const SNAKE_TICK_MS = 140;
  const snakeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakeTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const snakeMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  type SnakeCell = { x: number; y: number };
  type SnakeDir = 'up' | 'down' | 'left' | 'right';
  const snakeBodyRef = useRef<SnakeCell[]>([]);
  const snakeDirRef = useRef<SnakeDir>('right');
  const snakePendingDirRef = useRef<SnakeDir>('right');
  const snakeFoodRef = useRef<SnakeCell>({ x: 14, y: 10 });
  const snakeOverRef = useRef(false);
  const snakeStartedRef = useRef(false);
  const snakeScoreRef = useRef(0);
  const snakeLastTickRef = useRef(0);

  const randomFood = (body: SnakeCell[]): SnakeCell => {
    const occupied = new Set(body.map((s) => `${s.x},${s.y}`));
    // Bounded retries in case the board is almost full.
    for (let i = 0; i < 200; i++) {
      const f = {
        x: Math.floor(Math.random() * SNAKE_COLS),
        y: Math.floor(Math.random() * SNAKE_ROWS),
      };
      if (!occupied.has(`${f.x},${f.y}`)) return f;
    }
    return { x: 0, y: 0 };
  };

  const initSnake = () => {
    snakeBodyRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    snakeDirRef.current = 'right';
    snakePendingDirRef.current = 'right';
    snakeFoodRef.current = randomFood(snakeBodyRef.current);
    snakeOverRef.current = false;
    snakeStartedRef.current = false;
    snakeScoreRef.current = 0;
    snakeLastTickRef.current = 0;
  };

  // Initialize the canvas + texture + material once.
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SNAKE_CANVAS_W;
    canvas.height = SNAKE_CANVAS_H;
    snakeCanvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    snakeTextureRef.current = tex;
    snakeMaterialRef.current = new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false,
    });
    return () => {
      tex.dispose();
      snakeMaterialRef.current?.dispose();
    };
  }, []);

  // Reset the game whenever the user (re-)enters snake mode.
  useEffect(() => {
    if (screenMode === 'pixels') initSnake();
  }, [screenMode]);

  // Arrow keys steer; space restarts after game over. Listener is
  // only attached while in snake mode so arrow keys don't get hijacked
  // when the user is doing something else.
  useEffect(() => {
    if (screenMode !== 'pixels') return;
    const opposite: Record<SnakeDir, SnakeDir> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (opposite[snakeDirRef.current] !== 'up') snakePendingDirRef.current = 'up';
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (opposite[snakeDirRef.current] !== 'down') snakePendingDirRef.current = 'down';
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (opposite[snakeDirRef.current] !== 'left') snakePendingDirRef.current = 'left';
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (opposite[snakeDirRef.current] !== 'right') snakePendingDirRef.current = 'right';
          e.preventDefault();
          break;
        case ' ':
          // Space: start the game on the title screen, or restart
          // after game over.
          if (snakeOverRef.current) {
            initSnake();
            snakeStartedRef.current = true;
          } else if (!snakeStartedRef.current) {
            snakeStartedRef.current = true;
          }
          e.preventDefault();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screenMode]);

  // Touch controls for mobile — swipe to steer, tap to start/restart.
  // Only active while in snake mode so touches elsewhere on the page
  // (scroll, links, the orbit-controls when zoomed out) work normally.
  useEffect(() => {
    if (screenMode !== 'pixels') return;
    const opposite: Record<SnakeDir, SnakeDir> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    const SWIPE_THRESHOLD_PX = 30;
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      // Tap (no significant movement) — same as SPACE: start the
      // game from the title screen, or restart after game over.
      if (ax < SWIPE_THRESHOLD_PX && ay < SWIPE_THRESHOLD_PX) {
        if (snakeOverRef.current) {
          initSnake();
          snakeStartedRef.current = true;
        } else if (!snakeStartedRef.current) {
          snakeStartedRef.current = true;
        }
        return;
      }
      // Swipe — pick the dominant axis and steer.
      const next: SnakeDir = ax > ay
        ? (dx > 0 ? 'right' : 'left')
        : (dy > 0 ? 'down' : 'up');
      if (opposite[snakeDirRef.current] !== next) {
        snakePendingDirRef.current = next;
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [screenMode]);

  // Game loop — tick every SNAKE_TICK_MS ms, then redraw the canvas.
  useFrame(({ clock }) => {
    if (screenMode !== 'pixels') return;
    const canvas = snakeCanvasRef.current;
    const tex = snakeTextureRef.current;
    if (!canvas || !tex) return;

    const now = clock.getElapsedTime() * 1000;
    if (now - snakeLastTickRef.current < SNAKE_TICK_MS) return;
    snakeLastTickRef.current = now;

    // ---- TICK ----
    // Skip movement entirely until the player presses SPACE to start.
    if (snakeStartedRef.current && !snakeOverRef.current) {
      snakeDirRef.current = snakePendingDirRef.current;
      const body = snakeBodyRef.current;
      const head = body[0];
      const newHead: SnakeCell = { x: head.x, y: head.y };
      switch (snakeDirRef.current) {
        case 'up': newHead.y -= 1; break;
        case 'down': newHead.y += 1; break;
        case 'left': newHead.x -= 1; break;
        case 'right': newHead.x += 1; break;
      }
      // Wall collision = game over (no wrap — Nokia behavior).
      if (
        newHead.x < 0 ||
        newHead.x >= SNAKE_COLS ||
        newHead.y < 0 ||
        newHead.y >= SNAKE_ROWS
      ) {
        snakeOverRef.current = true;
      } else if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        // Self collision = game over.
        snakeOverRef.current = true;
      } else {
        body.unshift(newHead);
        if (
          newHead.x === snakeFoodRef.current.x &&
          newHead.y === snakeFoodRef.current.y
        ) {
          snakeScoreRef.current += 1;
          snakeFoodRef.current = randomFood(body);
        } else {
          body.pop();
        }
      }
    }

    // ---- DRAW ----
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = SCREEN_BG_DARK;
    ctx.fillRect(0, 0, SNAKE_CANVAS_W, SNAKE_CANVAS_H);

    // The screen mesh's bbox is slightly larger than the lit screen
    // face on every side, so cells drawn at the canvas edges land
    // BEHIND the TV's bezel and disappear. Inset the playfield to a
    // generous rectangle that sits centered on the visible screen,
    // leaving a strip of space below for the score. The values are
    // centered on the canvas (0.5W, 0.5H-ish) rather than on the
    // logo-channel offset — the bezel symmetry suggests the visible
    // screen actually centers near the canvas center. If cells still
    // get clipped after a model re-export, tune these four constants.
    const PLAY_X = SNAKE_CANVAS_W * 0.18;
    const PLAY_Y = SNAKE_CANVAS_H * 0.20;
    const PLAY_W = SNAKE_CANVAS_W * 0.64;
    const PLAY_H = SNAKE_CANVAS_H * 0.50;
    const PLAY_CX = PLAY_X + PLAY_W / 2;
    const PLAY_CY = PLAY_Y + PLAY_H / 2;

    const cellW = PLAY_W / SNAKE_COLS;
    const cellH = PLAY_H / SNAKE_ROWS;
    const gap = 3;

    // Faint grid background so the playfield is readable even when empty.
    ctx.fillStyle = 'rgba(99, 91, 255, 0.06)';
    for (let r = 0; r < SNAKE_ROWS; r++) {
      for (let c = 0; c < SNAKE_COLS; c++) {
        ctx.fillRect(PLAY_X + c * cellW + gap, PLAY_Y + r * cellH + gap, cellW - gap * 2, cellH - gap * 2);
      }
    }

    // Snake body — head in solid brand blurple, tail fades.
    const body = snakeBodyRef.current;
    for (let i = 0; i < body.length; i++) {
      const s = body[i];
      const t = 1 - i / Math.max(body.length, 1);
      ctx.fillStyle =
        i === 0
          ? BRAND_SHIELD
          : `rgba(99, 91, 255, ${0.45 + t * 0.45})`;
      ctx.fillRect(
        PLAY_X + s.x * cellW + gap,
        PLAY_Y + s.y * cellH + gap,
        cellW - gap * 2,
        cellH - gap * 2
      );
    }

    // Food — brand coral.
    const f = snakeFoodRef.current;
    ctx.fillStyle = '#FF4D6D';
    ctx.fillRect(PLAY_X + f.x * cellW + gap, PLAY_Y + f.y * cellH + gap, cellW - gap * 2, cellH - gap * 2);

    // Score — drawn in the strip BELOW the playfield (inside the
    // visible screen, outside the grid). Centered horizontally on the
    // playfield so it tracks the playfield's position automatically.
    ctx.fillStyle = '#f5f7ff';
    ctx.font = 'bold 38px ui-monospace, "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `SCORE  ${snakeScoreRef.current.toString().padStart(3, '0')}`,
      PLAY_CX,
      PLAY_Y + PLAY_H + 16
    );

    // Start-screen overlay — shown before the player has pressed SPACE.
    // Same visual pattern as the game-over screen so it reads as a
    // proper title card. Centered on the playfield, not the canvas.
    if (!snakeStartedRef.current && !snakeOverRef.current) {
      ctx.fillStyle = 'rgba(11, 19, 64, 0.88)';
      ctx.fillRect(PLAY_X, PLAY_CY - 160, PLAY_W, 320);
      ctx.fillStyle = BRAND_SHIELD;
      ctx.font = 'bold 108px ui-monospace, "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SNAKE', PLAY_CX, PLAY_CY - 60);
      ctx.fillStyle = '#f5f7ff';
      ctx.font = 'bold 36px ui-monospace, "JetBrains Mono", monospace';
      ctx.fillText('TAP OR PRESS SPACE TO START', PLAY_CX, PLAY_CY + 20);
      ctx.fillStyle = 'rgba(245, 247, 255, 0.6)';
      ctx.font = '26px ui-monospace, "JetBrains Mono", monospace';
      ctx.fillText('SWIPE / ARROWS / WASD TO STEER', PLAY_CX, PLAY_CY + 80);
    }

    // Game over overlay.
    if (snakeOverRef.current) {
      ctx.fillStyle = 'rgba(11, 19, 64, 0.86)';
      ctx.fillRect(PLAY_X, PLAY_CY - 130, PLAY_W, 260);
      ctx.fillStyle = '#FF4D6D';
      ctx.font = 'bold 96px ui-monospace, "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', PLAY_CX, PLAY_CY - 30);
      ctx.fillStyle = '#f5f7ff';
      ctx.font = 'bold 32px ui-monospace, "JetBrains Mono", monospace';
      ctx.fillText('TAP OR PRESS SPACE TO RESTART', PLAY_CX, PLAY_CY + 60);
    }

    tex.needsUpdate = true;
  });

  // Swap the screen mesh's MATERIAL and UV ATTRIBUTE based on the
  // current screen mode. The mesh's original UVs are degenerate
  // (mapping everything to a single point), so we also swap in the
  // planar UVs whenever we apply a custom material — and put back
  // the original UVs when restoring the off state.
  useEffect(() => {
    const mesh = screenMeshRef.current;
    if (!mesh) return;
    const geom = mesh.geometry as THREE.BufferGeometry;
    const applyCustom = (mat: THREE.Material) => {
      mesh.material = mat;
      if (planarUvsRef.current) {
        geom.setAttribute('uv', planarUvsRef.current);
        geom.attributes.uv.needsUpdate = true;
      }
    };
    if (screenMode === 'logo' && screenOnMaterialRef.current) {
      applyCustom(screenOnMaterialRef.current);
    } else if (screenMode === 'pixels' && snakeMaterialRef.current) {
      applyCustom(snakeMaterialRef.current);
    } else {
      if (originalMaterialRef.current) {
        mesh.material = originalMaterialRef.current;
      }
      if (originalUvsRef.current) {
        geom.setAttribute('uv', originalUvsRef.current);
        geom.attributes.uv.needsUpdate = true;
      }
    }
  }, [screenMode]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  const focusOn = (object: THREE.Object3D) => {
    if (!controls) return;
    const oc = controls as unknown as OrbitLike;
    const targetPos = new THREE.Vector3();
    object.getWorldPosition(targetPos);
    // Distance to pull back from the mesh = a multiple of its largest
    // dimension, clamped to a minimum so tiny meshes (buttons, screws)
    // don't suck the camera into them.
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.2);
    const distance = Math.max(maxDim * 6, 1.8);
    const dir = new THREE.Vector3()
      .subVectors(camera.position, oc.target)
      .normalize();
    const newCamPos = targetPos.clone().addScaledVector(dir, distance);

    gsap.to(camera.position, {
      x: newCamPos.x,
      y: newCamPos.y,
      z: newCamPos.z,
      duration: 1.0,
      ease: 'power3.inOut',
    });
    gsap.to(oc.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: () => oc.update(),
    });
  };

  // Frame the WHOLE TV (screen + buttons + knobs) in the viewport.
  // Called when the user presses a button, so they get a close-up of
  // the screen + the controls without losing their current viewing
  // angle. Uses the monitor model's bbox to determine the right zoom
  // distance, keeps the camera's current direction relative to target.
  const focusOnTV = () => {
    if (!controls) return;
    const oc = controls as unknown as OrbitLike;
    // BBox of ONLY the TV meshes (tv*) — exclude the wooden ground
    // plane that's bundled in the .glb, otherwise its bbox dominates
    // and our zoom distance ends up huge instead of tight on the TV.
    const box = new THREE.Box3();
    const tmpBox = new THREE.Box3();
    monitorScene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.isMesh && m.name && m.name.toLowerCase().startsWith('tv')) {
        tmpBox.setFromObject(m);
        box.union(tmpBox);
      }
    });
    const center = new THREE.Vector3();
    box.getCenter(center);
    const boxSize = new THREE.Vector3();
    box.getSize(boxSize);
    // Compute the camera distance required to fit the TV bbox into
    // the viewport given the camera's actual vFOV and the canvas
    // aspect ratio. A fixed multiplier like maxDim * 1.7 framed the
    // TV nicely on 16:9 desktops but pushed the camera way too close
    // on narrow phone screens — there the horizontal FOV is much
    // smaller, so the same distance fills the viewport. Recomputing
    // per-call makes the framing identical on every device. The
    // padding factor leaves room for buttons + a little breathing room.
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const vFovRad = (perspectiveCam.fov * Math.PI) / 180;
    const aspect = viewportSize.width / viewportSize.height;
    const fitPadding = 1.15;
    const distV = (boxSize.y / 2) * fitPadding / Math.tan(vFovRad / 2);
    const distH = (boxSize.x / 2) * fitPadding / (Math.tan(vFovRad / 2) * aspect);
    // Floor on boxSize.z so we never end up inside the bbox depth.
    const distance = Math.max(distV, distH, boxSize.z);
    // Always approach from straight ahead — camera along the TV's
    // +Z axis at the screen's height, looking dead-on at the screen.
    // No elevation, no side offset, regardless of where the user
    // had rotated to before pressing the button.
    const dir = new THREE.Vector3(0, 0, 1);
    const newCamPos = center.clone().addScaledVector(dir, distance);

    gsap.to(camera.position, {
      x: newCamPos.x,
      y: newCamPos.y,
      z: newCamPos.z,
      duration: 1.1,
      ease: 'power3.inOut',
    });
    gsap.to(oc.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: () => oc.update(),
    });
    // Mark as focused so a double-click anywhere will run resetView()
    // and return the user to the default fit-everything camera. Also
    // lock the camera so drag-rotate is disabled while zoomed in —
    // user has to double-click to exit before they can spin again.
    focusedRef.current = monitorScene;
    onCameraLockChange(true);
  };

  const resetView = () => {
    if (!controls || !initialCamPos.current || !initialTarget.current) return;
    const oc = controls as unknown as OrbitLike;
    gsap.to(camera.position, {
      x: initialCamPos.current.x,
      y: initialCamPos.current.y,
      z: initialCamPos.current.z,
      duration: 1.0,
      ease: 'power3.inOut',
    });
    gsap.to(oc.target, {
      x: initialTarget.current.x,
      y: initialTarget.current.y,
      z: initialTarget.current.z,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: () => oc.update(),
      onComplete: () => {
        focusedRef.current = null;
        // Re-enable drag-rotate once the camera is back at default.
        onCameraLockChange(false);
      },
    });
  };

  return (
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const name = (e.object as THREE.Object3D).name || 'object';
        onClickMesh({
          name,
          clientX: e.nativeEvent.clientX,
          clientY: e.nativeEvent.clientY,
        });
        // Walk up the parent chain to find which "button" mesh was
        // hit, if any. tv004 toggles the logo channel, tv005 toggles
        // the pixel-grid channel. Other tv* parts (frame, knobs,
        // speaker, antenna) just show the tooltip and do nothing.
        let current: THREE.Object3D | null = e.object;
        let buttonHit: 'logo' | 'pixels' | null = null;
        let buttonMesh: THREE.Object3D | null = null;
        while (current && current !== monitorScene) {
          if (current.name === LOGO_BUTTON_MESH_NAME) {
            buttonHit = 'logo';
            buttonMesh = current;
            break;
          }
          if (current.name === PIXEL_BUTTON_MESH_NAME) {
            buttonHit = 'pixels';
            buttonMesh = current;
            break;
          }
          current = current.parent;
        }
        // Tactile "press" animation: quick scale-down + bounce back.
        // killTweensOf prevents a rapid second click from stacking
        // tweens and leaving the button stuck at a small scale.
        if (buttonMesh) {
          gsap.killTweensOf(buttonMesh.scale);
          buttonMesh.scale.set(1, 1, 1);
          gsap.to(buttonMesh.scale, {
            x: 0.85,
            y: 0.85,
            z: 0.85,
            duration: 0.09,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
        // eslint-disable-next-line no-console
        console.log(`[Hero3D] click on "${name}" — buttonHit=${buttonHit}`);
        if (buttonHit) {
          // If the press is going to turn the current channel OFF
          // (user clicked the same button twice), zoom OUT to the
          // default view. Otherwise zoom IN to the close-up so they
          // can see what they just turned on.
          const willTurnOff = screenMode === buttonHit;
          onButtonPress(buttonHit);
          if (willTurnOff) {
            resetView();
          } else {
            focusOnTV();
          }
        }
      }}
      onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        // Toggle: focused → reset, otherwise → focus on the clicked mesh.
        if (focusedRef.current) {
          resetView();
        } else {
          focusedRef.current = e.object;
          focusOn(e.object);
        }
      }}
    >
      <primitive
        object={ramenScene}
        position={RAMEN_POS}
        rotation={RAMEN_ROT}
        scale={RAMEN_SCALE}
      />
      <primitive
        object={monitorScene}
        position={MONITOR_POS}
        rotation={MONITOR_ROT}
        scale={MONITOR_SCALE}
      />
      {/* Logo rendering is handled by swapping the screen mesh's
          material via a useEffect above — no JSX element needed. The
          material with the logo texture IS the screen, so it fits
          perfectly with zero gap. */}
    </group>
  );
}

// ============================================================
// RESPONSIVE BOUNDS — drei's <Bounds> auto-fits the camera to a
// fixed margin regardless of viewport, so on narrow phone screens
// the same margin reads as "everything tiny." This wrapper drops the
// margin on mobile so the models fill more of the canvas. The `key`
// changes when crossing the breakpoint to force Bounds to remount and
// recompute the fit (a prop change alone wouldn't refit it).
// ============================================================
function ResponsiveBounds({ children }: { children: React.ReactNode }) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const margin = isMobile ? 0.85 : 1.0;
  return (
    <Bounds
      key={isMobile ? 'mobile' : 'desktop'}
      fit
      clip
      observe
      margin={margin}
    >
      {children}
    </Bounds>
  );
}

// ============================================================
// Visible fallback while the .glb downloads + parses — at least
// the canvas pixels are obviously rendering even if the model isn't.
// ============================================================
function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#635bff" />
    </mesh>
  );
}

export default function Hero3D() {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<ClickPayload | null>(null);
  // The PC's "screen" content. Toggled by clicking anywhere on the
  // monitor model. Null when the screen is "off"; 'logo' when the
  // GIFT logo is showing. Easy to extend later (e.g. boot-up text,
  // animation frames) by adding more values.
  const [screen, setScreen] = useState<ScreenMode>('off');
  // When true, the camera is zoomed into the TV and rotation is locked.
  // A double-click anywhere fires resetView in DeskScene, which calls
  // back with false once the camera has animated home.
  const [cameraLocked, setCameraLocked] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!tooltip) return;
    const id = setTimeout(() => setTooltip(null), 1800);
    return () => clearTimeout(id);
  }, [tooltip]);

  if (!mounted) return null;

  return (
    <div className="hero-3d" aria-hidden>
      <Canvas
        // Camera starts wide — <Bounds fit> below repositions it
        // automatically once the model loads to frame the scene.
        camera={{ position: [4, 3, 6], fov: 40, near: 0.01, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        // Soft tint behind everything so it's obvious if the canvas
        // itself is mounting. Remove once the model is visible.
        style={{ background: 'linear-gradient(180deg, #eef2fb 0%, #d9dff0 100%)' }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 3, -4]} intensity={0.3} />
        <Suspense fallback={<LoadingBox />}>
          <Environment preset="apartment" />
          {/* Bounds auto-fits the camera to whatever lives inside it.
              Center re-centers the model at origin first so off-origin
              .glb exports still frame correctly. `observe` re-fits if
              the bounds change (e.g. window resize). The margin shrinks
              on narrow viewports so models don't look tiny on mobile. */}
          <ResponsiveBounds>
            <Center>
              <DeskScene
                onClickMesh={setTooltip}
                onButtonPress={(which) =>
                  // Each button toggles its own channel: pressing
                  // tv004 cycles off ↔ logo; pressing tv005 cycles
                  // off ↔ pixels. Pressing one while the OTHER is
                  // active switches over (not stacked) — only one
                  // channel can be on at a time.
                  setScreen((s) => (s === which ? 'off' : which))
                }
                screenMode={screen}
                onCameraLockChange={setCameraLocked}
              />
            </Center>
          </ResponsiveBounds>
        </Suspense>
        {/* User-driven orbit: drag to rotate. Wheel-zoom + pan disabled
            so page scroll doesn't pull the camera around — zoom is now
            driven by double-click instead (see DeskScene). Polar angle
            clamped so the model never flips upside down. dampingFactor
            adds inertia so rotation feels weighted, not snappy. */}
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableRotate={!cameraLocked}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.52}
        />
      </Canvas>
      {tooltip && (
        <div
          className="hero-3d-tooltip"
          style={{ left: tooltip.clientX, top: tooltip.clientY }}
        >
          {tooltip.name || 'object'}
        </div>
      )}
      {/* Screen content is now projected in 3D onto the screen mesh
          via drei <Html transform> inside DeskScene — no 2D overlay
          needed. */}
    </div>
  );
}
