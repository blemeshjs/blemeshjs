import { describe, expect, it } from "vitest";
import { KeyRefreshPhase } from "./key-refresh-phase.js";

describe("KeyRefreshPhase", () => {
  it("should have normalOperation with value 0", () => {
    expect(KeyRefreshPhase.normalOperation).toBe(0);
  });

  it("should have keyDistribution with value 1", () => {
    expect(KeyRefreshPhase.keyDistribution).toBe(1);
  });

  it("should have usingNewKeys with value 2", () => {
    expect(KeyRefreshPhase.usingNewKeys).toBe(2);
  });

  describe("keyRefreshPhaseFrom", () => {
    it("should return normalOperation for value 0", () => {
      expect(KeyRefreshPhase.from(0)).toBe(KeyRefreshPhase.normalOperation);
    });

    it("should return keyDistribution for value 1", () => {
      expect(KeyRefreshPhase.from(1)).toBe(KeyRefreshPhase.keyDistribution);
    });

    it("should return usingNewKeys for value 2", () => {
      expect(KeyRefreshPhase.from(2)).toBe(KeyRefreshPhase.usingNewKeys);
    });

    it("should return undefined for invalid value", () => {
      expect(KeyRefreshPhase.from(3)).toBeUndefined();
      expect(KeyRefreshPhase.from(-1)).toBeUndefined();
      expect(KeyRefreshPhase.from(99)).toBeUndefined();
    });
  });
});
