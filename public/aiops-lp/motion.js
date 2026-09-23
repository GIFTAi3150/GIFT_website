(() => {
  'use strict';
  // Content is visible by default, including without JS or observer support.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  function track(animation) {
    animations.add(animation);
    animation.onfinish = animation.oncancel = () => animations.delete(animation);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (reduced.matches) return;
        const animation = target.animate(
          [
            { opacity: 0.65, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 250, easing: 'ease-out' },
        );
        track(animation);
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll('[data-enter]').forEach((element) => observer.observe(element));
  reduced.addEventListener('change', () => {
    if (reduced.matches) animations.forEach((animation) => animation.cancel());
  });
})();

// Disabled preview buttons still show touch feedback without becoming actionable.
(() => {
  'use strict';
  let press = null;
  function clearPress() {
    press?.button.removeAttribute('data-pressed');
    press = null;
  }
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      const button = event.target.closest?.('.line-cta');
      if (!button) return;
      clearPress();
      press = { button, id: event.pointerId, x: event.clientX, y: event.clientY };
      button.setAttribute('data-pressed', '');
    },
    { passive: true },
  );
  document.addEventListener(
    'pointermove',
    (event) => {
      if (!press || event.pointerId !== press.id) return;
      // A drag should scroll normally, not keep the button looking pressed.
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 12) clearPress();
    },
    { passive: true },
  );
  function release(event) {
    if (press && event.pointerId === press.id) clearPress();
  }
  document.addEventListener('pointerup', release, { capture: true, passive: true });
  document.addEventListener('pointercancel', release, { capture: true, passive: true });
  window.addEventListener('blur', clearPress);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearPress();
  });
})();
