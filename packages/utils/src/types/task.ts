type TaskStatus = "running" | "cancelled" | "completed";

type Continuation<T, E extends Error = Error> = {
  resolve: (value: T) => void;
  reject: (err: E) => void;
  signal: AbortSignal;
  onCancel: (cb: () => void) => void;
};

export class Task<T, E extends Error = Error> {
  private _status: TaskStatus = "running";
  private _controller = new AbortController();
  private _cancelHandlers: (() => void)[] = [];
  private _settled = false;
  private _promise: Promise<T>;
  private _resolve!: (value: T) => void;
  private _reject!: (reason?: E) => void;

  readonly signal: AbortSignal;

  constructor(executor: (continuation: Continuation<T, E>) => void | Promise<void>) {
    this.signal = this._controller.signal;

    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      const continuation: Continuation<T, E> = {
        resolve: (val) => {
          if (!this._settled && this._status === "running") {
            this._settled = true;
            this._status = "completed";
            resolve(val);
          }
        },
        reject: (err) => {
          if (!this._settled && this._status === "running") {
            this._settled = true;
            this._status = "completed";
            reject(err);
          }
        },
        signal: this.signal,
        onCancel: (cb) => {
          if (this._status !== "running") return;
          this._cancelHandlers.push(cb);
        },
      };

      try {
        const result = executor(continuation);
        if (result instanceof Promise) {
          result.catch((e) => {
            continuation.reject(e as E);
          });
        }
      } catch (e) {
        continuation.reject(e as E);
      }
    });
  }

  static sleep(ms: number): Task<void, never> {
    return new Task<void, never>(({ resolve, signal, onCancel }) => {
      const timeout = setTimeout(() => {
        resolve();
      }, ms);

      onCancel(() => {
        clearTimeout(timeout);
      });

      // Also cancel immediately if already aborted
      if (signal.aborted) {
        clearTimeout(timeout);
        resolve(); // or reject, depending on behavior
      }
    });
  }

  cancel(): void {
    if (this._status !== "running" || this._settled) return;

    this._settled = true;
    this._status = "cancelled";
    this._controller.abort();

    for (const handler of this._cancelHandlers) {
      try {
        handler();
      } catch (_) {}
    }

    this._reject(new Error("Task cancelled") as E);
  }

  get status(): TaskStatus {
    return this._status;
  }

  get result(): Promise<T> {
    return this._promise;
  }

  async value(): Promise<T> {
    return await this._promise;
  }

  static detached<T, E extends Error = Error>(
    executor: (continuation: Continuation<T, E>) => void | Promise<void>,
  ): Task<T, E> {
    return new Task(executor);
  }
}
