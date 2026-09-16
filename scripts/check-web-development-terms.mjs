import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
await mkdir('.inspect/terms', { recursive: true });
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [width, height] of [
      [390, 844],
      [320, 568],
      [375, 667],
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
      await page.waitForSelector('[data-terms-motion]');
      await page.waitForTimeout(1400);
      const section = page.locator('#terms');
      const entries = section.locator(
        '.wd-terms__list h3, .wd-terms__list li, .wd-terms__handover',
      );
      const geometry = await section.evaluate((el) => ({
        start: scrollY + el.getBoundingClientRect().top,
        travel: parseFloat(el.style.getPropertyValue('--terms-travel')),
        paced: el.hasAttribute('data-terms-paced'),
      }));
      if (height > 500) {
        assert.ok(geometry.paced, `${width}x${height}: use the mobile reading area`);
        const count = await entries.count();
        const distance = geometry.travel - height * 0.8;
        const readEntry = async (index) => {
          await page.evaluate(
            (top) => scrollTo({ top, behavior: 'instant' }),
            geometry.start + (distance * (index + 0.6)) / count,
          );
          await page.waitForTimeout(180);
          const entry = entries.nth(index);
          const state = await entry.evaluate((el) => {
            const section = el.closest('#terms');
            const bounds = el.getBoundingClientRect();
            const frame = section.querySelector('.wd-terms__window').getBoundingClientRect();
            const heading = section.querySelector('.wd-terms__head').getBoundingClientRect();
            return {
              top: bounds.top,
              bottom: bounds.bottom,
              left: bounds.left,
              right: bounds.right,
              frameTop: frame.top,
              frameBottom: frame.bottom,
              headingTop: heading.top,
              headingBottom: heading.bottom,
              opacity: getComputedStyle(el.querySelector('.wd-terms__entry')).opacity,
              textOffset:
                el.querySelector('.wd-terms__entry').getBoundingClientRect().top -
                el.querySelector('.wd-terms__mask').getBoundingClientRect().top,
              current: el.hasAttribute('data-term-current'),
              nextTop: section.nextElementSibling.getBoundingClientRect().top,
            };
          });
          assert.ok(state.current, `entry ${index} should follow scroll position`);
          assert.equal(state.opacity, '1', `entry ${index} must be fully revealed`);
          assert.ok(
            Math.abs(state.textOffset) < 1,
            `entry ${index} must finish sliding before the hold`,
          );
          assert.ok(
            state.top >= state.frameTop - 1 && state.bottom <= state.frameBottom + 1,
            `entry ${index} cropped: ${JSON.stringify(state)}`,
          );
          assert.ok(
            state.left >= 15 && state.right <= width - 15,
            `entry ${index} cropped horizontally`,
          );
          assert.ok(state.headingTop >= 79 && state.headingBottom < state.frameTop);
          assert.ok(state.frameBottom <= height - 20);
          assert.ok(state.nextTop >= height, 'next section must not overlap the reading pause');
        };
        for (let index = 0; index < count; index += 1) await readEntry(index);
        await page.evaluate(
          (top) => scrollTo({ top, behavior: 'instant' }),
          geometry.start + geometry.travel - height * 0.2,
        );
        await page.waitForTimeout(600);
        assert.equal(
          await section
            .locator('.wd-terms__handover')
            .evaluate((el) => getComputedStyle(el.querySelector('.wd-terms__entry')).opacity),
          '1',
        );
        if (width === 390 || width === 320) {
          await page.waitForTimeout(2500);
          await page.screenshot({ path: `.inspect/terms/${engine.name()}-${width}-handover.png` });
        }
        await readEntry(2);
        const before = await page.evaluate(() => scrollY);
        await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
        await page.waitForTimeout(600);
        assert.equal(await page.evaluate(() => scrollY), before);
        assert.ok(await entries.nth(2).evaluate((el) => el.hasAttribute('data-term-current')));
        // Mid-transition must show an actual partial reveal, not just completed states.
        await page.evaluate(
          (top) => scrollTo({ top, behavior: 'instant' }),
          geometry.start + (distance * 2.2) / count,
        );
        await page.waitForTimeout(180);
        const motion = await entries.nth(2).evaluate((el) => {
          const text = el.querySelector('.wd-terms__entry');
          const mask = el.querySelector('.wd-terms__mask');
          return {
            opacity: Number(getComputedStyle(text).opacity),
            offset: text.getBoundingClientRect().top - mask.getBoundingClientRect().top,
            height: mask.getBoundingClientRect().height,
          };
        });
        assert.ok(
          motion.opacity > 0 && motion.opacity < 1,
          `missing reveal: ${JSON.stringify(motion)}`,
        );
        assert.ok(
          motion.offset > 5 && motion.offset < motion.height,
          `text must physically move through its mask: ${JSON.stringify(motion)}`,
        );
        if (width === 390)
          await page.screenshot({ path: `.inspect/terms/${engine.name()}-moving.png` });
        if (engine === chromium && width === 390) {
          const cdp = await page.context().newCDPSession(page);
          const progress = await section.evaluate((el) =>
            el.style.getPropertyValue('--terms-progress'),
          );
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x: 200, y: 690 }],
          });
          for (let y = 660; y >= 300; y -= 30) {
            await cdp.send('Input.dispatchTouchEvent', {
              type: 'touchMove',
              touchPoints: [{ x: 200, y }],
            });
            await page.waitForTimeout(25);
          }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          await page.waitForTimeout(800);
          assert.notEqual(
            await section.evaluate((el) => el.style.getPropertyValue('--terms-progress')),
            progress,
            'touch swipe must advance the animation',
          );
          await cdp.detach();
        }
      } else {
        assert.ok(!geometry.paced, 'short landscape screens use natural flow');
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForSelector('.wd-page[data-wd-static]');
      assert.equal(await section.getAttribute('data-terms-paced'), null);
      assert.equal(await section.getAttribute('data-terms-motion'), null);
      assert.ok(
        await entries.evaluateAll((elements) =>
          elements.every((el) => {
            const text = el.querySelector('.wd-terms__entry');
            return (
              getComputedStyle(text).opacity === '1' && getComputedStyle(text).transform === 'none'
            );
          }),
        ),
      );
      // Reproduce the original overlap position with the next section halfway up the screen.
      await section.evaluate((el) =>
        scrollTo({
          top: scrollY + el.nextElementSibling.getBoundingClientRect().top - innerHeight / 2,
          behavior: 'instant',
        }),
      );
      const gap = await section.evaluate(
        (el) =>
          el.nextElementSibling.getBoundingClientRect().top -
          el.querySelector('.wd-terms__handover').getBoundingClientRect().bottom,
      );
      assert.ok(gap >= 20, `handover note is covered by the following section: ${gap}`);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      console.log(
        `${engine.name()} ${width}x${height}: every term fits, scroll reveal, final note, and reduced motion passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
