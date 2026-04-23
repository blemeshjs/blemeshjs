import { describe, expect, it } from "vitest";
import { DispatchQueue } from "./dispatch-queue.js";

describe("SerialQueue", () => {
  it("should create a queue with a label", () => {
    const queue = new DispatchQueue("test");
    expect(queue.label).toBe("test");
    expect(queue.toString()).toBe("SerialQueue(test)");
  });

  it("should run async tasks serially", async () => {
    const queue = new DispatchQueue("serial");
    const results: number[] = [];
    await Promise.all([
      queue.async(async () => {
        await new Promise((r) => setTimeout(r, 30));
        results.push(1);
      }),
      queue.async(() => {
        results.push(2);
      }),
    ]);
    // The second task should only run after the first
    expect(results).toEqual([1, 2]);
  });

  it("should provide named queues as singletons", () => {
    const main1 = DispatchQueue.main;
    const main2 = DispatchQueue.named("main");
    expect(main1).toBe(main2);

    const io1 = DispatchQueue.io;
    const io2 = DispatchQueue.named("io");
    expect(io1).toBe(io2);

    const bg1 = DispatchQueue.background;
    const bg2 = DispatchQueue.named("background");
    expect(bg1).toBe(bg2);
  });

  it("should create new named queues if not existing", () => {
    const q1 = DispatchQueue.named("custom");
    const q2 = DispatchQueue.named("custom");
    expect(q1).toBe(q2);
    const q3 = DispatchQueue.named("another");
    expect(q1).not.toBe(q3);
  });
});
