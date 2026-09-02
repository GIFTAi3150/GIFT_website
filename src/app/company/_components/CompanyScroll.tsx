'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';

gsap.registerPlugin(ScrollTrigger, SplitText);

const ZWSP = String.fromCharCode(0x200b);
const E = 'expo.out';

// Same grain the homepage About section bakes (HPAbout.tsx) — paper texture.
function makeGrainUrl(size = 256, amplitude = 18): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const id = ctx.createImageData(size, size);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.floor((Math.random() - 0.5) * 2 * amplitude);
    d[i] = 128 + n;
    d[i + 1] = 128 + n;
    d[i + 2] = 128 + n;
    d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c.toDataURL();
}

/**
 * Scroll orchestrator for /company. Rendered LAST inside <main> so this effect
 * runs after every section's own effect; the flash guard is released in a rAF
 * at the very end, after all initial states exist (see project_dx_navigation_flash_fix).
 */
export default function CompanyScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.company-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;

    const grain = root.querySelector<HTMLElement>('.co-vision__grain');
    if (grain) grain.style.backgroundImage = `url(${makeGrainUrl()})`;

    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));

    if (reduced) {
      // company.css's reduced-motion block paints every final state.
      release();
      return;
    }

    // ---- Lenis: desktop only. Touch scroll doesn't deliver continuous events,
    //      so Lenis starves ScrollTrigger on phones (project memory). ----
    let lenis: Lenis | null = null;
    let lenisRaf: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      // ---- Section labels: rule grows, text slides in (timeline → toggleActions, never once) ----
      root.querySelectorAll<HTMLElement>('.co-label').forEach((label) => {
        const rule = label.querySelector<HTMLElement>('.co-label__rule');
        const text = label.querySelector<HTMLElement>('.co-label__text');
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });

      // ---- h2 char reveal on enter (tween + once is safe) ----
      // Headings are U+200B phrase-segmented too: a bare char split turns every
      // character into a break opportunity and the JP orphan rules die.
      root.querySelectorAll<HTMLElement>('[data-co-heading]').forEach((el) => {
        const split = SplitText.create(el, {
          type: 'words, chars',
          wordsClass: 'co-hw',
          wordDelimiter: { delimiter: ZWSP, replaceWith: '' },
        });
        splits.push(split);
        gsap.set(split.words, { display: 'inline-block', whiteSpace: 'nowrap' });
        gsap.set(split.chars, { opacity: 0, y: 40, display: 'inline-block' });
        gsap.to(split.chars, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.025, ease: E,
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      });

      // ---- Generic fade-up (signature, address, buttons) ----
      root.querySelectorAll<HTMLElement>('[data-co-fade]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.85, ease: E,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });

      // ---- Mission: phrase-by-phrase scrub. Copy is U+200B-segmented so a
      //      "word" is a phrase box; breaks only ever fall between phrases. ----
      const missionParas = Array.from(root.querySelectorAll<HTMLElement>('#mission [data-co-phrases]'));
      if (missionParas.length) {
        const split = SplitText.create(missionParas, {
          type: 'words',
          wordsClass: 'co-w',
          wordDelimiter: { delimiter: ZWSP, replaceWith: '' },
        });
        splits.push(split);
        gsap.set(split.words, { display: 'inline-block', whiteSpace: 'nowrap', opacity: 0.14 });
        missionParas.forEach((p) => {
          const words = Array.from(p.querySelectorAll<HTMLElement>('.co-w'));
          if (!words.length) return;
          gsap.to(words, {
            opacity: 1, duration: 0.5, stagger: 0.05, ease: 'none',
            scrollTrigger: { trigger: p, start: 'top 78%', end: 'bottom 45%', scrub: 0.35 },
          });
        });
      }
      const railFill = root.querySelector<HTMLElement>('#mission .co-rail__fill');
      const missionBody = root.querySelector<HTMLElement>('#mission .co-mission__body');
      if (railFill && missionBody) {
        gsap.to(railFill, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: missionBody, start: 'top 60%', end: 'bottom 60%', scrub: 0.3 },
        });
      }

      // ---- Vision: sticky statement, lines wipe in sequence; marquee rides the scroll ----
      const vSpacer = root.querySelector<HTMLElement>('.co-vision__spacer');
      const vLines = Array.from(root.querySelectorAll<HTMLElement>('.co-vision__line'));
      const vRule = root.querySelector<HTMLElement>('.co-vision__rule');
      const vEn = root.querySelector<HTMLElement>('.co-vision__en');
      if (vSpacer && vLines.length) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: vSpacer, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        });
        vLines.forEach((line, i) => {
          tl.fromTo(
            line,
            { clipPath: 'inset(0 100% 0 0)', x: -24 },
            { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 0.28, ease: 'none' },
            0.06 + i * 0.24,
          );
        });
        if (vRule) tl.to(vRule, { scaleX: 1, duration: 0.1, ease: 'none' }, 0.8);
        if (vEn) tl.to(vEn, { opacity: 1, duration: 0.1, ease: 'none' }, 0.86);
      }
      const vSection = root.querySelector<HTMLElement>('#vision');
      const marquee = root.querySelector<HTMLElement>('.co-vision__marquee');
      if (vSection && marquee) {
        gsap.fromTo(marquee, { xPercent: 0 }, {
          xPercent: -22, ease: 'none',
          scrollTrigger: { trigger: vSection, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
        });
      }

      // ---- Why AIOps: the thesis builds itself. Three foundations quoted from
      //      the copy slide onto the ground (現場) one by one as the argument is
      //      read; then AI drops onto the stack, which compresses, springs back
      //      and lights up blue. One scrubbed timeline over the text column; the
      //      stage is sticky beside it (desktop) or above it (phones). ----
      //      The stage is DESKTOP-ONLY (company.css hides it below 1024px, same
      //      breakpoint as the liquid background), so the build timeline is too:
      //      animating a display:none stack is dead work.
      const stageOn = window.matchMedia('(min-width: 1024px)').matches;
      const whyArgument = root.querySelector<HTMLElement>('.co-why__argument');
      const whyStage = root.querySelector<HTMLElement>('.co-why__stage');
      const stack = root.querySelector<HTMLElement>('[data-co-stack]');
      const b1 = root.querySelector<HTMLElement>('[data-co-block="1"]');
      const b2 = root.querySelector<HTMLElement>('[data-co-block="2"]');
      const b3 = root.querySelector<HTMLElement>('[data-co-block="3"]');
      const ai = root.querySelector<HTMLElement>('[data-co-block="ai"]');
      if (stageOn && whyArgument && whyStage && stack && b1 && b2 && b3 && ai) {
        gsap.set(b1, { xPercent: -135 });
        gsap.set(b2, { xPercent: 135 });
        gsap.set(b3, { xPercent: -135 });
        // End at 'bottom 88%' so the drop + impact play while the sticky stage is
        // still fully pinned and the conclusion paragraph is on screen.
        gsap.timeline({
          scrollTrigger: {
            trigger: whyArgument,
            start: 'top 72%',
            end: 'bottom 88%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
          .to(b1, { xPercent: 0, duration: 1, ease: 'power3.out' }, 0.2)
          .to(b2, { xPercent: 0, duration: 1, ease: 'power3.out' }, 1.4)
          .to(b3, { xPercent: 0, duration: 1, ease: 'power3.out' }, 2.6)
          // parked one full stage-height above (the stage clips it), then the drop
          .fromTo(
            ai,
            { y: () => -whyStage.offsetHeight },
            { y: 0, duration: 0.9, ease: 'power2.in', immediateRender: true },
            3.9,
          )
          .to(stack, { scaleY: 0.96, duration: 0.12, ease: 'power1.out' }, 4.8)   // impact
          .to(stack, { scaleY: 1, duration: 0.4, ease: 'back.out(2.5)' }, 4.92)   // rebound
          .to([b1, b2, b3], {                                                      // the 中身 lights up
            borderColor: 'rgba(96, 165, 250, 0.8)',
            backgroundColor: 'rgba(37, 99, 235, 0.16)',
            duration: 0.5,
            ease: 'power1.out',
          }, 4.9);
      }

      // ---- Values: the push machine. ONE scrubbed number, --vs (0..3), drives
      //      every transform in company.css (masked stack pushes up, the outlined
      //      kanji slides sideways). Holds of 0.65 between pushes of 0.35 so each
      //      value is actually read before the next one rises. ----
      const valuesInner = root.querySelector<HTMLElement>('.co-values__inner');
      const valuesSpacer = root.querySelector<HTMLElement>('.co-values__spacer');
      if (valuesInner && valuesSpacer) {
        const proxy = { vs: 0 };
        const apply = () => valuesInner.style.setProperty('--vs', proxy.vs.toFixed(4));
        apply();
        gsap.timeline({
          scrollTrigger: { trigger: valuesSpacer, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
          onUpdate: apply,
        })
          .to(proxy, { vs: 1, duration: 0.35, ease: 'power3.inOut' }, 0.65)
          .to(proxy, { vs: 2, duration: 0.35, ease: 'power3.inOut' }, 1.65)
          .to(proxy, { vs: 3, duration: 0.35, ease: 'power3.inOut' }, 2.65)
          .to(proxy, { vs: 3, duration: 0.35, ease: 'none' }, 3.0); // tail hold
      }

      // ---- Information rows ----
      const rows = gsap.utils.toArray<HTMLElement>('.co-info__row');
      if (rows.length) {
        gsap.set(rows, { opacity: 0, x: -28 });
        gsap.to(rows, {
          opacity: 1, x: 0, duration: 0.6, stagger: 0.06, ease: E,
          scrollTrigger: { trigger: rows[0], start: 'top 86%', once: true },
        });
      }

      // ---- CTA: the giant word rises with the scroll ----
      const ctaSection = root.querySelector<HTMLElement>('#contact-cta');
      const ctaWord = root.querySelector<HTMLElement>('.co-cta__word');
      if (ctaSection && ctaWord) {
        gsap.to(ctaWord, {
          opacity: 1, y: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: ctaSection, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
        });
      }
    }, root);

    // ---- Refresh points: fonts, late layout, frozen-vh re-measure ----
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    const t1 = window.setTimeout(refresh, 800);
    const t2 = window.setTimeout(refresh, 2000);
    window.addEventListener(VH_FROZEN_CHANGE, refresh);

    release();

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener(VH_FROZEN_CHANGE, refresh);
      ctx.revert();
      splits.forEach((s) => { try { s.revert(); } catch { /* ignore */ } });
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
