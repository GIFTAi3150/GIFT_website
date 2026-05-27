'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  // Disable the browser's automatic scroll restoration so it doesn't
  // override our programmatic reset below. With history.scrollRestoration
  // = 'auto' (the default), the browser restores the previous page's
  // scroll position from History state — this fires AFTER React commits
  // and silently undoes any effect-based scrollTo call. Setting 'manual'
  // hands full scroll control to us.
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // useLayoutEffect fires synchronously after React's DOM mutations and
  // BEFORE the browser paints. This guarantees the scroll position is
  // corrected before the user sees the new page, eliminating the
  // visible flash of the wrong position that useEffect could cause.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  // Belt-and-suspenders: Lenis (used on DX + achievements pages) runs its RAF
  // loop between useLayoutEffect and useEffect cleanup. That RAF fires AFTER our
  // useLayoutEffect scrollTo(0,0) and calls window.scrollTo back to its stored
  // Y — overriding us. This useEffect runs AFTER all old-page cleanup effects
  // (including lenis.destroy()), so Lenis is gone and the scrollTo sticks. The
  // inner requestAnimationFrame covers any post-commit Next.js scroll restoration.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
