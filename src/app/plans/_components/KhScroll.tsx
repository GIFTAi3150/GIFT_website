'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
import { getFieldController } from './fieldBus';

gsap.registerPlugin(ScrollTrigger);

const E = 'expo.out';
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Scroll orchestrator for /plans. Rendered LAST inside <main> so its effect
 * runs after every section's; the flash guard is released in a rAF at the
 * very end (project_dx_navigation_flash_fix).
 *
 * One mechanism per section — different in KIND, not in parameters:
 *   field     canvas: loose filaments of light → ruled lines (KhField), fed by the hero pin
 *   hero      the harnessing — the name yields to the coda once the lattice is in
 *   features  the index — a cabinet of drawers; the open one walks down the stack
 *   pricing   折半, the fold — the 299万円 sheet folds in half on a hinge
 *   glossary  the marker — a highlighter sweeps the definition
 *   support   the companion — the mark beside the reader lights the item it passes
 *   cta       the bookend — the veil lifts, a wave runs down the ruled rows, copy rises
 * Shared (allowed repeats): section label rule + h2 mask rise.
 */
export default function KhScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.kh-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));
    const field = getFieldController();

    if (reduced) {
      // plans.css's reduced-motion block paints every final state.
      field?.setOrder(1);
      release();
      return;
    }

    // ---- Lenis: desktop only (touch starves ScrollTrigger of events) ----
    let lenis: Lenis | null = null;
    let lenisRaf: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    const q = <T extends HTMLElement>(sel: string, from: ParentNode = root) => from.querySelector<T>(sel);
    const qa = <T extends HTMLElement>(sel: string, from: ParentNode = root) =>
      Array.from(from.querySelectorAll<T>(sel));

    let introCap = 0;
    let unlistenReady: (() => void) | null = null;
    const onFirstScroll = () => {
      const cue = q('[data-hero-cue]');
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };

    const ctx = gsap.context(() => {
      // ═══ shared: section labels + h2 ═══════════════════════════════════
      qa('[data-kh-label]').forEach((label) => {
        const rule = q('.kh-label__rule', label);
        const text = q('.kh-label__text', label);
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });
      qa('[data-kh-h2] .kh-h2__line').forEach((line) => {
        gsap.fromTo(
          line,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, ease: E, scrollTrigger: { trigger: line, start: 'top 90%', once: true } },
        );
      });

      // ═══ hero: load intro + the harnessing ══════════════════════════════
      const hero = q('#hero');
      const block = q('[data-hero-block]');
      const coda = q('[data-hero-coda]');
      const ins = qa('[data-hero-in]');
      const cue = q('[data-hero-cue]');
      gsap.set(ins, { yPercent: 112 });
      if (cue) gsap.set(cue, { autoAlpha: 0 });
      const intro = gsap.timeline({ paused: true });
      intro.to(ins, { yPercent: 0, duration: 1.25, ease: E, stagger: 0.07 }, 0.25);
      if (cue) intro.to(cue, { autoAlpha: 1, duration: 0.4 }, 2.4);
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        intro.play();
      };
      window.addEventListener('gift:logo-ready', start, { once: true });
      unlistenReady = () => window.removeEventListener('gift:logo-ready', start);
      introCap = window.setTimeout(start, 2400);
      window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

      let heroEnd = 0;
      if (hero) {
        const place = (p: number) => {
          field?.setOrder(ss(0.02, 0.6, p));
          const b = ss(0.56, 0.72, p);
          if (block) {
            block.style.opacity = (1 - b).toFixed(3);
            block.style.transform = `translate3d(0, ${(-48 * b).toFixed(1)}px, 0)`;
            block.style.pointerEvents = b > 0.5 ? 'none' : '';
          }
          const c = ss(0.66, 0.84, p);
          if (coda) {
            coda.style.opacity = c.toFixed(3);
            coda.style.transform = `translate3d(0, ${(56 * (1 - c)).toFixed(1)}px, 0)`;
          }
        };
        place(0);
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(self.progress),
          onRefresh: (self) => place(self.progress),
          onToggle: (self) => field?.setHeroActive(self.isActive),
        });
        // the veil: the lattice dims as the hero's bottom edge rises through the viewport
        ScrollTrigger.create({
          trigger: hero,
          start: 'bottom 96%',
          end: 'bottom 30%',
          onUpdate: (self) => field?.setVeil(self.progress),
          onRefresh: (self) => field?.setVeil(self.progress),
        });
        // parallax feed: how far the reader is past the hero
        const feed = (scroll: number) => field?.setScrollY(Math.max(0, scroll - heroEnd));
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onRefresh: (self) => {
            heroEnd = hero.offsetTop + hero.offsetHeight - window.innerHeight;
            feed(self.scroll());
          },
          onUpdate: (self) => feed(self.scroll()),
        });
      }

      // ═══ features: the index ════════════════════════════════════════════
      const index = q('#features');
      const drawers = qa('[data-drawer]');
      if (index && drawers.length) {
        const n = drawers.length;
        let lastK = -1;
        const place = (p: number) => {
          const x = p * (n - 1);
          const k = Math.min(n - 1, Math.floor(x));
          const f = x - k;
          // plateaus: each drawer holds fully open for a while before handing over
          const a = k >= n - 1 ? n - 1 : k + ss(0.3, 0.7, f);
          drawers.forEach((d, i) => {
            const o = 1 - Math.min(1, Math.abs(a - i));
            d.style.setProperty('--open', o.toFixed(3));
          });
          const kk = Math.round(a);
          if (kk !== lastK) {
            drawers.forEach((d, i) => d.toggleAttribute('data-open', i === kk));
            lastK = kk;
          }
        };
        place(0);
        ScrollTrigger.create({
          trigger: index,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(clamp01((self.progress - 0.06) / 0.88)),
          onRefresh: (self) => place(clamp01((self.progress - 0.06) / 0.88)),
        });
      }

      // ═══ pricing: 折半, the fold ════════════════════════════════════════
      const foldWrap = q('[data-fold-wrap]');
      const foldStick = q('[data-fold-stick]');
      const foldSpacer = q('[data-fold-spacer]');
      const fold = q('[data-fold]');
      if (foldWrap && foldStick && foldSpacer && fold) {
        const HALF = Math.PI / 2;
        const place = (p: number) => {
          const t = ss(0.06, 0.94, p);
          const th = t * Math.PI;
          const front = th < HALF ? Math.sin(th) * 0.5 : 0;
          const back = th > HALF ? (1 - (th - HALF) / HALF) * 0.5 : 0.5;
          const top = Math.sin(th) * 0.35;
          fold.style.setProperty('--fold', t.toFixed(4));
          fold.style.setProperty('--shade-front', front.toFixed(3));
          fold.style.setProperty('--shade-back', back.toFixed(3));
          fold.style.setProperty('--shade-top', top.toFixed(3));
        };
        place(0);
        ScrollTrigger.create({
          trigger: foldWrap,
          start: () => `top top+=${Math.round(parseFloat(getComputedStyle(foldStick).top) || 0)}`,
          end: () => `+=${foldSpacer.offsetHeight}`,
          onUpdate: (self) => place(self.progress),
          onRefresh: (self) => place(self.progress),
        });
      }

      // ═══ glossary: the marker ═══════════════════════════════════════════
      const marker = q('[data-marker]');
      if (marker) {
        const cs = qa('.kh-mark__c', marker);
        let lastN = -1;
        const apply = (n: number) => {
          if (n === lastN) return;
          for (let i = 0; i < cs.length; i++) {
            const on = i < n;
            const was = i < lastN;
            if (on !== was) cs[i].classList.toggle('is-on', on);
          }
          lastN = n;
        };
        apply(0);
        ScrollTrigger.create({
          trigger: marker,
          start: 'top 78%',
          end: 'bottom 42%',
          onUpdate: (self) => apply(Math.floor(self.progress * (cs.length + 1))),
          onRefresh: (self) => apply(Math.floor(self.progress * (cs.length + 1))),
        });
      }

      // ═══ support: the companion ═════════════════════════════════════════
      const list = q('[data-support-list]');
      const items = qa('[data-support-item]');
      if (list && items.length) {
        let lit = -1;
        const place = () => {
          const mid = window.innerHeight * 0.5;
          let best = 0;
          let bestD = Infinity;
          items.forEach((item, i) => {
            const r = item.getBoundingClientRect();
            const d = Math.abs((r.top + r.bottom) * 0.5 - mid);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          });
          if (best !== lit) {
            items.forEach((item, i) => item.classList.toggle('is-here', i === best));
            lit = best;
          }
        };
        place();
        ScrollTrigger.create({
          trigger: list,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: place,
          onRefresh: place,
        });
      }

      // ═══ cta: the bookend ═══════════════════════════════════════════════
      const cta = q('#cta');
      const rise = q('[data-cta-rise]');
      if (cta) {
        if (rise) {
          gsap.fromTo(
            rise,
            { y: 110 },
            { y: 0, ease: 'none', scrollTrigger: { trigger: cta, start: 'top bottom', end: 'top 25%', scrub: true } },
          );
        }
        ScrollTrigger.create({
          trigger: cta,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => field?.setCta(self.isActive),
        });
      }
    }, root);

    const onVh = () => ScrollTrigger.refresh();
    window.addEventListener(VH_FROZEN_CHANGE, onVh);
    const fontsRefresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(fontsRefresh, fontsRefresh);

    release();

    return () => {
      window.clearTimeout(introCap);
      window.removeEventListener('scroll', onFirstScroll);
      unlistenReady?.();
      window.removeEventListener(VH_FROZEN_CHANGE, onVh);
      ctx.revert();
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
