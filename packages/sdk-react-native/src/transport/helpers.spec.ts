import { getHexDeviceId } from "./helpers";
import { describe, expect, it } from "vitest";

describe("getHexDeviceId", () => {
  it("should return empty string for falsy deviceId", () => {
    expect(getHexDeviceId("")).toBe("");
    expect(getHexDeviceId(undefined as unknown as string)).toBe("");
    expect(getHexDeviceId(null as unknown as string)).toBe("");
  });

  it("should remove colons, spaces, and hyphens and uppercase", () => {
    expect(getHexDeviceId("12:34:56:78:9A:BC")).toBe("123456789ABC");
    expect(getHexDeviceId("12-34-56-78-9a-bc")).toBe("123456789ABC");
    expect(getHexDeviceId("68EDF61A-D073-9547-A768-3D9DDA15C36E")).toBe(
      "68EDF61AD0739547A7683D9DDA15C36E",
    );
    expect(getHexDeviceId("12 34 56 78 9a bc")).toBe("123456789ABC");
    expect(getHexDeviceId("123456789abc")).toBe("123456789ABC");
  });

  it("should handle mixed separators", () => {
    expect(getHexDeviceId("12:34-56 78:9a-bc")).toBe("123456789ABC");
  });
});
