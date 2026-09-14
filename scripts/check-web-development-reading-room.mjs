import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
await mkdir('.inspect/reading-room', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: width < 900,
      hasTouch: width < 900,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-time-travel][data-animated]');
    await page.waitForTimeout(1600);

    for (const selector of [
      '[data-time-travel]',
      '.wd-manifesto',
      '.wd-worries',
      '.wd-included',
      '.wd-prepare',
      '.wd-pages',
      ...(width >= 900 ? ['.wd-approach'] : []),
    ]) {
      const geometry = await page.locator(selector).evaluate((section) => {
        const css = getComputedStyle(document.documentElement);
        const viewport = parseFloat(css.getPropertyValue('--svh-frozen'));
        const scrollViewport = parseFloat(css.getPropertyValue('--vh-frozen'));
        const rest = parseFloat(getComputedStyle(section).getPropertyValue('--wd-rest'));
        return {
          start: scrollY + section.getBoundingClientRect().top,
          animation: section.offsetHeight - viewport - rest * scrollViewport,
          viewport: scrollViewport,
        };
      });
      const samples = [];
      for (const hold of [0.05, 0.75]) {
        await page.evaluate(
          (top) => scrollTo({ top, behavior: 'instant' }),
          geometry.start + geometry.animation + geometry.viewport * hold,
        );
        await page.waitForTimeout(1100);
        samples.push(
          await page.locator(selector).evaluate((section) => {
            const frame =
              section.querySelector('.wd-frame') || section.firstElementChild.nextElementSibling;
            const nodes = section.querySelectorAll(
              '[data-lock], [data-lock-lead], [data-worry-answer], [data-hand-noun], ' +
                '[data-hand-note], [data-hand-left], [data-sheet]',
            );
            return {
              frameTop: frame.getBoundingClientRect().top,
              transforms: [...nodes].map((node) => getComputedStyle(node).transform),
              heroProgress: section.style.getPropertyValue('--era-progress'),
              step: section.querySelector('[data-build]')?.dataset.step,
              craft: section
                .querySelector('[data-craft]')
                ?.style.getPropertyValue('--craft-progress'),
              nextTop: section.nextElementSibling.getBoundingClientRect().top,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          }),
        );
      }
      const [before, after] = samples;
      assert.ok(
        Math.abs(before.frameTop - after.frameTop) < 1,
        `${selector}: frame left too early`,
      );
      assert.deepEqual(
        after.transforms,
        before.transforms,
        `${selector}: text still entering during rest`,
      );
      assert.ok(after.nextTop >= height - 1, `${selector}: next section covers the reading beat`);
      assert.ok(!after.overflow, `${selector}: horizontal overflow`);
      if (selector === '[data-time-travel]') assert.equal(Number(after.heroProgress), 1);
      if (selector === '.wd-included') assert.equal(after.step, '6');
      if (selector === '.wd-approach') assert.equal(Number(after.craft), 1);
      console.log(
        `${width}px ${selector}: completed content stays in place through the reading beat`,
      );
      if (['[data-time-travel]', '.wd-pages'].includes(selector)) {
        await page.screenshot({
          path: `.inspect/reading-room/${width}-${selector === '.wd-pages' ? 'pages' : 'hero'}.png`,
        });
      }
    }
    const colors = await page.evaluate(() => [
      getComputedStyle(document.querySelector('.wd-pages')).backgroundColor,
      getComputedStyle(document.querySelector('.wd-closing__disc')).backgroundColor,
    ]);
    assert.deepEqual(colors, ['rgb(24, 41, 75)', 'rgb(24, 41, 75)']);
    if (width < 900) {
      await page.locator('.wd-approach').evaluate((section) => {
        scrollTo({
          top:
            scrollY +
            section.getBoundingClientRect().top +
            parseFloat(section.style.getPropertyValue('--craft-travel')) * 0.9,
          behavior: 'instant',
        });
      });
      await page.waitForTimeout(1000);
      assert.equal(
        await page
          .locator('.wd-approach .wd-frame')
          .evaluate((el) => getComputedStyle(el).position),
        'sticky',
      );
      assert.equal(
        await page
          .locator('[data-craft-step="finished"]')
          .evaluate((el) => Number(el.style.getPropertyValue('--craft-detail'))),
        1,
      );
    }
    await page.locator('.wd-closing').scrollIntoViewIfNeeded();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `.inspect/reading-room/${width}-closing.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForSelector('.wd-page[data-wd-static]');
    assert.equal(
      await page.locator('[data-time-travel]').evaluate((el) => el.dataset.era),
      'modern',
    );
    assert.equal(
      await page
        .locator('.wd-pages')
        .evaluate((el) => getComputedStyle(el).getPropertyValue('--wd-rest').trim()),
      '0',
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Reading room, navy surfaces, and reduced-motion checks passed.');
