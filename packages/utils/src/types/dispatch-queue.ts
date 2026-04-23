import { Mutex } from "async-mutex";

export class DispatchQueue {
  private static readonly queues = new Map<string, DispatchQueue>();

  readonly label: string;
  private mutex = new Mutex();

  constructor(label: string) {
    this.label = label;
  }

  async async(execute: () => void | Promise<void>): Promise<void> {
    await this.mutex.runExclusive(execute);
  }

  toString() {
    return `SerialQueue(${this.label})`;
  }
  /** Get or create a named queue */
  static named(label: string): DispatchQueue {
    if (!this.queues.has(label)) {
      this.queues.set(label, new DispatchQueue(label));
    }
    return this.queues.get(label)!;
  }

  /** Static properties for common queues */
  static get main(): DispatchQueue {
    return this.named("main");
  }

  static get io(): DispatchQueue {
    return this.named("io");
  }

  static get background(): DispatchQueue {
    return this.named("background");
  }

  async executeTimerCallback(callback: () => void): Promise<void> {
    await this.async(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in timer callback (${this.label}):`, error);
      }
    });
  }
}
