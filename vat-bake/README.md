# VAT bake pipeline — working folder

Scratch folder for the DX hero Vertex Animation Texture (VAT) bake
(Plans.md **T-010**). Raw `.bin` dumps here are **gitignored** — they're large
dev artifacts, not shipped assets.

## Workflow

1. **Capture (P1)** — `npm run dev`, open `/dev/capture-dx-vat`, click
   *Start capture*, download `dx-hero-vat-raw.bin`, and drop it in this folder.
2. **Compress (P2)** — the compressor reads the raw `.bin` from here and writes
   the small, mobile-friendly VAT asset into `public/` (that one DOES ship).
3. **Playback (P3/P4)** — the DX hero loads the `public/` VAT and plays it back
   on every device, no live solver.

## Raw `.bin` format (little-endian)

| offset | type            | meaning                                   |
|--------|-----------------|-------------------------------------------|
| 0      | int32           | texW                                      |
| 4      | int32           | texH                                      |
| 8      | int32           | frameCount                                |
| 12     | float32 × N     | RGBA per particle per frame (N = frameCount × texW × texH × 4); xyz = position, w = shield/G flag |

Put the captured file here as: `vat-bake/dx-hero-vat-raw.bin`
