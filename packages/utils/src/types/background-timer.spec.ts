import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BackgroundTimer } from "./background-timer.js";
import { DispatchQueue } from "./dispatch-queue.js";

describe("BackgroundTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("repeating timers", () => {
    it("should repeatedly trigger the callback at specified intervals", async () => {
      const callback = vi.fn();
      const interval = 1; // 1 second
      const timer = new BackgroundTimer(
        interval,
        true, // repeats
        callback,
        DispatchQueue.main,
      );

      // Verify initial state
      expect(callback).not.toHaveBeenCalled();
      expect(timer.remainingTime).toBeCloseTo(interval);

      // First interval
      await vi.advanceTimersByTimeAsync(interval * 1000);
      expect(callback).toHaveBeenCalledOnce();
      expect(timer.remainingTime).toBeCloseTo(interval);

      // Second interval
      await vi.advanceTimersByTimeAsync(interval * 1000);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(timer.remainingTime).toBeCloseTo(interval);

      // Third interval (partial)
      await vi.advanceTimersByTimeAsync(500); // Half interval
      expect(callback).toHaveBeenCalledTimes(2);
      expect(timer.remainingTime).toBeCloseTo(0.5);

      // Complete third interval
      await vi.advanceTimersByTimeAsync(500);
      expect(callback).toHaveBeenCalledTimes(3);

      // Cleanup
      timer.invalidate();
    });

    it("should stop repeating after invalidate() is called", async () => {
      const callback = vi.fn();
      const timer = new BackgroundTimer(1, true, callback);

      // Trigger twice
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(2);

      // Invalidate and verify stops
      timer.invalidate();
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("non-repeating timers", () => {
    it("should trigger once and auto-invalidate", async () => {
      const callback = vi.fn();
      const timer = new BackgroundTimer(1, false, callback);

      // Verify not called prematurely
      await vi.advanceTimersByTimeAsync(500);
      expect(callback).not.toHaveBeenCalled();

      // Complete interval
      await vi.advanceTimersByTimeAsync(500);
      expect(callback).toHaveBeenCalledOnce();

      // Verify auto-invalidated
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledOnce();
      expect(timer.remainingTime).toBe(0);
    });
  });

  describe("queue behavior", () => {
    it("should execute callbacks in the specified queue", async () => {
      const queue = new DispatchQueue("test-queue");
      const queueSpy = vi.spyOn(queue, "async");
      const callback = vi.fn();

      new BackgroundTimer(1, true, callback, queue);

      // Trigger timer
      await vi.advanceTimersByTimeAsync(1000);
      expect(queueSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it("should maintain queue serialization", async () => {
      const queue = new DispatchQueue("serial-queue");
      const results: number[] = [];

      new BackgroundTimer(
        0.1,
        false,
        () => {
          results.push(1);
        },
        queue,
      );

      new BackgroundTimer(
        0.2,
        false,
        () => {
          results.push(2);
        },
        queue,
      );

      // Advance past both timers
      await vi.advanceTimersByTimeAsync(300);

      // Verify callbacks executed in timer order (not schedule order)
      expect(results).toEqual([1, 2]);
    });
  });

  describe("remainingTime", () => {
    it("should accurately report remaining time", async () => {
      const callback = vi.fn();
      const timer = new BackgroundTimer(2, false, callback);

      // Initial state
      expect(timer.remainingTime).toBeCloseTo(2);

      // After 1 second
      await vi.advanceTimersByTimeAsync(1000);
      expect(timer.remainingTime).toBeCloseTo(1);

      // After 1.5 seconds
      await vi.advanceTimersByTimeAsync(500);
      expect(timer.remainingTime).toBeCloseTo(0.5);

      // After completion
      await vi.advanceTimersByTimeAsync(500);
      expect(timer.remainingTime).toBe(0);
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
