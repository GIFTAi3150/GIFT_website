import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const engine = process.env.INCLUDED_TEST_ENGINE === 'webkit' ? webkit : chromium;
const browser = await engine.launch({ headless: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [320, 568],
    [390, 844],
    [844, 390],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: width < 900,
      hasTouch: width < 900,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://localhost:3000/services/web-development', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600);
    for (const step of [1, 2, 3, 4, 5, 6, 3, 1]) {
      await page.evaluate(
        (progress) => {
          const section = document.querySelector('#included');
          const rest = Number.parseFloat(getComputedStyle(section).getPropertyValue('--wd-rest'));
          const viewport = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--vh-frozen'),
          );
          scrollTo({
            top:
              scrollY +
              section.getBoundingClientRect().top +
              (section.offsetHeight - innerHeight - rest * viewport) * progress,
            behavior: 'instant',
          });
        },
        (step - 0.25) / 6,
      );
      await page.waitForTimeout(1000);
      const state = await page.evaluate(() => {
        const section = document.querySelector('#included');
        const rows = [...section.querySelectorAll('[data-inc]')];
        const visible = rows.filter((row) => row.classList.contains('is-on'));
        const row = visible[0];
        const rect = row.getBoundingClientRect();
        const body = row.querySelector('.wd-inc__body > p');
        const price = section.querySelector('.wd-included__price').getBoundingClientRect();
        const news = section.querySelector('.wd-build__news').getBoundingClientRect();
        const art = section.querySelector('.wd-build__frame').getBoundingClientRect();
        return {
          visibleCount: visible.length,
          index: rows.indexOf(row) + 1,
          build: Number(section.querySelector('[data-build]').dataset.step),
          enter: Number(
            section.querySelector('[data-build]').style.getPropertyValue('--step-enter'),
          ),
          top: rect.top,
          bottom: rect.bottom,
          bodyClipped: body.scrollHeight > body.clientHeight + 1,
          priceBottom: price.bottom,
          previewHeight: art.height,
          newsFits: news.bottom <= art.bottom + 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      console.log(JSON.stringify({ engine: engine.name(), width, height, step, ...state }));
      if ([1, 6].includes(step))
        await page.screenshot({ path: `.inspect/included-${engine.name()}-${width}-${step}.png` });
      assert.equal(state.visibleCount, 1);
      assert.equal(state.index, step);
      assert.equal(state.build, step);
      assert.equal(state.enter, 1, 'the feature must finish revealing before its reading interval');
      assert.ok(state.top >= 80 && state.bottom <= height, 'feature text extends outside viewport');
      assert.ok(!state.bodyClipped && !state.overflow, 'feature text is clipped');
      assert.ok(state.newsFits, 'miniature website news is clipped');
      assert.ok(
        state.priceBottom <= height && state.previewHeight >= 80,
        'preview/price does not fit',
      );
    }
    assert.deepEqual(errors, []);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(500);
    assert.equal(await page.locator('#included[data-included-steps]').count(), 0);
    await page.waitForFunction(() => {
      const rows = [...document.querySelectorAll('#included [data-inc]')];
      return rows.every(
        (row) =>
          getComputedStyle(row).visibility === 'visible' && row.getBoundingClientRect().height > 0,
      );
    });
    assert.equal(await page.locator('#included [data-inc]:visible').count(), 6);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Mobile included sequence, reverse scrolling, and reduced-motion checks passed.');
