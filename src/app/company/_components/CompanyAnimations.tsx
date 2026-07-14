'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// biscom's signature ease: cubic-bezier(.25,1,.5,1)
const E = 'power3.out';

export default function CompanyAnimations() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile = window.matchMedia('(max-width: 899px)').matches;

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {

      // ---- Hero title: SplitText char-by-char on mount (no scrollTrigger) ----
      const heroTitle = document.querySelector<HTMLElement>('#company-hero-title');
      if (heroTitle) {
        const split = SplitText.create(heroTitle, { type: 'chars' });
        splits.push(split);
        gsap.fromTo(
          split.chars,
          { opacity: 0, yPercent: 110, rotateX: -55 },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 1.0,
            stagger: 0.045,
            ease: E,
            delay: 0.25,
          },
        );
      }

      // ---- Hero video parallax (desktop only) ----
      // The clip-text hero (HeroClipText) has no #company-hero-video; guard so
      // GSAP doesn't warn about a missing target.
      if (!isMobile && document.querySelector('#company-hero-video')) {
        gsap.to('#company-hero-video', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: '#company-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // ---- Decorative line + section label reveal ----
      // Pattern from biscom's line-loop: line grows scaleX 0→1, then label fades in
      document.querySelectorAll<HTMLElement>('[data-gsap="label"]').forEach((label) => {
        const line = label.previousElementSibling as HTMLElement | null;
        const tl = gsap.timeline({
          // toggleActions, NOT once:true — see the note at the bottom of this file.
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (line?.hasAttribute('data-deco-line')) {
          gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
          tl.to(line, { scaleX: 1, duration: 0.52, ease: 'power2.inOut' });
        }
        gsap.set(label, { opacity: 0, x: -16 });
        tl.to(label, { opacity: 1, x: 0, duration: 0.52, ease: E }, '-=0.22');
      });

      // ---- Section h2 headings: SplitText char-by-char on scroll ----
      document.querySelectorAll<HTMLElement>('[data-gsap="heading"]').forEach((el) => {
        const split = SplitText.create(el, { type: 'chars' });
        splits.push(split);
        gsap.set(split.chars, { opacity: 0, y: 44, display: 'inline-block' });
        gsap.to(split.chars, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.028,
          ease: E,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
      });

      // ---- Values blc-round: scroll-scrub scale+y (biscom's setRoundBlcEvent) ----
      // outer: #js-values-blc (overflow:hidden, transparent)
      // inner bg: #js-values-blc-bg (absolute, border-radius, dark bg) — this is what moves
      const blcOuter = document.querySelector<HTMLElement>('#js-values-blc');
      const blcBg = document.querySelector<HTMLElement>('#js-values-blc-bg');
      if (blcOuter && blcBg) {
        gsap.timeline({
          scrollTrigger: {
            trigger: blcOuter,
            start: 'top 95%',
            end: 'top 38%',
            scrub: 0.4,
          },
        })
          .fromTo(blcBg, { scale: isMobile ? 0.92 : 0.9 }, { scale: 1, ease: 'power3.in', force3D: false })
          .fromTo(blcBg, { y: isMobile ? 150 : 220 }, { y: 0, ease: 'power1.out', force3D: false }, '<');
      }

      // ---- Values section: biscom's 3-part stagger (titles → badges → body) ----
      const valuesSection = document.querySelector<HTMLElement>('#js-values-section');
      if (valuesSection) {
        const valuesGrid = valuesSection.querySelector('.b-values-grid');
        const titles = valuesSection.querySelectorAll<HTMLElement>('[data-gsap="card-title"]');
        const indices = valuesSection.querySelectorAll<HTMLElement>('[data-gsap="b-index"]');
        const texts = valuesSection.querySelectorAll<HTMLElement>('[data-gsap="card-text"]');

        if (titles.length) {
          gsap.set(titles, { y: 25, opacity: 0 });
          gsap.set(indices, { opacity: 0, scale: 0 });
          gsap.set(texts, { y: 30, opacity: 0 });

          gsap.timeline({
            scrollTrigger: {
              trigger: valuesGrid || valuesSection,
              start: 'top 82%',
              // toggleActions, NOT once:true — see the note at the bottom of this file.
              toggleActions: 'play none none none',
            },
          })
            .to(titles, { y: 0, opacity: 1, duration: 1.0, delay: 0.2, ease: E, stagger: { amount: 0.45 } })
            .to(indices, { opacity: 1, scale: 1, duration: 1.0, ease: 'back.out(1.7)', stagger: { amount: 0.45 } }, '<+=0.1')
            .to(texts, { y: 0, opacity: 1, duration: 1.0, ease: E, stagger: { amount: 0.45 } }, '<+=0.1');
        }
      }

      // ---- Anti-value cards ----
      const antiCards = gsap.utils.toArray<HTMLElement>('[data-gsap="anti-card"]');
      if (antiCards.length) {
        gsap.set(antiCards, { opacity: 0, x: -30 });
        ScrollTrigger.batch(antiCards, {
          start: 'top 85%',
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, x: 0, duration: 0.65, stagger: 0.1, ease: E }),
          once: true,
        });
      }

      // ---- Info table rows: stagger slide-in from left (biscom's data section) ----
      const rows = gsap.utils.toArray<HTMLElement>('[data-gsap="row"]');
      if (rows.length) {
        gsap.set(rows, { opacity: 0, x: -32 });
        gsap.to(rows, {
          opacity: 1,
          x: 0,
          duration: 0.62,
          stagger: 0.065,
          ease: E,
          scrollTrigger: { trigger: rows[0], start: 'top 84%', once: true },
        });
      }

      // ---- Stats items ----
      const stats = gsap.utils.toArray<HTMLElement>('[data-gsap="stat"]');
      if (stats.length) {
        gsap.set(stats, { opacity: 0, y: 36 });
        gsap.to(stats, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: E,
          scrollTrigger: {
            trigger: stats[0].closest('section') || stats[0],
            start: 'top 82%',
            once: true,
          },
        });
      }

      // ---- Why AIOps paragraphs: per-paragraph reveal as each enters view ----
      const whyAiopsSection = document.querySelector<HTMLElement>('#why-aiops');
      if (whyAiopsSection) {
        const paras = Array.from(
          whyAiopsSection.querySelectorAll<HTMLElement>('[data-highlight-text]'),
        );
        paras.forEach((para) => {
          gsap.fromTo(
            para,
            { opacity: 0, y: 28, x: -6 },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.72,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: para,
                start: 'top 88%',
                once: true,
              },
            },
          );
        });
      }

      // ---- Generic fade-up blocks ----
      gsap.utils.toArray<HTMLElement>('[data-gsap="fade"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: E,
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          },
        );
      });

    }); // end gsap.context

    return () => {
      ctx.revert();
      splits.forEach((s) => { try { s.revert(); } catch (_) { /* ignore */ } });
    };
  }, []);

  return null;
}

