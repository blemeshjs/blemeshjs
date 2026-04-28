import { describe, expect, it } from "vitest";
import { AddressRange, SceneRange } from "../mesh-models/index.js";
import { mergedRanges } from "./ranges.js";
import { Address, ClosedRange, SceneNumber } from "@blemeshjs/utils";

describe("Ranges", () => {
  it("should merge address ranges properly", () => {
    const ranges = mergedRanges([
      new AddressRange(new ClosedRange(new Address(10), new Address(20))),
      new AddressRange(new ClosedRange(new Address(30), new Address(40))),
      new AddressRange(new ClosedRange(new Address(1), new Address(5))),
      new AddressRange(new ClosedRange(new Address(15), new Address(50))),
    ]);
    // Ranges should be merge into 2 separate ranges.
    expect(ranges.length).toBe(2);

    // Result should be also ordered.
    expect(ranges[0].lowAddress).toEqual(new Address(1));
    expect(ranges[0].highAddress).toEqual(new Address(5));
    expect(ranges[1].lowAddress).toEqual(new Address(10));
    expect(ranges[1].highAddress).toEqual(new Address(50));
  });

  it("should merge scene ranges properly", () => {
    const ranges = mergedRanges([
      new SceneRange(new ClosedRange(new SceneNumber(1), new SceneNumber(10))),
      new SceneRange(new ClosedRange(new SceneNumber(20), new SceneNumber(30))),
      new SceneRange(new ClosedRange(new SceneNumber(40), new SceneNumber(50))),
    ]);
    // Ranges should be merge into 3 separate ranges.
    expect(ranges.length).toBe(3);

    // They should be order by range
    expect(ranges[0].firstScene).toEqual(new SceneNumber(1));
    expect(ranges[1].firstScene).toEqual(new SceneNumber(20));
    expect(ranges[2].firstScene).toEqual(new SceneNumber(40));
  });

  it("should merge lower bound", () => {
    const ranges = mergedRanges([
      new SceneRange(new ClosedRange(new SceneNumber(5), new SceneNumber(10))),
      new SceneRange(new ClosedRange(new SceneNumber(5), new SceneNumber(20))),
    ]);
    // Ranges should be merge into 1 element.
    expect(ranges.length).toBe(1);

    // They should be order by range
    expect(ranges[0].firstScene).toEqual(new SceneNumber(5));
    expect(ranges[0].lastScene).toEqual(new SceneNumber(20));
  });

  it("should merge upper bound", () => {
    const ranges = mergedRanges([
      new SceneRange(new ClosedRange(new SceneNumber(5), new SceneNumber(10))),
      new SceneRange(new ClosedRange(new SceneNumber(1), new SceneNumber(10))),
    ]);
    // Ranges should be merge into 1 element.
    expect(ranges.length).toBe(1);

    // They should be order by range
    expect(ranges[0].firstScene).toEqual(new SceneNumber(1));
    expect(ranges[0].lastScene).toEqual(new SceneNumber(10));
  });
});
