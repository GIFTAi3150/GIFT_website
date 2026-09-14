import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

// Run against a local dev/production server. Height-only resizes model an in-app
// browser toolbar; real orientation changes still need to update the layout.
const engine = process.env.HERO_TEST_ENGINE === 'webkit' ? webkit : chromium;
const browser = await engine.launch({ headless: true });
const failures = [];
try {
  for (const initialHeight of [844, 780]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: initialHeight },
      isMobile: true,
      hasTouch: true,
    });
    await page.goto(
      `${process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development'}`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForSelector('[data-time-travel][data-animated]');
    await page.waitForTimeout(1600);
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const read = () =>
      page.evaluate(() => {
        const hero = document.querySelector('[data-time-travel]');
        const viewport = hero.querySelector('[data-pixel-viewport]').getBoundingClientRect();
        const title = hero.querySelector('[data-browser-era="retro"] h2').getBoundingClientRect();
        return {
          y: scrollY,
          height: viewport.height,
          titleY: title.top - viewport.top,
          progress: Number(getComputedStyle(hero).getPropertyValue('--era-progress')),
        };
      });
    const baseline = await read();
    const samples = [];
    for (const height of [initialHeight - 60, initialHeight, initialHeight + 60, initialHeight]) {
      await page.setViewportSize({ width: 390, height });
      await page.evaluate(() => window.dispatchEvent(new Event('gift:layout')));
      await page.waitForTimeout(500);
      samples.push(await read());
    }
    console.log(JSON.stringify({ initialHeight, baseline, samples }));
    try {
      for (const sample of samples) {
        assert.ok(Math.abs(sample.y - baseline.y) <= 1, 'toolbar resize moved document scroll');
        assert.ok(
          Math.abs(sample.height - baseline.height) <= 1,
          'toolbar resize changed hero height',
        );
        assert.ok(
          Math.abs(sample.titleY - baseline.titleY) <= 1,
          'toolbar resize moved hero content',
        );
        assert.ok(
          Math.abs(sample.progress - baseline.progress) <= 0.002,
          'toolbar resize rewound animation',
        );
      }
    } catch (error) {
      failures.push(`${initialHeight}px: ${error.message}`);
    }
    let previous = -1;
    for (let step = 1; step <= 8; step += 1) {
      await page.setViewportSize({ width: 390, height: initialHeight - (step % 2) * 60 });
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: 'instant' });
        window.dispatchEvent(new Event('gift:layout'));
      }, step * 100);
      await page.waitForTimeout(400);
      const sample = await read();
      assert.ok(
        Math.abs(sample.y - step * 100) <= 1,
        'layout refresh restored an older scroll position',
      );
      assert.ok(sample.progress >= previous, 'downward scrolling reversed the reveal');
      previous = sample.progress;
    }
    await page.setViewportSize({ width: 390, height: initialHeight });
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
    await page.waitForTimeout(500);
    assert.ok(
      (await read()).progress < previous,
      'deliberate upward scrolling should reverse the reveal',
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);
    assert.equal(await page.locator('[data-hero-scroll-cue]').getAttribute('role'), null);
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
    await page
      .locator('[data-time-travel]')
      .evaluate((hero) => window.scrollTo({ top: hero.offsetHeight, behavior: 'instant' }));
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-time-travel]');
      return hero.getBoundingClientRect().bottom <= 1;
    });
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const rotated = await read();
    assert.ok(rotated.height < baseline.height, 'rotation did not update the frozen layout');
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'rotation caused horizontal overflow',
    );
    console.log('Downward scrolling, intentional reverse, full reveal, and rotation passed.');
    await page.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(failures, [], failures.join('\n'));
console.log('Hero toolbar-resize regression checks passed.');
