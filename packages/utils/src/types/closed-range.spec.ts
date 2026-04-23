import { describe, it, expect } from "vitest";
import { ClosedRange } from "./closed-range.js";
import Long from "long";

describe("ClosedRange", () => {
  it("should create a valid number range", () => {
    const range = new ClosedRange(1, 5);
    expect(range.lowerBound).toBe(1);
    expect(range.upperBound).toBe(5);
    expect(range.toString()).toBe("1...5");
  });

  it("should throw if lower > upper for numbers", () => {
    expect(() => new ClosedRange(10, 5)).toThrow("Invalid range: lower > upper");
  });

  it("should create a valid string range", () => {
    const range = new ClosedRange("a", "z");
    expect(range.lowerBound).toBe("a");
    expect(range.upperBound).toBe("z");
    expect(range.toString()).toBe("a...z");
  });

  it("should throw if lower > upper for strings", () => {
    expect(() => new ClosedRange("z", "a")).toThrow("Invalid range: lower > upper");
  });

  it("should use custom comparator", () => {
    const comparator = (a: { v: number }, b: { v: number }) => a.v - b.v;
    const range = new ClosedRange({ v: 1 }, { v: 3 }, comparator);
    expect(range.contains({ v: 2 })).toBe(true);
    expect(range.contains({ v: 4 })).toBe(false);
  });

  it("should check contains correctly", () => {
    const range = new ClosedRange(1, 5);
    expect(range.contains(1)).toBe(true);
    expect(range.contains(3)).toBe(true);
    expect(range.contains(5)).toBe(true);
    expect(range.contains(0)).toBe(false);
    expect(range.contains(6)).toBe(false);
  });

  it("should iterate over number range with forEach", () => {
    const range = new ClosedRange(2, 4);
    const values: number[] = [];
    range.forEach((v) => values.push(v));
    expect(values).toEqual([2, 3, 4]);
  });

  it("should throw for forEach on non-number range", () => {
    const range = new ClosedRange("a", "c");
    expect(() => range.forEach(() => {})).toThrow("forEach only supports number ranges");
  });

  it("returns correct length for number range", () => {
    const range = new ClosedRange(3, 7);
    expect(range.length).toEqual(Long.fromNumber(5)); // 7 - 3 + 1 = 5
  });

  it("returns 1 for single-value number range", () => {
    const range = new ClosedRange(5, 5);
    expect(range.length).toEqual(Long.fromNumber(1)); // 5 - 5 + 1 = 1
  });

  it("returns undefined for string range", () => {
    const range = new ClosedRange("a", "z");
    expect(range.length).toBeUndefined();
  });

  it("returns undefined for custom comparator range", () => {
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v;
    const range = new ClosedRange({ v: 1 }, { v: 3 }, cmp);
    expect(range.length).toBeUndefined();
  });

  it("returns undefined if bounds are not numbers", () => {
    const range = new ClosedRange(false, true);
    expect(range.length).toBeUndefined();
  });
});
