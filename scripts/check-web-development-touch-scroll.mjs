import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const origin = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    page.setDefaultTimeout(30000);
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-time-travel][data-animated]');
    await page.waitForTimeout(1600);
    const clippedAncestors = await page.locator('[data-time-travel]').evaluate((hero) => {
      const clipped = [];
      for (
        let el = hero.parentElement;
        el && el !== document.documentElement;
        el = el.parentElement
      ) {
        if (getComputedStyle(el).overflowX !== 'visible') clipped.push(el.tagName);
      }
      return clipped;
    });
    assert.deepEqual(clippedAncestors, [], 'mobile sticky hero has a page-wide clipping ancestor');
    const tileCount = await page.locator('[data-pixel-tiles] rect').count();
    assert.ok(tileCount > 0 && tileCount <= 80, 'mobile uses a smaller pixel grid');
    assert.equal(await page.locator('[data-pixel-mask] rect').count(), tileCount);
    assert.match(
      await page
        .locator('[data-browser-era="modern"]')
        .evaluate((el) => getComputedStyle(el).clipPath),
      /url\(/,
      'mobile uses the same pixel mask transition as desktop',
    );
    assert.equal(
      await page
        .locator('[data-pixel-mask] rect')
        .evaluateAll((rects) => rects.every((rect) => Number(rect.getAttribute('width')) === 0)),
      true,
      'retro is fully visible at the start',
    );

    await page.evaluate(() => scrollTo({ top: 320, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      window.scrollWrites = [];
      const original = window.scrollTo;
      window.scrollTo = function (...args) {
        window.scrollWrites.push({ args, from: scrollY });
        return original.apply(window, args);
      };
    });
    const progress = () =>
      page
        .locator('[data-time-travel]')
        .evaluate((el) => Number(el.style.getPropertyValue('--era-progress')));
    const before = await progress();
    assert.ok(before > 0 && before < 1, 'scrolling must reveal the modern website');
    for (const event of ['gift:layout', 'load', 'gift:route-styles-ready']) {
      await page.evaluate((type) => dispatchEvent(new Event(type)), event);
      await page.waitForTimeout(500);
      assert.deepEqual(
        await page.evaluate(() => window.scrollWrites),
        [],
        `${engine.name()}: ${event} wrote the document scroll position`,
      );
      assert.equal(await page.evaluate(() => scrollY), 320);
      assert.equal(await progress(), before, `${engine.name()}: refresh rewound the reveal`);
    }
    await page.setViewportSize({ width: 390, height: 784 });
    await page.waitForTimeout(600);
    assert.deepEqual(
      await page.evaluate(() => window.scrollWrites),
      [],
      'toolbar issued scroll commands',
    );
    assert.equal(await progress(), before);
    console.log(
      `${engine.name()}: layout/load/toolbar refreshes issue zero document scroll commands`,
    );

    if (engine === chromium) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        window.scrollWrites = [];
        window.swipeFrames = [];
        const sample = () => {
          const hero = document.querySelector('[data-time-travel]');
          const stage = hero.querySelector('[data-pixel-viewport]').parentElement;
          const heroRect = hero.getBoundingClientRect();
          const stageRect = stage.getBoundingClientRect();
          const expectedTop = Math.min(
            Math.max(heroRect.top + 80, 80),
            heroRect.bottom - stageRect.height,
          );
          window.swipeFrames.push({
            stageError: stageRect.top - expectedTop,
            stageHeight: stageRect.height,
            y: scrollY,
            p: Number(
              document.querySelector('[data-time-travel]').style.getPropertyValue('--era-progress'),
            ),
          });
          window.sampleFrame = requestAnimationFrame(sample);
        };
        window.sampleFrame = requestAnimationFrame(sample);
      });
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        window.swipeFrames = [];
      });
      const cdp = await page.context().newCDPSession(page);
      for (let swipe = 0; swipe < 3; swipe++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: 195, y: 650 }],
        });
        for (let step = 1; step <= 20; step++) {
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: 195, y: 650 - step * 16 }],
          });
          if (step === 8) {
            await page.setViewportSize({ width: 390, height: swipe % 2 ? 844 : 784 });
            await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
          }
          await page.waitForTimeout(20);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(400);
      }
      const state = await page.evaluate(() => {
        cancelAnimationFrame(window.sampleFrame);
        return {
          frames: window.swipeFrames,
          writes: window.scrollWrites,
          era: document.querySelector('[data-time-travel]').dataset.era,
          y: scrollY,
        };
      });
      assert.ok(state.y > 800, 'touch swipes did not move the document');
      assert.equal(state.era, 'modern');
      assert.deepEqual(state.writes, [], 'animation interrupted native touch scrolling');
      for (const frame of state.frames) {
        assert.ok(
          Math.abs(frame.stageError) <= 1,
          'sticky hero jumped away from its expected position',
        );
        assert.equal(
          frame.stageHeight,
          state.frames[0].stageHeight,
          'toolbar resized the scene during a swipe',
        );
      }
      for (let i = 1; i < state.frames.length; i++) {
        assert.ok(
          state.frames[i].y >= state.frames[i - 1].y - 1,
          'a downward swipe moved the page up',
        );
        assert.ok(
          state.frames[i].p >= state.frames[i - 1].p - 0.002,
          'a downward swipe reversed the reveal',
        );
      }
      console.log(
        `chromium: ${state.frames.length} frames of native touch swipes stayed monotonic through the mobile hero`,
      );
    }
  } finally {
    await browser.close();
  }
}
