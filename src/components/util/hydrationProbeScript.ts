/**
 * TEMPORARY DIAGNOSTIC — remove once the iOS React #418/#422 hydration mismatch
 * is root-caused. See memory: project_react_hydration_418_open.
 *
 * The mismatch only fires on real iPhones (Safari + Chrome-iOS). Local WebKit
 * (Playwright, iPhone 13 descriptor) renders zero hydration warnings, so the
 * agent that rewrites the DOM lives on the device — a translator, a content
 * blocker, iOS data detectors — and we cannot see it from here. This script
 * catches it in the act, on the device, without needing a Mac + Web Inspector.
 *
 * Three instruments, in order of value:
 *
 * 1. MUTATION RECORDER. Installed in <head>, so it is watching from the first
 *    parsed byte. The discriminator that makes this readable: **the HTML parser
 *    only ever appends.** It never removes a node, never rewrites the text of an
 *    existing one, never changes an attribute after insertion. So a removal, an
 *    attribute change, or a text edit that is not a pure append is, by
 *    construction, NOT the parser — it is another agent touching our DOM. Those
 *    are recorded verbatim; plain parser appends are only counted. Recording
 *    stops shortly after React mounts, so React's own repair work doesn't drown
 *    the signal.
 *
 * 2. REWRITER FINGERPRINTS. A targeted scan for the calling cards known DOM
 *    rewriters leave behind (iOS data detectors, translators, password managers,
 *    content blockers), sampled at DOMContentLoaded, at hydration, and at load.
 *
 * 3. CONSOLE CAPTURE. Dev React prints the full hydration mismatch (the exact
 *    differing element and text) to console.error; prod React prints "Minified
 *    React error #418". Both are captured, plus window.onerror.
 *
 * Everything is POSTed to /api/probe, which prints it to the server log — the
 * `next dev` terminal locally, Vercel runtime logs in production.
 *
 * NOTE: an earlier version of this probe re-fetched the page and structurally
 * diffed the server HTML against the live DOM. That does not work: the server
 * HTML contains React's streaming placeholders (<template id="B:0">, div#S:0,
 * the $RS/$RC fixup scripts) which the browser resolves into real content before
 * hydration, so the two trees differ enormously for entirely innocent reasons.
 * Don't reintroduce it.
 *
 * Costs nothing unless explicitly asked for: only injected in dev or when
 * HYDRATION_PROBE=on, and even then it no-ops unless the URL carries ?probe=1.
 */
