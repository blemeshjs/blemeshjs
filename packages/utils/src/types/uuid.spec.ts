import { describe, expect, it } from "vitest";
import { UUID } from "./uuid.js";

describe("UUID", () => {
  it("generates a valid random UUID by default", () => {
    const uuid = new UUID();
    expect(UUID.isValidUUIDString(uuid.uuidString)).toBe(true);
  });

  it("generates a valid random UUID using static random()", () => {
    const uuid = UUID.random();
    expect(UUID.isValidUUIDString(uuid.uuidString)).toBe(true);
  });

  it("accepts a valid UUID string", () => {
    const valid = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";
    const uuid = new UUID(valid);
    expect(uuid.uuidString).toBe(valid);
    expect(uuid.hex).toBe("1b9d6bcdbbfd4b2d9b5dab8dfbbd4bed");
  });
  it("checks equality", () => {
    const valid = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";
    const uuid = new UUID(valid);
    const uuid1 = new UUID(valid);
    expect(uuid).toEqual(uuid1);
  });

  it("returns undefined on invalid UUID string", () => {
    expect(UUID.fromUuidString("invalid-uuid")).toBeUndefined();
  });

  it("toString returns the UUID string", () => {
    const uuid = new UUID();
    expect(uuid.toString()).toBe(uuid.uuidString);
  });

  it("isValidUUIDString returns true for valid v4 UUID", () => {
    const uuid = UUID.random();
    expect(UUID.isValidUUIDString(uuid.uuidString)).toBe(true);
  });

  it("isValidUUIDString returns false for invalid UUID", () => {
    expect(UUID.isValidUUIDString("not-a-uuid")).toBe(false);
  });
});
