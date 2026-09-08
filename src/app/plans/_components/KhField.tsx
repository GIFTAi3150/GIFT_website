'use client';

import { useEffect, useRef } from 'react';
import { setFieldController } from './fieldBus';

/**
 * The field — rev 4, "the light" (2026-09-07). A fixed video plate behind the
 * whole page: the manager's approved background loop (a glossy blue/violet
 * ribbon of light turning through a black studio), framed so the giant name
 * keeps the left and the light keeps the right.
 *
 * Rev 1 (word fragments → text lattice), rev 2 (filaments of light → ruled
 * lines) and rev 3 (a live three.js glass orb) were all rejected the same day.
 * Rev 4 stops re-creating the reference and plays the licensed asset that
 * came with it (designpro-background-kit) — so there is no WebGL on this page
 * at all any more: no probe, no renderer, no context-loss path, no three.js in
 * the bundle.
 *
 * Bus → plate (contract UNCHANGED, so KhScroll and every section stay as they
 * are):
 *   order      the hero's pin, 0 → 1. Drives `--kh-o`; CSS derives the settle
 *              (scale 1.08 → 1) and the focus wash that gathers the light to
 *              the edges as the coda takes the centre. Land = full strength.
 *   veil       navy over the plate under the sections (VEIL_MAX), lifted under
 *              the CTA (VEIL_CTA). One element, two speeds: the hero scrub
 *              writes with transition 0, the CTA toggle with CTA_EASE_MS —
 *              they never overlap, so no rAF loop is needed anywhere here.
 *   scrollY    slow parallax past the hero, written straight to the parallax
 *              box's transform and clamped to its bleed, so no edge is ever
 *              exposed and no per-frame custom property invalidates the grade.
 *   cta        lifts the veil for the bookend. Nothing else.
 *   heroActive accepted and ignored — see below.
 *
 * Playback: the loop NEVER stops (the user's call, 2026-09-07). There is no
 * scroll gating and no visibility gating; a `pause` listener puts it straight
 * back, so anything that stops it — a background tab, an OS interruption, a
 * hydration hiccup — self-heals. The one thing that holds it is
 * prefers-reduced-motion, where the whole page is static anyway. That listener
 * must be removed BEFORE the cleanup's pause() or the teardown restarts it.
 *
 * Viewport: the plate box is `.kh-field`, fixed at 100lvh (NOT inset:0 — on
 * phones inset:0 follows the address bar and re-crops the video on every
 * scroll). Nothing here measures or resizes; `object-fit: cover` does it.
 */

// /videos/ (plural), not /video/: next.config.js only gives that prefix the
// byte-range + revalidation headers a looping <video> needs in dev
// (ERR_CACHE_OPERATION_NOT_SUPPORTED otherwise — project memory).
const SRC = '/videos/kh-field.mp4';
const POSTER = '/img/kh-field-poster.jpg';

const VEIL_MAX = 0.85; // under the sections the light is dimmed, never stopped
const VEIL_CTA = 0.55; // the bookend lets more of it through
const CTA_EASE_MS = 700;

const PARALLAX = 0.055;
const PARALLAX_MAX = 100; // must stay ≤ .kh-field__media's vertical bleed

