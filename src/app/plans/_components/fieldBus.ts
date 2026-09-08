// Hand-off between KhField (owns the background canvas) and KhScroll (owns the
// page's ScrollTriggers). KhField registers on mount; KhScroll, rendered last
// inside <main>, reads it in its own effect. Same shape as ai-training's
// fieldBus, with this page's own verbs.

export interface FieldController {
  /** 0 = every word scattered, 1 = the lattice. Fed by the hero's pin. */
  setOrder(p: number): void;
  /** 0 = full strength (hero), 1 = the dimmed ground under the sections. */
  setVeil(v: number): void;
  /** Scroll distance past the hero, px — the lattice drifts under the page. */
  setScrollY(y: number): void;
  /** Hero on screen → the scatter drift animates. */
  setHeroActive(on: boolean): void;
  /** CTA on screen → the wave of light runs through the lattice rows. */
  setCta(on: boolean): void;
}

let current: FieldController | null = null;

export function setFieldController(c: FieldController | null) {
  current = c;
}

export function getFieldController(): FieldController | null {
  return current;
}
