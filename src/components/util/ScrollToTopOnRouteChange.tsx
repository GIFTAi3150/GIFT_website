'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

// Snap the viewport to the very top. Different browsers treat either
// documentElement or body as the scrolling root, so we clear all of them —
// whichever one is actually scrolling, this sticks. `behavior: 'instant'`
// bypasses any CSS scroll-behavior so the reset never animates.
function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Every route change lands the user at the top (the hero), never at the
// previous page's — or the destination's previously-visited — scroll
// position. The user wants this for ALL navigation site-wide (footer link,
// header, back/forward), so we reset unconditionally on pathname change.
export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  // Disable the browser's automatic scroll restoration so it doesn't override
  // our programmatic reset. With history.scrollRestoration = 'auto' (default)
  // the browser restores the previous scroll position from History state AFTER
  // React commits, silently undoing the reset. 'manual' hands us full control.
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Reset synchronously after DOM mutations and BEFORE paint, so the new page
  // is never visibly drawn at the wrong position.
  useLayoutEffect(() => {
    resetScroll();
  }, [pathname]);

  // Belt-and-suspenders against LATE re-positioning that runs after our layout
  // effect: (a) Next's App Router scroll-restoration, which can re-apply a
  // stored position on its own frame, and (b) a destroyed Lenis instance whose
  // last RAF fires post-cleanup and calls window.scrollTo back to its stored Y.
  // Re-assert the top across the next few frames so a late writer can't win.
  // Every reset is instant and lands at 0, so there is no visible motion.
  useEffect(() => {
    let frame = 0;
    let raf = requestAnimationFrame(function tick() {
      resetScroll();
      frame += 1;
      if (frame < 3) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