// ---------------------------------------------------------------------------
// Never put `once: true` on a gsap.timeline()'s scrollTrigger. Use
// `toggleActions: 'play none none none'` — same behaviour, no crash.
//
// Why (GSAP 3.15, ScrollTrigger.js line numbers):
//   1934  A TIMELINE-attached ScrollTrigger cannot measure itself at creation
//         (its children aren't added yet), so GSAP defers: `start = end = 0`
//         and schedules the refresh a tick later. A TWEEN-attached trigger
//         (gsap.to/fromTo) and a callback-only ScrollTrigger.create()/batch()
//         refresh immediately, so they are NOT affected by any of this.
//   1366  When the NEXT trigger is created, it walks _triggers backwards and
//         force-refreshes any it finds with a falsy .end — i.e. exactly the
//         deferred timeline ones above.
//   1606  That forced refresh calls self.update(). GSAP's own comment there
//         names the scenario: "when you reload a page when it's already
//         scrolled down".
//   1772  update() sees the trigger is already past its start, and `once`
//         makes it kill() ITSELF...
//   1890  ...which splices it out of _triggers — the array the loop at 1366
//         is in the middle of indexing. The loop only compensates for ONE
//         removal (1377-1381), so it then reads _triggers[i] === undefined:
//
//         TypeError: Cannot read properties of undefined (reading 'end')
//
// That error took down /company in production on 2026-07-14: it escaped to the
// root error boundary, so the visitor got a full-page error screen. Reproduced
// in a prod build (triggers created while the page was already scrolled) and
// verified fixed. Tweens keeping `once: true` below are intentional — they are
// not deferred and cannot hit this.
// ---------------------------------------------------------------------------
