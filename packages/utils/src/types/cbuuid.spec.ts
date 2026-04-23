import { describe, expect, it } from "vitest";
import { CBUUID } from "./cbuuid.js";
import { UUID } from "./uuid.js";

describe("CBUUID", () => {
  it("should construct from a string", () => {
    const uuid = new CBUUID("1234abcd");
    expect(uuid.fullUuidString).toBe("1234ABCD-0000-1000-8000-00805F9B34FB");
  });

  it("should construct from a number", () => {
    const uuid = new CBUUID("180d");
    expect(uuid.fullUuidString).toBe("0000180D-0000-1000-8000-00805F9B34FB");
    expect(uuid.shortUuid).toBe("180d");
  });

  it("should construct from a Uint8Array", () => {
    const arr = new Uint8Array([0x12, 0x34, 0xab, 0xcd]);
    const uuid = new CBUUID(arr);
    expect(uuid.fullUuidString).toBe("1234ABCD-0000-1000-8000-00805F9B34FB");
  });

  it("should compare equality correctly", () => {
    const uuid1 = new CBUUID("1234abcd");
    const uuid2 = new CBUUID("1234ABCD");
    expect(uuid1.equals(uuid2)).toBe(true);
  });

  it("should uuid from cbuuid", () => {
    const cbuuid = new CBUUID("1234abcd");
    const uuid = cbuuid.uuid;
    expect(uuid).toBeInstanceOf(UUID);
  });

  it("should create from string using static method", () => {
    const uuid = new CBUUID("abcd");
    expect(uuid.fullUuidString).toBe("0000ABCD-0000-1000-8000-00805F9B34FB");
  });

  it("should not equal different UUIDs", () => {
    const uuid1 = new CBUUID("abcd");
    const uuid2 = new CBUUID("12340000");
    expect(uuid1.equals(uuid2)).toBe(false);
  });

  it("should create cbuuid from web bluetooth uuid", () => {
    // uuid from web bluetooth
    const uuid = new CBUUID("00002ab4-0000-1000-8000-00805f9b34fb");
    expect(uuid).toBeInstanceOf(CBUUID);
    expect(uuid.fullUuidString.toLowerCase()).toBe("00002ab4-0000-1000-8000-00805f9b34fb");
  });
});
