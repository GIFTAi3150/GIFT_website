'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
import { INCLUDED } from './wdContent';
import { getFrozenViewportHeight, getHeroScrollDistance } from './heroScrollGeometry';

gsap.registerPlugin(ScrollTrigger);

const E = 'expo.out';
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** smoothstep between a and b */
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Scroll orchestrator for /services/web-development ("The Build"). Rendered
 * LAST inside <main> so its effect runs after every section's; the flash guard
 * is released in a rAF at the very end (project_dx_navigation_flash_fix).
 *
 * One mechanism per section — different in KIND, not in parameters:
 *   hero       a full browser evolves from a 1990s homepage to a modern site
 *   manifesto  the lock — the two words travel in from the edges and lock; 先 fills
 *   worries    the strike — a blue stroke crosses each worry out, the answer rises
 *   included   the build — a browser frame assembles beside the index, then narrows to a phone
 *   prepare    the handover — 文章 / 写真 / ロゴ slide across the divider from 御社 to GIFT
 *   pages      the spread — ten sheets fan out of a pile into the sitemap grid
 *   compare    the column — the GIFT column drops into the ledger
 *   approach   the craft — a wireframe becomes a finished website
 *   plans      the separation — the two sheets part from one stack as they enter
 *   flow       the route — a path drawn through the steps; a dot travels it
 *   closing    the aperture — a blue disc opens over the section
 * Shared (allowed repeats): section label rule + h2 mask rise.
 *
 * The seam between any two sections is one system: the outgoing sheet lags
 * and shades (`--wd-out`), the incoming sheet's corners flatten (`--wd-in`).
 *
 * Stages are sticky frames inside tall wrappers (budgets in web-development.css
 * as `--budget` multiples of --vh-frozen); a scrubbed proxy tween reads their
 * progress. No GSAP pin anywhere.
 */
