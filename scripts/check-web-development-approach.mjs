import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
await mkdir('.inspect/approach', { recursive: true });

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [width, height] of [
      [390, 844],
      [375, 667],
      [320, 568],
      [768, 1024],
      [844, 390],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        isMobile: true,
        hasTouch: true,
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('main.wd-page:not([data-flash-guard])');
      await page.waitForTimeout(1200);
      const section = page.locator('.wd-approach');
      const geometry = await section.evaluate((el) => ({
        start: scrollY + el.getBoundingClientRect().top,
        distance: parseFloat(el.style.getPropertyValue('--craft-travel')),
        paced: el.hasAttribute('data-craft-paced'),
        headingFirst:
          el.querySelector('.wd-approach__copy').getBoundingClientRect().bottom <=
          el.querySelector('.wd-approach__window').getBoundingClientRect().top,
      }));
      assert.ok(geometry.headingFirst, 'mobile heading must precede the previews');
      if (height > 500) {
        assert.ok(geometry.paced, `${width}x${height}: portrait layout should hold the previews`);
        assert.ok(
          geometry.distance >= height * 3,
          'give both previews several screens of scroll time',
        );
        let headingTop;
        for (const [progress, preview] of [
          [0.34, 'draft'],
          [0.9, 'finished'],
          [0.98, 'finished'],
          [0.34, 'draft'],
        ]) {
          await page.evaluate(
            (top) => scrollTo({ top, behavior: 'instant' }),
            geometry.start + geometry.distance * progress,
          );
          await page.waitForTimeout(500);
          const state = await section.evaluate((el) => {
            const windowRect = el.querySelector('.wd-approach__window').getBoundingClientRect();
            const heading = el.querySelector('.wd-approach__copy').getBoundingClientRect();
            return {
              headingTop: heading.top,
              headingBottom: heading.bottom,
              windowTop: windowRect.top,
              windowBottom: windowRect.bottom,
              nextTop: el.nextElementSibling.getBoundingClientRect().top,
              previews: Object.fromEntries(
                [...el.querySelectorAll('[data-craft-step]')].map((entry) => [
                  entry.dataset.craftStep,
                  {
                    top: entry.getBoundingClientRect().top,
                    bottom: entry.getBoundingClientRect().bottom,
                    detail: Number(entry.style.getPropertyValue('--craft-detail')),
                  },
                ]),
              ),
            };
          });
          headingTop ??= state.headingTop;
          assert.ok(Math.abs(state.headingTop - headingTop) < 1, 'heading moves during the hold');
          assert.ok(state.headingTop >= 79 && state.headingBottom < state.windowTop);
          assert.ok(state.windowBottom <= height - 20, 'preview must fit below the heading');
          assert.ok(Math.abs(state.previews[preview].top - state.windowTop) < 2);
          assert.ok(state.previews[preview].bottom <= state.windowBottom + 2);
          assert.equal(
            state.previews[preview].detail,
            1,
            'preview must finish before its reading pause',
          );
          assert.ok(state.nextTop >= height, 'next section must wait for the animation');
          if (width === 390 && progress !== 0.98) {
            await page.waitForTimeout(2500);
            await page.screenshot({ path: `.inspect/approach/${engine.name()}-${preview}.png` });
          }
        }
        const before = await page.evaluate(() => scrollY);
        await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
        await page.waitForTimeout(600);
        assert.equal(
          await page.evaluate(() => scrollY),
          before,
          'layout refresh must not move the page',
        );
      } else {
        assert.ok(!geometry.paced, 'short landscape screens need natural flow');
        assert.equal(
          await section.locator('.wd-frame').evaluate((el) => getComputedStyle(el).position),
          'relative',
        );
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForSelector('.wd-page[data-wd-static]');
      assert.equal(await section.getAttribute('data-craft-paced'), null);
      assert.equal(
        await section
          .locator('.wd-approach__window')
          .evaluate((el) => getComputedStyle(el).overflow),
        'visible',
      );
      assert.equal(
        await section.locator('[data-craft]').evaluate((el) => getComputedStyle(el).transform),
        'none',
      );
      assert.ok(
        await section
          .locator('[data-craft-step]')
          .evaluateAll((entries) =>
            entries.every((el) => !el.style.getPropertyValue('--craft-detail')),
          ),
      );
      assert.deepEqual(errors, []);
      console.log(
        `${engine.name()} ${width}x${height}: heading order, scroll pacing, layout, and reduced motion passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
