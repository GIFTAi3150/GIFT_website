(() => {
  const stickyBar = document.querySelector('.gift-sticky-line');
  if (stickyBar) {
    const reserveBarSpace = () => {
      document.documentElement.style.setProperty(
        '--gift-sticky-height',
        Math.ceil(stickyBar.getBoundingClientRect().height) + 'px',
      );
    };
    reserveBarSpace();
    if ('ResizeObserver' in window) {
      new ResizeObserver(reserveBarSpace).observe(stickyBar);
    } else {
      window.addEventListener('resize', reserveBarSpace, { passive: true });
    }
  }

  // Desktop sector index: names light up in turn when it scrolls into view.
  const sectorIndex = document.querySelector('.gift-sector-directory');
  if (
    sectorIndex &&
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const items = sectorIndex.querySelectorAll('.gift-sectors li');
    items.forEach((item, index) => item.style.setProperty('--i', index));
    sectorIndex.setAttribute('data-scan', '');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        sectorIndex.classList.add('is-in');
        // Once scanned, hover responds without the stagger delay.
        window.setTimeout(() => {
          items.forEach((item) => item.style.removeProperty('--i'));
        }, items.length * 90 + 700);
      },
      { threshold: 0.45 },
    );
    observer.observe(sectorIndex);
  }

  // 使い方 step path: the rail fills with scroll and each step lights up when reached.
  const stepList = document.querySelector('.gift-how .gift-steps');
  if (stepList && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const steps = [...stepList.children];
    let stepFrame = 0;
    const updateSteps = () => {
      stepFrame = 0;
      const line = window.innerHeight * 0.62;
      const bounds = stepList.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (line - bounds.top) / bounds.height));
      stepList.style.setProperty('--p', progress.toFixed(4));
      steps.forEach((step) => {
        step.classList.toggle('is-active', step.getBoundingClientRect().top + 12 < line);
      });
    };
    const requestSteps = () => {
      if (!stepFrame) stepFrame = requestAnimationFrame(updateSteps);
    };
    stepList.setAttribute('data-progress', '');
    window.addEventListener('scroll', requestSteps, { passive: true });
    window.addEventListener('resize', requestSteps, { passive: true });
    updateSteps();
  }

  // 受け取り方 chat: plays once when the section scrolls into view.
  const receiveChat = document.querySelector('.gift-receive-flow-card');
  if (
    receiveChat &&
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    receiveChat.setAttribute('data-chat', '');
    const chatObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        chatObserver.disconnect();
        receiveChat.classList.add('is-in');
      },
      { threshold: 0.5 },
    );
    chatObserver.observe(receiveChat);
  }

  // Scroll-in entrances below the hero. Each group gets its own kind of motion;
  // --d staggers items within a row. Content stays visible without the script.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealGroups = [
      ['.gift-section-kicker', 'mask', 0],
      ['.gift-examples .gift-section-heading h2', 'fade', 0],
      ['.gift-example-image', 'wipe', 3],
      ['.gift-example-title', 'fade', 3],
      ['.gift-how .gift-panel-tab', 'fade', 0],
      ['.gift-how h2', 'sweep', 0],
      ['.gift-receive-flow-card .gift-panel-tab', 'fade', 0],
      ['.gift-receive-flow-card h2', 'sweep', 0],
      ['.gift-receive-flow-card .gift-receive-flow', 'pop', 0],
      ['.gift-line-card .gift-panel-tab', 'fade', 0],
      ['.gift-consultation span', 'mask', 2],
      ['.gift-line-card .gift-line-button', 'pop', 0],
      ['.gift-qr-space', 'pop', 0],
      ['.gift-footer p', 'fade', 2],
    ];
    // A clip-path-hidden element has an empty intersection rect, so observe its
    // parent and reveal every element registered under it.
    const revealTargets = new Map();
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealTargets.get(entry.target)?.forEach((element) => element.classList.add('is-shown'));
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );
    revealGroups.forEach(([selector, kind, perRow]) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.setAttribute('data-reveal', kind);
        const step = perRow ? index % perRow : 0;
        const titleLag = selector === '.gift-example-title' ? 180 : 0;
        element.style.setProperty('--d', step * 110 + titleLag + 'ms');
        const target = element.parentElement;
        if (!revealTargets.has(target)) {
          revealTargets.set(target, []);
          revealObserver.observe(target);
        }
        revealTargets.get(target).push(element);
      });
    });
  }

  // LINE close: cursor spotlight and a magnetic CTA (mouse only).
  const lineCard = document.querySelector('.gift-line-card');
  const lineCta = lineCard?.querySelector('.gift-line-button');
  if (
    lineCard &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    let pullX = 0;
    let pullY = 0;
    lineCard.addEventListener('pointermove', (event) => {
      const card = lineCard.getBoundingClientRect();
      lineCard.style.setProperty('--mx', event.clientX + 'px');
      lineCard.style.setProperty('--my', event.clientY - card.top + 'px');
      if (!lineCta) return;
      const button = lineCta.getBoundingClientRect();
      // Measure from the button's resting centre, not its pulled position.
      const dx = event.clientX - (button.left + button.width / 2 - pullX);
      const dy = event.clientY - (button.top + button.height / 2 - pullY);
      const reach = Math.max(0, 1 - Math.hypot(dx, dy) / 240);
      pullX = dx * 0.3 * reach;
      pullY = dy * 0.45 * reach;
      lineCta.style.translate = `${pullX.toFixed(1)}px ${pullY.toFixed(1)}px`;
    });
    lineCard.addEventListener('pointerleave', () => {
      pullX = 0;
      pullY = 0;
      if (lineCta) lineCta.style.translate = '0px 0px';
      lineCard.style.removeProperty('--mx');
      lineCard.style.removeProperty('--my');
    });
  }

  const exampleDialog = document.querySelector('#gift-example-dialog');
  if (exampleDialog) {
    let activeTrigger = null;
    let savedScrollY = 0;
    let backdropPointerDown = false;
    let closing = false;
    const image = exampleDialog.querySelector('.gift-dialog-image');
    const title = exampleDialog.querySelector('#gift-example-dialog-title');
    const sector = exampleDialog.querySelector('.gift-dialog-sector');
    const copy = exampleDialog.querySelector('#gift-example-dialog-copy');

    document.querySelectorAll('[data-example-open]').forEach((button) => {
      button.addEventListener('click', () => {
        if (exampleDialog.open) return;
        const card = button.closest('.gift-example');
        const sourceImage = card.querySelector('.gift-example-image');
        image.src = sourceImage.currentSrc || sourceImage.src;
        image.alt = sourceImage.alt;
        title.innerHTML = card.querySelector('h3').innerHTML;
        sector.textContent = card.querySelector('.gift-sector').textContent;
        copy.innerHTML = card.querySelector('.gift-example-copy').innerHTML;
        activeTrigger = button;
        button.setAttribute('aria-expanded', 'true');
        savedScrollY = window.scrollY;
        document.documentElement.classList.add('gift-modal-open');
        exampleDialog.showModal();
        exampleDialog.scrollTop = 0;
      });
    });

    const closeDialog = async () => {
      if (!exampleDialog.open || closing) return;
      closing = true;
      // If dismissed during entry, fade out from the current frame without a flash.
      const currentStyle = getComputedStyle(exampleDialog);
      const backdropStyle = getComputedStyle(exampleDialog, '::backdrop');
      exampleDialog.style.setProperty('--gift-close-opacity', currentStyle.opacity);
      exampleDialog.style.setProperty('--gift-close-transform', currentStyle.transform);
      exampleDialog.style.setProperty('--gift-backdrop-close-opacity', backdropStyle.opacity);
      activeTrigger?.setAttribute('aria-expanded', 'false');
      exampleDialog.classList.add('is-closing');
      // Keep the modal and focus lock in place until the exit motion finishes.
      await Promise.allSettled(
        exampleDialog.getAnimations().map((animation) => animation.finished),
      );
      if (exampleDialog.open && closing) exampleDialog.close();
    };

    exampleDialog.querySelector('[data-example-close]').addEventListener('click', closeDialog);
    exampleDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });

    const outsideDialog = (event) => {
      const bounds = exampleDialog.getBoundingClientRect();
      return (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      );
    };
    exampleDialog.addEventListener('pointerdown', (event) => {
      backdropPointerDown = event.target === exampleDialog && outsideDialog(event);
    });
    exampleDialog.addEventListener('click', (event) => {
      if (backdropPointerDown && event.target === exampleDialog && outsideDialog(event)) {
        closeDialog();
      }
      backdropPointerDown = false;
    });
    exampleDialog.addEventListener('close', () => {
      closing = false;
      backdropPointerDown = false;
      exampleDialog.classList.remove('is-closing');
      activeTrigger?.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('gift-modal-open');
      activeTrigger?.focus({ preventScroll: true });
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      activeTrigger = null;
    });
  }
  document.querySelectorAll('[data-line-pending]').forEach((button) => {
    button.addEventListener('click', () => {
      const status = document.getElementById(button.getAttribute('aria-controls'));
      if (status) {
        status.hidden = false;
        status.textContent = 'ただいま準備中です。公開までしばらくお待ちください。';
      }
    });
  });

  document.querySelectorAll('[data-line-placement]').forEach((link) => {
    link.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'fukushi_lp_line_click',
        placement: link.getAttribute('data-line-placement'),
        campaign_variant: new URLSearchParams(window.location.search).get('utm_content') || '',
      });
    });
  });
})();
