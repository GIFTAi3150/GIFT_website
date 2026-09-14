// Regression: open DevTools from desktop with responsive device mode remembered.
// Run against a local dev server: node scripts/check-devtools-resize.mjs [origin]
// Uses an isolated installed-Chrome profile; never changes the user's profile.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const origin = process.argv[2] || 'http://127.0.0.1:3000';
const profile = await mkdtemp(join(tmpdir(), 'gift-devtools-resize-'));
let context;
try {
  await mkdir(join(profile, 'Default'));
  await writeFile(join(profile, 'Default', 'Preferences'), JSON.stringify({
    devtools: { preferences: {
      currentDockState: '"right"',
      'emulation.device-width': '410',
      'emulation.show-device-mode': 'true',
      'emulation.device-mode-value': '{"device":"","orientation":"","mode":""}',
      'inspector-view.split-view-state': '{"vertical":{"size":582}}',
    } },
  }));
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: false, viewport: null,
    args: ['--window-size=1600,1000'],
  });
  const page = context.pages()[0];
  const browserSession = await context.browser().newBrowserCDPSession();
  const pageSession = await context.newCDPSession(page);
  const { targetInfo } = await pageSession.send('Target.getTargetInfo');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const closeDevTools = async () => {
    const { targetInfos } = await browserSession.send('Target.getTargets');
    for (const target of targetInfos.filter((target) => target.url.startsWith('devtools:'))) {
      await browserSession.send('Target.closeTarget', { targetId: target.targetId });
    }
    await page.waitForFunction(() => innerWidth >= 900 && visualViewport.scale === 1);
  };
  for (const route of ['/services/web-development', '/']) {
    await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.querySelector('[data-flash-guard]'));
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      window.__resizeSamples = [];
      window.addEventListener('resize', () => {
        window.__resizeSamples.push({
          width: innerWidth, height: innerHeight,
          frozen: document.documentElement.style.getPropertyValue('--svh-frozen'),
        });
      });
    });
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await browserSession.send('Target.openDevTools', { targetId: targetInfo.targetId });
      await page.waitForFunction(() => innerWidth >= 400 && innerWidth <= 420);
      // Allow the viewport-freeze settle timer and scroll refresh to complete.
      await page.waitForTimeout(700);
      const result = await page.evaluate(() => ({
        width: innerWidth, visualWidth: visualViewport.width, scale: visualViewport.scale,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        frozen: parseFloat(document.documentElement.style.getPropertyValue('--svh-frozen')),
        badMeasurements: window.__resizeSamples.filter((sample) => parseFloat(sample.frozen) <= 1),
      }));
      if (result.scale !== 1) {
        const samples = await page.evaluate(() => window.__resizeSamples);
        console.error(JSON.stringify({ route, result, samples }));
      }
      assert.equal(result.scale, 1, `${route}: DevTools unexpectedly zoomed the page`);
      assert.ok(Math.abs(result.visualWidth - result.width) <= 1, 'Visual and layout widths differ');
      assert.equal(result.overflow, false, 'Document overflows horizontally');
      assert.ok(result.frozen > 1, 'Frozen viewport has a transient size');
      assert.deepEqual(result.badMeasurements, [], 'Saved a transient 1px viewport');
      // Native vertical scrolling must still work with overflow-x: clip on body.
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForFunction(() => scrollY > 0);
      await page.evaluate(() => window.scrollTo(0, 0));
      console.log(`${route} cycle ${cycle + 1}: scale=${result.scale}, width=${result.width}, no overflow`);
      await closeDevTools();
    }
  }
  // The fix must preserve intentional pinch zoom.
  await browserSession.send('Target.openDevTools', { targetId: targetInfo.targetId });
  await page.waitForFunction(() => innerWidth >= 400 && innerWidth <= 420);
  await pageSession.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  assert.equal(await page.evaluate(() => visualViewport.scale), 2, 'User zoom was disabled');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: DevTools transitions, vertical scrolling, viewport measurements, and user zoom.');
} finally {
  await context?.close();
  assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
  assert.ok(basename(profile).startsWith('gift-devtools-resize-'));
  await rm(profile, { recursive: true, force: true });
}
