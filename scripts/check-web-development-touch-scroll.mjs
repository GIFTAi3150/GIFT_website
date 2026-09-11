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
          window.swipeFrames.push({
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
          if (step === 8) await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
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
        `chromium: ${state.frames.length} frames of native touch swipes stayed monotonic through the modern reveal`,
      );
    }
  } finally {
    await browser.close();
  }
}
