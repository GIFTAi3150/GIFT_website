import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

// Physical WebView resizing approximates in-app browser toolbars. Native app
// overlays and software keyboards still need a device check before release.
const engine = process.env.VIEWPORT_TEST_ENGINE === 'webkit' ? webkit : chromium;
const origin = process.env.VIEWPORT_TEST_URL || 'http://localhost:3000';
const browser = await engine.launch({ headless: true });
const failures = [];
const close = (a, b, message) => assert.ok(Math.abs(a - b) <= 1, `${message}: ${a} -> ${b}`);
const snapshot = (page) =>
  page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
    y: scrollY,
    frozen: document.documentElement.style.getPropertyValue('--svh-frozen'),
    sections: [...document.querySelectorAll('main section')].map((el) => ({
      top: el.offsetTop,
      height: el.offsetHeight,
    })),
    frames: [...document.querySelectorAll('.wd-frame')].map((el) => ({
      height: el.clientHeight,
      heading: el.querySelector('h2')?.getBoundingClientRect().height || 0,
    })),
  }));
try {
  for (const path of process.env.VIEWPORT_TEST_PATHS?.split(',') || [
    '/',
    '/company',
    '/services/aiops',
    '/services/ai-training',
    '/services/web-development',
    '/plans',
    '/contact',
  ]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 720 },
      isMobile: true,
      hasTouch: true,
    });
    try {
      page.setDefaultTimeout(30000);
      await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () =>
          document.documentElement.style.getPropertyValue('--svh-frozen').endsWith('px') &&
          !document.querySelector('main[data-flash-guard]'),
      );
      await page.waitForTimeout(1500);
      const meta = await page.locator('meta[name=viewport]').getAttribute('content');
      assert.match(meta, /width=device-width/);
      assert.doesNotMatch(meta, /user-scalable=no|maximum-scale=1(?:,|$)/);
      await page.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
      await page.waitForTimeout(700);
      const before = await snapshot(page);
      assert.equal(before.frozen, '720px');
      for (const height of [660, 780, 720]) {
        await page.setViewportSize({ width: 390, height });
        await page.waitForTimeout(700);
        const after = await snapshot(page);
        close(before.height, after.height, `${path} document height`);
        close(before.y, after.y, `${path} scroll position`);
        assert.ok(after.width <= 390, `${path} horizontal overflow`);
        assert.equal(after.frozen, before.frozen);
        before.sections.forEach((section, i) => {
          close(section.top, after.sections[i].top, `${path} section ${i} top`);
          close(section.height, after.sections[i].height, `${path} section ${i} height`);
        });
        before.frames.forEach((frame, i) => {
          close(frame.height, after.frames[i].height, `${path} frame ${i} height`);
          close(frame.heading, after.frames[i].heading, `${path} frame ${i} text`);
        });
      }
      console.log(`${engine.name()} ${path}: stable toolbar resizing and page geometry`);
      if (path === '/services/web-development') {
        // Hover around a step boundary where changing the trigger's end would
        // previously switch cards even though the reader had stopped scrolling.
        await page.evaluate(() => {
          const section = document.querySelector('#included');
          scrollTo({
            top: section.offsetTop + (section.offsetHeight - 720) * 0.49,
            behavior: 'instant',
          });
        });
        await page.waitForTimeout(1100);
        const step = await page.locator('[data-build]').getAttribute('data-step');
        for (const height of [660, 780, 720]) {
          await page.setViewportSize({ width: 390, height });
          await page.evaluate(() => window.dispatchEvent(new Event('gift:layout')));
          await page.waitForTimeout(700);
          assert.equal(
            await page.locator('[data-build]').getAttribute('data-step'),
            step,
            'toolbar advanced a feature',
          );
        }
        await page.setViewportSize({ width: 1, height: 1 });
        await page.waitForTimeout(500);
        assert.equal((await snapshot(page)).frozen, '720px', 'hidden WebView polluted saved size');
        await page.setViewportSize({ width: 390, height: 720 });
        await page.evaluate(() =>
          window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
        );
        await page.waitForTimeout(700);
        assert.equal((await snapshot(page)).frozen, '720px');
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(700);
        assert.equal((await snapshot(page)).frozen, '390px', 'rotation did not update layout');
        await page.setViewportSize({ width: 320, height: 568 });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(700);
        await page.getByRole('button', { name: 'メニューを開く' }).click();
        const nav = page.getByRole('navigation', { name: 'モバイルナビゲーション' });
        await nav.getByRole('button', { name: /SERVICE/ }).click();
        const menu = await nav.evaluate((el) => ({
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        }));
        assert.ok(menu.scrollWidth <= menu.width, 'mobile menu has horizontal overflow');
        await page.setViewportSize({ width: 320, height: 440 });
        await nav.locator('a').last().scrollIntoViewIfNeeded();
        assert.ok(await nav.locator('a').last().isVisible(), 'last mobile menu link unreachable');
        await page.screenshot({ path: `.inspect/viewport-menu-${engine.name()}.png` });
      }
      if (path === '/contact') {
        const fields = page.locator('.contact-input');
        assert.ok(
          await fields.evaluateAll((els) =>
            els.every((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
          ),
        );
        await page.locator('input[name=name]').focus();
        await page.setViewportSize({ width: 390, height: 380 });
        await page.waitForTimeout(500);
        assert.equal((await snapshot(page)).frozen, '720px', 'keyboard changed saved viewport');
        // Blur before keyboard dismissal, then restore: neither event should
        // commit the temporary keyboard height. No form data is submitted.
        await page.locator('input[name=name]').evaluate((el) => el.blur());
        await page.waitForTimeout(450);
        assert.equal((await snapshot(page)).frozen, '720px');
        await page.setViewportSize({ width: 390, height: 720 });
        await page.waitForTimeout(500);
        assert.equal((await snapshot(page)).frozen, '720px');
        console.log(`${engine.name()} contact: keyboard open/blur/dismiss preserved layout`);
      }
    } catch (error) {
      failures.push(`${path}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
  // Start scrolling server-rendered HTML while the application scripts are
  // delayed, as on a slow in-app connection. Hydration must not move the reader.
  const startup = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  startup.setDefaultTimeout(30000);
  let releaseScripts;
  const gate = new Promise((resolve) => {
    releaseScripts = resolve;
  });
  await startup.route(/\/_next\/.*\.js(?:\?|$)/, async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await startup.goto(origin + '/services/web-development', { waitUntil: 'commit' });
    await startup.waitForFunction(() => {
      const hero = document.querySelector('[data-time-travel]');
      return (
        hero &&
        Math.abs(hero.offsetHeight - 844) <= 1 &&
        getComputedStyle(hero.querySelector('[data-browser-era=modern]')).visibility === 'visible'
      );
    });
    await startup.evaluate(() => scrollTo({ top: 320, behavior: 'instant' }));
    await startup.waitForTimeout(300);
    const initialHeight = await startup
      .locator('[data-time-travel]')
      .evaluate((el) => el.offsetHeight);
    releaseScripts();
    await startup.waitForSelector('[data-time-travel][data-animated]');
    await startup.waitForTimeout(1800);
    close(await startup.evaluate(() => scrollY), 320, 'hydration reset the reader');
    close(
      await startup.locator('[data-time-travel]').evaluate((el) => el.offsetHeight),
      initialHeight,
      'hydration changed hero height',
    );
    await startup
      .locator('a[href="/contact"]')
      .last()
      .evaluate((el) => el.click());
    await startup.waitForURL('**/contact');
    await startup.waitForFunction(() => scrollY === 0);
    console.log(
      `${engine.name()} delayed startup preserved scroll; client navigation still resets`,
    );
  } finally {
    releaseScripts();
    await startup.close();
  }
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  desktop.setDefaultTimeout(30000);
  await desktop.goto(origin + '/services/web-development', { waitUntil: 'domcontentloaded' });
  await desktop.waitForTimeout(1800);
  await desktop.setViewportSize({ width: 1280, height: 840 });
  await desktop.waitForFunction(
    () =>
      Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--svh-frozen')) - 840) <=
      1,
  );
  close(
    parseFloat((await snapshot(desktop)).frozen),
    840,
    'desktop height resizing was incorrectly frozen',
  );
  await desktop.close();
} finally {
  await browser.close();
}
assert.deepEqual(failures, [], failures.join('\n'));
console.log(`${engine.name()} viewport regression checks passed.`);
