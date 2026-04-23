import { describe, expect, it } from "vitest";
import { isEnumCase } from "./enum.js";

enum StringEnum {
  FOO = "FOO",
  BAR = "BAR",
  EMPTY = "",
  LOWER = "lower",
  NUMBER = "123",
  SPECIAL = "FOO-BAR",
}

enum MixedEnum {
  FOO = "FOO",
  NUM = 1, // Not a string, should not match
}

describe("isEnumCase", () => {
  it("returns true for valid string enum values", () => {
    expect(isEnumCase("FOO", StringEnum)).toBe(true);
    expect(isEnumCase("BAR", StringEnum)).toBe(true);
    expect(isEnumCase("", StringEnum)).toBe(true);
    expect(isEnumCase("lower", StringEnum)).toBe(true);
    expect(isEnumCase("123", StringEnum)).toBe(true);
    expect(isEnumCase("FOO-BAR", StringEnum)).toBe(true);
  });

  it("returns false for values not in the enum", () => {
    expect(isEnumCase("baz", StringEnum)).toBe(false);
    expect(isEnumCase("foo", StringEnum)).toBe(false);
    expect(isEnumCase("FOO_BAR", StringEnum)).toBe(false);
    expect(isEnumCase(undefined, StringEnum)).toBe(false);
    expect(isEnumCase(null, StringEnum)).toBe(false);
    expect(isEnumCase(123, StringEnum)).toBe(false);
  });

  it("ignores non-string enum values", () => {
    expect(isEnumCase("FOO", MixedEnum)).toBe(true);
    expect(isEnumCase(1, MixedEnum)).toBe(true);
  });
});