export default function WdScroll() {
  const [motionRevision, setMotionRevision] = useState(0);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.wd-page');
    if (!root) return;
    const layout = () => {
      const height = getFrozenViewportHeight();
      root.toggleAttribute('data-wd-short', height <= 700);
      root.toggleAttribute('data-wd-landscape', height <= 500);
    };
    layout();
    const frame = requestAnimationFrame(layout);
    window.addEventListener(VH_FROZEN_CHANGE, layout);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(VH_FROZEN_CHANGE, layout);
      root.removeAttribute('data-wd-short');
      root.removeAttribute('data-wd-landscape');
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 899px)');
    const change = () => setMotionRevision((revision) => revision + 1);
    // Rebuild desktop-only scrolling and animation geometry when DevTools or
    // window resizing crosses the same breakpoint as the responsive CSS.
    preference.addEventListener('change', change);
    mobile.addEventListener('change', change);
    return () => {
      preference.removeEventListener('change', change);
      mobile.removeEventListener('change', change);
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.wd-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));
    const q = <T extends HTMLElement>(sel: string, from: ParentNode = root) =>
      from.querySelector<T>(sel);
    const qa = <T extends HTMLElement>(sel: string, from: ParentNode = root) =>
      Array.from(from.querySelectorAll<T>(sel));

    if (reduced) {
      // CSS defaults are the final states; only the build needs a resting step.
      root.setAttribute('data-wd-static', '');
      const build = q('[data-build]');
      if (build) {
        build.dataset.step = '5';
        build.style.setProperty('--step', '5');
      }
      qa('[data-inc], .wd-step').forEach((el) => el.classList.add('is-on'));
      release();
      return () => root.removeAttribute('data-wd-static');
    }

    // ---- Lenis: desktop only (touch starves ScrollTrigger of events) ----
    let lenis: Lenis | null = null;
    let lenisRaf: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        anchors: { offset: -96 },
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }
    const scrub = isMobile ? 0.15 : 0.5;
    // Every frame on this route uses CSS sticky, never GSAP pinning. The global
    // refresh scrolls the window to 0 and back, which disrupts WebView momentum.
    // On mobile we own refresh events and refresh only this route's instances.
    if (isMobile) ScrollTrigger.config({ autoRefreshEvents: 'none' });

    // Layout-dependent measurements run on refreshInit (transforms cleared),
    // and every stage re-places itself after the refresh.
    const measurers: Array<() => void> = [];
    const cleanups: Array<() => void> = [];
    const stages: Array<{ place: (p: number) => void; last: number }> = [];
    const stage = (
      el: HTMLElement | null,
      place: (p: number) => void,
      s = scrub,
      end?: string | (() => string),
    ) => {
      if (!el) return;
      const entry = { place, last: 0 };
      stages.push(entry);
      const wrapped = (p: number) => {
        entry.last = p;
        place(p);
      };
      const proxy = { p: 0 };
      wrapped(0);
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: end ?? (isMobile ? () => `+=${getHeroScrollDistance(el)}` : 'bottom bottom'),
          scrub: s,
          invalidateOnRefresh: true,
        },
        onUpdate: () => wrapped(proxy.p),
      });
    };

    const ctx = gsap.context(() => {
      // ═══ shared: section labels + h2 ═══════════════════════════════════
      qa('[data-wd-label]').forEach((label) => {
        const rule = q('.wd-label__rule', label);
        const text = q('.wd-label__text', label);
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });
      qa('[data-wd-h2] .wd-h2__line').forEach((line, i) => {
        gsap.fromTo(
          line,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: E,
            delay: (i % 2) * 0.08,
            scrollTrigger: { trigger: line, start: 'top 90%', once: true },
          },
        );
      });

      // ═══ hero: one browser travels from 1994 to today ═══════════════════
      const hero = q('[data-time-travel]');
      if (hero) {
        const viewport = q('[data-pixel-viewport]', hero);
        const retro = q('[data-browser-era="retro"]', hero);
        const modern = q('[data-browser-era="modern"]', hero);
        const mask = hero.querySelector<SVGClipPathElement>('[data-pixel-mask]');
        const tiles = hero.querySelector<SVGGElement>('[data-pixel-tiles]');
        const svgNS = 'http://www.w3.org/2000/svg';
        const clipUrl = `url(#${hero.dataset.pixelClipId})`;
        type Pixel = {
          x: number;
          y: number;
          w: number;
          h: number;
          threshold: number;
          duration: number;
          revealed: boolean;
          lastSize: number;
          lastOpacity: number;
          clip: SVGRectElement;
          tile: SVGRectElement;
        };
        let pixels: Pixel[] = [];
        let progress = 0;
        let gridWidth = 0;
        let gridHeight = 0;
        let bleedX = 0;
        let bleedY = 0;
        let activeModern: boolean | null = null;

        const paint = (value: number) => {
          progress = value;
          hero.style.setProperty('--era-progress', value.toFixed(4));
          const era = value >= 0.999 ? 'modern' : 'retro';
          if (hero.dataset.era !== era) hero.dataset.era = era;
          if (modern) modern.style.clipPath = isMobile || value >= 1 ? 'none' : clipUrl;
          if (retro) retro.style.visibility = value >= 1 ? 'hidden' : 'visible';
          const nextModern = value >= 0.5;
          if (nextModern !== activeModern) {
            activeModern = nextModern;
            [retro, modern].forEach((browser, index) => {
              if (!browser) return;
              const active = index === (nextModern ? 1 : 0);
              browser.inert = !active;
              browser.setAttribute('aria-hidden', String(!active));
            });
          }
          pixels.forEach((pixel) => {
            const phase = clamp01((value - pixel.threshold) / pixel.duration);
            // Cover the old cell completely before swapping its contents. This
            // avoids tiny fragments of both eras' type competing in one cell.
            const size = Math.round(ss(0, 0.42, phase) * 6) / 6;
            const revealed = phase >= 0.44;
            const opacity = Math.round((1 - ss(0.48, 1, phase)) * 24) / 24;
            if (revealed !== pixel.revealed) {
              pixel.revealed = revealed;
              pixel.clip.setAttribute('width', String(revealed ? pixel.w + bleedX : 0));
            }
            if (size !== pixel.lastSize) {
              pixel.lastSize = size;
              pixel.tile.setAttribute('x', String(pixel.x + (pixel.w * (1 - size)) / 2));
              pixel.tile.setAttribute('y', String(pixel.y + (pixel.h * (1 - size)) / 2));
              pixel.tile.setAttribute('width', String((pixel.w + bleedX) * size));
              pixel.tile.setAttribute('height', String((pixel.h + bleedY) * size));
            }
            if (opacity !== pixel.lastOpacity) {
              pixel.lastOpacity = opacity;
              pixel.tile.setAttribute('opacity', String(opacity));
            }
          });
        };

        const buildPixels = () => {
          if (!viewport || !mask || !tiles) return;
          const width = viewport.clientWidth;
          const height = viewport.clientHeight;
          if (!width || !height || (width === gridWidth && height === gridHeight)) return;
          gridWidth = width;
          gridHeight = height;
          // Bound the grid by both area and width, including tall phone screens.
          const size = Math.max(
            24,
            Math.ceil(width / 32),
            Math.ceil(Math.sqrt((width * height) / 700)),
          );
          const columns = Math.max(1, Math.ceil(width / size));
          const rows = Math.max(1, Math.ceil(height / size));
          bleedX = 1.25 / width;
          bleedY = 1.25 / height;
          const clipFragment = document.createDocumentFragment();
          const tileFragment = document.createDocumentFragment();
          const palette = ['#1749bb', '#2563eb', '#458af2', '#85ceff', '#b4f0ff'];
          pixels = [];
          for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
              // Repeatable spatial noise keeps the wave identical when reversing
              // or rebuilding after a resize. A small cluster offset breaks up
              // the straight edge without scattering pixels over the whole page.
              const noise = ((column * 73 + row * 151 + column * row * 17) % 101) / 101;
              const cluster = ((Math.floor(column / 3) * 17 + Math.floor(row / 3) * 31) % 19) / 19;
              const rank =
                (column / Math.max(1, columns - 1)) * 0.68 +
                (row / Math.max(1, rows - 1)) * 0.2 +
                cluster * 0.08 +
                noise * 0.04;
              const x = column / columns;
              const y = row / rows;
              const w = 1 / columns;
              const h = 1 / rows;
              const clip = document.createElementNS(svgNS, 'rect');
              clip.setAttribute('x', String(x));
              clip.setAttribute('y', String(y));
              clip.setAttribute('width', '0');
              clip.setAttribute('height', String(h + bleedY));
              const tile = document.createElementNS(svgNS, 'rect');
              tile.setAttribute('fill', palette[Math.floor(noise * palette.length)]);
              tile.setAttribute('opacity', '0');
              clipFragment.appendChild(clip);
              tileFragment.appendChild(tile);
              pixels.push({
                x,
                y,
                w,
                h,
                threshold: 0.02 + rank * 0.74,
                duration: 0.18 + noise * 0.04,
                revealed: false,
                lastSize: -1,
                lastOpacity: -1,
                clip,
                tile,
              });
            }
          }
          mask.replaceChildren(clipFragment);
          tiles.replaceChildren(tileFragment);
          paint(progress);
        };
        hero.setAttribute('data-animated', '');
        if (!isMobile) {
          measurers.push(buildPixels);
          buildPixels();
          const observer = new ResizeObserver(buildPixels);
          if (viewport) observer.observe(viewport);
          cleanups.push(() => observer.disconnect());
        }
        if (isMobile) {
          // Phones show the modern site in normal flow, without a scroll transition.
          paint(1);
        } else {
          // Desktop retains the eased pixel reveal.
          stage(
            hero,
            (p) => paint(clamp01((p - 0.08) / 0.78)),
            0.4,
            () => `+=${getHeroScrollDistance(hero)}`,
          );
        }
      }

      // ═══ the seam: every sheet slides over the one before it ═══════════
      const sections = qa('.wd-sec');
      sections.forEach((sec, i) => {
        const prev = sections[i - 1];
        const write = (p: number) => {
          const v = p.toFixed(4);
          sec.style.setProperty('--wd-in', v);
          if (prev) prev.style.setProperty('--wd-out', v);
        };
        ScrollTrigger.create({
          trigger: sec,
          start: () => (isMobile ? `top ${getFrozenViewportHeight()}px` : 'top bottom'),
          end: 'top top',
          onUpdate: (self) => write(self.progress),
          onRefresh: (self) => write(self.progress),
        });
      });

      // ═══ manifesto: the lock ════════════════════════════════════════════
      {
        const el = q('.wd-manifesto');
        const locks = qa('[data-lock]');
        const title = q('[data-lock-title]');
        const rule = q('[data-lock-rule]');
        const leads = qa('[data-lock-lead]');
        const gear = q('[data-gear]');
        // Keep the cog engaged from entry through exit, including outside the text lock.
        if (el && gear) {
          gsap.fromTo(
            gear,
            { rotation: -30 },
            {
              rotation: 510,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: isMobile ? 0.12 : 0.2,
                invalidateOnRefresh: true,
              },
            },
          );
        }
        stage(el, (p) => {
          const amp = Math.min(window.innerWidth * (isMobile ? 0.7 : 0.6), 760);
          const t = ss(0.02, 0.5, p);
          locks.forEach((lock) => {
            const dir = Number(lock.dataset.lock) || 1;
            lock.style.transform = `translate3d(${(dir * (1 - t) * amp).toFixed(1)}px,0,0)`;
          });
          title?.classList.toggle('is-locked', p > 0.5);
          if (rule) rule.style.transform = `scaleX(${ss(0.5, 0.6, p).toFixed(4)})`;
          leads.forEach((line, i) => {
            const y = (1 - ss(0.56 + i * 0.05, 0.78 + i * 0.05, p)) * 110;
            line.style.transform = `translate3d(0,${y.toFixed(2)}%,0)`;
          });
        });
      }

      // ═══ worries: the strike ════════════════════════════════════════════
      {
        const el = q('.wd-worries');
        const items = qa('[data-worry]');
        const answer = q('[data-worry-answer]');
        stage(el, (p) => {
          items.forEach((li, i) => {
            const a = 0.08 + i * 0.16;
            const s = ss(a, a + 0.13, p);
            li.style.setProperty('--s', s.toFixed(4));
            li.classList.toggle('is-struck', s > 0.55);
          });
          if (answer) {
            const y = (1 - ss(0.74, 0.9, p)) * 110;
            answer.style.transform = `translate3d(0,${y.toFixed(2)}%,0)`;
          }
        });
      }

      // ═══ included: the build ════════════════════════════════════════════
      {
        const el = q('.wd-included');
        const build = q('[data-build]');
        const frame = q('[data-build-frame]');
        const rows = qa('[data-inc]');
        const caption = q('[data-build-caption]');
        if (isMobile) el?.setAttribute('data-included-steps', '');
        let last = -1;
        stage(el, (p) => {
          // 0 blueprint · 1 design · 2 pages · 3 zero · 4 https · 5 news · 6 phone
          const step = isMobile
            ? Math.min(6, Math.floor(p * 6) + 1)
            : Math.max(0, Math.min(6, Math.floor((p - 0.04) / 0.15) + 1));
          if (step !== last) {
            last = step;
            if (build) {
              build.dataset.step = String(step);
              build.style.setProperty('--step', String(step));
            }
            rows.forEach((row, i) => row.classList.toggle('is-on', i === step - 1));
            if (caption) caption.textContent = step ? INCLUDED.items[step - 1].label : 'BLUEPRINT';
          }
          if (frame && !isMobile) {
            const tilt = -(1 - ss(0, 0.3, p)) * 9;
            frame.style.transform = `perspective(1600px) rotateY(${tilt.toFixed(2)}deg)`;
          }
        });
      }

      // ═══ prepare: the handover ══════════════════════════════════════════
      {
        const el = q('.wd-prepare');
        const hands = qa('[data-hand]');
        const left = q('[data-hand-left]');
        const dists: number[] = [];
        const measure = () => {
          hands.forEach((li, i) => {
            const noun = q('[data-hand-noun]', li);
            const target = q('[data-hand-target]', li);
            if (!noun || !target) return;
            noun.style.transform = '';
            // land a little inside the GIFT column, clear of the divider
            dists[i] = target.getBoundingClientRect().left - noun.getBoundingClientRect().left + 12;
          });
        };
        measurers.push(measure);
        measure();
        stage(el, (p) => {
          hands.forEach((li, i) => {
            const a = 0.06 + i * 0.24;
            const t = ss(a, a + 0.16, p);
            const noun = q('[data-hand-noun]', li);
            const note = q('[data-hand-note]', li);
            if (noun)
              noun.style.transform = `translate3d(${((dists[i] || 0) * t).toFixed(1)}px,0,0)`;
            li.classList.toggle('is-over', t > 0.5);
            if (note) {
              const n = ss(a + 0.11, a + 0.23, p);
              note.style.transform = `translate3d(0,${((1 - n) * 105).toFixed(2)}%,0)`;
            }
          });
          if (left) {
            const l = ss(0.8, 0.95, p);
            left.style.transform = `translate3d(0,${((1 - l) * 105).toFixed(2)}%,0)`;
          }
        });
      }

      // ═══ pages: the spread ══════════════════════════════════════════════
      {
        const el = q('.wd-pages');
        const grid = q('[data-spread]');
        const sheets = qa('[data-sheet]');
        const offs: Array<[number, number]> = [];
        const measure = () => {
          if (!grid) return;
          sheets.forEach((s) => {
            s.style.transform = '';
          });
          const g = grid.getBoundingClientRect();
          const cx = g.left + g.width / 2;
          const cy = g.top + g.height / 2;
          sheets.forEach((s, i) => {
            const r = s.getBoundingClientRect();
            offs[i] = [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)];
          });
        };
        measurers.push(measure);
        measure();
        stage(el, (p) => {
          sheets.forEach((s, i) => {
            const t = ss(0.05 + i * 0.04, 0.5 + i * 0.04, p);
            const [dx, dy] = offs[i] || [0, 0];
            const rot = (i % 2 ? 1 : -1) * (3 + i * 1.1);
            const x = dx * (1 - t);
            const y = dy * (1 - t) + (1 - t) * i * 1.5;
            s.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(rot * (1 - t)).toFixed(2)}deg)`;
            s.style.zIndex = String(t < 0.999 ? 20 - i : 1);
          });
        });
      }

      // ═══ compare: the column ════════════════════════════════════════════
      {
        const table = q('[data-compare]');
        if (table) {
          gsap.fromTo(
            table,
            { '--drop': 0 },
            {
              '--drop': 1,
              ease: 'none',
              scrollTrigger: { trigger: table, start: 'top 85%', end: 'top 40%', scrub },
            },
          );
        }
      }

      // ═══ approach: wireframe to finished website ═══════════════════════
      {
        const el = q('.wd-approach');
        const visual = q('[data-craft]');
        stage(el, (p) => {
          visual?.style.setProperty('--craft-progress', ss(0.04, 0.65, p).toFixed(4));
        });
        cleanups.push(() => visual?.style.removeProperty('--craft-progress'));
      }

      // ═══ plans: the separation ══════════════════════════════════════════
      {
        // Mobile cards stay in normal flow with their CSS gap at every scroll position.
        const grid = q('[data-plans]');
        const plans = qa('[data-plan]');
        if (!isMobile && grid && plans.length === 2) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: grid, start: 'top 92%', end: 'top 42%', scrub },
          });
          tl.fromTo(
            plans[0],
            { xPercent: 52, y: 30, rotate: -2.5 },
            { xPercent: 0, y: 0, rotate: 0, ease: 'power2.out', duration: 1 },
            0,
          ).fromTo(
            plans[1],
            { xPercent: -52, y: 60, rotate: 2.5 },
            { xPercent: 0, y: 0, rotate: 0, ease: 'power2.out', duration: 1 },
            0.05,
          );
        }
      }

      // ═══ flow: the route ════════════════════════════════════════════════
      {
        const route = q('[data-route]');
        const svg = q<HTMLElement>('[data-route-svg]');
        const path = route?.querySelector<SVGPathElement>('[data-route-path]') ?? null;
        const trail = route?.querySelector<SVGPathElement>('[data-route-trail]') ?? null;
        const dot = q('[data-route-dot]');
        // scoped to the route: the build frame carries its own data-step
        const steps = route ? qa('.wd-step', route) : [];
        const nodes = route ? qa('[data-step-node]', route) : [];
        if (route && svg && path && trail && dot && nodes.length > 1) {
          let total = 0;
          const nodeLens: number[] = [];
          const segment = (pts: number[][], upto: number) => {
            let d = `M ${pts[0][0]} ${pts[0][1]}`;
            for (let i = 1; i <= upto; i += 1) {
              const [x0, y0] = pts[i - 1];
              const [x1, y1] = pts[i];
              const ym = (y0 + y1) / 2;
              d += ` C ${x0} ${ym}, ${x1} ${ym}, ${x1} ${y1}`;
            }
            return d;
          };
          const build = () => {
            const rb = route.getBoundingClientRect();
            const pts = nodes.map((n) => {
              const r = n.getBoundingClientRect();
              return [r.left + r.width / 2 - rb.left, r.top + r.height / 2 - rb.top];
            });
            svg.setAttribute('viewBox', `0 0 ${rb.width} ${rb.height}`);
            const d = segment(pts, pts.length - 1);
            path.setAttribute('d', d);
            trail.setAttribute('d', d);
            total = path.getTotalLength();
            const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            svg.appendChild(tmp);
            for (let i = 0; i < pts.length; i += 1) {
              tmp.setAttribute('d', segment(pts, i));
              nodeLens[i] = tmp.getTotalLength();
            }
            tmp.remove();
            path.style.strokeDasharray = `${total}`;
          };
          measurers.push(build);
          build();
          const place = (p: number) => {
            const len = total * p;
            path.style.strokeDashoffset = `${total - len}`;
            const pt = path.getPointAtLength(len);
            dot.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0) translate(-50%,-50%)`;
            steps.forEach((s, i) => s.classList.toggle('is-on', len >= (nodeLens[i] ?? 0) - 1));
          };
          const entry = { place, last: 0 };
          stages.push(entry);
          const wrapped = (p: number) => {
            entry.last = p;
            place(p);
          };
          const proxy = { p: 0 };
          wrapped(0);
          gsap.to(proxy, {
            p: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: route,
              start: 'top 58%',
              end: 'bottom 62%',
              scrub,
              invalidateOnRefresh: true,
            },
            onUpdate: () => wrapped(proxy.p),
          });
        }
      }

      // ═══ closing: the aperture ══════════════════════════════════════════
      {
        const el = q('.wd-closing');
        const disc = q('[data-disc]');
        const preview = q('[data-close-preview]');
        const lines = qa('[data-close-line]');
        if (el && disc) {
          const at = isMobile ? '78% 70%' : '84% 62%';
          gsap.fromTo(
            disc,
            { clipPath: `circle(${isMobile ? 10 : 8}% at ${at})` },
            {
              clipPath: `circle(150% at ${at})`,
              ease: 'power2.inOut',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub },
            },
          );
        }
        if (el && lines.length) {
          gsap.fromTo(
            lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 1.1,
              stagger: 0.1,
              ease: E,
              scrollTrigger: { trigger: el, start: 'top 62%', once: true },
            },
          );
        }
        if (el && preview && !isMobile) {
          gsap.fromTo(
            preview,
            { y: 70 },
            {
              y: -30,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        }
      }
    }, root);

    // ---- refresh lifecycle ----
    const onRefreshInit = () => measurers.forEach((m) => m());
    const onRefresh = () => stages.forEach((s) => s.place(s.last));
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.addEventListener('refresh', onRefresh);
    let disposed = false;
    let touching = false;
    let refreshTimer: number | undefined;
    const refresh = () => {
      if (disposed) return;
      if (!isMobile) {
        ScrollTrigger.refresh(true);
        return;
      }
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (touching) {
          refresh();
          return;
        }
        refreshTimer = undefined;
        // Instance refresh measures at the current scroll position. Unlike a
        // global refresh it does not reset the document's native scroll offset.
        ScrollTrigger.update();
        onRefreshInit();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger && root.contains(trigger.trigger)) trigger.refresh();
        });
        ScrollTrigger.update();
        onRefresh();
      }, 200);
    };
    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
    };
    const onMobileScroll = () => {
      if (refreshTimer !== undefined) refresh();
    };
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    if (isMobile) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
      window.addEventListener('scroll', onMobileScroll, { passive: true });
      window.addEventListener('pageshow', refresh);
      document.addEventListener('visibilitychange', onVisible);
    }
    window.addEventListener(VH_FROZEN_CHANGE, refresh);
    window.addEventListener('gift:route-styles-ready', refresh);
    window.addEventListener('gift:layout', refresh);
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh, refresh);
    // first client-side nav: a late font-subset reflow can move every trigger
    // after the last refresh (project_aiops_pending_bugs) — one bounded catch-up
    const late = window.setTimeout(refresh, 1200);

    release();

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      if (isMobile) {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchEnd);
        window.removeEventListener('scroll', onMobileScroll);
        window.removeEventListener('pageshow', refresh);
        document.removeEventListener('visibilitychange', onVisible);
        // Other routes use GSAP's standard automatic refresh lifecycle.
        ScrollTrigger.config({
          autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
        });
      }
      window.clearTimeout(late);
      window.removeEventListener(VH_FROZEN_CHANGE, refresh);
      window.removeEventListener('gift:route-styles-ready', refresh);
      window.removeEventListener('gift:layout', refresh);
      window.removeEventListener('load', refresh);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
      // Proxy stages write styles directly, outside GSAP's style snapshots.
      // Restore their readable end states before a live reduced-motion rebuild.
      stages.forEach(({ place }) => place(1));
      q('.wd-included')?.removeAttribute('data-included-steps');
      qa('.wd-sec').forEach((section) => {
        section.style.removeProperty('--wd-in');
        section.style.removeProperty('--wd-out');
      });
      const hero = q('[data-time-travel]');
      hero?.removeAttribute('data-animated');
      hero?.style.removeProperty('--era-progress');
      hero?.querySelectorAll<HTMLElement>('[data-browser-era]').forEach((window) => {
        const modern = window.dataset.browserEra === 'modern';
        window.inert = !modern;
        window.setAttribute('aria-hidden', String(!modern));
        window.style.removeProperty('clip-path');
        window.style.removeProperty('visibility');
        window.style.removeProperty('opacity');
      });
      hero?.querySelector('[data-pixel-mask]')?.replaceChildren();
      hero?.querySelector('[data-pixel-tiles]')?.replaceChildren();
      if (hero) hero.dataset.era = 'modern';
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, [motionRevision]);

  return null;
}
