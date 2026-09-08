# GIFT website production and maintenance hero

A React / TypeScript / Vite / Tailwind hero using the approved character and the supplied Kling video. The Japanese offer presents GIFT's custom website production and ongoing care for ¥30,000 per month before tax, with no initial fee.

The visual palette follows the live GIFT company page at https://www.gift-inc.org/company: a midnight-navy hero (#0b1020), pale blue header (#f0f7ff), white text, and restrained blue accents (#2563eb / #60a5fa). These colors were verified from the reference page's rendered styles. Japanese headings have clearer line spacing, the monthly-price numeral receives emphasis, and the pricing and included services are separated with a quiet rule. All supplied offer text is preserved.

## Development

Install with `npm ci`, then run `npm run dev`. `npm run build` type-checks and emits the static site into `dist`.

## Character video

The page always opens with a transparent still image. Character animation is opt-in through the Japanese motion toggle; it does not preload or decode video, create a WebGL context, or start a character animation loop on page load. Turning motion off cancels work and releases decoded images.

`scripts/prepare-character.py` preserves the original upload, crops the unused green area, removes the background and spill, and creates an intermediate packed matte video. That intermediate is retained in `assets/source/`, outside the published assets. `scripts/prepare-motion-frames.py` converts it into 96 transparent WebP poses at 576 × 502, packed into one 2.3 MB binary asset with an index. The browser fetches that asset only after the visitor enables motion.

`Character.tsx` draws the requested poses on a 2D canvas. `MotionCache` retains at most 12 decoded images (about 13.3 MiB of RGBA pixels), with at most two image decodes in progress. Evicted and late images are explicitly closed. Those figures describe the character cache, not total browser memory. Drawing is capped at 24 updates per second on desktop and 18 on touch devices, with lower rates or a static fallback if frame scheduling becomes slow. This cap is not a measured frame-rate guarantee. The character stops requesting animation frames at rest, while off screen, in a hidden tab, or behind the mobile menu.

The conversion uses Python, NumPy, Pillow, and FFmpeg:

```sh
python scripts/prepare-character.py /absolute/path/to/source.mp4 assets/source
python scripts/prepare-motion-frames.py assets/source/aria-motion.mp4 public/media/aria-poses
```

The source was `kling_20260908_VIDEO_Preserve_t_3672_0.mp4`, 1912 × 1080, 24 fps, 10.04 seconds. Pose timings in `Character.tsx` are calibrated to this specific video. Replacing the video requires recalibrating those timings and checking the crop.

Once motion is enabled, the cursor's angle around the character selects a recorded head pose. This is a directional approximation using the video's existing movement; it is not a live 3D model. The controller smooths angle changes and uses the latest requested pose instead of accumulating work. Pointer exit returns to the resting pose. Touch dragging is supported. Changes to a reduced-motion preference stop the character, and every reload starts static.

## Hero interactions

- GSAP animates the entrance. The character uses an independent animation loop only while its pose changes.
- The monthly-price headline types in with reserved layout space and a complete screen-reader alternative.
- The contact button appears independently of the typing animation.
- Navigation links to the service and pricing content within the hero. All contact actions lead to the supplied GIFT contact page, https://www.gift-inc.org/contact.
- The mobile menu supports Escape, keyboard focus containment, and inert background content.
- Lenis handles scrolling and anchor links; its ticker wakes on interaction and sleeps after scrolling finishes. The mobile menu pauses background scrolling. Reduced motion disables smooth scrolling and entrance animation.
- The two supplied font stylesheets are linked in `index.html`, with Helvetica Neue and Japanese system font fallbacks.
- The hero remains the only section. On smaller screens the character appears above the full offer, with enough page height to read every benefit and use the contact button.

## Performance validation

`node scripts/verify-motion-cache.ts` verifies concurrency limits, latest-request priority, eviction, cleanup after pending decodes, and prevention of retry loops. The production TypeScript/Vite build and all 96 packed transparent images are also checked. The supported cloud browser could not reach the internal preview during the crash investigation, so no browser FPS measurement or reproduction on the user's PC is claimed.

## Publication

The Site identity is stored in `.openai/hosting.json`; publish the `dist` static output through Sites. No environment variables or external services are required by the page.
