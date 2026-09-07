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
/** smoothstep between a and b */
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Scroll orchestrator for /services/aiops ("Groundwork"). Rendered LAST inside
 * <main> so its effect runs after every section's; the flash guard is
 * released in a rAF at the very end (project_dx_navigation_flash_fix).
 *
 * One mechanism per section — different in KIND, not in parameters:
 *   scene     the surface — the title recedes into the paint, the liquid's own
 *             uniforms are scrubbed (AoField), four stanzas dolly up out of the depth
 *   caps      the dial — a wheel of titles turns; the one at the pointer is live
 *   pains     the pile — questions fall and stack with weight, then are lifted away
 *   steps     the flip board — a split-flap hinges through the six steps
 *   agents    the fill — hollow industry words fill bottom-to-top with the liquid
 *   thinking  the drift — two giant lines travel sideways with the scroll, crossing into alignment
 *   cta       the bookend — the veil lifts, the liquid moves again, copy rises
 * Shared (allowed repeats): section label rule + h2 mask rise.
 *
 * Scroll budgets (the pinned stages' heights) live in aiops.css as
 * `--ao-*-budget` multiples of --vh-frozen; the phase windows are here.
 */
export default function AoScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.ao-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));
    const field = getFieldController();

    if (reduced) {
      // aiops.css's [data-ao-static] block paints every final state.
      root.setAttribute('data-ao-static', '');
      field?.setScene(1);
      field?.setVeil(1);
      release();
      return () => root.removeAttribute('data-ao-static');
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
    const scrub = isMobile ? 0.15 : 0.5;

    let introCap = 0;
    const onFirstScroll = () => {
      const cue = q('[data-hero-cue]');
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };

    const ctx = gsap.context(() => {
      // ═══ shared: section labels + h2 ═══════════════════════════════════
      qa('[data-ao-label]').forEach((label) => {
        const rule = q('.ao-label__rule', label);
        const text = q('.ao-label__text', label);
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });
      qa('[data-ao-h2] .ao-h2__line').forEach((line, i) => {
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
      qa('.ao-conditions__rule').forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power2.inOut', scrollTrigger: { trigger: rule, start: 'top 88%', once: true } },
        );
      });

      // ═══ scene: the surface ═════════════════════════════════════════════
      const scene = q('.ao-scene');
      const hero = q('[data-hero]');
      const ins = qa('[data-hero-in]');
      const cue = q('[data-hero-cue]');
      const stanzas = qa('[data-stanza]');

      // load intro — masked rises once the plate has painted
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
      introCap = window.setTimeout(start, 2400);
      window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

      if (scene && hero) {
        const blur = (px: number) => (isMobile ? 'blur(0px)' : `blur(${px}px)`);
        gsap.set(stanzas, { autoAlpha: 0 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub },
        });
        // the title recedes into the paint
        tl.fromTo(
          hero,
          { scale: 1, y: 0, autoAlpha: 1, filter: blur(0) },
          { scale: 0.86, y: -40, autoAlpha: 0, filter: blur(10), ease: 'power2.in', duration: 0.2 },
          0,
        );
        const scrim = q('[data-scene-scrim]');
        if (scrim) tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 0.16 }, 0.08);
        // the statement — each stanza dollies up out of the depth
        const T0 = 0.16;
        const SPAN = (0.96 - T0) / stanzas.length;
        const IN = SPAN * 0.36;
        const OUT = SPAN * 0.34;
        stanzas.forEach((st, i) => {
          const t0 = T0 + SPAN * i;
          tl.fromTo(
            st,
            { scale: 0.78, y: 46, autoAlpha: 0, filter: blur(6) },
            { scale: 1, y: 0, autoAlpha: 1, filter: blur(0), ease: 'power2.out', duration: IN },
            t0,
          );
          if (i < stanzas.length - 1) {
            tl.to(
              st,
              { scale: 1.24, y: -36, autoAlpha: 0, filter: blur(8), ease: 'power2.in', duration: OUT },
              t0 + SPAN - OUT,
            );
          }
        });
        tl.to({}, { duration: 0.001 }, 1);

        // the plate: calms as the scene is read; the veil rises as it leaves
        ScrollTrigger.create({
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => field?.setScene(self.progress),
          onRefresh: (self) => field?.setScene(self.progress),
        });
        ScrollTrigger.create({
          trigger: scene,
          start: 'bottom 96%',
          end: 'bottom 30%',
          onUpdate: (self) => field?.setVeil(self.progress),
          onRefresh: (self) => field?.setVeil(self.progress),
        });
      }

      // ═══ caps: the dial ═════════════════════════════════════════════════
      const capsStage = q('[data-caps-stage]');
      const dial = q('[data-dial]');
      const spokes = qa('[data-dial-spoke]');
      const caps = qa('[data-cap]');
      if (capsStage && dial && spokes.length) {
        const n = spokes.length;
        // 40° between spokes (aiops.css --dial-step): five titles ride the
        // visible arc; anything past ±80° has faded out, so no title is ever
        // clipped at the edge or poking in from behind the hub.
        const DIAL_STEP = 40;
        let active = -1;
        const place = (p: number) => {
          const x = p * (n - 1);
          const k = Math.min(n - 1, Math.floor(x));
          const f = x - k;
          const a = k >= n - 1 ? n - 1 : k + ss(0.3, 0.7, f);
          dial.style.setProperty('--dial-a', `${(-a * DIAL_STEP).toFixed(3)}deg`);
          spokes.forEach((s, i) => {
            const off = Math.abs(i - a) * DIAL_STEP;
            s.style.opacity = clamp01(1 - (off - 22) / 56).toFixed(3);
          });
          const on = Math.round(a);
          if (on !== active) {
            active = on;
            spokes.forEach((s, i) => s.classList.toggle('is-on', i === on));
            caps.forEach((c, i) => c.classList.toggle('is-on', i === on));
          }
        };
        place(0);
        ScrollTrigger.create({
          trigger: capsStage,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(clamp01((self.progress - 0.05) / 0.88)),
          onRefresh: (self) => place(clamp01((self.progress - 0.05) / 0.88)),
        });
      }

      // ═══ pains: the pile ════════════════════════════════════════════════
      const painsStage = q('[data-pains-stage]');
      const slabs = qa('[data-slab]');
      const answer = q('[data-pains-answer]');
      if (painsStage && slabs.length) {
        const vh = () => window.innerHeight;
        // Slower than the other pins on purpose (user, 2026-09-07: the boxes
        // "came too fast"): the stage carries a 2.2 vh budget, each fall spans
        // 14 % of it (~225 px of scroll for a full-viewport drop), and the
        // scrub lags a little more so the landing reads as weight, not a snap.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: painsStage,
            start: 'top top',
            end: 'bottom bottom',
            scrub: isMobile ? 0.25 : 0.9,
            invalidateOnRefresh: true,
          },
        });
        const DROP0 = 0.06;
        const GAP = 0.17;
        const FALL = 0.14;
        slabs.forEach((slab, i) => {
          const t0 = DROP0 + GAP * i;
          gsap.set(slab, { transformOrigin: '50% 100%' });
          // the fall — accelerating, a hair of tilt, hard landing
          tl.fromTo(
            slab,
            { y: () => -vh() * 1.05, rotate: i % 2 ? 2.2 : -2.2 },
            { y: 0, rotate: 0, ease: 'power2.in', duration: FALL },
            t0,
          );
          // the landing squash (immediateRender off: the fall's `from` must be
          // the only state applied before the first scroll frame)
          tl.fromTo(
            slab,
            { scaleY: 0.94 },
            { scaleY: 1, ease: 'elastic.out(1, 0.55)', duration: 0.06, immediateRender: false },
            t0 + FALL,
          );
          // the weight — the slabs beneath take the hit
          if (i > 0) {
            tl.fromTo(
              slabs.slice(0, i),
              { y: 0 },
              { y: 5, ease: 'power2.out', duration: 0.02, yoyo: true, repeat: 1, immediateRender: false },
              t0 + FALL,
            );
          }
        });
        // the lift — GIFT takes the pile away, top slab first
        const LIFT0 = DROP0 + GAP * slabs.length + 0.02; // 0.76
        tl.to(
          [...slabs].reverse(),
          {
            y: () => -vh() * 1.15,
            rotate: (i: number) => (i % 2 ? -3 : 3),
            ease: 'power2.in',
            duration: 0.12,
            stagger: 0.03,
          },
          LIFT0,
        );
        if (answer) {
          tl.fromTo(
            answer,
            { y: 44, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, ease: E, duration: 0.14 },
            LIFT0 + 0.1,
          );
        }
        tl.to({}, { duration: 0.001 }, 1);
      }

      // ═══ steps: the flip board ══════════════════════════════════════════
      const stepsStage = q('[data-steps-stage]');
      const flap = q('[data-flap]');
      const leaf = q('[data-flap-leaf]');
      if (stepsStage && flap && leaf) {
        const slots: Record<string, HTMLElement[]> = {};
        qa('[data-flap-slot]', flap).forEach((slot) => {
          slots[slot.dataset.flapSlot ?? ''] = qa('[data-face]', slot);
        });
        const dots = qa('[data-flap-dot]', flap);
        const n = slots.front?.length ?? 0;
        const show = (name: string, idx: number) => {
          const faces = slots[name];
          if (!faces) return;
          faces.forEach((f, i) => f.classList.toggle('is-on', i === idx));
        };
        let lastK = -1;
        let lastDot = -1;
        const place = (p: number) => {
          const segs = n - 1;
          const x = p * segs;
          let k = Math.min(segs - 1, Math.floor(x));
          let f = x - k;
          if (p >= 1) {
            k = segs - 1;
            f = 1;
          }
          if (k !== lastK) {
            lastK = k;
            show('top', Math.min(n - 1, k + 1));
            show('bottom', k);
            show('front', k);
            show('back', Math.min(n - 1, k + 1));
          }
          // a wide ease window inside each segment: the leaf turns over ~60 %
          // of the segment (with the 2.6 vh budget, ~230 px of scroll per flip)
          // and rests on the step for the remainder
          const e = ss(0.2, 0.8, f);
          const angle = -180 * e;
          leaf.style.transform = `rotateX(${angle.toFixed(2)}deg)`;
          // the leaf takes light as it turns
          flap.style.setProperty('--flip', e.toFixed(3));
          const dot = e > 0.5 ? Math.min(n - 1, k + 1) : k;
          if (dot !== lastDot) {
            lastDot = dot;
            dots.forEach((d, i) => d.classList.toggle('is-on', i === dot));
          }
        };
        place(0);
        ScrollTrigger.create({
          trigger: stepsStage,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(clamp01((self.progress - 0.06) / 0.88)),
          onRefresh: (self) => place(clamp01((self.progress - 0.06) / 0.88)),
        });
      }

      // ═══ agents: the fill ═══════════════════════════════════════════════
      const agentsStage = q('[data-agents-stage]');
      const words = qa('[data-fill-word]');
      const dossiers = qa('[data-dossier]');
      if (agentsStage && words.length) {
        const n = words.length;
        let active = -1;
        const place = (p: number) => {
          const x = p * n;
          words.forEach((w, i) => {
            const f = ss(0.06, 0.86, clamp01(x - i));
            w.style.setProperty('--f', f.toFixed(4));
            w.classList.toggle('is-full', f >= 0.999);
          });
          // the dossier follows the word that is filling (or the last full one)
          const on = Math.max(0, Math.min(n - 1, Math.floor(x - 0.08)));
          if (on !== active) {
            active = on;
            dossiers.forEach((d, i) => d.classList.toggle('is-on', i === on));
          }
        };
        place(0);
        ScrollTrigger.create({
          trigger: agentsStage,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => place(clamp01((self.progress - 0.05) / 0.9)),
          onRefresh: (self) => place(clamp01((self.progress - 0.05) / 0.9)),
        });
      }

      // ═══ thinking: the drift ════════════════════════════════════════════
      const thinking = q('.ao-thinking');
      const driftLines = qa('[data-drift]');
      if (thinking && driftLines.length) {
        // two giant lines travel in opposite directions with the scroll and
        // cross into alignment as the sheet passes the centre of the screen
        const amp = () => window.innerWidth * (isMobile ? 0.16 : 0.12);
        driftLines.forEach((line) => {
          const dir = Number(line.dataset.drift) || 1;
          gsap.fromTo(
            line,
            { x: () => dir * amp() },
            {
              x: () => -dir * amp(),
              ease: 'none',
              scrollTrigger: { trigger: thinking, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
            },
          );
        });
      }

      // ═══ cta: the bookend ═══════════════════════════════════════════════
      const cta = q('.ao-cta');
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
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad, { once: true });

    release();

    return () => {
      window.clearTimeout(introCap);
      window.removeEventListener('scroll', onFirstScroll);
      window.removeEventListener(VH_FROZEN_CHANGE, onVh);
      window.removeEventListener('load', onLoad);
      ctx.revert();
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
