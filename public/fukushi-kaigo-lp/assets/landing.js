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
      ['.gift-catalog .gift-section-heading h2', 'fade', 0],
      ['.gift-tally-total', 'fade', 0],
      ['.gift-tally-side', 'fade', 0],
      ['.gift-search', 'fade', 0],
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
        element.style.setProperty('--d', step * 110 + 'ms');
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

  // カタログ検索: JSON は初回操作（フォーカス／入力／ヒント）か、セクションが画面に近づいた
  // タイミングで一度だけ取得してキャッシュする。
  const catalogSection = document.querySelector('.gift-catalog');
  if (catalogSection) {
    const searchForm = catalogSection.querySelector('.gift-search');
    const input = catalogSection.querySelector('#gift-q');
    const resultsBox = catalogSection.querySelector('.gift-search-results');
    const countLine = catalogSection.querySelector('.gift-search-count');
    const list = catalogSection.querySelector('.gift-search-list');
    const moreLink = catalogSection.querySelector('.gift-search-more');
    const clearButton = catalogSection.querySelector('.gift-search-clear');
    const syncClear = () => { clearButton.hidden = input.value === ''; };
    clearButton.addEventListener('click', () => {
      input.value = '';
      syncClear();
      runSearch('');
      input.focus();
    });

    let skillsPromise = null;
    const loadSkills = () => {
      if (!skillsPromise) {
        skillsPromise = fetch('/fukushi-kaigo-lp/assets/skills-2026-09.json')
          .then((response) => response.json())
          .catch(() => []);
      }
      return skillsPromise;
    };

    const normalize = (value) => value.normalize('NFKC').toLowerCase();

    const runSearch = async (rawQuery) => {
      const query = rawQuery.trim();
      if (!query) {
        resultsBox.hidden = true;
        return;
      }
      const rows = await loadSkills();
      const tokens = normalize(query).split(/\s+/).filter(Boolean);
      const matches = [];
      rows.forEach(([group, industry, name, does, when]) => {
        const haystack = normalize(`${name}${does}${when}${industry}${group}`);
        if (!tokens.every((token) => haystack.includes(token))) return;
        const nameHaystack = normalize(name);
        const nameMatchesAll = tokens.every((token) => nameHaystack.includes(token));
        matches.push({ group, industry, name, does, nameMatchesAll });
      });
      // Array#sort is stable, so name-matches float up without losing catalogue order among ties.
      matches.sort((a, b) => (b.nameMatchesAll ? 1 : 0) - (a.nameMatchesAll ? 1 : 0));

      const total = matches.length;
      if (total === 0) {
        countLine.textContent = `「${query}」に合う作業は見つかりませんでした。LINEでご相談ください。`;
      } else if (total <= 3) {
        countLine.textContent = `「${query}」に合う作業 ${total}本`;
      } else {
        countLine.textContent = `「${query}」に合う作業 ${total}本（うち3本を表示）`;
      }

      list.textContent = '';
      matches.slice(0, 3).forEach((row, index) => {
        const item = document.createElement('li');
        item.style.setProperty('--i', index);
        const sector = document.createElement('p');
        sector.className = 'gift-sector';
        sector.textContent = `事業：${row.industry}`;
        const heading = document.createElement('h3');
        heading.textContent = row.name;
        const does = document.createElement('p');
        does.textContent = `AIがすること：${row.does}`;
        item.append(sector, heading, does);
        list.append(item);
      });
      resultsBox.hidden = false;
    };

    let debounceTimer = null;
    const searchNow = () => {
      clearTimeout(debounceTimer);
      runSearch(input.value);
    };
    input.addEventListener('focus', loadSkills, { once: true });
    input.addEventListener('input', () => {
      syncClear();
      loadSkills();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(input.value), 200);
    });
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchNow();
    });
    catalogSection.querySelectorAll('.gift-search-hints [data-q]').forEach((button) => {
      button.addEventListener('click', () => {
        input.value = button.getAttribute('data-q');
        syncClear();
        loadSkills();
        searchNow();
      });
    });

    if ('IntersectionObserver' in window) {
      const prefetchObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          prefetchObserver.disconnect();
          loadSkills();
        },
        { rootMargin: '600px 0px' },
      );
      prefetchObserver.observe(catalogSection);
    }

    const isRendered = (el) => !!el && !!el.getClientRects().length;
    moreLink.addEventListener('click', (event) => {
      event.preventDefault();
      const qrSpace = document.querySelector('.gift-qr-space');
      const target = isRendered(qrSpace) ? qrSpace : document.querySelector('.gift-line-card');
      target?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'center',
      });
    });
  }

  // 本数のカウントアップ: 各グループ（事業名の下・カタログの統計行）が画面に入った瞬間に 0 から実数へ増える。
  const countGroups = document.querySelectorAll('[data-count-group]');
  if (
    countGroups.length &&
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const easeOutCubic = (t) => 1 - (1 - t) ** 3;
    const animateCount = (node) => {
      const target = Number(node.getAttribute('data-count-to'));
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        node.textContent = String(Math.round(target * easeOutCubic(progress)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countObserver.unobserve(entry.target);
          entry.target.classList.add('is-counted');
          entry.target.querySelectorAll('.gift-count').forEach(animateCount);
        });
      },
      { threshold: 0.4 },
    );
    countGroups.forEach((group) => {
      // Zero only the groups that start below the fold; the first-view one counts up straight away.
      if (group.getBoundingClientRect().top > window.innerHeight) {
        group.setAttribute('data-count-armed', '');
        group.querySelectorAll('.gift-count').forEach((node) => { node.textContent = '0'; });
      }
      countObserver.observe(group);
    });
  }

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
