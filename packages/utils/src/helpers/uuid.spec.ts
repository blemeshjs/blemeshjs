import { describe, expect, it } from "vitest";
import { uuidToHex, uuidToUint8Array } from "./uuid.js";

describe("uuidToHex", () => {
  it("should remove dashes and convert to lowercase", () => {
    const uuid = "123E4567-E89B-12D3-A456-426614174000";
    const expected = "123e4567e89b12d3a456426614174000";
    expect(uuidToHex(uuid)).toBe(expected);
  });

  it("should handle already lowercase and no dashes", () => {
    const uuid = "123e4567e89b12d3a456426614174000";
    expect(uuidToHex(uuid)).toBe(uuid);
  });
});

describe("uuidToUint8Array", () => {
  it("should convert uuid to Uint8Array", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const arr = uuidToUint8Array(uuid);
    expect(arr).toBeInstanceOf(Uint8Array);
    expect(arr.length).toBe(16);
    // Check first and last bytes
    expect(arr[0]).toBe(parseInt("12", 16));
    expect(arr[15]).toBe(parseInt("00", 16));
  });
});
