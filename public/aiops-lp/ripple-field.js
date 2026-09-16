// Adapted from React Bits Shape Waves by David Haz (2026).
// See THIRD-PARTY-NOTICES.txt. This is the component's damped wave simulation.
export class RippleField {
  constructor(cols, rows, cell, originY) {
    Object.assign(this, { cols, rows, cell, originY, active: false, backlog: 0 });
    this.heights = new Float32Array(cols * rows);
    this.previous = new Float32Array(cols * rows);
    this.pixels = new Uint8Array(cols * rows);
  }
  splash(x, y, strength) {
    const sigma = Math.max(0.5, 20 / this.cell), reach = Math.ceil(sigma * 2.5);
    const cx = x / this.cell - 0.5, cy = (y - this.originY) / this.cell - 0.5;
    for (let row = Math.max(0, Math.floor(cy - reach)); row <= Math.min(this.rows - 1, Math.ceil(cy + reach)); row++) {
      for (let col = Math.max(0, Math.floor(cx - reach)); col <= Math.min(this.cols - 1, Math.ceil(cx + reach)); col++) {
        const dx = col - cx, dy = row - cy, index = row * this.cols + col;
        this.heights[index] = Math.min(1.2, this.heights[index] + strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)));
      }
    }
    this.active = true;
  }
  step(dt) {
    if (!this.active) return false;
    this.backlog = Math.min(this.backlog + dt, 4 / 60);
    let peak = 1;
    while (this.backlog >= 1 / 60) {
      this.backlog -= 1 / 60; peak = 0;
      const { cols, rows, heights, previous } = this;
      for (let row = 0; row < rows; row++) {
        const base = row * cols, up = Math.max(0, row - 1) * cols, down = Math.min(rows - 1, row + 1) * cols;
        for (let col = 0; col < cols; col++) {
          const i = base + col, height = heights[i];
          const laplacian = heights[base + Math.max(0, col - 1)] + heights[base + Math.min(cols - 1, col + 1)]
            + heights[up + col] + heights[down + col] - 4 * height;
          const next = (height + (height - previous[i]) * 0.94 + 0.42 * laplacian) * 0.972;
          previous[i] = next;
          this.pixels[i] = Math.round(Math.min(1, Math.max(0, next)) * 255);
          peak = Math.max(peak, Math.abs(next), Math.abs(next - height));
        }
      }
      this.heights = previous; this.previous = heights;
    }
    if (peak < 0.003) {
      this.heights.fill(0); this.previous.fill(0); this.pixels.fill(0);
      this.active = false; this.backlog = 0;
    }
    return true;
  }
}
