/**
 * Creates the "hero-gradient-loop" composition in After Effects.
 * Run via: AfterFX.exe -r create-hero-gradient.jsx
 *
 * Technique: two radial gradient blobs (teal + orange) on a warm grey base,
 * animated with sine-wave expressions so the blob centers drift slowly.
 * Matches the biscom.jp/10th color field.
 *
 * After this runs:
 *   1. Preview the comp in AE
 *   2. File > Export > Add to Media Encoder Queue
 *   3. Format: H.264, Preset: Match Source - High Bitrate
 *   4. Output: .../public/company/hero-gradient-loop.mp4
 */

(function createHeroGradient() {

  app.beginUndoGroup("Create Hero Gradient Loop");

  var W   = 1920;
  var H   = 1080;
  var DUR = 10.5;   // ~1 period of the WebGL sin-warp (2π / 0.6 ≈ 10.47 s)
  var FPS = 30;

  /* ── New comp ─────────────────────────────────────────────────── */
  var comp = app.project.items.addComp(
    "hero-gradient-loop", W, H, 1, DUR, FPS
  );
  comp.bgColor = [0.84, 0.83, 0.81]; // warm silver-grey background

  /* ── Base solid ───────────────────────────────────────────────── */
  var base = comp.layers.addSolid(
    [0.84, 0.83, 0.81],
    "BG", W, H, 1
  );
  base.moveToEnd();

  /* ── Helper: add a radial gradient blob layer ─────────────────── */
  function addBlob(name, cx, cy, ex, ey, col) {
    var lyr = comp.layers.addSolid([1, 1, 1], name, W, H, 1);
    lyr.blendingMode = BlendingMode.MULTIPLY;

    var fx = lyr.property("Effects").addProperty("ADBE Ramp");
    fx.property("Ramp Shape").setValue(2);          // 2 = Radial
    fx.property("Start of Ramp").setValue([cx, cy]);
    fx.property("End of Ramp").setValue([ex, ey]);
    fx.property("Start Color").setValue(col);
    fx.property("End Color").setValue([1, 1, 1]);   // fades to white = fades into base
    fx.property("Ramp Scatter").setValue(30);       // soften the edge

    return { lyr: lyr, fx: fx };
  }

  /* ── Teal blob — left-centre ──────────────────────────────────── */
  // #477BB3 — steel blue-teal; sits where the cool gradient lives
  var teal = addBlob("Teal Blob", 400, 430, 1640, 880, [0.278, 0.482, 0.702]);

  // Expressions make the center drift slowly without jumping at the loop point
  // (sin oscillates back and forth, so frame 0 == frame DUR)
  teal.fx.property("Start of Ramp").expression = [
    "var spd = 0.28;",
    "[400 + Math.sin(time * spd) * 65,",
    " 430 + Math.cos(time * spd * 0.78) * 50]"
  ].join("\n");

  /* ── Orange blob — upper-right ────────────────────────────────── */
  // #DE5D17 — vivid orange-amber; the warm accent corner
  var org = addBlob("Orange Blob", 1780, 110, 680, 860, [0.871, 0.365, 0.090]);

  org.fx.property("Start of Ramp").expression = [
    "var spd = 0.31;",
    "[1780 + Math.sin(time * spd + 1.2) * 55,",
    "   110 + Math.cos(time * spd * 0.82 + 0.8) * 42]"
  ].join("\n");

  /* ── Subtle noise overlay — adds the organic grain biscom bakes ─ */
  var noise = comp.layers.addSolid([0.5, 0.5, 0.5], "Noise", W, H, 1);
  noise.blendingMode = BlendingMode.OVERLAY;
  noise.opacity.setValue(5);                        // very subtle, 5 %

  var fn = noise.property("Effects").addProperty("ADBE Fractal Noise");
  fn.property("Contrast").setValue(100);
  fn.property("Brightness").setValue(-20);
  // Evolution animates at ~30°/s — slow enough to feel organic
  fn.property("Evolution").expression = "time * 30";

  // Scale is nested under Transform in Fractal Noise
  try {
    fn.property("Transform").property("Scale").setValue(250);
  } catch (e) {
    // Older AE builds — skip; scale defaults are fine
  }

  /* ── Move noise on top ───────────────────────────────────────────*/
  noise.moveToBeginning();

  /* ── Save AEP to desktop ─────────────────────────────────────────*/
  var savePath = "C:/Users/owner/Desktop/hero-gradient-loop.aep";
  try {
    app.project.save(new File(savePath));
  } catch (e) {
    // AE may need a project open first — save wherever it lands
    app.project.save();
  }

  app.endUndoGroup();

  /* ── Open the comp viewer ────────────────────────────────────────*/
  comp.openInViewer();

  alert(
    "Done!\n\n" +
    "Comp: hero-gradient-loop (" + DUR + "s, " + W + "×" + H + ")\n\n" +
    "Next steps:\n" +
    "1. Press Space to preview\n" +
    "2. File > Export > Add to Adobe Media Encoder Queue\n" +
    "3. Format: H.264  |  Output: hero-gradient-loop.mp4\n" +
    "4. Drop the mp4 into:  GIFT_website/public/company/"
  );

})();
