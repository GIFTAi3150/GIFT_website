// Catalog preview motion (DOM side). The 3D book, its page turns and the
// printed theme pages live in scripts/ai-catalog/src/ (catalog-scene.js,
// catalog-book.js). Here: the heading reveal, and the 3 steps, whose rail fills
// with scroll and lights each step as the fill reaches it.

window.__lpMotion = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function show(el) {
  el.classList.add('is-in');
}

const targets = document.querySelectorAll('.reveal, .pv-title');
if (reduce.matches || !('IntersectionObserver' in window)) {
  targets.forEach(show);
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        show(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  targets.forEach((el) => io.observe(el));
}

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
