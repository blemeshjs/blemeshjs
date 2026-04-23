import { describe, it, expect } from "vitest";
import { KeyIndex } from "./key-index.js";

describe("KeyIndex", () => {
  it("should create a KeyIndex instance", () => {
    const key = new KeyIndex(1234);
    expect(key).toBeInstanceOf(KeyIndex);
    expect(key.valueOf()).toBe(1234);
  });

  it("should return bytes in LE and BE order", () => {
    const key = new KeyIndex(0x123);
    expect(key.bytes).toBeInstanceOf(Uint8Array);
    expect(key.bytesBE).toBeInstanceOf(Uint8Array);
    // Check actual values
    expect(Array.from(key.bytes)).toEqual([0x23, 0x01]);
    expect(Array.from(key.bytesBE)).toEqual([0x01, 0x23]);
  });

  it("should compare equality", () => {
    const key1 = new KeyIndex(100);
    const key2 = new KeyIndex(100);
    const key3 = new KeyIndex(101);
    expect(key1.equal(key2)).toBe(true);
    expect(key1.equal(key3)).toBe(false);
  });

  it("should validate key index range", () => {
    expect(new KeyIndex(0).isValidKeyIndex).toBe(true);
    expect(new KeyIndex(4095).isValidKeyIndex).toBe(true);
    expect(new KeyIndex(4096).isValidKeyIndex).toBe(false);
    expect(new KeyIndex(-1).isValidKeyIndex).toBe(false);
  });
});
