import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

// Alternate wheel events between the page gutter and the interactive preview
// while smooth scrolling is still running. An unconditional native-scroll
// exemption used to advance the reveal, then let Lenis rewind it on the next frame.
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const height of [900, 600]) {
      const page = await browser.newPage({ viewport: { width: 1440, height } });
      await page.goto(
        process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development',
        { waitUntil: 'networkidle' },
      );
      await page.waitForSelector('#included[data-build-scrub]');
      await page.waitForTimeout(1800);
      await page.evaluate(() => {
        const hero = document.querySelector('[data-time-travel]');
        window.heroWheelFrames = [];
        window.heroWheelRecording = true;
        const sample = () => {
          window.heroWheelFrames.push({
            y: scrollY,
            p: +hero.style.getPropertyValue('--era-progress'),
          });
          if (window.heroWheelRecording) requestAnimationFrame(sample);
        };
        sample();
      });
      for (let step = 0; step < 14; step++) {
        await page.mouse.move(step % 2 ? 700 : 12, height / 2);
        await page.mouse.wheel(0, 480);
        await page.waitForTimeout(70);
      }
      await page.waitForTimeout(1400);
      const frames = await page.evaluate(() => {
        window.heroWheelRecording = false;
        return window.heroWheelFrames;
      });
      const backwards = frames.flatMap((frame, index) => {
        const previous = frames[index - 1];
        return previous && (frame.y < previous.y - 2 || frame.p < previous.p - 0.005)
          ? [{ previous, frame }]
          : [];
      });
      assert.deepEqual(backwards, [], 'downward wheel input rewound the page or hero');
      assert.equal(frames.at(-1).p, 1, 'wheel sequence did not reach modern');

      await page.evaluate(() => window.dispatchEvent(new Event('gift:layout')));
      await page.waitForTimeout(600);
      assert.equal(
        await page.locator('[data-time-travel]').getAttribute('data-era'),
        'modern',
        JSON.stringify(
          await page.locator('[data-time-travel]').evaluate((el) => ({
            y: scrollY,
            p: el.style.getPropertyValue('--era-progress'),
            top: el.getBoundingClientRect().top,
            height: el.offsetHeight,
          })),
        ),
      );
      // Genuine upward input must still take the visitor back through the eras.
      await page.mouse.move(12, height / 2);
      for (let step = 0; step < 8; step++) await page.mouse.wheel(0, -1000);
      await page.waitForTimeout(1600);
      assert.equal(await page.locator('[data-time-travel]').getAttribute('data-era'), 'retro');
      assert.ok(await page.evaluate(() => scrollY < 2));

      await page.locator('[data-time-travel]').evaluate((hero) => {
        const css = getComputedStyle(document.documentElement);
        const distance =
          hero.offsetHeight -
          parseFloat(css.getPropertyValue('--svh-frozen')) -
          parseFloat(css.getPropertyValue('--vh-frozen')) *
            parseFloat(getComputedStyle(hero).getPropertyValue('--wd-rest'));
        window.scrollTo({ top: distance * 0.95, behavior: 'instant' });
      });
      await page.waitForFunction(
        () => document.querySelector('[data-time-travel]').dataset.era === 'modern',
      );
      await page.waitForTimeout(500);
      const preview = page.locator('[data-browser-era="modern"] [data-wd-browser-page]');
      const canScroll = await preview.evaluate((el) => el.scrollHeight > el.clientHeight + 2);
      if (canScroll) {
        const before = await page.evaluate(() => scrollY);
        await preview.hover();
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(400);
        assert.ok(await preview.evaluate((el) => el.scrollTop > 0), 'nested preview cannot scroll');
        assert.ok(
          Math.abs((await page.evaluate(() => scrollY)) - before) < 2,
          'nested scrolling moved the document',
        );
      }
      await page.mouse.move(12, height / 2);
      await page.mouse.wheel(0, 3000);
      await page.waitForFunction(
        () => document.querySelector('[data-time-travel]').getBoundingClientRect().bottom <= 1,
      );
      console.log(
        `${engine.name()} 1440x${height}: ${frames.length} forward frames without rewinds; reverse, refresh${canScroll ? ', nested preview' : ''} passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
