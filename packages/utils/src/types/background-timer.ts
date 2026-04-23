import { DispatchQueue } from "./dispatch-queue.js";

type TimerCallback =
  | ((timer: BackgroundTimer) => Promise<void>)
  | ((timer: BackgroundTimer) => void);

export class BackgroundTimer {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private startTime: number = performance.now();

  readonly interval: number;
  readonly repeats: boolean;
  private readonly callback: TimerCallback;
  private readonly queue: DispatchQueue;

  constructor(
    interval: number,
    repeats: boolean,
    callback: TimerCallback,
    queue: DispatchQueue = DispatchQueue.background,
  ) {
    this.interval = interval * 1000;
    this.repeats = repeats;
    this.callback = callback;
    this.queue = queue;

    this.schedule();
  }

  static scheduledTimer(
    interval: number,
    repeats: boolean,
    callback: TimerCallback,
    queue: DispatchQueue = DispatchQueue.background,
  ): BackgroundTimer {
    return new BackgroundTimer(interval, repeats, callback, queue);
  }
  private schedule() {
    this.startTime = performance.now();

    if (this.repeats) {
      this.timerId = setInterval(() => {
        void this.queue.async(async () => {
          await this.callback(this);
          this.startTime = performance.now();
        });
      }, this.interval);
    } else {
      this.timerId = setTimeout(() => {
        void this.queue.async(async () => {
          await this.callback(this);
          this.startTime = performance.now();
          this.invalidate();
        });
      }, this.interval);
    }
  }

  get remainingTime(): number {
    if (!this.timerId) return 0;
    const elapsed = performance.now() - this.startTime;
    return Math.max(0, (this.interval - elapsed) / 1000);
  }

  invalidate(): void {
    if (this.timerId !== null) {
      if (this.repeats) {
        clearInterval(this.timerId);
      } else {
        clearTimeout(this.timerId);
      }
      this.timerId = null;
    }
  }
}
