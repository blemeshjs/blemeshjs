import { describe, expect, it } from "vitest";
import { timeIntervalSinceNow } from "./date.js";

describe("Date Helper", () => {
  describe("timeIntervalSinceNow", () => {
    it("should return positive value for future dates", () => {
      const futureDate = Date.now() + 10000; // 10 seconds in future
      const interval = timeIntervalSinceNow(futureDate);
      expect(interval).toBeGreaterThan(0);
      expect(interval).toBeCloseTo(10, 0);
    });

    it("should return negative value for past dates", () => {
      const pastDate = Date.now() - 10000; // 10 seconds in past
      const interval = timeIntervalSinceNow(pastDate);
      expect(interval).toBeLessThan(0);
      expect(interval).toBeCloseTo(-10, 0);
    });

    it("should return approximately 0 for current time", () => {
      const now = Date.now();
      const interval = timeIntervalSinceNow(now);
      expect(Math.abs(interval)).toBeLessThan(0.1);
    });
  });
});
