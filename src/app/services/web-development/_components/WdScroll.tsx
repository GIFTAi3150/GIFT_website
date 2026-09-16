'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
import { INCLUDED } from './wdContent';
import { getFrozenViewportHeight, getStageAnimationDistance } from './heroScrollGeometry';

gsap.registerPlugin(ScrollTrigger);

const E = 'power2.out';
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** smoothstep between a and b */
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Each action reveals during the first 55% of its interval, then rests for reading.
const beat = (p: number, count: number, index: number) => clamp01(p * count - index);
const reveal = (p: number, count: number, index: number) => ss(0, 0.55, beat(p, count, index));

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
 *   compare    fixed columns; each highlighted row holds before the next advances
 *   approach   the craft — a wireframe becomes a finished website
 *   plans      the two cards settle gently within their own columns
 *   terms      the ledger — rows settle as their divider lines draw across
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
        // Let previews scroll natively only while their own content can move.
        // Unconditional data-lenis-prevent let wheel events scroll the document
        // natively while an older Lenis tween was still writing its position.
        allowNestedScroll: true,
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
          // Use the expanded animation budget, then keep the completed frame sticky.
          end: end ?? (() => `+=${getStageAnimationDistance(el)}`),
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
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.9, ease: E }, '+=0.2');
      });
      qa('[data-wd-h2]').forEach((heading) => {
        gsap.fromTo(
          qa('.wd-h2__line', heading),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: E,
            stagger: 1.45,
            // Measure the stationary mask so the hidden line's offset cannot delay entry.
            scrollTrigger: { trigger: heading, start: 'top 98%', once: true },
          },
        );
      });

      // ═══ hero: one browser travels from 1994 to today ═══════════════════
      const hero = q('[data-time-travel]');
      if (hero) {
        const viewport = q('[data-pixel-viewport]', hero);
        const retro = q('[data-browser-era="retro"]', hero);
        const modern = q('[data-browser-era="modern"]', hero);
        const cue = q('[data-hero-cue-text]', hero);
        const cueTitle = cue?.querySelector('strong');
        const cueDescription = cue?.querySelector('small');
        let cueModern: boolean | null = null;
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
          // Swap one text layer at the invisible midpoint of the handoff.
          // Its opacity and movement share the pixel progress, including reverse.
          hero.style.setProperty('--cue-progress', ss(0, 1, value).toFixed(4));
          const showModernCue = value >= 0.5;
          const cueOpacity = showModernCue ? ss(0.5, 0.88, value) : 1 - ss(0.12, 0.5, value);
          hero.style.setProperty('--cue-opacity', cueOpacity.toFixed(4));
          hero.style.setProperty(
            '--cue-offset',
            `${((showModernCue ? 1 : -1) * (1 - cueOpacity) * 5).toFixed(3)}px`,
          );
          if (cueModern !== showModernCue) {
            cueModern = showModernCue;
            if (cue) cue.dataset.cueEra = showModernCue ? 'modern' : 'retro';
            if (cueTitle)
              cueTitle.textContent = showModernCue ? '続けてスクロール' : '下にスクロール';
            if (cueDescription)
              cueDescription.textContent = showModernCue
                ? 'サービスの詳細をご紹介'
                : 'スクロールで新しいサイトへ';
          }
          hero.toggleAttribute('data-hero-cue-idle', value <= 0);
          const era = value >= 0.999 ? 'modern' : 'retro';
          if (hero.dataset.era !== era) hero.dataset.era = era;
          if (modern) modern.style.clipPath = value >= 1 ? 'none' : clipUrl;
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
          // Keep the same pixel effect with a much smaller grid on phones.
          const size = Math.max(
            isMobile ? 48 : 24,
            Math.ceil(width / (isMobile ? 8 : 32)),
            Math.ceil(Math.sqrt((width * height) / (isMobile ? 80 : 700))),
          );
          const round = isMobile ? Math.floor : Math.ceil;
          const columns = Math.max(1, round(width / size));
          const rows = Math.max(1, round(height / size));
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
                threshold: 0.02 + rank * 0.6,
                duration: 0.32 + noise * 0.04,
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
        measurers.push(buildPixels);
        buildPixels();
        const observer = new ResizeObserver(buildPixels);
        if (viewport) observer.observe(viewport);
        cleanups.push(() => observer.disconnect());
        {
          let start = 0;
          let distance = 1;
          let frame = 0;
          const render = () => {
            frame = 0;
            paint(clamp01(((window.scrollY - start) / distance - 0.08) / 0.78));
          };
          const measure = () => {
            cancelAnimationFrame(frame);
            start = window.scrollY + hero.getBoundingClientRect().top;
            distance = getStageAnimationDistance(hero);
            render();
          };
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(render);
          };
          // Read the document position on both layouts. Lenis already eases
          // desktop scrolling; a second scrub tween reset the completed hero
          // to zero when ScrollTrigger refreshed below this section.
          measurers.push(measure);
          measure();
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(frame);
          });
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
          const t = ss(0, 0.3, p);
          locks.forEach((lock) => {
            const dir = Number(lock.dataset.lock) || 1;
            lock.style.transform = `translate3d(${(dir * (1 - t) * amp).toFixed(1)}px,0,0)`;
          });
          title?.classList.toggle('is-locked', p >= 0.3);
          if (rule) rule.style.transform = `scaleX(${ss(0.4, 0.48, p).toFixed(4)})`;
          leads.forEach((line, i) => {
            const y = (1 - reveal(clamp01((p - 0.55) / 0.45), leads.length, i)) * 110;
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
            const s = reveal(p, items.length + 1, i);
            li.style.setProperty('--s', s.toFixed(4));
            li.classList.toggle('is-struck', s > 0.55);
          });
          if (answer) {
            const y = (1 - reveal(p, items.length + 1, items.length)) * 110;
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
        const pageTiles = qa('.wd-build__pages li');
        if (isMobile) el?.setAttribute('data-included-steps', '');
        el?.setAttribute('data-build-scrub', '');
        let last = -1;
        let textTransition: gsap.core.Timeline | null = null;
        const showText = (index: number, initial: boolean) => {
          if (!isMobile || initial) {
            rows.forEach((row, i) => row.classList.toggle('is-on', i === index));
            return;
          }
          // Finish the text handoff even if the reader stops mid-swipe. A new
          // direction replaces the pending handoff instead of queuing old steps.
          textTransition?.kill();
          const outgoing = rows.find((row) => row.classList.contains('is-on'));
          const incoming = rows[index];
          const direction = outgoing && index < rows.indexOf(outgoing) ? -1 : 1;
          textTransition = gsap.timeline();
          if (outgoing !== incoming) {
            if (outgoing)
              textTransition.to(outgoing, {
                opacity: 0,
                y: -6 * direction,
                duration: 0.18,
                ease: 'power1.in',
              });
            textTransition.add(() => {
              rows.forEach((row, i) => row.classList.toggle('is-on', i === index));
              gsap.set(incoming, { opacity: 0, y: 8 * direction });
            });
          }
          textTransition.to(incoming, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' });
        };
        stage(el, (p) => {
          if (!el?.hasAttribute('data-build-scrub')) {
            build?.style.setProperty('--step', '6');
            if (build) build.dataset.step = '6';
            rows.forEach((row) => row.classList.add('is-on'));
            return;
          }
          // Every feature gets its own gradual reveal and a completed reading interval.
          const index = Math.min(rows.length - 1, Math.floor(p * rows.length));
          const step = index + 1;
          const enter = reveal(p, rows.length, index);
          build?.style.setProperty('--step', (index + enter).toFixed(4));
          build?.style.setProperty('--step-enter', enter.toFixed(4));
          const pages = beat(p, rows.length, 1);
          pageTiles.forEach((tile, i) => {
            tile.style.setProperty(
              '--page-enter',
              ss(i * 0.025, 0.3 + i * 0.025, pages).toFixed(4),
            );
          });
          if (step !== last) {
            showText(index, last === -1);
            last = step;
            if (build) {
              build.dataset.step = String(step);
            }
            if (caption) caption.textContent = step ? INCLUDED.items[step - 1].label : 'BLUEPRINT';
          }
          rows.forEach((row, i) => {
            const active = i === index;
            const body = q('.wd-inc__body', row);
            if (body && !isMobile) body.style.gridTemplateRows = `${active ? enter : 0}fr`;
          });
          if (frame && !isMobile) {
            const tilt = -(1 - reveal(p, rows.length, 0)) * 9;
            frame.style.transform = `perspective(1600px) rotateY(${tilt.toFixed(2)}deg)`;
          }
        });
        cleanups.push(() => {
          textTransition?.kill();
          el?.removeAttribute('data-build-scrub');
          build?.style.removeProperty('--step-enter');
          pageTiles.forEach((tile) => tile.style.removeProperty('--page-enter'));
          rows.forEach((row) => {
            row.style.removeProperty('opacity');
            row.style.removeProperty('transform');
            q('.wd-inc__body', row)?.style.removeProperty('grid-template-rows');
          });
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
            const phase = beat(p, hands.length + 1, i);
            const t = ss(0, 0.35, phase);
            const noun = q('[data-hand-noun]', li);
            const note = q('[data-hand-note]', li);
            if (noun)
              noun.style.transform = `translate3d(${((dists[i] || 0) * t).toFixed(1)}px,0,0)`;
            li.classList.toggle('is-over', t > 0.5);
            if (note) {
              const n = ss(0.35, 0.65, phase);
              note.style.transform = `translate3d(0,${((1 - n) * 105).toFixed(2)}%,0)`;
            }
          });
          if (left) {
            const l = reveal(p, hands.length + 1, hands.length);
            left.style.transform = `translate3d(0,${((1 - l) * 105).toFixed(2)}%,0)`;
          }
        });
      }

      // ═══ pages: the spread ══════════════════════════════════════════════
      {
        const el = q('.wd-pages');
        const grid = q('[data-spread]');
        if (el && grid) {
          let sheets: HTMLElement[] = [];
          const offs: Array<[number, number]> = [];
          let start = 0;
          let distance = 1;
          let frame = 0;
          let disposed = false;
          const place = (p: number) => {
            if (disposed) return;
            sheets.forEach((s, i) => {
              const t = reveal(p, sheets.length, i);
              const [dx, dy] = offs[i] || [0, 0];
              // Keep the small deck offsets inside slot 10, even on narrow phones.
              const x = (dx + ((i % 3) - 1) * 0.6) * (1 - t);
              const y = (dy + i * 0.35) * (1 - t);
              s.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${lerp(0.92, 1, t).toFixed(4)})`;
              s.style.zIndex = String(t < 0.999 ? 20 - i : 30);
            });
          };
          const render = () => {
            frame = 0;
            place(clamp01((window.scrollY - start) / distance));
          };
          const measure = () => {
            cancelAnimationFrame(frame);
            // React can replace cards after a content edit; always bind the current nodes.
            sheets = qa('[data-sheet]', grid);
            const origin = sheets.at(-1);
            if (!origin) return;
            // Layout offsets ignore animation transforms, so refresh never scatters the deck.
            const cx = origin.offsetLeft + origin.offsetWidth / 2;
            const cy = origin.offsetTop + origin.offsetHeight / 2;
            sheets.forEach((sheet, i) => {
              offs[i] = [
                cx - (sheet.offsetLeft + sheet.offsetWidth / 2),
                cy - (sheet.offsetTop + sheet.offsetHeight / 2),
              ];
            });
            start = 0;
            for (
              let node: HTMLElement | null = el;
              node;
              node = node.offsetParent as HTMLElement | null
            )
              start += node.offsetTop;
            distance = getStageAnimationDistance(el);
            render();
          };
          measurers.push(measure);
          measure();
          // Lenis already eases desktop scroll. Reading the document also avoids
          // a scrub proxy resetting to zero when a completed stage is refreshed.
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(render);
          };
          window.addEventListener('scroll', onScroll, { passive: true });
          const contentObserver = new MutationObserver(measure);
          contentObserver.observe(grid, { childList: true });
          const sizeObserver = new ResizeObserver(measure);
          sizeObserver.observe(grid);
          cleanups.push(() => {
            disposed = true;
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            contentObserver.disconnect();
            sizeObserver.disconnect();
            qa('[data-sheet]', grid).forEach((sheet) => {
              sheet.style.removeProperty('transform');
              sheet.style.removeProperty('z-index');
            });
          });
        }
      }

      // ═══ compare: a native-scroll reading beat for each highlighted row ═
      {
        const journey = q('[data-compare-journey]');
        const table = q('.wd-matrix');
        const tableHead = table?.querySelector('thead');
        const body = table?.querySelector('tbody');
        const rows = qa('[data-compare-row]');
        if (journey && table && tableHead && body && rows.length) {
          let start = 0;
          let distance = 1;
          let paced = false;
          let frame = 0;
          let current = -1;
          let offsets: number[] = [];
          const highlight = (index: number) => {
            if (index === current) return;
            current = index;
            rows.forEach((row, i) => row.toggleAttribute('data-current', i === index));
          };
          const render = () => {
            frame = 0;
            if (!paced) {
              const line = Math.max(
                getFrozenViewportHeight() * 0.46,
                80 + tableHead.offsetHeight + 24,
              );
              highlight(
                rows.findIndex((row) => {
                  const bounds = row.getBoundingClientRect();
                  return bounds.top <= line && bounds.bottom > line;
                }),
              );
              rows.forEach((row) => {
                row.style.setProperty('--row-enter', '1');
                row.style.setProperty('--row-rule', '1');
              });
              return;
            }
            const progress = clamp01((window.scrollY - start) / distance);
            const step = progress * rows.length;
            const index = Math.min(rows.length - 1, Math.floor(step));
            const next = Math.min(rows.length - 1, index + 1);
            // Hold for the first 65% of each beat, then move to the next row.
            const move = ss(0.65, 1, step - index);
            journey.style.setProperty(
              '--compare-shift',
              `${-lerp(offsets[index], offsets[next], move)}px`,
            );
            highlight(index);
            rows.forEach((row, i) => {
              const reveal = i <= index ? 1 : i === next ? move : 0;
              row.style.setProperty('--row-enter', reveal.toFixed(4));
              row.style.setProperty('--row-rule', reveal.toFixed(4));
            });
          };
          const measure = () => {
            cancelAnimationFrame(frame);
            const viewport = getFrozenViewportHeight();
            const headingHeight = tableHead.offsetHeight;
            const bounds = rows.map((row) => row.getBoundingClientRect());
            const bodyTop = body.getBoundingClientRect().top;
            const bodyHeight = body.offsetHeight;
            const available = viewport - 80 - 24;
            // Short/zoomed windows keep natural flow if a whole row cannot fit.
            paced = available - headingHeight >= Math.max(...bounds.map((r) => r.height)) + 8;
            journey.toggleAttribute('data-compare-paced', paced);
            if (paced) {
              const height = Math.min(headingHeight + bodyHeight + 1, available);
              const bodyWindow = height - headingHeight - 1;
              const maxShift = Math.max(0, bodyHeight - bodyWindow);
              offsets = bounds.map((r) =>
                Math.max(0, Math.min(maxShift, r.top - bodyTop + r.height / 2 - bodyWindow / 2)),
              );
              // Each comparison gets almost a full viewport of scroll to read.
              distance = viewport * rows.length * 0.85;
              journey.style.setProperty('--compare-frame', `${height}px`);
              journey.style.setProperty('--compare-travel', `${distance}px`);
            } else {
              journey.style.removeProperty('--compare-frame');
              journey.style.removeProperty('--compare-travel');
              journey.style.removeProperty('--compare-shift');
            }
            start = window.scrollY + journey.getBoundingClientRect().top - 80;
            render();
          };
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(render);
          };
          measurers.push(measure);
          measure();
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            journey.removeAttribute('data-compare-paced');
            ['--compare-frame', '--compare-travel', '--compare-shift'].forEach((name) =>
              journey.style.removeProperty(name),
            );
            rows.forEach((row) => {
              row.removeAttribute('data-current');
              row.style.removeProperty('--row-enter');
              row.style.removeProperty('--row-rule');
            });
          });
        }
      }

      // ═══ approach: wireframe to finished website ═══════════════════════
      {
        const el = q('.wd-approach');
        const visual = q('[data-craft]');
        if (isMobile && el && visual) {
          const previews = qa('[data-craft-step]', visual);
          const copy = q('.wd-approach__copy', el);
          let paced = false;
          let start = 0;
          let shift = 0;
          let starts: number[] = [];
          let distance = 1;
          let frame = 0;
          const layoutTop = (element: HTMLElement) => {
            let top = 0;
            for (
              let node: HTMLElement | null = element;
              node;
              node = node.offsetParent as HTMLElement | null
            )
              top += node.offsetTop;
            return top;
          };
          const render = () => {
            frame = 0;
            const progress = clamp01((window.scrollY - start) / distance);
            if (paced)
              el.style.setProperty('--craft-shift', `${-shift * ss(0.4, 0.58, progress)}px`);
            previews.forEach((preview, index) => {
              // Build, hold the draft, travel to the result, build, then hold again.
              const p = paced
                ? index === 0
                  ? clamp01(progress / 0.3)
                  : clamp01((progress - 0.58) / 0.28)
                : clamp01((window.scrollY - starts[index]) / distance);
              preview.style.setProperty('--craft-shell', ss(0, 0.3, p).toFixed(4));
              preview.style.setProperty('--craft-nav', ss(0.12, 0.42, p).toFixed(4));
              preview.style.setProperty('--craft-copy', ss(0.24, 0.68, p).toFixed(4));
              preview.style.setProperty('--craft-image', ss(0.3, 0.78, p).toFixed(4));
              preview.style.setProperty('--craft-detail', ss(0.5, 0.85, p).toFixed(4));
              if (index === 0)
                visual.style.setProperty('--craft-handoff', ss(0.65, 0.95, p).toFixed(4));
            });
          };
          const measure = () => {
            cancelAnimationFrame(frame);
            const viewport = getFrozenViewportHeight();
            const previewHeight = Math.max(...previews.map((preview) => preview.offsetHeight));
            const frameHeight = (copy?.offsetHeight ?? 0) + 20 + previewHeight;
            // Keep natural flow for short/zoomed screens where a complete preview won't fit.
            paced = previews.length === 2 && frameHeight <= viewport - 80 - 24;
            el.toggleAttribute('data-craft-paced', paced);
            if (paced) {
              distance = viewport * 4;
              shift =
                previews[1].getBoundingClientRect().top - previews[0].getBoundingClientRect().top;
              el.style.setProperty('--craft-frame', `${frameHeight}px`);
              el.style.setProperty('--craft-window', `${previewHeight}px`);
              el.style.setProperty('--craft-travel', `${distance}px`);
              start = layoutTop(el);
            } else {
              ['--craft-frame', '--craft-window', '--craft-travel', '--craft-shift'].forEach(
                (name) => el.style.removeProperty(name),
              );
              starts = previews.map((preview) => layoutTop(preview) - viewport * 0.92);
              distance = Math.max(1, viewport * 0.92 - Math.max(96, viewport * 0.22));
            }
            render();
          };
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(render);
          };
          measurers.push(measure);
          measure();
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            el.removeAttribute('data-craft-paced');
            ['--craft-frame', '--craft-window', '--craft-travel', '--craft-shift'].forEach((name) =>
              el.style.removeProperty(name),
            );
            visual.style.removeProperty('--craft-handoff');
            previews.forEach((preview) => {
              ['shell', 'nav', 'copy', 'image', 'detail'].forEach((part) =>
                preview.style.removeProperty(`--craft-${part}`),
              );
            });
          });
        } else {
          stage(el, (p) => {
            visual?.style.setProperty('--craft-progress', ss(0.04, 0.65, p).toFixed(4));
            visual?.style.setProperty('--craft-color', ss(0.04, 0.35, p).toFixed(4));
            visual?.style.setProperty('--craft-position', ss(0.48, 0.85, p).toFixed(4));
          });
        }
        cleanups.push(() => {
          ['--craft-progress', '--craft-color', '--craft-position'].forEach((name) =>
            visual?.style.removeProperty(name),
          );
        });
      }

      // ═══ plans: settle in place ════════════════════════════════════════
      {
        // Keep both offers readable throughout entry, including when scrolling back.
        const plans = qa('[data-plan]');
        plans.forEach((plan) =>
          gsap.fromTo(
            plan,
            { y: 24 },
            {
              y: 0,
              duration: 1.5,
              ease: E,
              scrollTrigger: { trigger: plan, start: 'top 94%', once: true },
            },
          ),
        );
      }

      // ═══ terms: the ledger ══════════════════════════════════════════════
      {
        const terms = q('.wd-terms');
        if (terms && isMobile) {
          const heading = q('.wd-terms__head', terms);
          const ledger = q('.wd-terms__grid', terms);
          const entries = qa('.wd-terms__list h3, .wd-terms__list li, .wd-terms__handover', terms);
          let start = 0;
          let distance = 1;
          let paced = false;
          let frame = 0;
          let offsets: number[] = [];
          let starts: number[] = [];
          const layoutTop = (element: HTMLElement) => {
            let top = 0;
            for (
              let node: HTMLElement | null = element;
              node;
              node = node.offsetParent as HTMLElement | null
            )
              top += node.offsetTop;
            return top;
          };
          const render = () => {
            frame = 0;
            if (!paced) {
              entries.forEach((entry, index) => {
                entry.style.setProperty(
                  '--term-enter',
                  ss(0, 1, (window.scrollY - starts[index]) / distance).toFixed(4),
                );
                entry.removeAttribute('data-term-current');
              });
              return;
            }
            const progress = clamp01((window.scrollY - start) / distance);
            const step = progress * entries.length;
            const index = Math.min(entries.length - 1, Math.floor(step));
            const next = Math.min(entries.length - 1, index + 1);
            // Reveal the current entry with physical movement, then hold it for reading.
            const move = ss(0.65, 1, step - index);
            terms.style.setProperty(
              '--terms-shift',
              `${-lerp(offsets[index], offsets[next], move)}px`,
            );
            terms.style.setProperty('--terms-progress', progress.toFixed(4));
            entries.forEach((entry, i) => {
              entry.style.setProperty('--term-enter', ss(0, 0.48, step - i).toFixed(4));
              entry.toggleAttribute('data-term-current', i === index);
            });
          };
          const measure = () => {
            cancelAnimationFrame(frame);
            const viewport = getFrozenViewportHeight();
            // Measure with the progress rule present; it occupies space below the lead.
            terms.setAttribute('data-terms-paced', '');
            const available = viewport - 80 - 24 - (heading?.offsetHeight ?? 0) - 24;
            const tallest = Math.max(...entries.map((entry) => entry.offsetHeight));
            paced = !!ledger && available >= tallest + 16;
            terms.toggleAttribute('data-terms-paced', paced);
            if (paced && ledger) {
              const height = Math.min(ledger.offsetHeight, available);
              const maxShift = Math.max(0, ledger.offsetHeight - height);
              const ledgerTop = layoutTop(ledger);
              offsets = entries.map((entry) =>
                Math.max(
                  0,
                  Math.min(
                    maxShift,
                    layoutTop(entry) - ledgerTop + entry.offsetHeight / 2 - height / 2,
                  ),
                ),
              );
              distance = viewport * entries.length * 0.3;
              terms.style.setProperty('--terms-window', `${height}px`);
              // Reserve a final reading pause and keep the next sheet below the viewport.
              terms.style.setProperty('--terms-travel', `${distance + viewport * 0.8}px`);
              start = layoutTop(terms);
            } else {
              ['--terms-window', '--terms-travel', '--terms-shift', '--terms-progress'].forEach(
                (name) => terms.style.removeProperty(name),
              );
              starts = entries.map((entry) => layoutTop(entry) - viewport * 0.92);
              distance = viewport * 0.44;
            }
            render();
          };
          terms.setAttribute('data-terms-motion', '');
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(render);
          };
          measurers.push(measure);
          measure();
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            terms.removeAttribute('data-terms-paced');
            terms.removeAttribute('data-terms-motion');
            ['--terms-window', '--terms-travel', '--terms-shift', '--terms-progress'].forEach(
              (name) => terms.style.removeProperty(name),
            );
            entries.forEach((entry) => {
              entry.style.removeProperty('--term-enter');
              entry.removeAttribute('data-term-current');
            });
          });
        } else if (terms) {
          // Desktop rows follow their own viewport position.
          // Finish near the bottom of the viewport so the fine print is ready to read.
          qa('.wd-terms__list li', terms).forEach((row) => {
            gsap.fromTo(
              row,
              { opacity: 0.35, x: 14, '--term-rule': 0 },
              {
                opacity: 1,
                x: 0,
                '--term-rule': 1,
                ease: 'power1.out',
                scrollTrigger: {
                  trigger: row,
                  start: 'top 94%',
                  end: 'top 74%',
                  scrub,
                },
              },
            );
          });
          qa('.wd-terms__list h3, .wd-terms__handover', terms).forEach((entry) => {
            gsap.fromTo(
              entry,
              { opacity: 0.4, y: 18 },
              {
                opacity: 1,
                y: 0,
                ease: E,
                scrollTrigger: {
                  trigger: entry,
                  start: 'top 94%',
                  end: 'top 74%',
                  scrub,
                },
              },
            );
          });
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
          let nodeYs: number[] = [];
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
            nodeYs = pts.map((point) => point[1]);
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
          const draw = (len: number) => {
            path.style.strokeDashoffset = `${total - len}`;
            const pt = path.getPointAtLength(len);
            dot.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0) translate(-50%,-50%)`;
            steps.forEach((s, i) => s.classList.toggle('is-on', len >= (nodeLens[i] ?? 0) - 1));
          };
          const place = (p: number) => {
            // Stop on each process step before following the path to the next one.
            const cursor = clamp01(p) * (nodes.length - 1);
            const index = Math.min(nodes.length - 2, Math.floor(cursor));
            const len = lerp(nodeLens[index], nodeLens[index + 1], ss(0.3, 1, cursor - index));
            draw(len);
          };
          if (isMobile) {
            let routeTop = 0;
            let viewport = 1;
            let starts: number[] = [];
            let frame = 0;
            const bodies = qa('.wd-step__body', route);
            const layoutTop = (element: HTMLElement) => {
              let top = 0;
              for (
                let node: HTMLElement | null = element;
                node;
                node = node.offsetParent as HTMLElement | null
              )
                top += node.offsetTop;
              return top;
            };
            const render = () => {
              frame = 0;
              // Follow the nodes' actual heights; the last step completes in the viewport.
              const cursor = window.scrollY + viewport * 0.6 - routeTop;
              let index = 0;
              while (index < nodeYs.length - 2 && cursor >= nodeYs[index + 1]) index += 1;
              const progress = ss(
                0,
                1,
                (cursor - nodeYs[index]) / Math.max(1, nodeYs[index + 1] - nodeYs[index]),
              );
              draw(lerp(nodeLens[index], nodeLens[index + 1], progress));
              bodies.forEach((body, i) => {
                const enter = ss(0, 1, (window.scrollY - starts[i]) / (viewport * 0.24));
                body.style.setProperty('--flow-enter', enter.toFixed(4));
              });
            };
            const measure = () => {
              cancelAnimationFrame(frame);
              viewport = getFrozenViewportHeight();
              routeTop = layoutTop(route);
              starts = steps.map((step) => layoutTop(step) - viewport * 0.88);
              render();
            };
            const onScroll = () => {
              if (!frame) frame = requestAnimationFrame(render);
            };
            route.setAttribute('data-route-motion', '');
            measurers.push(measure);
            measure();
            window.addEventListener('scroll', onScroll, { passive: true });
            cleanups.push(() => {
              cancelAnimationFrame(frame);
              window.removeEventListener('scroll', onScroll);
              route.removeAttribute('data-route-motion');
              bodies.forEach((body) => body.style.removeProperty('--flow-enter'));
              place(1);
            });
          } else {
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
                start: 'top 78%',
                end: 'bottom 62%',
                scrub,
                invalidateOnRefresh: true,
              },
              onUpdate: () => wrapped(proxy.p),
            });
          }
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
              duration: 1.8,
              ease: 'power2.inOut',
              scrollTrigger: { trigger: el, start: 'top 95%', once: true },
            },
          );
        }
        if (el && lines.length) {
          lines.forEach((line) =>
            gsap.fromTo(
              line,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 1.2,
                ease: E,
                // Each line starts on entry, without waiting for lines above it.
                scrollTrigger: { trigger: line.parentElement, start: 'top 98%', once: true },
              },
            ),
          );
        }
        if (el && preview) {
          gsap.fromTo(
            preview,
            { y: 24 },
            {
              y: 0,
              duration: 1.5,
              ease: E,
              scrollTrigger: { trigger: preview, start: 'top 98%', once: true },
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
      ctx.revert();
      // GSAP may restore an interrupted fade's inline styles. Clear those
      // snapshots afterward so reduced-motion rebuilds show every description.
      cleanups.forEach((cleanup) => cleanup());
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
      hero?.style.removeProperty('--cue-progress');
      hero?.style.removeProperty('--cue-opacity');
      hero?.style.removeProperty('--cue-offset');
      hero?.removeAttribute('data-hero-cue-idle');
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
