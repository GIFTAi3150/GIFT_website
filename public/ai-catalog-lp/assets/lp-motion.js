// The catalog examples are static. Only the receive steps and closing section
// have the existing subtle scroll-linked accents.

window.__lpMotion = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// 3 steps: --s runs 0 -> 1 as the list passes the lower part of the viewport.
const steps = document.getElementById('steps');
if (steps) {
  const items = [...steps.querySelectorAll('li')];
  let raf = 0;
  const fill = () => {
    raf = 0;
    const r = steps.getBoundingClientRect();
    const s = reduce.matches
      ? 1
      : Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / Math.max(1, r.height * 0.9)));
    steps.style.setProperty('--s', s.toFixed(4));
    items.forEach((li, i) => li.classList.toggle('is-on', s >= (i / (items.length - 1)) * 0.94 + 0.02));
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(fill);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  fill();
}

// Closing: the giant 1,987 drifts in as the section enters (--d, 0 -> 1).
const closing = document.getElementById('closing');
if (closing) {
  let raf = 0;
  const drift = () => {
    raf = 0;
    const r = closing.getBoundingClientRect();
    const d = reduce.matches
      ? 1
      : Math.min(1, Math.max(0, (innerHeight - r.top) / Math.max(1, Math.min(r.height, innerHeight))));
    closing.style.setProperty('--d', d.toFixed(4));
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(drift);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  drift();
}
