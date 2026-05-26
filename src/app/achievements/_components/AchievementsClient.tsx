'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../achievements.css';

export default function AchievementsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Dispatch gift:logo-ready so the page-cover fade works
    window.dispatchEvent(new Event('gift:logo-ready'));

    // ---- Reveal observer ----
    const revealEls = document.querySelectorAll('.ach-rv');
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    revealEls.forEach((el) => revealIO.observe(el));

    // ---- Counter animation ----
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const counterEls = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
    counterEls.forEach((el) => {
      el.textContent = el.dataset.count ?? '0';
    });
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const end = parseFloat(el.dataset.count ?? '0');
          const dur = 1700;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            el.textContent = String(
              end >= 100 ? Math.round(easeOut(p) * end) : Math.round(easeOut(p) * end),
            );
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = String(end);
          };
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    counterEls.forEach((el) => counterIO.observe(el));

    // ---- Lenis smooth scroll ----
    let lenisCleanup: (() => void) | undefined;
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      } as ConstructorParameters<typeof Lenis>[0]);
      let rafId: number;
      const raf = (t: number) => {
        lenis.raf(t);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      lenisCleanup = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    });

    // ---- Accolades scroll-driven panner ----
    const accSection = document.getElementById('accolades');
    const accCards = document.getElementById('accCards');
    const accFill = document.getElementById('accMeterFill');
    const accLabel = document.getElementById('accMeterLabel');
    const accBgWord = document.getElementById('accBgWord');
    const accTrack = accSection?.querySelector<HTMLElement>('.acc-track');
    let accRafId: number;

    if (accSection && accCards && accTrack && accFill && accLabel && accBgWord) {
      const cardEls = Array.from(accCards.children) as HTMLElement[];
      const total = cardEls.length;

      if (window.innerWidth >= 820) {
        cardEls.forEach((el) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition =
            'opacity .5s var(--ease), transform .5s var(--ease), border-color .6s var(--ease), box-shadow .6s var(--ease)';
        });
      }

      const updateAcc = () => {
        if (window.innerWidth < 820) {
          accCards.style.transform = '';
          accBgWord.style.transform = '';
          return;
        }
        const rect = accSection.getBoundingClientRect();
        const range = accSection.offsetHeight - window.innerHeight;
        const passed = Math.max(0, -rect.top);
        const p = Math.min(1, range > 0 ? passed / range : 0);
        const distance = Math.max(0, accCards.scrollWidth - accTrack.clientWidth + 24);
        accCards.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
        accBgWord.style.transform = `translate3d(${p * distance * 0.4 - distance * 0.2}px, -50%, 0)`;
        accFill.style.transform = `scaleX(${p})`;
        const idx = Math.min(total, Math.max(1, Math.floor(p * total * 0.9999) + 1));
        accLabel.textContent =
          String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        const trackRect = accTrack.getBoundingClientRect();
        const focalX = trackRect.left + trackRect.width * 0.5;
        cardEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const dist = Math.abs(cx - focalX) / window.innerWidth;
          if (dist < 0.65) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          } else {
            el.style.opacity = String(Math.max(0.25, 1 - (dist - 0.65) * 2));
            el.style.transform = 'translateY(0)';
          }
          el.classList.toggle('focal', dist < 0.18);
        });
      };

      const tickAcc = () => {
        updateAcc();
        accRafId = requestAnimationFrame(tickAcc);
      };
      accRafId = requestAnimationFrame(tickAcc);
    }

    // ---- Three.js 3D scene ----
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animRafId = 0;
    let threeResizeCleanup: (() => void) | undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1124, 8, 22);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x0a1124, 1);

    scene.add(new THREE.AmbientLight(0x2a3a66, 0.8));
    const key = new THREE.DirectionalLight(0xe8b04c, 1.3);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6b8ac4, 0.7);
    rim.position.set(-6, -2, 3);
    scene.add(rim);
    const pt = new THREE.PointLight(0xe8b04c, 1.4, 18);
    pt.position.set(0, 0, 4);
    scene.add(pt);

    // ---- Scroll group (keyframe-driven container) ----
    const scrollGroup = new THREE.Group();
    scene.add(scrollGroup);

    // ---- GLB mascot ----
    let petBounce: THREE.Object3D | null = null;

    import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      const loader = new GLTFLoader();
      loader.load(
        '/models/GIFT_mascot_space.glb',
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).castShadow = true;
              (child as THREE.Mesh).receiveShadow = true;
            }
          });

          // Normalize model to a fixed world-unit size regardless of export scale
          const bbox = new THREE.Box3().setFromObject(model);
          const bsz = new THREE.Vector3();
          bbox.getSize(bsz);
          const maxDim = Math.max(bsz.x, bsz.y, bsz.z);
          if (maxDim > 0) model.scale.setScalar(2.0 / maxDim);

          // Identify the pet as the child whose bounding-box centre sits
          // highest in model space (above the sphere/world).
          if (model.children.length >= 2) {
            let topChild: THREE.Object3D | null = null;
            let topY = -Infinity;
            model.children.forEach((child) => {
              const box = new THREE.Box3().setFromObject(child);
              const center = new THREE.Vector3();
              box.getCenter(center);
              if (center.y > topY) {
                topY = center.y;
                topChild = child;
              }
            });
            petBounce = topChild;
          } else {
            petBounce = model;
          }

          scrollGroup.add(model);
        },
        undefined,
        (err) => console.error('GLB load error', err),
      );
    });

    // Particles
    const N = 380;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(N * 3);
    const pColors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 4 + Math.random() * 6,
        t = Math.random() * Math.PI * 2,
        p = (Math.random() - 0.5) * Math.PI * 0.7;
      positions[i * 3 + 0] = Math.cos(t) * Math.cos(p) * r;
      positions[i * 3 + 1] = Math.sin(p) * r;
      positions[i * 3 + 2] = Math.sin(t) * Math.cos(p) * r - 1;
      const golden = Math.random() > 0.3;
      pColors[i * 3 + 0] = golden ? 0.91 : 0.85;
      pColors[i * 3 + 1] = golden ? 0.69 : 0.85;
      pColors[i * 3 + 2] = golden ? 0.3 : 0.65;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const dots = new THREE.Points(
      partGeo,
      new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(dots);

    // Comets
    const TAIL_LEN = 40;
    type Comet = {
      head: THREE.Mesh;
      tail: THREE.Points;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      history: { x: number; y: number; z: number }[];
      delay: number;
      alive: boolean;
    };
    const comets: Comet[] = [];

    const makeComet = (): Comet => {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0xfff6da,
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const cGeo = new THREE.BufferGeometry();
      const cPos = new Float32Array(TAIL_LEN * 3),
        cCol = new Float32Array(TAIL_LEN * 3);
      cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
      cGeo.setAttribute('color', new THREE.BufferAttribute(cCol, 3));
      const tail = new THREE.Points(
        cGeo,
        new THREE.PointsMaterial({
          size: 0.22,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      scene.add(head);
      scene.add(tail);
      return {
        head,
        tail,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        history: [],
        delay: 0,
        alive: false,
      };
    };

    const resetComet = (c: Comet, immediate: boolean) => {
      const fromLeft = Math.random() > 0.5;
      c.pos.set(
        fromLeft ? -13 - Math.random() * 3 : 13 + Math.random() * 3,
        (Math.random() - 0.3) * 6,
        (Math.random() - 0.5) * 5 - 1,
      );
      const speed = 0.22 + Math.random() * 0.16,
        dirX = fromLeft ? 1 : -1;
      c.vel.set(dirX * speed, (-0.2 - Math.random() * 0.35) * speed * 0.7, 0);
      c.history.length = 0;
      c.alive = true;
      c.delay = immediate ? 0 : Math.floor(120 + Math.random() * 360);
    };

    for (let i = 0; i < 2; i++) {
      const c = makeComet();
      resetComet(c, false);
      c.delay = i * 160 + Math.random() * 240;
      c.alive = false;
      comets.push(c);
    }

    const tickComets = () => {
      for (const c of comets) {
        if (!c.alive) {
          if (--c.delay <= 0) resetComet(c, true);
          c.head.visible = false;
          c.tail.visible = false;
          continue;
        }
        c.head.visible = true;
        c.tail.visible = true;
        c.pos.add(c.vel);
        c.head.position.copy(c.pos);
        c.history.unshift({ x: c.pos.x, y: c.pos.y, z: c.pos.z });
        if (c.history.length > TAIL_LEN) c.history.pop();
        const pA = c.tail.geometry.attributes.position as THREE.BufferAttribute;
        const cA = c.tail.geometry.attributes.color as THREE.BufferAttribute;
        for (let i = 0; i < TAIL_LEN; i++) {
          const h = c.history[i] || c.pos;
          pA.array[i * 3 + 0] = h.x;
          pA.array[i * 3 + 1] = h.y;
          pA.array[i * 3 + 2] = h.z;
          const f = 1 - i / TAIL_LEN,
            intensity = Math.pow(f, 1.1);
          cA.array[i * 3 + 0] = (0.65 + 0.35 * f) * intensity;
          cA.array[i * 3 + 1] = (0.45 + 0.4 * f) * intensity;
          cA.array[i * 3 + 2] = (0.15 + 0.25 * f) * intensity;
        }
        pA.needsUpdate = true;
        cA.needsUpdate = true;
        if (Math.abs(c.pos.x) > 14 || c.pos.y < -7) {
          c.alive = false;
          c.delay = Math.floor(140 + Math.random() * 380);
        }
      }
    };

    // ---- Scroll keyframes ----
    const KF = [
      { p: 0.0,  x:  2.4, y:  0.4, z:  0.0, s: 1.2,  spin: 0.7 },
      { p: 0.12, x:  3.0, y: -1.0, z: -1.0, s: 0.95, spin: 0.5 },
      { p: 0.22, x: -2.6, y: -0.4, z: -0.5, s: 0.85, spin: 0.6 },
      { p: 0.4,  x:  4.5, y:  1.5, z: -3.5, s: 0.60, spin: 0.4 },
      { p: 0.55, x: -3.4, y:  1.0, z: -1.5, s: 0.8,  spin: 0.6 },
      { p: 0.72, x:  3.0, y:  0.8, z: -2.0, s: 0.7,  spin: 0.5 },
      { p: 0.82, x: -3.2, y: -0.8, z: -3.0, s: 0.6,  spin: 0.4 },
      { p: 0.9,  x:  0.0, y:  0.0, z:  1.0, s: 1.65, spin: 1.0 },
      { p: 1.0,  x:  0.0, y: -0.2, z:  0.5, s: 1.1,  spin: 1.3 },
    ];

    const sampleKF = (prog: number) => {
      prog = Math.max(0, Math.min(1, prog));
      const isMobile = window.innerWidth < 720;
      const xScale  = isMobile ? 0.45 : window.innerWidth < 1024 ? 0.7 : 1;
      const xOffset = isMobile ? -0.7 : 0;
      const sBoost  = isMobile ? 0.75 : window.innerWidth < 1024 ? 0.82 : 1;
      const yOffset = isMobile ? -0.2 : 0;
      const zOffset = isMobile ? 1.0 : 0;
      for (let i = 0; i < KF.length - 1; i++) {
        if (prog >= KF[i].p && prog <= KF[i + 1].p) {
          const a = KF[i], b = KF[i + 1];
          const t = (prog - a.p) / (b.p - a.p);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          return {
            x: (a.x + (b.x - a.x) * e) * xScale + xOffset,
            y: a.y + (b.y - a.y) * e + yOffset,
            z: a.z + (b.z - a.z) * e + zOffset,
            s: (a.s + (b.s - a.s) * e) * sBoost,
            spin: a.spin + (b.spin - a.spin) * e,
          };
        }
      }
      const last = KF[KF.length - 1];
      return { ...last, x: last.x * xScale + xOffset, y: last.y + yOffset, z: last.z + zOffset, s: last.s * sBoost };
    };

    const clock = new THREE.Clock();
    let lastT = 0;

    const animate = () => {
      animRafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = t - lastT;
      lastT = t;

      // Scroll-driven keyframe: position / scale / spin
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? window.scrollY / docH : 0;
      const kf = sampleKF(progress);

      scrollGroup.position.x += (kf.x - scrollGroup.position.x) * 0.08;
      scrollGroup.position.y += (kf.y - scrollGroup.position.y) * 0.08;
      scrollGroup.position.z += (kf.z - scrollGroup.position.z) * 0.08;
      const newS = scrollGroup.scale.x + (kf.s - scrollGroup.scale.x) * 0.08;
      scrollGroup.scale.set(newS, newS, newS);
      scrollGroup.rotation.y += 0.18 * dt * kf.spin;
      scrollGroup.rotation.x = Math.sin(t * 0.6) * 0.1;
      scrollGroup.rotation.z = Math.sin(t * 0.4) * 0.06;

      // Pet bounce: physics arc + continuous squash-and-stretch
      if (petBounce) {
        const FREQ = 1.25;
        const HEIGHT = 0.26;
        const phase = (t * FREQ) % 1;

        // easeOut rise (fast launch) → easeIn fall (gravity acceleration)
        // gives snappy contact rather than the floaty smoothstep landing
        let h: number;
        if (phase < 0.45) {
          const x = phase / 0.45;
          h = 1 - (1 - x) * (1 - x);   // easeOutQuad
        } else {
          const x = (phase - 0.45) / 0.55;
          h = 1 - x * x;               // easeInQuad (slightly longer fall)
        }
        petBounce.position.y = h * HEIGHT;

        // Fully continuous squash-and-stretch — no binary snap
        // h=0 (contact) → squash; h=1 (peak) → stretch
        const stretchY = 1 + 0.12 * h - 0.20 * (1 - h) * (1 - h);
        const stretchX = 1 / Math.sqrt(Math.max(0.5, stretchY));
        petBounce.scale.set(stretchX, stretchY, stretchX);
      }

      // Background particles slow drift
      dots.rotation.y = t * 0.04;
      dots.rotation.x = Math.sin(t * 0.1) * 0.05;

      tickComets();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener('resize', onResize);
    threeResizeCleanup = () => window.removeEventListener('resize', onResize);

    return () => {
      revealIO.disconnect();
      counterIO.disconnect();
      if (accRafId) cancelAnimationFrame(accRafId);
      if (animRafId) cancelAnimationFrame(animRafId);
      threeResizeCleanup?.();
      lenisCleanup?.();
    };
  }, []);

  return (
    <>
      <Header />
      <div className="achievements-page">
        <canvas id="bg-3d" ref={canvasRef} />
        <div className="ap-grain" aria-hidden />

        {/* ── Hero ── */}
        <section className="hero" id="hero">
          <div className="wrap">
            <div className="hero-3d-spacer" aria-hidden />
            <h1>
              <span className="word">
                <span className="inner">築いてきた、</span>
              </span>
              <span className="word">
                <span className="inner">
                  <span className="gh">信頼</span>の
                </span>
              </span>
              <span className="word">
                <span className="inner">重み。</span>
              </span>
            </h1>
            <p className="sub lead">
              コールセンターから始まったGIFTは、8年で3事業・300名超の組織になりました。
              <br />
              数字の裏側には、声で動かしてきた人の物語があります。
              <br />
              その<span className="gh">軌跡</span>のすべてを、ここに記録します。
            </p>
            <div className="actions">
              <a href="#stats" className="btn primary">
                数字で見る <span className="arr">→</span>
              </a>
              <a href="#accolades" className="btn ghost">
                受賞・認定を見る <span className="arr">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="stats" id="stats">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow ach-rv">By the Numbers · 数字でみるGIFT</span>
                <h2 className="ach-rv d1">
                  8年で
                  <br />
                  育てた、<span className="gh">芯のある</span>数字。
                </h2>
              </div>
              <p className="lead ach-rv d2" style={{ maxWidth: '32ch' }}>
                外向きの広告数字ではなく、
                <br />
                現場の手応えから積み上がった指標を並べました。
              </p>
            </div>
            <div className="tick ach-rv">
              <span>SECTION / 01</span>
              <span className="gh">— FIGURES</span>
              <span>UPDATED 2026 Q1</span>
              <span style={{ marginLeft: 'auto' }}>SOURCE / 社内KPI</span>
            </div>
            <div className="grid">
              <div className="tile ach-rv d1">
                <div className="label">
                  <span>STAFF</span>
                  <span className="idx">01</span>
                </div>
                <div className="num">
                  <span data-count="312">0</span>
                  <span className="unit">名+</span>
                </div>
                <p className="desc">
                  2018年の創業時5名から、コール・DX・財務の3事業を横断する大規模組織へ。離職率は業界平均の半分。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,20 8,18 16,15 24,16 32,11 40,8 48,4 60,2"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d2">
                <div className="label">
                  <span>BUSINESS LINES</span>
                  <span className="idx">02</span>
                </div>
                <div className="num">
                  <span data-count="3">0</span>
                  <span className="unit">事業</span>
                </div>
                <p className="desc">
                  コールセンター、DXコンサル、財務コンサル。横断的に活きるスキルを、ひとつの会社の中で育てます。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,16 12,16 20,8 32,8 40,2 60,2"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d3">
                <div className="label">
                  <span>CLIENT PROJECTS</span>
                  <span className="idx">03</span>
                </div>
                <div className="num">
                  <span data-count="184">0</span>
                  <span className="unit">件</span>
                </div>
                <p className="desc">
                  大手通信、金融、SaaS、不動産まで。継続率94%、平均パートナー年数3.7年。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,22 8,20 14,18 22,14 30,15 38,10 46,7 54,4 60,3"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d4">
                <div className="label">
                  <span>SATISFACTION</span>
                  <span className="idx">04</span>
                </div>
                <div className="num">
                  <span data-count="98">0</span>
                  <span className="unit">%</span>
                </div>
                <p className="desc">
                  研修完走率98%、社員満足度4.6/5。「働きやすさ」で選ばれる現場をつくり続けます。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,12 10,10 20,11 30,8 40,6 50,5 60,3"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── Videos ── */}
        <section className="videos" id="videos">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow ach-rv">Film · 映像</span>
                <h2 className="ach-rv d1">
                  数字は語らない
                  <br />
                  ことを、<span className="gh">映像</span>で。
                </h2>
              </div>
            </div>
            <div className="tick ach-rv">
              <span>SECTION / 02</span>
            </div>
            <div className="v-feature ach-rv">
              <video autoPlay muted loop playsInline>
                <source src="/video/achievements-vid.mp4" type="video/mp4" />
              </video>
              <div className="veil" />
            </div>
          </div>
        </section>

        {/* ── Accolades ── */}
        <section className="accolades" id="accolades">
          <div className="acc-pin">
            <div className="acc-bg-grid" />
            <div className="acc-bg-word" id="accBgWord">
              RECOGNITION · 受賞 · CERTIFIED · 認定 · RECOGNITION · 受賞 · CERTIFIED · 認定
            </div>
            <div className="acc-header">
              <div>
                <span className="eyebrow ach-rv">Recognition · 受賞・認定</span>
                <h2 className="ach-rv d1">
                  外からの<span className="gh">評価</span>もまた、
                  <br />
                  燃料になる。
                </h2>
              </div>
              <p className="lead ach-rv d2 right">
                広告や寄稿ではなく、
                <br />
                第三者の審査と国の基準で受け取った評価だけを並べました。
              </p>
            </div>
            <div className="acc-track">
              <div className="acc-cards" id="accCards">
                <article className="acc-card">
                  <div className="top">
                    <span className="num">01 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-1"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-1">
                            HDI ★★★ · BENCHMARK · HDI ★★★ · BENCHMARK ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">★</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2023<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">HDI 格付けベンチマーク — 三つ星評価</div>
                    <div className="org">HDI-Japan / Support Center Division</div>
                    <p className="body">
                      サポートセンター運営の総合品質で最高位「★★★」を獲得。応答品質・運営管理の両軸で業界トップ水準と認定。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">02 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-2"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-2">
                            BEST CALL CENTER · 業界大賞 · BEST CALL CENTER ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">▲</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2024<span className="post">AWARD</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">業界大賞 — Best Call Center Award 総合大賞</div>
                    <div className="org">月刊 コールセンター・ジャパン誌</div>
                    <p className="body">
                      「自社運営の質」が業界誌主催のオブザーバー賞で評価され、応募 187
                      社のなかから総合大賞を受賞。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">03 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-3"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-3">
                            DX CERTIFIED · DX認定事業者 · DX CERTIFIED ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">◆</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2024<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">DX認定事業者 — 情報処理推進機構</div>
                    <div className="org">経済産業省 / IPA</div>
                    <p className="body">
                      経営ビジョンに基づくDX推進体制が国の基準に適合。受託案件のみならず、自社の業務基盤でも認定要件を達成。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">04 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-4"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-4">
                            GREAT PLACE TO WORK · 働きがいのある会社 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">●</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">RANK</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">働きがいのある会社 — 中規模部門 ランクイン</div>
                    <div className="org">Great Place to Work® Institute Japan</div>
                    <p className="body">
                      従業員アンケート・組織カルチャー監査の両軸で評価。中規模部門
                      100〜999名カテゴリで初年度ランクイン。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">05 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-5"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-5">
                            健康経営優良法人 · KENKO 2025 · 健康経営 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">+</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">健康経営優良法人 — 大規模法人部門</div>
                    <div className="org">経済産業省 / 日本健康会議</div>
                    <p className="body">
                      心身の健康投資・労働環境・予防医療の各指標で経済産業省の認定基準を上回り、大規模法人部門で取得。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">06 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-6"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-6">
                            ISO 27001 · INFORMATION SECURITY · ISO 27001 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">▣</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">ISO/IEC 27001 — 情報セキュリティ認証取得</div>
                    <div className="org">BSI Japan / ISMS</div>
                    <p className="body">
                      全社情報資産・クライアント預託データの管理体制を国際基準で監査。財務コンサル事業部の認証取得を皮切りに、全部署へ展開中。
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <div className="acc-meter">
              <span className="label" id="accMeterLabel">
                01 / 06
              </span>
              <div className="bar">
                <div className="fill" id="accMeterFill" />
              </div>
              <span className="end">2023 → 2025</span>
              <span className="scroll-hint">SCROLL</span>
            </div>
          </div>
        </section>

        {/* ── Quote ── */}
        <section className="quote" id="quote">
          <div className="marquee" aria-hidden>
            <span className="track">
              opportunity · 機会 · opportunity · 機会 · opportunity · 機会 ·{' '}
            </span>
            <span className="track">
              opportunity · 機会 · opportunity · 機会 · opportunity · 機会 ·{' '}
            </span>
          </div>
          <div className="wrap">
            <div className="mark ach-rv">&ldquo;</div>
            <p className="body ach-rv d1">
              数字は、信頼の
              <br />
              <span className="em">残響</span>にすぎない。
              <br />
              鳴らしたのは、いつも人だった。
            </p>
            <div className="attr ach-rv d2">— 代表取締役 / 大塚 一平 · 2026 年頭所感より</div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ach-cta" id="cta">
          <div className="wrap">
            <span className="eyebrow ach-rv">Contact · お問い合わせ</span>
            <h2 className="ach-rv d1">
              GIFTと、<span className="gh">共に</span>
              <br />
              歩みませんか。
            </h2>
            <p className="sub lead ach-rv d2">
              事業の課題でも、採用のご相談でも。
              <br />
              まずは気軽にお声がけください。
            </p>
            <div className="actions ach-rv d3">
              <Link href="/contact" className="btn primary">
                お問い合わせ <span className="arr">→</span>
              </Link>
              <Link href="/recruit" className="btn ghost">
                採用情報を見る <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <div style={{ position: 'relative', zIndex: 3 }}>
        <Footer />
      </div>
    </>
  );
}
