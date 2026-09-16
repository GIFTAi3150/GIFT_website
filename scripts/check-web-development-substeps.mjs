import assert from 'node:assert/strict';
import { chromium } from 'playwright';

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
    await page.goto('http://localhost:3000/services/web-development', { waitUntil: 'networkidle' });
    await page.waitForSelector('#included[data-build-scrub]');
    await page.waitForTimeout(1600);
    const go = async (selector, progress) => {
      await page.locator(selector).evaluate((section, p) => {
        const css = getComputedStyle(document.documentElement);
        const height = parseFloat(css.getPropertyValue('--svh-frozen'));
        const scrollHeight = parseFloat(css.getPropertyValue('--vh-frozen'));
        const rest = parseFloat(getComputedStyle(section).getPropertyValue('--wd-rest'));
        scrollTo({
          top:
            scrollY +
            section.getBoundingClientRect().top +
            (section.offsetHeight - height - rest * scrollHeight) * p,
          behavior: 'instant',
        });
      }, progress);
      await page.waitForTimeout(750);
    };
    for (let step = 1; step <= 6; step++) {
      await go('#included', (step - 1 + 0.2) / 6);
      const entering = await page
        .locator('[data-build]')
        .evaluate((el) => Number(el.style.getPropertyValue('--step')));
      assert.ok(
        entering > step - 1 && entering < step,
        `feature ${step} skipped its gradual reveal`,
      );
      const read = () =>
        page.locator('#included').evaluate((section) => {
          const build = section.querySelector('[data-build]');
          return {
            step: build.dataset.step,
            enter: build.style.getPropertyValue('--step-enter'),
            active: [...section.querySelectorAll('[data-inc]')].findIndex((el) =>
              el.classList.contains('is-on'),
            ),
            styles: [
              ...section.querySelectorAll(
                '.wd-build__frame, .wd-build__hero, .wd-build__pages li, .wd-build__mark, .wd-build__news-new',
              ),
            ].map((el) => {
              const css = getComputedStyle(el);
              return [css.transform, css.opacity, css.width];
            }),
          };
        });
      await go('#included', (step - 1 + 0.7) / 6);
      const before = await read();
      await go('#included', (step - 1 + 0.9) / 6);
      assert.deepEqual(await read(), before, `feature ${step} moved during its reading interval`);
      assert.equal(Number(before.enter), 1);
      assert.equal(before.active, step - 1);
    }
    // Every small action in these sequences has a separate completed interval.
    for (const [selector, count, nodes, offset, span] of [
      ['.wd-worries', 5, '[data-worry], [data-worry-answer]', 0, 1],
      ['.wd-prepare', 4, '[data-hand-noun], [data-hand-note], [data-hand-left]', 0, 1],
      ['.wd-pages', 10, '[data-sheet]', 0, 1],
      ['.wd-manifesto', 3, '[data-lock-lead]', 0.55, 0.45],
    ]) {
      for (let i = 0; i < count; i++) {
        const read = () =>
          page
            .locator(selector)
            .evaluate(
              (section, nodes) =>
                [...section.querySelectorAll(nodes)].map((el) => [
                  getComputedStyle(el).transform,
                  el.style.getPropertyValue('--s'),
                ]),
              nodes,
            );
        await go(selector, offset + (span * (i + 0.7)) / count);
        const before = await read();
        await go(selector, offset + (span * (i + 0.9)) / count);
        assert.deepEqual(await read(), before, `${selector} action ${i + 1} did not pause`);
      }
      console.log(`${width}px ${selector}: all ${count} individual reading intervals passed`);
    }
    await go('#included', 0.2 / 6);
    assert.equal(await page.locator('[data-build]').getAttribute('data-step'), '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForSelector('.wd-page[data-wd-static]');
    assert.equal(await page.locator('[data-build-scrub]').count(), 0);
    const bodies = await page
      .locator('#included .wd-inc__body')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    assert.ok(
      bodies.every((height) => height > 20),
      'reduced motion hid feature descriptions',
    );
    console.log(
      `${width}px: all six features reveal gradually, hold individually, reverse, and remain readable with reduced motion`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
