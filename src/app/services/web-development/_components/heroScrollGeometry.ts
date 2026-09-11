/** Match frozen CSS geometry, with a safe fallback before hydration. */
export function getFrozenViewportHeight(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--svh-frozen').trim();
  const height = value.endsWith('px') ? Number.parseFloat(value) : 0;
  return height > 0 ? height : window.innerHeight;
}

export function getHeroScrollDistance(section: HTMLElement): number {
  return Math.max(1, section.offsetHeight - getFrozenViewportHeight());
}
