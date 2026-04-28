import { describe, expect, it } from "vitest";
import { NetworkKey } from "../src/mesh-models/network-key.js";
import { hexToUint8Array } from "uint8array-extras";
import { IvIndex, KeyIndex } from "@blemeshjs/utils";
import { NetworkPdu } from "../src/layers/network-layer/network-pdu.js";
import { PduType } from "../src/bearer/bearer.js";
import { LowerTransportPduType } from "../src/layers/lower-transport-layer/lower-transport-pdu.js";

describe("Network Pdus", () => {
  it("decodes access message", () => {
    const networkKey = NetworkKey.fromName(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    ) as NetworkKey;
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("68cab5c5348a230afba8c63d4e686364979deaf4fd40961145939cda0e");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeDefined();
    expect(networkPdu!.ivi).toBe(0x0);
    expect(networkPdu!.nid).toBe(0x68);
    expect(networkPdu!.type).toBe(LowerTransportPduType.accessMessage);
    expect(networkPdu!.ttl).toBe(4);
    expect(networkPdu!.sequence).toBe(0x3129ab);
    expect(networkPdu!.source.valueOf()).toBe(0x003);
    expect(networkPdu!.destination.valueOf()).toBe(0x1201);
    expect(networkPdu!.transportPdu).toEqual(hexToUint8Array("8026ac01ee9dddfd2169326d23f3afdf"));
  });

  it("decodes control message", () => {
    const networkKey = NetworkKey.fromName(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    ) as NetworkKey;
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeDefined();
    expect(networkPdu!.ivi).toBe(0x0);
    expect(networkPdu!.nid).toBe(0x68);
    expect(networkPdu!.type).toBe(LowerTransportPduType.controlMessage);
    expect(networkPdu!.ttl).toBe(0);
    expect(networkPdu!.sequence).toBe(1);
    expect(networkPdu!.source.valueOf()).toBe(0x1201);
    expect(networkPdu!.destination.valueOf()).toBe(0xfffd);
    expect(networkPdu!.transportPdu).toEqual(hexToUint8Array("034b50057e400000010000"));
  });

  it("decodes control message using old key", () => {
    const networkKey = NetworkKey.fromName(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    ) as NetworkKey;
    networkKey.key = hexToUint8Array("7d01D01D01D01D01D01D01D01D01D01D");
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeDefined();
    expect(networkPdu!.ivi).toBe(0x0);
    expect(networkPdu!.nid).toBe(0x68);
    expect(networkPdu!.type).toBe(LowerTransportPduType.controlMessage);
    expect(networkPdu!.ttl).toBe(0);
    expect(networkPdu!.sequence).toBe(1);
    expect(networkPdu!.source.valueOf()).toBe(0x1201);
    expect(networkPdu!.destination.valueOf()).toBe(0xfffd);
    expect(networkPdu!.transportPdu).toEqual(hexToUint8Array("034b50057e400000010000"));
  });
  it("decodes control message with next iv index", () => {
    const networkKey = new NetworkKey(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345679, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu);
    expect(networkPdu!.ivi).toBe(0x0);
    expect(networkPdu!.nid).toBe(0x68);
    expect(networkPdu!.type).toBe(LowerTransportPduType.controlMessage);
    expect(networkPdu!.sequence).toBe(1);
    expect(networkPdu!.source.valueOf()).toBe(0x1201);
    expect(networkPdu!.destination.valueOf()).toBe(0xfffd);
    expect(networkPdu!.transportPdu).toEqual(hexToUint8Array("034b50057e400000010000"));
  });

  it("returns undefined too large on decoding control message with wrong iv index", () => {
    const networkKey = new NetworkKey(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345680, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeUndefined();
  });

  it("returns undefined too small on decoding control message with wrong iv index", () => {
    const networkKey = new NetworkKey(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345677, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeUndefined();
  });

  it("decoding message with wrong key", () => {
    const networkKey = new NetworkKey(
      "Other Key",
      new KeyIndex(0),
      hexToUint8Array("8dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeUndefined();
  });

  it("decoding message with wrong key 2", () => {
    const networkKey = new NetworkKey(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("68eca487516765b5e5bfdacbaf6cb7fb7bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeUndefined();
  });

  it("decoding control message with wrong nid", () => {
    const networkKey = new NetworkKey(
      "Test Key",
      new KeyIndex(0),
      hexToUint8Array("7dd7364cd842ad18c17c2b820c84c3d6"),
    );
    const ivIndex = new IvIndex(0x12345678, false);
    const data = hexToUint8Array("69eca487516765b5e5bfdacbaf6cb7fb6bff871f035444ce83a670df");

    const networkPdu = NetworkPdu.decode(data, PduType.networkPdu, networkKey, ivIndex);
    expect(networkPdu).toBeUndefined();
  });
});
