import { describe, expect, it } from "vitest";
import { RangeObject } from "./range-object.js";
import { ClosedRange } from "./closed-range.js";

describe("RangeObject", () => {
  it("should create a range object", () => {
    const range = new ClosedRange(0, 10);
    const rangeObject = new RangeObject(range);

    expect(rangeObject.lowerBound).toBe(0);
    expect(rangeObject.upperBound).toBe(10);
  });

  it("should return correct count", () => {
    const range = new ClosedRange(5, 15);
    const rangeObject = new RangeObject(range);

    expect(rangeObject.count.toNumber()).toBe(11);
  });

  it("should check if value is contained", () => {
    const range = new ClosedRange(10, 20);
    const rangeObject = new RangeObject(range);

    expect(rangeObject.contains(15)).toBe(true);
    expect(rangeObject.contains(10)).toBe(true);
    expect(rangeObject.contains(20)).toBe(true);
    expect(rangeObject.contains(5)).toBe(false);
    expect(rangeObject.contains(25)).toBe(false);
  });

  it("should check if range is contained", () => {
    const range1 = new ClosedRange(10, 30);
    const rangeObject1 = new RangeObject(range1);

    const range2 = new ClosedRange(15, 25);
    const rangeObject2 = new RangeObject(range2);

    expect(rangeObject1.containsRange(rangeObject2)).toBe(true);

    const range3 = new ClosedRange(5, 15);
    const rangeObject3 = new RangeObject(range3);

    expect(rangeObject1.containsRange(rangeObject3)).toBe(false);
  });

  it("should check if ranges overlap", () => {
    const range1 = new ClosedRange(10, 20);
    const rangeObject1 = new RangeObject(range1);

    const range2 = new ClosedRange(15, 25);
    const rangeObject2 = new RangeObject(range2);

    expect(rangeObject1.overlaps(rangeObject2)).toBe(true);

    const range3 = new ClosedRange(25, 30);
    const rangeObject3 = new RangeObject(range3);

    expect(rangeObject1.overlaps(rangeObject3)).toBe(false);
  });

  it("should provide access to underlying range", () => {
    const range = new ClosedRange(0, 100);
    const rangeObject = new RangeObject(range);

    expect(rangeObject.range).toBe(range);
  });
});
