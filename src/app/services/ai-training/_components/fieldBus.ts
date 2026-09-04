// Hand-off between AtPlasma (owns the background canvas + veil) and AtScroll
// (owns the page's ScrollTriggers). AtPlasma registers on mount; AtScroll,
// rendered last inside <main>, reads it in its own effect.

export interface FieldController {
  /** Hero scene scrub 0..1 (pinned spacer progress). */
  setScroll(p: number): void;
  /** Hero on screen → render loop on. */
  setActive(on: boolean): void;
  /** CTA bookend on screen → navy mode over the ghost word. */
  setCta(on: boolean): void;
}

let current: FieldController | null = null;

export function setFieldController(c: FieldController | null) {
  current = c;
}

export function getFieldController(): FieldController | null {
  return current;
}
