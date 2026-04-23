import { describe, it, expect } from "vitest";
import { OptionSet } from "./option-set.js";
import { Int32, UInt16 } from "./number.js";
import { hexToUint8Array } from "uint8array-extras";
import { Data } from "./buffer.js";
import { readUInt16BE } from "../helpers/data.js";

enum Flags {
  A = 1 << 0,
  B = 1 << 1,
  C = 1 << 2,
}

describe("OptionSet", () => {
  it("creates empty OptionSet", () => {
    const set = OptionSet.empty<Flags>();
    expect(set.rawValue).toBe(0);
  });

  it("insert and contains", () => {
    let set = OptionSet.empty<Flags>();
    set = set.insert(Flags.A);
    expect(set.contains(Flags.A)).toBe(true);
    expect(set.contains(Flags.B)).toBe(false);
  });

  it("remove", () => {
    let set = OptionSet.empty<Flags>().insert(Flags.A).insert(Flags.B);
    set = set.remove(Flags.A);
    expect(set.contains(Flags.A)).toBe(false);
    expect(set.contains(Flags.B)).toBe(true);
  });

  it("toggle", () => {
    let set = OptionSet.empty<Flags>();
    set = set.toggle(Flags.A);
    expect(set.contains(Flags.A)).toBe(true);
    set = set.toggle(Flags.A);
    expect(set.contains(Flags.A)).toBe(false);
  });

  it("union, subtract, intersect, equals", () => {
    const setA = OptionSet.empty<Flags>().insert(Flags.A).insert(Flags.B);
    const setB = OptionSet.empty<Flags>().insert(Flags.B).insert(Flags.C);

    expect(setA.union(setB).contains(Flags.C)).toBe(true);
    expect(setA.subtract(setB).contains(Flags.A)).toBe(true);
    expect(setA.intersect(setB).contains(Flags.B)).toBe(true);
    expect(setA.equals(setA)).toBe(true);
    expect(setA.equals(setB)).toBe(false);
  });

  it("toString", () => {
    const set = OptionSet.empty<Flags>().insert(Flags.A);
    expect(set.toString()).toBe("OptionSet(1)");
  });

  it("isDisjoint returns true for disjoint sets", () => {
    const set1 = new OptionSet<Flags>(Flags.A);
    const set2 = new OptionSet<Flags>(Flags.B);
    expect(set1.isDisjoint(set2)).toBe(true);
  });

  it("isDisjoint returns false for overlapping sets", () => {
    const set1 = new OptionSet<Flags>(Flags.A | Flags.B);
    const set2 = new OptionSet<Flags>(Flags.B | Flags.C);
    expect(set1.isDisjoint(set2)).toBe(false);
  });

  it("isDisjointWithArray returns true if disjoint with all", () => {
    const set = new OptionSet<Flags>(Flags.A);
    const others = [new OptionSet<Flags>(Flags.B), new OptionSet<Flags>(Flags.C)];
    expect(set.isDisjointWithArray(others)).toBe(true);
  });

  it("isDisjointWithArray returns false if any overlap", () => {
    const set = new OptionSet<Flags>(Flags.A | Flags.B);
    const others = [new OptionSet<Flags>(Flags.B), new OptionSet<Flags>(Flags.C)];
    expect(set.isDisjointWithArray(others)).toBe(false);
  });

  it("ble mesh requirement", () => {
    class OutputOobActions extends OptionSet<UInt16> {
      public static blink = new OutputOobActions(1 << 0);
      public static beep = new OutputOobActions(1 << 1);
      public static vibrate = new OutputOobActions(1 << 2);
      public static outputNumeric = new OutputOobActions(1 << 3);
      public static outputAlphanumeric = new OutputOobActions(1 << 4);

      public toString(): string {
        if (this.rawValue === 0) {
          return "None";
        }
        return (
          [
            [OutputOobActions.blink, "Blink"],
            [OutputOobActions.beep, "Beep"],
            [OutputOobActions.vibrate, "Vibrate"],
            [OutputOobActions.outputNumeric, "Output Numeric"],
            [OutputOobActions.outputAlphanumeric, "Output Alphanumeric"],
          ] as Array<[OutputOobActions, string]>
        )
          .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
          .filter((name) => name !== undefined)
          .join(", ");
      }
      static fromData(data: Data, offset: Int32) {
        return new OutputOobActions(readUInt16BE(data, offset));
      }
    }

    const data = hexToUint8Array("0019");
    const outputActions = OutputOobActions.fromData(data, 0);
    expect(outputActions.contains(OutputOobActions.blink.rawValue)).toBe(true);
  });
});
