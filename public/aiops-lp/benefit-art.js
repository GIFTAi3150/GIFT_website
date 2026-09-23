// Full-card buttons lift on activation and animate the sculpted illustrations.
(() => {
  'use strict';
  const posters = [...document.querySelectorAll('[data-service-art]')];
  if (!posters.length || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = posters.map((poster) => {
    const card = poster.closest('.line-benefit-card');
    // Without JavaScript, artwork remains a decorative image.
    const holder = document.createElement('button');
    holder.type = 'button';
    holder.className = poster.className;
    holder.dataset.serviceArt = poster.dataset.serviceArt;
    const label = card.querySelector('h3').textContent;
    holder.setAttribute('aria-label', label + 'のアニメーションを再生');
    holder.disabled = reduced.matches;
    if (reduced.matches) holder.setAttribute('aria-hidden', 'true');
    holder.append(...poster.childNodes);
    poster.replaceWith(holder);
    return {
      card,
      holder,
      artwork: holder.querySelector('.benefit-art-poster'),
      visible: false,
      looping: false,
      animation: null,
      lift: null,
    };
  });

  function restArtwork(state) {
    state.animation?.cancel();
    state.animation = null;
    state.looping = false;
  }

  function rest(state) {
    restArtwork(state);
    state.lift?.cancel();
    state.lift = null;
    state.card.removeAttribute('data-lifted');
  }

  function liftCard(state) {
    if (reduced.matches || document.hidden || !state.visible || state.holder.disabled) return;
    // Restart from the current position so rapid taps remain smooth.
    const current = getComputedStyle(state.card).translate;
    state.lift?.cancel();
    state.card.setAttribute('data-lifted', '');
    const animation = state.card.animate(
      [
        { translate: current === 'none' ? '0 0' : current, offset: 0, easing: 'ease-out' },
        { translate: '0 -8px', offset: 0.32, easing: 'ease-in-out' },
        { translate: '0 -6px', offset: 0.58, easing: 'ease-in-out' },
        { translate: '0 0', offset: 1 },
      ],
      { duration: 800 },
    );
    state.lift = animation;
    animation.onfinish = () => {
      if (state.lift !== animation) return;
      state.lift = null;
      state.card.removeAttribute('data-lifted');
    };
  }

  function play(state, loop) {
    if (reduced.matches || document.hidden || !state.visible || state.holder.disabled) return;
    if (loop && state.looping && state.animation?.playState === 'running') return;
    restArtwork(state);
    state.looping = loop;
    const animation = state.artwork.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', offset: 0 },
        { transform: 'translateY(-3px) rotate(-2deg)', offset: 0.35 },
        { transform: 'translateY(-1px) rotate(1deg)', offset: 0.7 },
        { transform: 'translateY(0) rotate(0deg)', offset: 1 },
      ],
      { duration: 3200, iterations: loop ? Infinity : 1, easing: 'ease-in-out' },
    );
    state.animation = animation;
    animation.onfinish = () => {
      if (state.animation === animation) restArtwork(state);
    };
  }

  const byCard = new Map(states.map((state) => [state.card, state]));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = byCard.get(entry.target);
        state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (!state.visible) rest(state);
      }
    },
    { threshold: [0, 0.25] },
  );

  for (const state of states) {
    observer.observe(state.card);
    state.holder.addEventListener(
      'pointerenter',
      (event) => {
        // Hovering starts a loop that continues after the pointer leaves.
        if (['mouse', 'pen'].includes(event.pointerType)) play(state, true);
      },
      { passive: true },
    );
    state.holder.addEventListener('pointercancel', () => rest(state), { passive: true });
    state.holder.addEventListener('click', () => {
      if (!state.looping) play(state, false);
      liftCard(state);
    });
    state.holder.addEventListener('blur', () => {
      if (!state.looping) rest(state);
    });
  }

  reduced.addEventListener('change', () => {
    for (const state of states) {
      state.holder.disabled = reduced.matches;
      if (reduced.matches) {
        state.holder.setAttribute('aria-hidden', 'true');
        rest(state);
      } else state.holder.removeAttribute('aria-hidden');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) states.forEach(rest);
  });
  window.addEventListener('pagehide', () => states.forEach(rest));
})();
