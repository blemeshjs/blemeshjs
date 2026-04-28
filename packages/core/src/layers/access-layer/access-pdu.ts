import { Address, Data, Int64, MeshMessageSecurity, UInt32 } from "@blemeshjs/utils";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import Long from "long";
import { UpperTransportPdu } from "../upper-transport-layer/upper-transport-pdu.js";
import { MeshMessage } from "@blemeshjs/utils";
import { MeshAddress } from "../../mesh-models/mesh-address.js";

export class AccessPdu {
  public constructor(
    /**
     * The Mesh Message that is being sent, or `undefined`, when the message
     * was received.
     */
    public message: MeshMessage | undefined,
    /**
     * Whether sending this message has been initiated by the user.
     * Status of automatic retries will not be reported to the app.
     */
    public userInitiated: boolean,
    /** Source Address. */
    public source: Address,
    /** Destination Address. */
    public destination: MeshAddress,
    /** Message Op Code. */
    public opCode: UInt32,
    /** Message parameters as Data. */
    public parameters: Data,

    /** The Access Layer PDU data that will be sent. */
    public accessPdu: Data,
  ) {}

  /**
   * Wether the outgoing message will be sent as segmented, or not.
   */
  public get isSegmented(): boolean {
    if (typeof this.message === "undefined") {
      return false;
    }
    return this.accessPdu.length > 11 || this.message.isSegmented;
  }
  /**
   * Number of packets for this PDU.
   * ```
   * Number of Packets | Maximum useful access payload size (octets)
   *                   | 32 bit TransMIC  | 64 bit TransMIC
   * ------------------+------------------+-------------------------
   * 1                 | 11 (unsegmented) | n/a
   * 1                 | 8 (segmented)    | 4 (segmented)
   * 2                 | 20               | 16
   * 3                 | 32               | 28
   * n                 | (n×12)-4         | (n×12)-8
   * 32                | 380              | 376
   * ```
   */
  public get segmentsCount(): Int64 {
    if (typeof this.message === "undefined") {
      return Long.fromNumber(0);
    }
    if (!this.isSegmented) {
      return Long.fromNumber(1);
    }
    switch (this.message.security) {
      case MeshMessageSecurity.low:
        return Long.fromNumber(1 + (this.accessPdu.length + 3) / 12);
      case MeshMessageSecurity.high:
        return Long.fromNumber(1 + (this.accessPdu.length + 7) / 12);
    }
  }

  public static fromMeshMessage(
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
    userInitiated: boolean,
  ): AccessPdu {
    const parameters = message.parameters ?? new Uint8Array();

    // Op Code 0b01111111 is invalid. We will ignore this case here
    // for now and send as a single byte OpCode.
    // TODO: Handle 0b0111111 opcode correctly.
    switch (true) {
      case message.opCode < 0x80:
        return new AccessPdu(
          message,
          userInitiated,
          source,
          destination,
          message.opCode,
          parameters,
          concatUint8Arrays([new Uint8Array([message.opCode & 0xff]), parameters]),
        );
      case message.opCode < 0x4000 || (message.opCode & 0xfffc00) === 0x8000:
        return new AccessPdu(
          message,
          userInitiated,
          source,
          destination,
          message.opCode,
          parameters,
          concatUint8Arrays([
            new Uint8Array([0x80 | ((message.opCode >> 8) & 0x3f), message.opCode & 0xff]),
            parameters,
          ]),
        );
      default:
        return new AccessPdu(
          message,
          userInitiated,
          source,
          destination,
          message.opCode,
          parameters,
          concatUint8Arrays([
            new Uint8Array([
              0xc0 | ((message.opCode >> 16) & 0x3f),
              (message.opCode >> 8) & 0xff,
              message.opCode & 0xff,
            ]),
            parameters,
          ]),
        );
    }
  }

  public static fromUpperTransportPdu(pdu: UpperTransportPdu): AccessPdu | undefined {
    // At least 1 octet is required.
    if (pdu.accessPdu.length < 1) {
      return undefined;
    }
    const octet0 = pdu.accessPdu[0];

    // Opcode 0b01111111 is reserved for future use.
    if (octet0 === 0b01111111) {
      return undefined;
    }

    // 1-octet Opcodes.
    if ((octet0 & 0x80) === 0) {
      return new AccessPdu(
        undefined,
        false,
        pdu.source,
        pdu.destination,
        octet0,
        pdu.accessPdu.slice(1, pdu.accessPdu.length),
        pdu.accessPdu,
      );
    }
    // 2-octet Opcodes.
    if ((octet0 & 0x40) === 0) {
      // At least 2 octets are required.
      if (pdu.accessPdu.length < 2) {
        return undefined;
      }
      const octet1 = pdu.accessPdu[1];
      return new AccessPdu(
        undefined,
        false,
        pdu.source,
        pdu.destination,
        (octet0 << 8) | octet1,
        pdu.accessPdu.slice(2, pdu.accessPdu.length),
        pdu.accessPdu,
      );
    }
    // 3-octet Opcodes.
    // At least 3 octets are required.
    if (pdu.accessPdu.length < 3) {
      return undefined;
    }
    const octet1 = pdu.accessPdu[1];
    const octet2 = pdu.accessPdu[2];
    return new AccessPdu(
      undefined,
      false,
      pdu.source,
      pdu.destination,
      (octet0 << 16) | (octet1 << 8) | octet2,
      pdu.accessPdu.slice(3, pdu.accessPdu.length),
      pdu.accessPdu,
    );
  }

  toString(): string {
    return `Access PDU (opcode: 0x${this.opCode.toString(16)}, parameters: 0x${uint8ArrayToHex(this.parameters)})`;
  }
}
