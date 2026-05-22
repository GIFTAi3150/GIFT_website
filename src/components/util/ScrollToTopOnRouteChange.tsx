'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Next.js App Router is supposed to scroll-to-top on every <Link>
// navigation, but in production we kept seeing pages open at the
// previous page's scroll position — the fixed header + variable
// page heights confuse the framework's built-in scroll restoration
// just often enough to feel broken.
//
// This component listens for pathname changes via usePathname()
// and forces window.scrollTo(0, 0) every time. Two notes on
// implementation:
//   1. behavior: 'instant' so we don't trigger a smooth-scroll
//      animation back from wherever the previous page left off —
//      that looked weirder than the bug itself in QA.
//   2. We deliberately read pathname (not pathname + searchParams)
//      so query-only changes (e.g. /contact?inquiry=...) DON'T
//      reset the scroll. Those are usually intra-page state
//      changes the user expects to keep their position for.
export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  useEffect(() => {
    // 'instant' is a valid ScrollBehavior at runtime but missing
    // from the TS lib in some Next.js versions — cast keeps both
    // browsers and the typechecker happy.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