const READY_CAP_MS = 900;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export default function KhField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const media = mediaRef.current;
    const veil = veilRef.current;
    const video = videoRef.current;
    if (!field || !media || !veil) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // `let`, not a captured const: a reader who turns the preference ON mid-page
    // must actually stop the loop, and kick() below reads this live
    let reduced = mq.matches;

    // ── the hero intro waits on this; the poster has painted long before ──
    let readyFired = false;
    const ready = () => {
      if (readyFired) return;
      readyFired = true;
      window.dispatchEvent(new Event('gift:logo-ready'));
    };
    const readyCap = window.setTimeout(ready, READY_CAP_MS);

    // ── playback: never stops ─────────────────────────────────────────────
    let cta = false;
    const kick = () => {
      if (reduced || !video || !video.paused) return;
      video.play().catch(() => {}); // iOS low-power blocks it; the poster stays
    };

    // ── the veil: one element, written at two speeds ──────────────────────
    let veilP = reduced ? 1 : 0; // KhScroll never drives the veil under reduced motion
    const paintVeil = (ms: number) => {
      veil.style.transitionDuration = `${ms}ms`;
      veil.style.opacity = (VEIL_MAX * veilP * (cta ? VEIL_CTA / VEIL_MAX : 1)).toFixed(3);
    };
    paintVeil(0);
    if (reduced) field.style.setProperty('--kh-o', '1');

    setFieldController({
      setOrder: (p) => {
        if (reduced) return;
        field.style.setProperty('--kh-o', clamp01(p).toFixed(4));
      },
      setVeil: (v) => {
        const c = clamp01(v);
        if (c === veilP) return;
        veilP = c;
        paintVeil(0); // a scrub: no easing, or it lags the reader's finger
      },
      setScrollY: (y) => {
        // written straight to the transform, NOT through a custom property on
        // .kh-field: an unregistered custom property invalidates the whole
        // subtree's computed style, which would re-resolve the settle box's
        // filter() on every scroll frame for no reason
        if (reduced) return;
        const px = -Math.min(PARALLAX_MAX, Math.max(0, y) * PARALLAX);
        media.style.transform = `translate3d(0, ${px.toFixed(1)}px, 0)`;
      },
      // the loop no longer starts or stops with the hero — kept because the
      // bus contract is shared with KhScroll, which still reports it
      setHeroActive: () => {},
      setCta: (on) => {
        if (on === cta) return;
        cta = on;
        paintVeil(CTA_EASE_MS); // a toggle: this one eases
      },
    });

    const onReduce = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      if (reduced) video?.pause();
      else kick();
    };
    mq.addEventListener('change', onReduce);

    // coming back to the tab: iOS pauses on background and fires nothing on
    // return, so the `pause` listener alone would leave it stopped. Kick only —
    // this handler never pauses anything.
    const onVis = () => {
      if (document.visibilityState !== 'hidden') kick();
    };
    document.addEventListener('visibilitychange', onVis);

    if (video) {
      video.muted = true; // Safari ignores the attribute on a hydrated node
      const onData = () => {
        ready();
        kick();
      };
      // a <video> that failed to load keeps showing its poster, cropped by the
      // same object-fit — so the plate degrades to the still frame, not a hole
      const onErr = () => ready();
      video.addEventListener('loadeddata', onData);
      video.addEventListener('error', onErr);
      video.addEventListener('pause', kick); // whatever stopped it, start again
      kick();
      return () => {
        window.clearTimeout(readyCap);
        // BEFORE pause(), or the pause listener immediately restarts it
        video.removeEventListener('pause', kick);
        video.removeEventListener('loadeddata', onData);
        video.removeEventListener('error', onErr);
        mq.removeEventListener('change', onReduce);
        document.removeEventListener('visibilitychange', onVis);
        video.pause();
        setFieldController(null);
      };
    }

    return () => {
      window.clearTimeout(readyCap);
      mq.removeEventListener('change', onReduce);
      document.removeEventListener('visibilitychange', onVis);
      setFieldController(null);
    };
  }, []);

  return (
    <div ref={fieldRef} className="kh-field" aria-hidden>
      {/* parallax box: bleeds past the plate by PARALLAX_MAX top and bottom */}
      <div ref={mediaRef} className="kh-field__media">
        {/* the settle: scale + grade, both driven by --kh-o */}
        <div className="kh-field__zoom">
          <video
            ref={videoRef}
            className="kh-field__video"
            src={SRC}
            poster={POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            disablePictureInPicture
            disableRemotePlayback
          />
        </div>
      </div>
      {/* composition: the giant name keeps the left, the light keeps the right */}
      <div className="kh-field__scrim" />
      {/* the harnessing: the light is gathered to the edges as the coda lands */}
      <div className="kh-field__focus" />
      {/* the ground under the sections */}
      <div ref={veilRef} className="kh-field__veil" />
    </div>
  );
}
