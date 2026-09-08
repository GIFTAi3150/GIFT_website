'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getNavThemeForPath } from '@/lib/navTheme';

const STYLES_READY_EVENT = 'gift:route-styles-ready';
const FADE_MS = 280;
const MAX_HOLD_MS = 5000;

function transitionColor(pathname: string) {
  if (pathname.startsWith('/services/aiops')) return '#000000';
  return getNavThemeForPath(pathname).bg;
}

/**
 * Keeps the SSR page cover available for client-side navigations. Next can
 * commit route HTML a few frames before its route CSS link has a stylesheet;
 * without this guard the light body and unstyled HTML are briefly visible.
 */
export default function RouteTransitionGuard() {
  const pathname = usePathname();
  const pendingRef = useRef(false);
  const safetyTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    const cover = document.getElementById('page-cover');
    if (!cover) return;
    pendingRef.current = false;
    cover.style.transition = `opacity ${FADE_MS}ms ease-out`;
    cover.style.opacity = '0';
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (!pendingRef.current) cover.style.visibility = 'hidden';
    }, FADE_MS + 40);
  }, []);

  const show = useCallback((href: string) => {
    const cover = document.getElementById('page-cover');
    if (!cover) return;

    let destination: URL;
    try {
      destination = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname) return;

    pendingRef.current = true;
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current);
    cover.style.transition = 'none';
    cover.style.backgroundColor = transitionColor(destination.pathname);
    cover.style.visibility = 'visible';
    cover.style.opacity = '1';
    cover.setAttribute('data-route-transition', '');
    safetyTimerRef.current = window.setTimeout(hide, MAX_HOLD_MS);
  }, [hide]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      show(anchor.href);
    };
    const onPopState = () => show(window.location.href);

    // Covers ordinary links early, before the App Router starts fetching.
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);

    // Covers programmatic router.push() calls that do not originate on a link.
    const pushState = history.pushState;
    history.pushState = function (...args) {
      if (args[2] != null) show(String(args[2]));
      return pushState.apply(this, args);
    };

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      history.pushState = pushState;
      if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [show]);

  useEffect(() => {
    if (!pendingRef.current) return;

    let frame = 0;
    let stableFrames = 0;
    let cancelled = false;
    const started = performance.now();

    const waitForStyles = () => {
      if (cancelled) return;
      const stylesheets = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
      const minimumHoldElapsed = performance.now() - started >= 100;
      const loaded = minimumHoldElapsed && stylesheets.length > 0 && stylesheets.every((link) => link.sheet !== null);
      stableFrames = loaded ? stableFrames + 1 : 0;

      if (stableFrames >= 2 || performance.now() - started >= MAX_HOLD_MS - 500) {
        window.dispatchEvent(new Event(STYLES_READY_EVENT));
        // Let scroll controllers refresh against the styled geometry before
        // revealing the destination.
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            const cover = document.getElementById('page-cover');
            cover?.removeAttribute('data-route-transition');
            hide();
          });
        });
        return;
      }
      frame = requestAnimationFrame(waitForStyles);
    };

    frame = requestAnimationFrame(waitForStyles);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname, hide]);

  return null;
}
