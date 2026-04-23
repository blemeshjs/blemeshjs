import { describe, expect, it } from "vitest";
import { Address } from "./address.js";

describe("Address", () => {
  it("should identify unassigned address", () => {
    expect(Address.unassignedAddress.isUnassigned).toBe(true);
    expect(new Address(0x0000).isUnassigned).toBe(true);
    expect(new Address(0x0001).isUnassigned).toBe(false);
  });

  it("should identify valid addresses", () => {
    expect(new Address(0x0001).isValidAddress).toBe(true);
    expect(new Address(0xfffc).isValidAddress).toBe(true);
    expect(new Address(0xffff).isValidAddress).toBe(true);
  });

  it("should identify unicast addresses", () => {
    expect(new Address(0x0001).isUnicast).toBe(true);
    expect(new Address(0x7fff).isUnicast).toBe(true);
    expect(new Address(0x8000).isUnicast).toBe(false);
    expect(Address.unassignedAddress.isUnicast).toBe(false);
  });

  it("should identify virtual addresses", () => {
    expect(new Address(0x8000).isVirtual).toBe(true);
    expect(new Address(0x9000).isVirtual).toBe(true);
    expect(new Address(0xc000).isVirtual).toBe(false);
  });

  it("should identify group addresses", () => {
    expect(new Address(0xc000).isGroup).toBe(true);
    expect(new Address(0xfeff).isGroup).toBe(true);
    expect(new Address(0x8000).isGroup).toBe(false);
    expect(new Address(0xfffc).isGroup).toBe(true); // special group
  });

  it("should identify special group addresses", () => {
    expect(Address.allProxies.isSpecialGroup).toBe(true);
    expect(Address.allFriends.isSpecialGroup).toBe(true);
    expect(Address.allRelays.isSpecialGroup).toBe(true);
    expect(Address.allNodes.isSpecialGroup).toBe(true);
    expect(new Address(0xff00).isSpecialGroup).toBe(true);
    expect(new Address(0xfeff).isSpecialGroup).toBe(false);
  });

  it("should have correct static address values", () => {
    expect(Address.allProxies.valueOf()).toBe(0xfffc);
    expect(Address.allFriends.valueOf()).toBe(0xfffd);
    expect(Address.allRelays.valueOf()).toBe(0xfffe);
    expect(Address.allNodes.valueOf()).toBe(0xffff);
  });

  it("should convert to decimal value", () => {
    expect(new Address(0x1234).dec).toBe(0x1234);
    expect(new Address(0xabcd).dec).toBe(0xabcd);
  });

  it("should convert to bytes", () => {
    const address = new Address(0x1234);
    const bytes = address.bytes;
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(2);
  });

  it("should convert to bytes big endian", () => {
    const address = new Address(0x1234);
    const bytes = address.bytesBE;
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(2);
  });

  it("should check equality", () => {
    const addr1 = new Address(0x1234);
    const addr2 = new Address(0x1234);
    const addr3 = new Address(0x5678);

    expect(addr1.equal(addr2)).toBe(true);
    expect(addr1.equal(addr3)).toBe(false);
  });

  it("should create address from hex", () => {
    const address = Address.fromHex("1234");
    expect(address).toBeDefined();
    expect(address?.valueOf()).toBe(0x1234);
  });

  it("should return undefined for invalid hex length", () => {
    expect(Address.fromHex("123")).toBeUndefined();
    expect(Address.fromHex("12345")).toBeUndefined();
  });

  it("should return undefined for invalid hex string", () => {
    const address = Address.fromHex("GGGG");
    expect(address?.valueOf()).toBe(NaN);
  });
});
