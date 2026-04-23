import { describe, expect, it } from "vitest";
import { ProxyProtocolHandler } from "../src/bearer/gatt/proxy-protocol-handler.js";
import { PduType } from "../src/bearer/bearer.js";
import Long from "long";

describe("Proxy Protocol", () => {
  it("simple message", () => {
    const proxyProtocol = new ProxyProtocolHandler();

    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const packets = proxyProtocol.segment(data, PduType.networkPdu, Long.fromNumber(11));

    expect(packets.length).toBe(1);
    expect(packets[0]).toEqual(new Uint8Array([0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
  it("short mtu message", () => {
    const proxyProtocol = new ProxyProtocolHandler();

    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const packets = proxyProtocol.segment(data, PduType.meshBeacon, Long.fromNumber(4));

    expect(packets.length).toBe(4);
    expect(packets[0]).toEqual(new Uint8Array([(1 << 6) | 1, 0, 1, 2]));
    expect(packets[1]).toEqual(new Uint8Array([(2 << 6) | 1, 3, 4, 5]));
    expect(packets[2]).toEqual(new Uint8Array([(2 << 6) | 1, 6, 7, 8]));
    expect(packets[3]).toEqual(new Uint8Array([(3 << 6) | 1, 9]));
  });
});
