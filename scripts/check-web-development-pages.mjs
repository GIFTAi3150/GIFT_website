import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = process.env.HERO_TEST_URL || 'http://localhost:3000/services/web-development';
await mkdir('.inspect/pages', { recursive: true });
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
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
      await page.waitForTimeout(1800);
      const go = async (progress) => {
        await page.locator('#pages').evaluate((el, progress) => {
          const css = getComputedStyle(document.documentElement);
          const viewport = parseFloat(css.getPropertyValue('--svh-frozen'));
          const vh = parseFloat(css.getPropertyValue('--vh-frozen'));
          const rest = parseFloat(getComputedStyle(el).getPropertyValue('--wd-rest'));
          scrollTo({
            top:
              scrollY +
              el.getBoundingClientRect().top +
              (el.offsetHeight - viewport - rest * vh) * progress,
            behavior: 'instant',
          });
        }, progress);
        await page.waitForTimeout(1000);
      };
      const transforms = () =>
        page
          .locator('[data-sheet]')
          .evaluateAll((cards) => cards.map((card) => card.style.transform));
      await go(0.025);
      const before = await transforms();
      // Reproduce a content update replacing exactly the two service cards in the screenshot.
      await page.locator('[data-spread]').evaluate((grid) => {
        for (const index of [1, 2]) {
          const previous = grid.children[index];
          const replacement = previous.cloneNode(true);
          replacement.style.removeProperty('transform');
          replacement.style.removeProperty('z-index');
          previous.replaceWith(replacement);
        }
      });
      await page.waitForTimeout(250);
      assert.deepEqual(
        await transforms(),
        before,
        'replacement cards must rejoin the animated deck',
      );
      for (const progress of [0.37, 0.77, 1, 0.17]) {
        await go(progress);
        const cards = await page.locator('[data-spread]').evaluate((grid) => {
          const bounds = grid.getBoundingClientRect();
          const last = grid.lastElementChild;
          return [...grid.children].map((card) => {
            const rect = card.getBoundingClientRect();
            return {
              left: rect.left - bounds.left,
              top: rect.top - bounds.top,
              targetLeft: card.offsetLeft,
              targetTop: card.offsetTop,
              centerX: rect.left - bounds.left + rect.width / 2,
              centerY: rect.top - bounds.top + rect.height / 2,
              deckX: last.offsetLeft + last.offsetWidth / 2,
              deckY: last.offsetTop + last.offsetHeight / 2,
              right: rect.right,
              viewportLeft: rect.left,
            };
          });
        });
        assert.equal(cards.length, 10);
        const settled = Math.min(10, Math.floor(progress * 10) + 1);
        cards.forEach((card, index) => {
          if (index < settled) {
            assert.ok(
              Math.abs(card.left - card.targetLeft) <= 1 &&
                Math.abs(card.top - card.targetTop) <= 1,
              `card ${index} missed its slot: ${JSON.stringify(card)}`,
            );
          } else {
            assert.ok(
              Math.abs(card.centerX - card.deckX) < 2 && Math.abs(card.centerY - card.deckY) < 4,
              `card ${index} escaped the waiting deck`,
            );
          }
          assert.ok(card.viewportLeft >= 0 && card.right <= width, 'card extends outside viewport');
        });
        const snapshot = await transforms();
        const y = await page.evaluate(() => scrollY);
        await page.evaluate(() => dispatchEvent(new Event('gift:layout')));
        await page.waitForTimeout(650);
        assert.deepEqual(
          await transforms(),
          snapshot,
          'layout refresh must preserve every card position',
        );
        assert.equal(await page.evaluate(() => scrollY), y);
        if (progress === 1)
          await page.screenshot({ path: `.inspect/pages/${engine.name()}-${width}-complete.png` });
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForSelector('.wd-page[data-wd-static]');
      assert.ok(
        (await transforms()).every((transform) => transform === ''),
        'reduced motion must restore the natural grid',
      );
      assert.equal(await page.locator('[data-sheet]').count(), 10);
      assert.deepEqual(errors, []);
      console.log(
        `${engine.name()} ${width}px: content replacements, ordered card placement, refresh, reverse scrolling, and reduced motion passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
