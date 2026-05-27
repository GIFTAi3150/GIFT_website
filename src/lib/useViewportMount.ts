'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface Options {
  /** rootMargin that triggers mount — element fires when this close to viewport.
   *  Default: '100% 0px' (one viewport above/below). */
  preMountMargin?: string;
  /** rootMargin that triggers release — element must be this far outside the
   *  viewport before the debounce starts. Default: '300% 0px'. */
  releaseMargin?: string;
  /** How long the element must stay outside releaseMargin before the context
   *  is released. Prevents churn on quick scroll-bys. Default: 1500ms. */
  releaseDebounceMs?: number;
  /** Dev-mode label for console logs (NODE_ENV !== 'production' only). */
  debugLabel?: string;
}

/**
 * Viewport-driven mount gate.
 *
 * Returns `shouldMount` (gate the Canvas) and `isVisible` (gate frameloop).
 * Starts false; becomes true once the element enters the pre-mount zone;
 * returns to false only after the element has been outside the release zone
 * for releaseDebounceMs.
 *
 * Three IntersectionObservers:
 *  1. preMountMargin — triggers shouldMount = true
 *  2. releaseMargin  — starts debounced shouldMount = false
 *  3. zero-margin    — tracks actual on-screen pixels for isVisible
 */
export function useViewportMount(
  ref: RefObject<HTMLElement>,
  options?: Options,
): { shouldMount: boolean; isVisible: boolean } {
  const {
    preMountMargin = '100% 0px',
    releaseMargin = '300% 0px',
    releaseDebounceMs = 1500,
    debugLabel,
  } = options ?? {};

  const [shouldMount, setShouldMount] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;

    // IntersectionObserver is not available in SSR or very old browsers.
    // Fall back to always-mounted so the Canvas still renders.
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldMount(true);
      setIsVisible(true);
      return;
    }

    const log = (msg: string) => {
      if (process.env.NODE_ENV !== 'production' && debugLabel) {
        // eslint-disable-next-line no-console
        console.log(`[viewport-mount:${debugLabel}] ${msg}`);
      }
    };

    const cancelRelease = () => {
      if (releaseTimerRef.current !== null) {
        clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }
    };

    // Observer 1: pre-mount — fires when element enters the pre-mount zone.
    const mountIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancelRelease();
          log('mount');
          setShouldMount(true);
        }
      },
      { rootMargin: preMountMargin },
    );

    // Observer 2: release — fires when element leaves the release zone.
    // Debounced so a quick scroll-by does not churn the WebGL context.
    const releaseIO = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (releaseTimerRef.current === null) {
            releaseTimerRef.current = setTimeout(() => {
              releaseTimerRef.current = null;
              log('release');
              setShouldMount(false);
            }, releaseDebounceMs);
          }
        } else {
          cancelRelease();
        }
      },
      { rootMargin: releaseMargin },
    );

    // Observer 3: visibility — zero-margin, tracks actual on-screen pixels.
    // Used by consumers for frameloop='always'/'never' control.
    const visibleIO = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
    );

    mountIO.observe(el);
    releaseIO.observe(el);
    visibleIO.observe(el);

    return () => {
      mountIO.disconnect();
      releaseIO.disconnect();
      visibleIO.disconnect();
      cancelRelease();
    };
  }, [ref, preMountMargin, releaseMargin, releaseDebounceMs, debugLabel]);

  return { shouldMount, isVisible };
}
