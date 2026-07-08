'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    /**
     * Set while the 404 (not-found) view is mounted. ErrorReporter reads it to
     * skip forwarding non-actionable client errors that fire on pages which
     * don't exist. See NotFoundReporterSilence below for the why.
     */
    __giftNotFound?: boolean;
  }
}

/**
 * Marks the current render as the 404 (not-found) view so ErrorReporter can
 * skip forwarding client errors that happen on non-existent pages.
 *
 * Why: after the gift-inc.org domain cutover, crawlers and RPA bots keep
 * hitting dead old WordPress URLs (/DashBoard, /support997/*). Those render our
 * 404 page, and a handful of bot/legacy browsers throw a non-reproducible React
 * error there — spamming the Slack alert channel with noise from pages that
 * aren't supposed to exist. A real 404 in a real browser is silent; there is
 * nothing to fix in a page that doesn't exist, so we simply don't page on it.
 *
 * Sets the flag on mount (covers client-side navigations into a 404) and clears
 * it on unmount, so a real page reached afterward still reports normally. The
 * inline script in not-found.tsx sets the same flag during HTML parse, so an
 * error thrown before this effect runs is covered too.
 */
export default function NotFoundReporterSilence(): null {
  useEffect(() => {
    window.__giftNotFound = true;
    return () => {
      window.__giftNotFound = false;
    };
  }, []);
  return null;
}
