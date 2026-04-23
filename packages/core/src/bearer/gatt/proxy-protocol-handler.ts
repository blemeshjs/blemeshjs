import { Data, Int64, UInt8 } from "@mesh-link-js/utils";
import { PduType } from "../bearer.js";
import { concatUint8Arrays } from "uint8array-extras";

class SAR extends Number {
  public static completeMessage = new SAR(0b00);
  public static firstSegment = new SAR(0b01);
  public static continuation = new SAR(0b10);
  public static lastSegment = new SAR(0b11);

  public get value(): UInt8 {
    return this.valueOf() << 6;
  }

  public equal(other: unknown) {
    return other instanceof SAR && this.valueOf() === other.valueOf();
  }

  public static fromData(data: Data): SAR | undefined {
    return new SAR(data[0] >> 6);
  }
}

/**
 * This helper class allows segmentation and reassembly (SAR) using
 * the Proxy Protocol defined in Bluetooth Mesh Profile 1.0.1.
 */
export class ProxyProtocolHandler {
  private buffer?: Data;
  private bufferType?: PduType;

  public constructor() {}

  /**
   * Segments the given data with given message type to 1+ messages
   * where all but the last one are of the MTU size and the last one
   * is MTU size or smaller.
   *
   * This method implements the Proxy Protocol from Bluetooth Mesh
   * specification.
   *
   * @param data The data to be segmented.
   * @param messageType The data type.
   * @param mtu The maximum size of a packet to be sent.
   */
  public segment(data: Data, messageType: PduType, mtu: Int64): Array<Data> {
    const packets: Array<Data> = [];

    if (data.length <= mtu.sub(1).toNumber()) {
      // Whole data can fit into a single packet.
      let singlePacket = new Uint8Array([SAR.completeMessage.value | messageType]);
      singlePacket = concatUint8Arrays([singlePacket, data]);
      packets.push(singlePacket);
    } else {
      // Data needs to be segmented.
      for (let i = 0; i <= data.length; i += mtu.sub(1).toNumber()) {
        const sar =
          i == 0
            ? SAR.firstSegment
            : i + mtu.sub(1).toNumber() > data.length
              ? SAR.lastSegment
              : SAR.continuation;
        let singlePacket = new Uint8Array([sar.value | messageType]);
        singlePacket = concatUint8Arrays([
          singlePacket,
          data.slice(i, Math.min(data.length, i + mtu.sub(1).toNumber())),
        ]);
        packets.push(singlePacket);
      }
    }

    return packets;
  }

  /**
   * This method consumes the given data. If the data were segmented,
   * they are buffered until the last segment is received.
   * This method returns the message and its type when the last segment
   * (or the only one) has been received, otherwise it returns `undefined`.
   *
   * The packets must be delivered in order. If a new message is
   * received while the previous one is still reassembled, the old
   * one will be disregarded. Invalid messages are disregarded.
   *
   * @param data The data received.
   * @returns The message and its type, or `undefined`, if more data are expected.
   */
  public reassemble(data: Data): { data: Data; messageType: PduType } | undefined {
    if (data.length <= 0) {
      // Disregard invalid packet.
      return undefined;
    }

    const sar = SAR.fromData(data);
    if (typeof sar === "undefined") {
      // Disregard invalid packet.
      return undefined;
    }
    const messageType = PduType.fromData(data);
    if (typeof messageType === "undefined") {
      // Disregard invalid packet.
      return undefined;
    }

    // Ensure, that only complete message or the first segment may be
    // processed if the buffer is empty.
    if (
      typeof this.buffer === "undefined" &&
      !sar.equal(SAR.completeMessage) &&
      !sar.equal(SAR.firstSegment)
    ) {
      // Disregard invalid packet.
      return undefined;
    }

    // If the new packet is a continuation/lastSegment, it should have the
    // same message type as the current buffer.
    if (
      typeof this.bufferType !== "undefined" &&
      this.bufferType !== messageType &&
      !sar.equal(SAR.completeMessage) &&
      !sar.equal(SAR.firstSegment)
    ) {
      // Disregard invalid packet.
      return undefined;
    }

    // If a new message was received while the old one was
    // processed, disregard the old one.
    if (
      typeof this.bufferType !== "undefined" &&
      (sar.equal(SAR.completeMessage) || sar.equal(SAR.firstSegment))
    ) {
      this.buffer = undefined;
      this.bufferType = undefined;
    }

    // Save the message type and append newly received data.
    this.bufferType = messageType;
    if (sar.equal(SAR.completeMessage) || sar.equal(SAR.firstSegment)) {
      this.buffer = new Uint8Array();
    }
    this.buffer = concatUint8Arrays([this.buffer!, data.slice(1, data.length)]);

    // If the complete message was received, return it.
    if (sar.equal(SAR.completeMessage) || sar.equal(SAR.lastSegment)) {
      const tmp = this.buffer;
      this.buffer = undefined;
      this.bufferType = undefined;
      return { data: tmp, messageType };
    }
    // Otherwise, just return nil.
    return undefined;
  }
}
