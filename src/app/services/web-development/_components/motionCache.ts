export interface DisposableFrame {
  close(): void;
}

/** Keeps the interactive character deliberately small and bounded in memory. */
export class MotionCache<T extends DisposableFrame> {
  private frames = new Map<number, T>();
  private loading = new Map<number, AbortController>();
  private failed = new Set<number>();
  private queue: number[] = [];
  private disposed = false;

  constructor(
    private readonly load: (index: number, signal: AbortSignal) => Promise<T>,
    private readonly onReady: () => void,
    private readonly onError: () => void,
    readonly capacity = 12,
    readonly concurrency = 2,
  ) {}

  get(index: number): T | undefined {
    const frame = this.frames.get(index);
    if (frame) {
      this.frames.delete(index);
      this.frames.set(index, frame);
    }
    return frame;
  }

  request(indices: number[]) {
    if (this.disposed) return;
    this.queue = [...new Set(indices)].slice(0, this.capacity);
    this.pump();
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    for (const controller of this.loading.values()) controller.abort();
    for (const frame of this.frames.values()) frame.close();
    this.frames.clear();
  }

  private pump() {
    if (this.disposed) return;

    for (const index of this.queue) {
      if (this.loading.size >= this.concurrency) break;
      if (this.frames.has(index) || this.loading.has(index) || this.failed.has(index)) continue;

      const controller = new AbortController();
      this.loading.set(index, controller);
      void this.load(index, controller.signal)
        .then((frame) => {
          if (this.disposed || controller.signal.aborted) {
            frame.close();
            return;
          }
          this.frames.set(index, frame);
          while (this.frames.size > this.capacity) {
            const oldest = this.frames.keys().next().value as number;
            this.frames.get(oldest)?.close();
            this.frames.delete(oldest);
          }
          this.onReady();
        })
        .catch(() => {
          if (!this.disposed && !controller.signal.aborted) {
            this.failed.add(index);
            this.onError();
          }
        })
        .finally(() => {
          this.loading.delete(index);
          this.pump();
        });
    }
  }
}
