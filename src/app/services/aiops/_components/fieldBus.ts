// Hand-off between AoField (owns the fixed liquid plate + veil) and AoScroll
// (owns the page's ScrollTriggers). AoField registers on mount; AoScroll,
// rendered last inside <main>, reads it in its own effect. Same shape as the
// ai-training / plans buses, with this page's own verbs.

export interface FieldController {
  /** Hero scene pin progress 0..1 — the ground calms as the statement comes up. */
  setScene(p: number): void;
  /** 0 = full strength (hero), 1 = the dimmed ground under the sections. */
  setVeil(v: number): void;
  /** CTA bookend on screen → the veil lifts and the liquid starts moving again. */
  setCta(on: boolean): void;
}

/**
 * The liquid's live targets. AoField writes them (from the bus), AoLiquidScene
 * lerps its uniforms toward them every frame — a plain shared object, so a
 * scroll frame never re-renders React.
 */
export const liquidTargets = { zoom: 4, spinSpeed: 2, contrast: 5.5 };

let current: FieldController | null = null;

export function setFieldController(c: FieldController | null) {
  current = c;
}

export function getFieldController(): FieldController | null {
  return current;
}
