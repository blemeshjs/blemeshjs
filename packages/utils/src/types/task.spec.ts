import { describe, it, expect } from "vitest";
import { Task } from "./task.js";

describe("Task", () => {
  it("should resolve with value", async () => {
    const task = new Task<number>(({ resolve }) => {
      setTimeout(() => resolve(42), 10);
    });
    await expect(task.value()).resolves.toBe(42);
    expect(task.status).toBe("completed");
  });

  it("should reject with error", async () => {
    const task = new Task<number>(({ reject }) => {
      setTimeout(() => reject(new Error("fail")), 10);
    });
    await expect(task.value()).rejects.toThrow("fail");
    expect(task.status).toBe("completed");
  });

  it("should cancel and call cancel handlers", async () => {
    let cancelled = false;
    const task = new Task<void>(({ resolve, onCancel }) => {
      const timeout = setTimeout(resolve, 100);
      onCancel(() => {
        cancelled = true;
        clearTimeout(timeout);
      });
    });
    task.cancel();
    await expect(task.value()).rejects.toThrow("Task cancelled");
    expect(cancelled).toBe(true);
    expect(task.status).toBe("cancelled");
  });

  it("should abort signal on cancel", () => {
    const task = new Task<void>(({}) => {});
    let aborted = false;
    task.signal.addEventListener("abort", () => {
      aborted = true;
    });
    task.cancel();
    task.result.catch(() => {});
    expect(aborted).toBe(true);
  });

  it("should not resolve or reject after cancel", async () => {
    let resolved = false;
    let rejected = false;
    const task = new Task<void>(({ resolve, reject, onCancel }) => {
      onCancel(() => {});
      setTimeout(() => {
        resolved = true;
        resolve();
      }, 20);
      setTimeout(() => {
        rejected = true;
        reject(new Error("fail"));
      }, 20);
    });
    task.cancel();
    await expect(task.value()).rejects.toThrow("Task cancelled");
    expect(resolved).toBe(false);
    expect(rejected).toBe(false);
  });

  it("Task.sleep resolves after ms", async () => {
    const start = Date.now();
    await Task.sleep(30).value();
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });

  it("should cancel the first task if the second one finishes first", async () => {
    const taskA = new Task<number>(({ signal, reject, resolve }) => {
      const onAbort = () => {
        reject(new Error("Task A was cancelled"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      setTimeout(() => {
        resolve(10);
      }, 100);
    });

    const taskB = new Task<void>(async ({ resolve }) => {
      await Task.sleep(10).value();
      resolve();
    });

    const result = await Promise.race([taskA.value(), taskB.value()]).catch((error: Error) => {
      expect(error.message).toBe("Task A was cancelled");
    });
    taskA.cancel();
    taskB.cancel();

    expect(taskA.status).toBe("cancelled");
    expect(result).toBeUndefined();
    expect(taskB.status).toBe("completed");
  });

  it("should return the first task value if the first one finishes first", async () => {
    const taskA = new Task<number>(({ signal, reject, resolve }) => {
      const onAbort = () => {
        reject(new Error("Task A was cancelled"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      setTimeout(() => {
        resolve(10);
      }, 10);
    });

    const taskB = new Task<void>(async ({ resolve }) => {
      await Task.sleep(100).value();
      resolve();
    });

    const result = await Promise.race([taskA.value(), taskB.value()]);
    taskA.cancel();
    taskB.cancel();

    expect(taskA.status).toBe("completed");
    expect(taskB.status).toBe("cancelled");
    expect(result).toBe(10);
  });

  it("should return error if the first task finishes first with error", async () => {
    const taskA = new Task<number>(({ reject }) => {
      setTimeout(() => {
        reject(new Error("Task A failed"));
      }, 10);
    });

    const taskB = new Task<void>(async ({ resolve }) => {
      await Task.sleep(100).value();
      resolve();
    });

    const result = await Promise.race([taskA.value(), taskB.value()]).catch((error: Error) => {
      expect(error.message).toBe("Task A failed");
    });
    taskA.cancel();
    taskB.cancel();

    expect(taskA.status).toBe("completed");
    expect(taskB.status).toBe("cancelled");
    await expect(taskA.result).rejects.toThrow("Task A failed");
    expect(result).toBeUndefined();
  });

  it("Task.sleep can be cancelled", async () => {
    const task = Task.sleep(100);
    setTimeout(() => task.cancel(), 10);
    await expect(task.value()).rejects.toThrow("Task cancelled");
    expect(task.status).toBe("cancelled");
  });
});
