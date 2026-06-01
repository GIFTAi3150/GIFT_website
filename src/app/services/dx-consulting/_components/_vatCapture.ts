// DEV-ONLY capture controller for the VAT bake pipeline (Plans.md T-010 / P1).
//
// The DX hero's live GPGPU solver (GiftLogoFluid) can't run on phones, so we
// bake its per-frame particle positions once on a capable machine and play
// them back as a Vertex Animation Texture. This singleton is the channel
// between the dev recorder route (/dev/capture-dx-vat) and GiftLogoFluid's
// useFrame: the route arms it, the solver's useFrame reads the freshly
// computed position render target each frame and hands the pixels here, and
// once the target frame count is reached we hand the whole sequence back to
// the route for serialization.
//
// It lives as a module singleton (not React state/context) because the
// recorder UI and the solver render loop are in separate component trees and
// the per-frame hot path must not trigger React re-renders. In normal site
// use `state` stays 'idle' and the useFrame tap is a single cheap boolean
// check — zero overhead for real visitors.

export type VatCaptureState = 'idle' | 'capturing' | 'done';

class VatCapture {
  state: VatCaptureState = 'idle';
  targetFrames = 0;
  texW = 0;
  texH = 0;
  // When non-null, GiftLogoFluid pins to this form index (0=head, 1=logo,
  // 2=pet) and suspends its auto-cycle, so a capture records ONE shape's
  // idle motion cleanly. null = normal site behavior (auto-cycle). The dev
  // recorder sets this before remounting the solver for each per-shape bake.
  forcedForm: number | null = null;
  // Each entry is one frame: an RGBA float buffer of length texW*texH*4.
  // xyz = particle position, w = shield/G flag (unused by playback for now).
  frames: Float32Array[] = [];

  onProgress?: (captured: number, total: number) => void;
  onDone?: (frames: Float32Array[], texW: number, texH: number) => void;

  get active(): boolean {
    return this.state === 'capturing';
  }

  // Called by the recorder route to start a capture run.
  arm(targetFrames: number): void {
    this.frames = [];
    this.targetFrames = targetFrames;
    this.texW = 0;
    this.texH = 0;
    this.state = 'capturing';
  }

  // Called from GiftLogoFluid's useFrame once per frame while active. `buf`
  // is the solver's reused scratch array — we COPY it because the caller
  // overwrites it next frame. Dims are reported by the tap (it owns TEX_W/H).
  addFrame(buf: Float32Array, texW: number, texH: number): void {
    if (this.state !== 'capturing') return;
    this.texW = texW;
    this.texH = texH;
    this.frames.push(buf.slice());
    this.onProgress?.(this.frames.length, this.targetFrames);
    if (this.frames.length >= this.targetFrames) {
      this.state = 'done';
      this.onDone?.(this.frames, this.texW, this.texH);
    }
  }

  reset(): void {
    this.state = 'idle';
    this.frames = [];
    this.targetFrames = 0;
    this.texW = 0;
    this.texH = 0;
    this.forcedForm = null;
  }
}

// Single shared instance. Imported by both the solver tap and the dev route.
export const vatCapture = new VatCapture();
