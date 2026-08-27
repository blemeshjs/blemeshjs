export class BindableTinyEmitter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends { [K in keyof E]: (...args: any[]) => void },
> {
  private listeners = new Map<keyof E, Set<E[keyof E]>>();
  private handlerUnbinders = new WeakMap<Partial<E>, () => void>();

  on = <K extends keyof E>(event: K, fn: E[K]): (() => void) => {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(fn);
    return () => set.delete(fn);
  };

  once = <K extends keyof E>(event: K, fn: E[K]): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const off = this.on(event, ((...args: any[]): void => {
      off();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      fn(...args);
    }) as E[K]);
  };

  off = <K extends keyof E>(event: K, fn?: E[K]) => {
    if (fn) {
      this.listeners.get(event)?.delete(fn);
    } else {
      this.listeners.delete(event);
    }
  };

  emit = <K extends keyof E>(event: K, ...args: Parameters<E[K]>) => {
    this.listeners.get(event)?.forEach((fn) => {
      (fn as E[K])(...args);
    });
  };

  bindAllEvents = (handler: Partial<E>): (() => void) => {
    const unbinders: (() => void)[] = [];
    const visited = new Set<string | symbol>();

    let obj: unknown = handler;

    // Walk instance + full prototype chain
    while (obj && obj !== Object.prototype) {
      // Own properties (arrow functions live here)
      for (const key of Reflect.ownKeys(obj)) {
        if (key === "constructor") continue;
        if (visited.has(key)) continue;
        visited.add(key);

        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc && typeof desc.value === "function") {
          const fn = desc.value as (...args: unknown[]) => void;
          unbinders.push(this.on(key as keyof E, fn.bind(handler) as E[keyof E]));
        }
      }

      obj = Object.getPrototypeOf(obj);
    }

    const unbind = () => unbinders.forEach((fn) => fn());
    this.handlerUnbinders.set(handler, unbind);
    return unbind;
  };

  unbindAllEvents = (handler: Partial<E>) => {
    this.handlerUnbinders.get(handler)?.();
    this.handlerUnbinders.delete(handler);
  };
}
