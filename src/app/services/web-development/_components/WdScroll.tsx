'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
import { INCLUDED } from './wdContent';

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
 *   hero       three-depth parallax exit (copy, preview, atmosphere)
 *   manifesto  the lock — the two words travel in from the edges and lock; 先 fills
 *   worries    the strike — a blue stroke crosses each worry out, the answer rises
 *   included   the build — a browser frame assembles beside the index, then narrows to a phone
 *   prepare    the handover — 文章 / 写真 / ロゴ slide across the divider from 御社 to GIFT
 *   pages      the spread — ten sheets fan out of a pile into the sitemap grid
 *   compare    the column — the GIFT column drops into the ledger
 *   approach   the join — two image halves travel together and meet
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

    // Layout-dependent measurements run on refreshInit (transforms cleared),
    // and every stage re-places itself after the refresh.
    const measurers: Array<() => void> = [];
    const stages: Array<{ place: (p: number) => void; last: number }> = [];
    const stage = (el: HTMLElement | null, place: (p: number) => void, s = scrub) => {
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
          end: 'bottom bottom',
          scrub: s,
          invalidateOnRefresh: true,
        },
        onUpdate: () => wrapped(proxy.p),
      });
    };

    const onFirstScroll = () => {
      const cue = q('.wd-scroll');
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };
    window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

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

      // ═══ hero: three-depth exit ═════════════════════════════════════════
      const hero = q('.wd-hero');
      if (hero) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub,
            invalidateOnRefresh: true,
          },
        });
        const copy = q('.wd-copy', hero);
        const preview = q('[data-wd-preview]', hero);
        const atmosphere = q('.wd-hero__atmosphere', hero);
        if (copy)
          tl.to(
            copy,
            { y: isMobile ? 40 : 140, opacity: 0, scale: 0.96, ease: 'power1.in', duration: 1 },
            0,
          );
        if (preview)
          tl.to(preview, { y: isMobile ? 30 : 90, scale: 0.97, ease: 'none', duration: 1 }, 0);
        if (atmosphere)
          tl.to(atmosphere, { yPercent: 24, opacity: 0.25, ease: 'none', duration: 1 }, 0);
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
          start: 'top bottom',
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
          if (gear) gear.style.transform = `rotate(${(p * 150).toFixed(2)}deg)`;
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
        let last = -1;
        stage(el, (p) => {
          // 0 blueprint · 1 design · 2 pages · 3 zero · 4 https · 5 news · 6 phone
          const step = Math.max(0, Math.min(6, Math.floor((p - 0.04) / 0.15) + 1));
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

      // ═══ approach: the join ═════════════════════════════════════════════
      {
        const el = q('.wd-approach');
        const box = q('[data-join]');
        const halves = qa('[data-join-half]');
        const imgs = qa('[data-join-img]');
        const size = { w: 0, h: 0 };
        const measure = () => {
          if (!box) return;
          const r = box.getBoundingClientRect();
          size.w = r.width;
          size.h = r.height;
        };
        measurers.push(measure);
        measure();
        stage(el, (p) => {
          const t = ss(0.04, 0.58, p);
          const gap = (isMobile ? 0.18 * size.h : 0.16 * size.w) * (1 - t);
          const lift = 0.05 * size.h * (1 - t);
          halves.forEach((half) => {
            const dir = Number(half.dataset.joinHalf) || 1;
            half.style.transform = isMobile
              ? `translate3d(0,${(dir * gap).toFixed(1)}px,0)`
              : `translate3d(${(dir * gap).toFixed(1)}px,${(-dir * lift).toFixed(1)}px,0)`;
          });
          const zoom = lerp(1.16, 1, ss(0, 1, p));
          imgs.forEach((img) => {
            img.style.transform = `scale(${zoom.toFixed(4)})`;
          });
          box?.classList.toggle('is-joined', t > 0.985);
        });
      }

      // ═══ plans: the separation ══════════════════════════════════════════
      {
        const grid = q('[data-plans]');
        const plans = qa('[data-plan]');
        if (grid && plans.length === 2) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: grid, start: 'top 92%', end: 'top 42%', scrub },
          });
          if (isMobile) {
            tl.fromTo(
              plans[1],
              { yPercent: -45, rotate: 1.5 },
              { yPercent: 0, rotate: 0, ease: 'power2.out', duration: 1 },
              0,
            );
          } else {
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
        const aria = q('[data-aria]');
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
        if (el && aria) {
          gsap.fromTo(
            aria,
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
    const refresh = () => ScrollTrigger.refresh();
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
      window.clearTimeout(late);
      window.removeEventListener('scroll', onFirstScroll);
      window.removeEventListener(VH_FROZEN_CHANGE, refresh);
      window.removeEventListener('gift:route-styles-ready', refresh);
      window.removeEventListener('gift:layout', refresh);
      window.removeEventListener('load', refresh);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      ctx.revert();
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
