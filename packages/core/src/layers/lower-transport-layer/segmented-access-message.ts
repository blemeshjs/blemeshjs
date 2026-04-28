import { Address, Data, MeshMessage, UInt16, UInt32, UInt8 } from "@blemeshjs/utils";
import { NetworkKey } from "../../mesh-models/index.js";
import { LowerTransportPduType } from "./lower-transport-pdu.js";
import { SegmentedMessage } from "./segmented-message.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { NetworkPdu } from "../network-layer/network-pdu.js";
import { UpperTransportPdu } from "../upper-transport-layer/upper-transport-pdu.js";
import Long from "long";

export class SegmentedAccessMessage extends SegmentedMessage {
  public constructor(
    protected $message: MeshMessage | undefined,
    protected $userInitiated: boolean,
    protected $sequenceZero: UInt16,
    protected $segmentOffset: UInt8,
    protected $lastSegmentNumber: UInt8,
    protected $source: Address,
    protected $destination: Address,
    protected $networkKey: NetworkKey,
    protected $ivIndex: UInt32,
    protected $upperTransportPdu: Data,
    /**
     * The Application Key identifier.
     * This field is set to `undefined` if the message is signed with a
     * Device Key instead.
     */
    public aid: UInt8 | undefined,
    /**
     * The size of Transport MIC: 4 or 8 bytes.
     */
    public transportMicSize: UInt8,
    /**
     * The sequence number used to encode this message.
     */
    public sequence: UInt32,
    protected $type: LowerTransportPduType = LowerTransportPduType.accessMessage,
  ) {
    super();
  }

  public get transportPdu(): Data {
    let octet0: UInt8 = 0x80; // SEG = 1
    if (typeof this.aid !== "undefined") {
      octet0 |= 0b01000000; // AKF = 1
      octet0 |= this.aid;
    }
    const octet1 = ((this.transportMicSize << 4) & 0x80) | (this.sequenceZero >> 6);
    const octet2 = ((this.sequenceZero & 0x3f) << 2) | (this.segmentOffset >> 3);
    const octet3 = ((this.segmentOffset & 0x07) << 5) | (this.lastSegmentNumber & 0x1f);
    return concatUint8Arrays([
      new Uint8Array([octet0, octet1, octet2, octet3]),
      this.upperTransportPdu,
    ]);
  }

  /**
   * Creates a Segment of an Access Message from a Network PDU that contains
   * a segmented access message. If the PDU is invalid, the
   * function returns `undefined`.
   *
   * @param networkPdu The received Network PDU with segmented Upper Transport message.
   */
  public static fromSegmentPdu(networkPdu: NetworkPdu): SegmentedAccessMessage | undefined {
    const data = networkPdu.transportPdu;
    if (!(data.length >= 5 && (data[0] & 0x80) !== 0)) {
      return undefined;
    }
    const akf = (data[0] & 0b01000000) !== 0;
    let aid: UInt8 | undefined;
    if (akf) {
      aid = data[0] & 0x3f;
    }
    const szmic = data[1] >> 7;
    const transportMicSize = szmic == 0 ? 4 : 8;

    const sequenceZero = ((data[1] & 0x7f) << 6) | (data[2] >> 2);
    const segmentOffset = ((data[2] & 0x03) << 3) | ((data[3] & 0xe0) >> 5);
    const lastSegmentNumber = data[3] & 0x1f;
    if (segmentOffset > lastSegmentNumber) {
      return undefined;
    }
    const upperTransportPdu = data.slice(4);
    const sequence = (networkPdu.sequence & 0xffe000) | sequenceZero;

    return new SegmentedAccessMessage(
      undefined,
      false,
      sequenceZero,
      segmentOffset,
      lastSegmentNumber,
      networkPdu.source,
      networkPdu.destination,
      networkPdu.networkKey,
      networkPdu.ivIndex,
      upperTransportPdu,
      aid,
      transportMicSize,
      sequence,
    );
  }

  /**
   * Creates a Segment of an Access Message object from the Upper Transport PDU
   * with given segment offset.
   *
   * @param pdu The segmented Upper Transport PDU.
   * @param networkKey The Network Key to encrypt the PCU with.
   * @param offset The segment offset.
   */
  public static fromUpperTransportPdu(
    pdu: UpperTransportPdu,
    networkKey: NetworkKey,
    offset: UInt8,
  ) {
    const lowerBound = Long.fromNumber(offset).mul(12);
    const upperBound = Math.min(
      pdu.transportPdu.length,
      Long.fromNumber(offset + 1)
        .mul(12)
        .toNumber(),
    );
    const segment = pdu.transportPdu.slice(lowerBound.toNumber(), upperBound);
    return new SegmentedAccessMessage(
      pdu.message,
      pdu.userInitiated,
      pdu.sequence & 0x1fff,
      offset,
      (Math.trunc((pdu.transportPdu.length + 11) / 12) & 0xff) - 1,
      pdu.source,
      pdu.destination.address,
      networkKey,
      pdu.ivIndex,
      segment,
      pdu.aid,
      pdu.transportMicSize,
      pdu.sequence,
    );
  }

  toString(): string {
    return `Segmented ${LowerTransportPduType.toString(this.type)} (akf: ${typeof this.aid !== "undefined" ? `1, aid: 0x${this.aid.toString(16).padStart(2, "0")}` : "0"}, szmic: ${this.transportMicSize == 4 ? 0 : 1}, seqZero: ${this.sequenceZero}, segO: ${this.segmentOffset}, segN: ${this.lastSegmentNumber}, data: 0x${uint8ArrayToHex(this.upperTransportPdu)})`;
  }
}
