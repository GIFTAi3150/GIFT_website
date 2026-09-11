'use client';

import { useEffect } from 'react';

const VH_VAR = '--vh-frozen';
const SVH_VAR = '--svh-frozen';
export const VH_FROZEN_CHANGE = 'gift:vh-frozen-change';

// Measure CSS units, not innerHeight: Safari's large and small viewports differ.
function measureViewport(height: '100vh' | '100svh'): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position:fixed;top:0;left:0;width:0;height:${height};visibility:hidden;pointer-events:none;`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

/** Keep scroll geometry stable when a mobile WebView resizes its browser bars.
 * Width changes still remeasure for rotation/split screen. Desktop windows
 * respond to every resize; keyboard and hidden-WebView sizes are never saved.
 */
export default function ViewportFreeze() {
  useEffect(() => {
    const root = document.documentElement;
    const touch = window.matchMedia('(hover: none) and (pointer: coarse)');
    let lastWidth = 0;
    let settleTimer: number | undefined;

    const editing = () => {
      const active = document.activeElement;
      return (
        active instanceof HTMLElement &&
        (active.isContentEditable || active.matches('input, textarea, select'))
      );
    };
    const usable = () =>
      document.visibilityState !== 'hidden' &&
      window.innerWidth > 1 &&
      window.innerHeight > 1 &&
      !(touch.matches && editing());

    const apply = (announce: boolean) => {
      if (!usable()) return;
      const px = measureViewport('100vh');
      if (!px) return;
      // Older engines can reject svh; retain a usable vh fallback.
      const spx = measureViewport('100svh') || px;
      const changed =
        root.style.getPropertyValue(VH_VAR) !== `${px}px` ||
        root.style.getPropertyValue(SVH_VAR) !== `${spx}px`;
      root.style.setProperty(VH_VAR, `${px}px`);
      root.style.setProperty(SVH_VAR, `${spx}px`);
      lastWidth = window.innerWidth;
      if (announce && changed) window.dispatchEvent(new Event(VH_FROZEN_CHANGE));
    };

    const onResize = () => {
      if (!usable()) return;
      // Any height-only change on a touch device can be browser chrome or an
      // on-screen keyboard. A percentage threshold misclassifies tall keyboards.
      if (touch.matches && lastWidth === window.innerWidth) return;
      apply(true);
    };
    const onOrientation = () => {
      onResize();
      window.clearTimeout(settleTimer);
      // iOS can report the old dimensions in the orientationchange event.
      settleTimer = window.setTimeout(() => apply(true), 350);
    };
    const onFocusOut = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(onResize, 350);
    };

    apply(false);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('pageshow', onResize);
    document.addEventListener('visibilitychange', onResize);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('pageshow', onResize);
      document.removeEventListener('visibilitychange', onResize);
      document.removeEventListener('focusout', onFocusOut);
      window.clearTimeout(settleTimer);
      root.style.removeProperty(VH_VAR);
      root.style.removeProperty(SVH_VAR);
    };
  }, []);
  return null;
}
