import { describe, expect, it } from "vitest";
import { NSNull } from "./common.js";

describe("Common Types", () => {
  describe("NSNull", () => {
    it("should be a symbol", () => {
      expect(typeof NSNull).toBe("symbol");
    });

    it("should have correct description", () => {
      expect(NSNull.toString()).toBe("Symbol(NSNull)");
    });

    it("should be unique", () => {
      const anotherSymbol = Symbol("NSNull");
      expect(NSNull).not.toBe(anotherSymbol);
    });
  });
});
