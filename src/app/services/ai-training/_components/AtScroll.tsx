'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
import { getFieldController } from './fieldBus';

gsap.registerPlugin(ScrollTrigger);

const E = 'expo.out';
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Scroll orchestrator for /services/ai-training. Rendered LAST inside <main>
 * so its effect runs after every section's; the flash guard is released in a
 * rAF at the very end (project_dx_navigation_flash_fix).
 *
 * One mechanism per section — different in KIND, not in parameters:
 *   hero      WebGL: the plasma (AtPlasma); the veil over it scrubs up as the hero leaves
 *   concerns  typewriter — characters typed by scroll position, caret follows
 *   reasons   focus band — viewport-fixed clip window over a defocused ghost
 *   flow      deck — sticky sheets cover each other, the covered one recedes
 *   courses   slot sentence — one word rolls, the matching panel slides in
 *   pricing   transfer — the regular figure recedes, the real burden grows
 *   faq       the reader's hand (AtFaq)
 *   cta       bookend — the veil lifts a little; copy rises in
 * Shared (allowed repeats): section label rule + h2 mask rise.
 */
export default function AtScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.at-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));

    if (reduced) {
      // ai-training.css's reduced-motion block paints every final state.
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

    const field = getFieldController();
    const q = <T extends HTMLElement>(sel: string, from: ParentNode = root) => from.querySelector<T>(sel);
    const qa = <T extends HTMLElement>(sel: string, from: ParentNode = root) =>
      Array.from(from.querySelectorAll<T>(sel));

    let introCap = 0;
    let cueTimer = 0;
    const onFirstScroll = () => {
      const cue = q('[data-hero-cue]');
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };

    const ctx = gsap.context(() => {
      // ═══ shared: section labels + h2 ═══════════════════════════════════
      qa('[data-at-label]').forEach((label) => {
        const rule = q('.at-label__rule', label);
        const text = q('.at-label__text', label);
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });
      qa('[data-at-h2] .at-h2__line').forEach((line) => {
        gsap.fromTo(
          line,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, ease: E, scrollTrigger: { trigger: line, start: 'top 90%', once: true } },
        );
      });

      // ═══ hero: load intro + the veil scrub over the plasma ═══════════════
      const scene = q('.at-scene');
      const stage = q('[data-hero-stage]');
      const ins = qa('[data-hero-in]');
      const cue = q('[data-hero-cue]');
      gsap.set(ins, { yPercent: 112 });
      if (cue) gsap.set(cue, { autoAlpha: 0 });
      const intro = gsap.timeline({ paused: true });
      intro.to(ins, { yPercent: 0, duration: 1.25, ease: E, stagger: 0.07 }, 0.25);
      if (cue) intro.to(cue, { autoAlpha: 1, duration: 0.4 }, 2.6);
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        intro.play();
      };
      window.addEventListener('gift:logo-ready', start, { once: true });
      introCap = window.setTimeout(start, 2400);
      window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

      if (scene && stage) {
        // the veil over the plasma rises as the hero leaves — below it, the
        // writing is the focus
        ScrollTrigger.create({
          trigger: scene,
          start: 'bottom 92%',
          end: 'bottom 28%',
          onUpdate: (self) => field?.setScroll(self.progress),
          onRefresh: (self) => field?.setScroll(self.progress),
        });
      }

      // ═══ concerns: the typewriter ═══════════════════════════════════════
      const type = q('.at-type');
      if (type) {
        const PAUSE = 14;
        const blocks = qa('.at-type__item, .at-type__lead', type);
        const chars: HTMLElement[] = [];
        const pos: number[] = [];
        let cursor = 0;
        blocks.forEach((block) => {
          qa('.at-type__c', block).forEach((c) => {
            chars.push(c);
            pos.push(cursor);
            cursor += 1;
          });
          cursor += PAUSE;
        });
        const total = cursor - PAUSE;
        let lastN = -1;
        let caret: HTMLElement | null = null;
        const apply = (n: number) => {
          if (n === lastN) return;
          // only the changed range flips
          for (let i = 0; i < chars.length; i++) {
            const on = pos[i] < n;
            const was = pos[i] < lastN;
            if (on !== was) chars[i].classList.toggle('is-on', on);
          }
          // caret: the next character to type (or the last one, at the end)
          let ci = chars.findIndex((_, i) => pos[i] >= n);
          const end = ci === -1;
          if (end) ci = chars.length - 1;
          const next = chars[ci];
          if (next !== caret) {
            if (caret) caret.classList.remove('is-caret', 'is-end');
            caret = next;
            caret.classList.add('is-caret');
          }
          caret.classList.toggle('is-end', end);
          lastN = n;
        };
        apply(0);
        ScrollTrigger.create({
          trigger: type,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const t = Math.min(1, Math.max(0, (self.progress - 0.03) / 0.87));
            apply(Math.floor(t * (total + 1)));
          },
        });
      }

      // ═══ reasons: the focus band ════════════════════════════════════════
      const focus = q('#reasons');
      const crisp = q('[data-focus-crisp]');
      if (focus && crisp) {
        const band = () => {
          const vh = window.innerHeight;
          const b0 = vh * 0.32;
          const b1 = vh * 0.68;
          const r = crisp.getBoundingClientRect();
          const top = Math.max(0, b0 - r.top);
          const bottom = Math.max(0, r.bottom - b1);
          crisp.style.clipPath = `inset(${top.toFixed(1)}px 0 ${bottom.toFixed(1)}px 0)`;
          focus.style.setProperty('--band-top', `${b0}px`);
          focus.style.setProperty('--band-bottom', `${b1}px`);
        };
        band();
        ScrollTrigger.create({
          trigger: focus,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: band,
          onRefresh: band,
          onToggle: (self) => {
            band();
            focus.toggleAttribute('data-focus-active', self.isActive);
          },
        });
      }

      // ═══ flow: the deck ═════════════════════════════════════════════════
      const sheets = qa('[data-sheet]');
      sheets.forEach((sheet, i) => {
        const next = sheets[i + 1];
        if (!next) return;
        gsap.to(sheet, {
          scale: 0.94,
          y: -14,
          '--shade': 0.34,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 96%', end: 'top 18%', scrub: true },
        });
      });

      // ═══ courses: the slot sentence ═════════════════════════════════════
      const courses = q('.at-courses');
      const roll = q('[data-slot-roll]');
      const panels = qa('[data-course]');
      if (courses && panels.length) {
        const n = panels.length;
        const place = (p: number) => {
          const x = p * (n - 1);
          const k = Math.min(n - 1, Math.floor(x));
          const f = x - k;
          const a = k >= n - 1 ? n - 1 : k + ss(0.34, 0.66, f);
          if (roll) roll.style.transform = `translateY(${(-a * 100) / n}%)`;
          panels.forEach((panel, i) => {
            const d = i - a;
            panel.style.transform = `translateX(${(d * 108).toFixed(2)}%)`;
            panel.style.visibility = Math.abs(d) >= 1 ? 'hidden' : 'visible';
          });
        };
        place(0);
        ScrollTrigger.create({
          trigger: courses,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(Math.min(1, Math.max(0, (self.progress - 0.08) / 0.84))),
        });
      }

      // ═══ pricing: the transfer ══════════════════════════════════════════
      const row = q('[data-price-row]');
      const figA = q('[data-price-fig-a]');
      const figB = q('[data-price-fig-b]');
      if (row && figA && figB) {
        const styles = getComputedStyle(root);
        const ink = styles.getPropertyValue('--at-ink').trim() || '#0B1020';
        const blue = styles.getPropertyValue('--at-blue').trim() || '#2563EB';
        const muted = 'rgba(11, 16, 32, 0.34)';
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 28%', scrub: 0.5 },
        });
        tl.fromTo(figA, { scale: 1, color: ink }, { scale: 0.5, color: muted, ease: 'none' }, 0);
        tl.fromTo(figB, { scale: 0.5, color: muted }, { scale: 1, color: blue, ease: 'none' }, 0);
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

    // FAQ rows change the document height when they open.
    const onFaq = () => ScrollTrigger.refresh();
    qa('.at-faq__a').forEach((a) => a.addEventListener('transitionend', onFaq));

    const onVh = () => ScrollTrigger.refresh();
    window.addEventListener(VH_FROZEN_CHANGE, onVh);
    const fontsRefresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(fontsRefresh, fontsRefresh);

    release();

    return () => {
      window.clearTimeout(introCap);
      window.clearTimeout(cueTimer);
      window.removeEventListener('scroll', onFirstScroll);
      window.removeEventListener(VH_FROZEN_CHANGE, onVh);
      qa('.at-faq__a').forEach((a) => a.removeEventListener('transitionend', onFaq));
      ctx.revert();
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