export const HYDRATION_PROBE_JS = `(function () {
  // STICKY ARMING. The bug did not fire on a ?probe=1&x=1 load — but that URL is
  // cache-busted by construction, so it tests the one condition under which a
  // cache-related mismatch cannot happen. And a URL you have to type is never the
  // URL a normal visit uses. So ?probe=1 ARMS the probe for this device, and it
  // then runs on every subsequent page load — normal browsing, normal URLs, warm
  // cache, back/forward — until ?probe=0 disarms it. Findings persist across
  // loads, so a mismatch on page 3 is still readable on page 5.
  var armed = false;
  try {
    if (location.search.indexOf('probe=0') !== -1) { localStorage.removeItem('giftProbe'); return; }
    if (location.search.indexOf('probe=1') !== -1) { localStorage.setItem('giftProbe', 'on'); armed = true; }
    else armed = localStorage.getItem('giftProbe') === 'on';
  } catch (e) {
    armed = location.search.indexOf('probe=1') !== -1;
  }
  if (!armed) return;
  if (window.__giftProbe) return;
  window.__giftProbe = true;

  // How did we ARRIVE at this page? A hydration mismatch that only shows up on a
  // reload, or on a back/forward (bfcache) restore, or only on a warm cache, is a
  // completely different bug from one that fires on a cold navigate — and we have
  // so far only ever tested cold navigates.
  var navType = 'unknown';
  try {
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type) navType = nav.type;
    if (nav && typeof nav.transferSize === 'number') {
      navType += nav.transferSize === 0 ? ' (from-cache)' : ' (from-network)';
    }
  } catch (e) {}

  var t0 = Date.now();
  var since = function () { return Date.now() - t0; };
  var logs = [];
  var muts = [];
  var counts = { parserAppends: 0, dropped: 0 };
  var phase = 'parsing';
  var fingerprints = {};

  /* ---------- 3. console / onerror capture ---------- */
  var ser = function (a) {
    try {
      if (typeof a === 'string') return a;
      if (a && a.stack && a.message) return a.name + ': ' + a.message + ' @ ' + a.stack;
      return JSON.stringify(a);
    } catch (e) { return String(a); }
  };
  var wrap = function (level) {
    var orig = console[level] ? console[level].bind(console) : function () {};
    console[level] = function () {
      try {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) parts.push(ser(arguments[i]));
        if (logs.length < 40) logs.push({ t: since(), level: level, text: parts.join(' ¦ ').slice(0, 1500) });
      } catch (e) {}
      return orig.apply(console, arguments);
    };
  };
  wrap('error');
  wrap('warn');
  window.addEventListener('error', function (e) {
    if (logs.length < 40) {
      logs.push({ t: since(), level: 'onerror', text: String(e.message || '') + ' @ ' + String(e.filename || '') + ':' + e.lineno });
    }
  }, true);

  /* ---------- shared helpers ---------- */
  var desc = function (n) {
    if (!n) return 'null';
    if (n.nodeType === 3) return '#text("' + String(n.data).slice(0, 90).replace(/\\s+/g, ' ') + '")';
    if (n.nodeType === 8) return '#comment';
    if (n.nodeType !== 1) return 'nodeType' + n.nodeType;
    var s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    var c = n.getAttribute && n.getAttribute('class');
    if (c) s += '.' + String(c).trim().split(/\\s+/).slice(0, 3).join('.');
    var u = n.getAttribute && (n.getAttribute('src') || n.getAttribute('href'));
    if (u) s += '[' + String(u).slice(0, 70) + ']';
    return s;
  };
  var pathOf = function (n) {
    var parts = [], hops = 0;
    while (n && hops < 6) {
      parts.unshift(desc(n));
      n = n.parentNode;
      hops++;
      if (n === document.documentElement) { parts.unshift('html'); break; }
    }
    return parts.join(' > ');
  };
  // Pre-hydration DOM edits we make ourselves — not the bug we are hunting.
  var ours = function (node, attr) {
    if (!node || node.nodeType !== 1) return false;
    if (node.id === 'page-cover') return true;
    if (node.tagName === 'BODY' && attr === 'class') return true;
    var u = (node.getAttribute && (node.getAttribute('src') || '')) || '';
    if (/googletagmanager|clarity\\.ms|gtag/.test(u)) return true;
    if (node.tagName === 'NEXTJS-PORTAL') return true;
    if (node.id && /nextjs|__next-build-watcher/.test(node.id)) return true;
    // React's streaming fixup: $RS/$RC inline scripts swap suspense placeholders
    // for real content before hydration. Legitimate, and it does remove nodes.
    if (node.tagName === 'SCRIPT' && !u) return true;
    if (node.tagName === 'TEMPLATE') return true;
    if (node.id && /^[SPB]:\\d+$/.test(node.id)) return true;
    return false;
  };

  /* ---------- 1. mutation recorder ---------- */
  var record = function (m) {
    if (muts.length >= 80) { counts.dropped++; return; }
    m.t = since();
    m.phase = phase;
    muts.push(m);
  };
  var obs = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var target = r.target;

      if (r.type === 'attributes') {
        if (ours(target, r.attributeName)) continue;
        record({
          kind: 'attr',
          at: pathOf(target),
          attr: r.attributeName,
          from: String(r.oldValue).slice(0, 120),
          to: String(target.getAttribute(r.attributeName)).slice(0, 120)
        });
        continue;
      }

      if (r.type === 'characterData') {
        var oldV = String(r.oldValue == null ? '' : r.oldValue);
        var newV = String(target.data == null ? '' : target.data);
        // The parser streams text in by APPENDING to an existing text node, so a
        // pure append is parser noise. Anything else rewrote our text.
        if (newV.indexOf(oldV) === 0) { counts.parserAppends++; continue; }
        record({
          kind: 'text-rewrite',
          at: pathOf(target.parentNode),
          from: oldV.slice(0, 120),
          to: newV.slice(0, 120)
        });
        continue;
      }

      if (r.type === 'childList') {
        // REMOVALS: the parser never removes. Always someone else.
        if (r.removedNodes.length && !ours(target)) {
          var removed = [];
          for (var j = 0; j < r.removedNodes.length && j < 4; j++) {
            if (!ours(r.removedNodes[j])) removed.push(desc(r.removedNodes[j]));
          }
          if (removed.length) {
            var added = [];
            for (var k = 0; k < r.addedNodes.length && k < 4; k++) added.push(desc(r.addedNodes[k]));
            record({
              kind: 'replace',
              at: pathOf(target),
              removed: removed,
              addedInPlace: added
            });
            continue;
          }
        }
        // ADDITIONS while parsing are the parser building our own page — noise.
        // Additions AFTER the parser finished, but before React hydrates, are
        // someone injecting into a finished document.
        if (r.addedNodes.length) {
          if (phase === 'parsing') { counts.parserAppends += r.addedNodes.length; continue; }
          for (var a = 0; a < r.addedNodes.length && a < 4; a++) {
            var n = r.addedNodes[a];
            if (ours(n) || ours(target)) continue;
            record({ kind: 'inject', at: pathOf(target), node: desc(n) });
          }
        }
      }
    }
  });
  try {
    obs.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    });
  } catch (e) {}

  /* ---------- 2. rewriter fingerprints ---------- */
  var PRINTS = [
    ['ios-data-detectors', '[x-apple-data-detectors], [data-detector], a[href^="tel:"]:not([data-gift]), a[href^="mailto:"]'],
    ['translator-font-wrap', 'font[_msttexthash], font[_mstmutation], font[style*="vertical-align"], html[class*="translated"]'],
    ['generic-translate', '[_msthash], [data-translated], [translate-marker], .translated-ltr, .translated-rtl'],
    ['password-manager', '[data-lastpass-icon-root], [data-1p-ignore], [data-bwignore], grammarly-extension, [data-dashlane-rid]'],
    ['injected-frames', 'body > iframe, html > iframe'],
    ['extension-nodes', '[id*="grammarly"], [class*="adguard"], [id*="adguard"], [class*="1password"]']
  ];
  var scan = function (stage) {
    var found = {};
    for (var i = 0; i < PRINTS.length; i++) {
      try {
        var hits = document.querySelectorAll(PRINTS[i][1]);
        if (hits.length) {
          var samples = [];
          for (var j = 0; j < hits.length && j < 3; j++) {
            samples.push(desc(hits[j]) + ' :: ' + String(hits[j].outerHTML || '').slice(0, 120));
          }
          found[PRINTS[i][0]] = { count: hits.length, samples: samples };
        }
      } catch (e) {}
    }
    // <font> tags are a classic translate wrapper and we never author them.
    try {
      var fonts = document.getElementsByTagName('font');
      if (fonts.length) found['font-tags'] = { count: fonts.length, samples: [String(fonts[0].outerHTML || '').slice(0, 150)] };
    } catch (e) {}
    fingerprints[stage] = found;
  };

  /* ---------- lifecycle ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { phase = 'post-dcl'; scan('dcl'); });
  } else {
    phase = 'post-dcl';
    scan('dcl');
  }
  // React sets a __reactContainer\$… key on the hydration container (document)
  // inside hydrateRoot(), i.e. the moment hydration begins.
  var reactAt = null;
  var poll = setInterval(function () {
    for (var k in document) {
      if (k.indexOf('__reactContainer') === 0) {
        reactAt = since();
        phase = 'hydrating';
        scan('react-mounted');
        clearInterval(poll);
        // Let React's own repair land, then stop recording.
        setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 400);
        return;
      }
    }
    if (since() > 20000) clearInterval(poll);
  }, 25);

  /* ---------- on-screen readout ---------- */
  // Production React only prints "Minified React error #418" — no element, no
  // component. So the phone needs to SHOW us what it saw. Painted 3s after load,
  // i.e. long after hydration has finished, so it cannot perturb the very thing
  // we are measuring. Only ever runs under ?probe=1.
  var paint = function (payload) {
    try {
      var hyd = [];
      for (var i = 0; i < payload.logs.length; i++) {
        var L = payload.logs[i];
        if (/418|422|423|425|hydrat|did not match|server html/i.test(L.text)) hyd.push(L);
      }
      // Persist hits across page loads: the mismatch may fire on a page you
      // reached three navigations ago, and it must still be readable here.
      var history = [];
      try {
        history = JSON.parse(localStorage.getItem('giftProbeHits') || '[]');
        for (var q = 0; q < hyd.length; q++) {
          history.push({ url: location.pathname + location.search, nav: navType, text: hyd[q].text.slice(0, 400) });
        }
        while (history.length > 10) history.shift();
        localStorage.setItem('giftProbeHits', JSON.stringify(history));
      } catch (e) {}
      var everHit = history.length > 0;
      var pre = [];
      for (var m = 0; m < payload.mutations.length; m++) {
        if (payload.mutations[m].phase !== 'hydrating') pre.push(payload.mutations[m]);
      }
      var accent = everHit ? '#ff4d4f' : '#22c55e';
      var box = document.createElement('div');
      box.setAttribute('style', [
        'position:fixed', 'left:0', 'right:0', 'bottom:0',
        'max-height:' + (everHit ? '60vh' : '90px'), 'overflow:auto',
        'z-index:2147483647', 'background:#0b1020', 'color:#e6edf3', 'font:11px/1.45 ui-monospace,Menlo,monospace',
        'padding:10px 12px', 'border-top:3px solid ' + accent,
        '-webkit-overflow-scrolling:touch', 'white-space:pre-wrap', 'word-break:break-word'
      ].join(';'));
      var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      var html = '<b style="color:' + accent + '">' +
        (everHit ? '● HYDRATION ERROR CAUGHT ×' + history.length + ' — SCREENSHOT THIS' : '○ armed · nothing caught yet') +
        '</b>  <span style="opacity:.6">tap to dismiss</span>\\n' +
        'this load: ' + esc(location.pathname) + ' · nav: ' + esc(navType) + '\\n' +
        'react +' + payload.reactMountedAt + 'ms · pre-hyd mutations: ' + pre.length +
        ' · console errors: ' + payload.logs.length + '\\n';
      for (var h = 0; h < history.length && h < 5; h++) {
        html += '\\n<span style="color:#ffb4b4">[' + esc(history[h].url) + ' · ' + esc(history[h].nav) + ']\\n' +
          esc(history[h].text) + '</span>\\n';
      }
      if (!everHit) {
        box.innerHTML = html + '<span style="opacity:.6">browse the site normally — reload, tap around, use back/forward. Probe stays armed. Visit /?probe=0 to switch off.</span>';
        box.addEventListener('click', function () { box.remove(); });
        document.body.appendChild(box);
        return;
      }
      var fpKeys = [];
      var fpLoad = payload.fingerprints['load'] || {};
      for (var f in fpLoad) fpKeys.push(f + '×' + fpLoad[f].count);
      html += '\\nfingerprints: ' + (fpKeys.length ? esc(fpKeys.join(', ')) : 'none');
      html += '\\n\\n<span style="opacity:.75">pre-hydration mutations:</span>\\n';
      for (var p = 0; p < pre.length && p < 12; p++) {
        html += esc(JSON.stringify(pre[p])).slice(0, 300) + '\\n';
      }
      if (payload.logs.length && !hyd.length) {
        html += '\\n<span style="opacity:.75">other console output:</span>\\n';
        for (var o = 0; o < payload.logs.length && o < 5; o++) {
          html += esc('[' + payload.logs[o].level + '] ' + payload.logs[o].text.slice(0, 200)) + '\\n';
        }
      }
      box.innerHTML = html;
      box.addEventListener('click', function () { box.remove(); });
      document.body.appendChild(box);
    } catch (e) {}
  };

  var report = function () {
    scan('load');
    try { obs.disconnect(); } catch (e) {}
    var payload = {
      url: location.href,
      navType: navType,
      ua: navigator.userAgent,
      lang: navigator.language,
      langs: (navigator.languages || []).join(','),
      viewport: window.innerWidth + 'x' + window.innerHeight,
      dpr: window.devicePixelRatio,
      reactMountedAt: reactAt,
      counts: counts,
      fingerprints: fingerprints,
      mutations: muts,
      logs: logs
    };
    try {
      fetch('/api/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    paint(payload);
  };

  var fire = function () { setTimeout(report, 3000); };
  if (document.readyState === 'complete') fire();
  else window.addEventListener('load', fire, { once: true });
})();`;
