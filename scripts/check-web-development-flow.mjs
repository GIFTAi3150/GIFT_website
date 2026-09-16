import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
await mkdir('.inspect/flow', { recursive: true });
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [width, height] of [
      [390, 844],
      [320, 568],
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
      await page.waitForSelector('[data-route-motion]');
      await page.waitForTimeout(1600);
      const route = page.locator('[data-route]');
      const steps = route.locator('.wd-step');
      const snapshot = () =>
        route.evaluate((el) => ({
          offset: parseFloat(el.querySelector('[data-route-path]').style.strokeDashoffset),
          active: [...el.querySelectorAll('.wd-step')].map((step) =>
            step.classList.contains('is-on'),
          ),
          bodies: [...el.querySelectorAll('.wd-step__body')].map((body) => ({
            opacity: Number(getComputedStyle(body).opacity),
            y: new DOMMatrixReadOnly(getComputedStyle(body).transform).m42,
          })),
        }));
      for (const index of [0, 1, 2, 3, 1]) {
        const top = await steps
          .nth(index)
          .evaluate((el) => scrollY + el.getBoundingClientRect().top);
        await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), top - height * 0.76);
        await page.waitForTimeout(160);
        const middle = await snapshot();
        assert.ok(middle.bodies[index].opacity > 0.15 && middle.bodies[index].opacity < 1);
        assert.ok(middle.bodies[index].y > 5, 'step text must physically rise during scrolling');
        await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), top - height * 0.5);
        await page.waitForTimeout(180);
        const complete = await snapshot();
        assert.equal(complete.bodies[index].opacity, 1);
        assert.equal(complete.bodies[index].y, 0);
        assert.ok(complete.active[index], 'step must light up while its heading is in view');
        assert.ok(
          complete.offset < middle.offset,
          `route line must advance: ${JSON.stringify({ engine: engine.name(), width, height, index, middle, complete })}`,
        );
        if (index === 3) {
          assert.ok(complete.active.every(Boolean));
          assert.ok(complete.offset < 1, 'route must reach the final step before it scrolls away');
          const gap = await route.evaluate(
            (el) =>
              el.closest('#flow').nextElementSibling.getBoundingClientRect().top -
              el.querySelector('.wd-step:last-child').getBoundingClientRect().bottom,
          );
          assert.ok(gap >= 20, 'next section must not cover the last description');
          await page.screenshot({ path: `.inspect/flow/${engine.name()}-${width}-complete.png` });
        }
      }
      const before = await snapshot();
      const scrollBefore = await page.evaluate(() => scrollY);
      await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
      await page.waitForTimeout(600);
      assert.equal(await page.evaluate(() => scrollY), scrollBefore);
      assert.deepEqual(await snapshot(), before, 'refresh must not reset the animation');
      if (engine === chromium && width === 390) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: 220, y: 700 }],
        });
        for (let y = 670; y >= 340; y -= 30) {
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: 220, y }],
          });
          await page.waitForTimeout(25);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(600);
        assert.ok((await snapshot()).offset < before.offset, 'native touch must draw the route');
        await cdp.detach();
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForSelector('.wd-page[data-wd-static]');
      assert.equal(await route.getAttribute('data-route-motion'), null);
      assert.ok(
        await route
          .locator('.wd-step__body')
          .evaluateAll((bodies) =>
            bodies.every(
              (body) =>
                getComputedStyle(body).opacity === '1' &&
                getComputedStyle(body).transform === 'none',
            ),
          ),
      );
      assert.deepEqual(errors, []);
      console.log(
        `${engine.name()} ${width}x${height}: step reveals, completed route, reverse scrolling, refresh, and reduced motion passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
