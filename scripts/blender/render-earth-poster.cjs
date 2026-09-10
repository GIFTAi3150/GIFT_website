// Capture the live renderer's FIRST frame so the fallback uses identical camera,
// model pose, cloud layer, light direction, atmosphere, and tone mapping.
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { chromium } = require('playwright');
const sharp = require('sharp');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1100 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, attributes) {
        const earth = type === 'webgl2' && this.closest('[data-earth-ready]');
        return getContext.call(
          this,
          type,
          earth ? { ...attributes, preserveDrawingBuffer: true } : attributes,
        );
      };
      const draw = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        const result = draw.apply(this, args);
        if (!window.earthCaptureQueued && this.canvas.closest('[data-earth-ready]')) {
          window.earthCaptureQueued = true;
          // Runs after the complete synchronous render, before rotation starts.
          queueMicrotask(() => {
            window.earthFirstFrame = this.canvas.toDataURL('image/png');
          });
        }
        return result;
      };
    });
    await page.route('**/*', (route) =>
      new URL(route.request().url()).hostname === 'localhost' ? route.continue() : route.abort(),
    );
    await page.goto('http://localhost:3000/services/web-development', {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    await page.waitForSelector('[data-time-travel][data-animated]');
    await page.addStyleTag({
      content: '[data-earth-ready] canvas { width: 800px !important; height: 800px !important; }',
    });
    await page.waitForTimeout(1700);
    await page.evaluate(() => {
      const hero = document.querySelector('[data-time-travel]');
      scrollTo(0, (hero.offsetHeight - innerHeight) * 0.96);
    });
    await page.waitForFunction(() => !!window.earthFirstFrame, undefined, { timeout: 45000 });
    if (errors.length) throw new Error(errors.join('\n'));
    const dataUrl = await page.evaluate(() => window.earthFirstFrame);
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    const metadata = await sharp(png).metadata();
    if (metadata.width !== 800 || metadata.height !== 800 || !metadata.hasAlpha)
      throw new Error('Expected an 800px transparent capture');
    const webp = await sharp(png).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
    const original = await sharp(png).ensureAlpha().raw().toBuffer();
    const decoded = await sharp(webp).ensureAlpha().raw().toBuffer();
    let error = 0,
      weight = 0;
    for (let i = 0; i < original.length; i += 4) {
      const alpha = original[i + 3] / 255;
      for (let c = 0; c < 3; c++) {
        error += Math.abs(original[i + c] - decoded[i + c]) * alpha;
        weight += alpha;
      }
    }
    const meanError = error / weight;
    if (!weight || meanError > 3) throw new Error('Poster differs from the live frame');
    fs.writeFileSync(path.join(root, '_source-assets/modern-earth/earth-web-first-frame.png'), png);
    fs.writeFileSync(path.join(root, 'public/models/earth/poster-web.webp'), webp);
    const version = createHash('sha256').update(webp).digest('hex').slice(0, 10);
    const componentPath = path.join(
      root,
      'src/app/services/web-development/_components/ModernEarth.tsx',
    );
    const component = fs.readFileSync(componentPath, 'utf8');
    fs.writeFileSync(
      componentPath,
      component.replace(
        /src="\/models\/earth\/poster-web\.webp(?:\?v=[^"]+)?"/,
        'src="/models/earth/poster-web.webp?v=' + version + '"',
      ),
    );

    console.log(
      JSON.stringify({
        width: metadata.width,
        height: metadata.height,
        bytes: webp.length,
        meanChannelError: Number(meanError.toFixed(3)),
      }),
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
