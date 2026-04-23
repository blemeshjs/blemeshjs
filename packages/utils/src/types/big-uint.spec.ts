import { describe, expect, it } from "vitest";
import { BigUInt } from "./big-uint.js";

describe("BigUInt", () => {
  it("constructs from decimal string and returns correct decimal string", () => {
    expect(new BigUInt("0").toDecimalString()).toBe("0");
    expect(new BigUInt("123456789").toDecimalString()).toBe("123456789");
    expect(new BigUInt("99999999999999999999999999999999").toDecimalString()).toBe(
      "99999999999999999999999999999999",
    );
  });

  it("throws on invalid decimal string", () => {
    expect(() => new BigUInt("")).toThrow();
    expect(() => new BigUInt("abc")).toThrow();
    expect(() => new BigUInt("123abc")).toThrow();
    expect(() => new BigUInt("1.23")).toThrow();
  });

  it("throws on too long decimal string", () => {
    const longStr = "1".repeat(BigUInt.maxDecimalDigits + 1);
    expect(() => new BigUInt(longStr)).toThrow();
  });

  it("toBytes returns correct big-endian bytes", () => {
    const b = new BigUInt("4660"); // 0x1234
    expect(b.toBytes(2)).toEqual(new Uint8Array([0x12, 0x34]));
    expect(b.toBytes(4)).toEqual(new Uint8Array([0x00, 0x00, 0x12, 0x34]));
    expect(b.toBytes(1)).toBeUndefined();
  });

  it("random generates valid BigUInts", () => {
    for (let i = 1; i <= BigUInt.maxDecimalDigits; i++) {
      const b = BigUInt.random(i);
      expect(b).toBeInstanceOf(BigUInt);
      expect(b!.toDecimalString().length).toBe(i);
    }
    expect(BigUInt.random(0)).toBeUndefined();
    expect(BigUInt.random(BigUInt.maxDecimalDigits + 1)).toBeUndefined();
  });

  it("toString returns decimal string", () => {
    const b = new BigUInt("12345");
    expect(b.toString()).toBe("12345");
  });

  it("handles leading zeros in input", () => {
    expect(new BigUInt("0000123").toDecimalString()).toBe("123");
  });

  it("handles large numbers", () => {
    const big = "98765432101234567890987654321012";
    const b = new BigUInt(big);
    expect(b.toDecimalString()).toBe(big);
  });
});
