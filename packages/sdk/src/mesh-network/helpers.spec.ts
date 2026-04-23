import { describe, it, expect } from "vitest";
import { nodeIdentity, networkIdentity } from "./helpers.js";
import { uint8ArrayToBase64 } from "uint8array-extras";

// MeshProxyService UUID: 1828 → 00001828-0000-1000-8000-00805f9b34fb
const PROXY_UUID = "00001828-0000-1000-8000-00805f9b34fb";

function makeServiceData(bytes: number[]): Record<string, unknown> {
  return {
    serviceData: {
      [PROXY_UUID]: uint8ArrayToBase64(new Uint8Array(bytes)),
    },
  };
}

describe("nodeIdentity", () => {
  it("returns null for empty advertisement data", () => {
    expect(nodeIdentity({})).toBeNull();
  });

  it("returns null when serviceData is absent", () => {
    expect(nodeIdentity({ other: "data" })).toBeNull();
  });

  it("returns null when serviceData byte[0] does not match 0x01 or 0x03", () => {
    // byte[0] = 0x05 — unknown type
    const ad = makeServiceData([0x05, ...Array<number>(17).fill(0)] as number[]);
    expect(nodeIdentity(ad)).toBeNull();
  });

  it("parses PublicNodeIdentity (byte[0]=0x01, length=17)", () => {
    // PublicNodeIdentity: type byte=0x01, 8 bytes hash, 8 bytes random
    const ad = makeServiceData([0x01, ...Array<number>(16).fill(0xaa)] as number[]);
    const result = nodeIdentity(ad);
    expect(result).not.toBeNull();
  });

  it("parses PrivateNodeIdentity (byte[0]=0x03, length=17)", () => {
    const ad = makeServiceData([0x03, ...Array<number>(16).fill(0xbb)] as number[]);
    const result = nodeIdentity(ad);
    expect(result).not.toBeNull();
  });
});

describe("networkIdentity", () => {
  it("returns null for empty advertisement data", () => {
    expect(networkIdentity({})).toBeNull();
  });

  it("returns null when serviceData is absent", () => {
    expect(networkIdentity({ other: "data" })).toBeNull();
  });

  it("returns null when serviceData byte[0] does not match 0x00 or 0x02", () => {
    const ad = makeServiceData([0x05, ...Array<number>(8).fill(0)] as number[]);
    expect(networkIdentity(ad)).toBeNull();
  });

  it("parses PublicNetworkIdentity (byte[0]=0x00, length=9)", () => {
    // PublicNetworkIdentity: type=0x00, 8 bytes networkId
    const ad = makeServiceData([0x00, ...Array<number>(8).fill(0xcc)] as number[]);
    const result = networkIdentity(ad);
    expect(result).not.toBeNull();
  });

  it("parses PrivateNetworkIdentity (byte[0]=0x02, length=17)", () => {
    // PrivateNetworkIdentity: type=0x02, 8 bytes randomNumber, 8 bytes obfuscatedId
    const ad = makeServiceData([0x02, ...Array<number>(16).fill(0xdd)] as number[]);
    const result = networkIdentity(ad);
    expect(result).not.toBeNull();
  });
});
