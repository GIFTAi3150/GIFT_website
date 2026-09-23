(() => {
  'use strict';
  const configNode = document.querySelector('#lp-config');
  if (!configNode) return;
  const config = JSON.parse(configNode.textContent);
  const gaId = /^G-[A-Z0-9]+$/.test(config.gaId) ? config.gaId : '';
  const pixelId = /^\d{5,20}$/.test(config.metaPixelId)
    ? config.metaPixelId
    : '';
  function script(src) {
    const node = document.createElement('script');
    node.async = true;
    node.src = src;
    document.head.appendChild(node);
  }

  // Integrations are opt-in through server configuration. No real IDs are
  // embedded in a preview, and page content/navigation do not depend on them.
  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    script(
      'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId),
    );
  }
  if (pixelId) {
    if (!window.fbq) {
      const queue = function () {
        if (queue.callMethod) queue.callMethod.apply(queue, arguments);
        else queue.queue.push(arguments);
      };
      queue.push = queue;
      queue.loaded = true;
      queue.version = '2.0';
      queue.queue = [];
      window.fbq = queue;
      window._fbq = queue;
      script('https://connect.facebook.net/en_US/fbevents.js');
    }
    window.fbq('init', pixelId);
    // Meta's PageView powers landing-page-view measurement; do not invent an LPV event.
    window.fbq('track', 'PageView');
  }

  document.querySelectorAll('a.line-cta[data-placement]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const detail = {
        campaign: config.campaign,
        placement: link.dataset.placement,
      };
      window.dispatchEvent(new CustomEvent('aiops-lp:line-click', { detail }));
      try {
        if (pixelId) window.fbq('trackCustom', 'LineRegistrationClick', detail);
      } catch {
        // An unavailable analytics provider must never block registration.
      }
      if (!gaId) return;
      // Preserve browser modifier-key navigation. Bound GA's navigation delay
      // so an ad blocker or failed request cannot strand the visitor.
      const normalNavigation =
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.button === 0;
      let finished = false;
      function navigate() {
        if (finished || !normalNavigation) return;
        finished = true;
        window.location.assign(link.href);
      }
      if (normalNavigation) {
        event.preventDefault();
        window.setTimeout(navigate, 250);
      }
      try {
        window.gtag('event', 'line_registration_click', {
          ...detail,
          transport_type: 'beacon',
          event_callback: navigate,
          event_timeout: 250,
        });
      } catch {
        navigate();
      }
    });
  });
})();
