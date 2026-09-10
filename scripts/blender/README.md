# Modern hero Earth

Original Blender globe inspired by the supplied Sketchfab Earth reference. No Sketchfab model data was downloaded.

- Public model: public/models/earth/earth.glb
- Static fallback: public/models/earth/poster-web.webp
- Texture attribution: public/models/earth/credits.txt
- Local Blender source: \_source-assets/modern-earth/gift-modern-earth.blend
- Rebuild script: build-modern-earth.py

The source folder is intentionally gitignored. It contains Solar System Scope's 2K Earth day, night and cloud maps plus optimized day-web.jpg, night-web.jpg, and clouds-web.png. See the public credits file for their source and CC BY 4.0 license. Cloud alpha was extracted from the grayscale map; day/night maps were JPEG-compressed.

Run the Python script through Blender MCP execute_code with `__file__` set to its full path (or GIFT_EARTH_ROOT set to the workspace). It creates a separate scene, exports only that scene with custom metadata disabled, saves its packed Blender source, and renders a Blender preview. That preview is for source review; its lighting and materials differ from the browser shaders.

To generate the website fallback, run `node scripts/blender/render-earth-poster.cjs` with the local dev server on port 3000. It captures the live renderer's first frame at 800 x 800 before rotation starts, including the same camera, material shaders, atmosphere and color settings. It saves a transparent WebP, checks compression error against the original frame, and retains the source PNG locally. It also updates the poster URL with a content hash so browsers refresh it when the image changes. Regenerate it whenever the web globe's appearance changes.

The browser applies a directional day/night shader, animated cloud layer and atmospheric rim to the exported meshes. It defers Three.js and the GLB until the modern preview becomes visible, pauses rendering offscreen, and keeps the poster for reduced motion, data saving, failed loads, or unavailable WebGL.
