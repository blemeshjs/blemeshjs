import {
  Address,
  Data,
  Int64,
  packUInt32BE,
  readUInt32BE,
  UInt16,
  UInt32,
  UInt8,
} from "@blemeshjs/utils";
import { NetworkKey } from "../../mesh-models/network-key.js";
import { LowerTransportPdu, LowerTransportPduType } from "./lower-transport-pdu.js";
import { concatUint8Arrays } from "uint8array-extras";
import { SegmentedMessage } from "./segmented-message.js";
import { NetworkPdu } from "../network-layer/network-pdu.js";
import Long from "long";

export class SegmentAcknowledgmentMessage extends LowerTransportPdu {
  public get transportPdu(): Data {
    const octet0: UInt8 = this.opCode & 0x7f;
    const octet1 = (this.isOnBehalfOfLowPowerNode ? 0x80 : 0x00) | (this.sequenceZero >> 6);
    const octet2 = (this.sequenceZero & 0x3f) << 2;
    return concatUint8Arrays([new Uint8Array([octet0, octet1, octet2]), this.upperTransportPdu]);
  }

  /**
   * Whether the source Node is busy and the message should be cancelled, or not.
   */
  public get isBusy(): boolean {
    return this.ackedSegments === 0;
  }

  constructor(
    protected $source: Address,
    protected $destination: Address,
    protected $networkKey: NetworkKey,
    protected $ivIndex: number,
    /**
     * Message Op Code.
     *
     * This is always 0x00 for Segment Acknowledgment Message.
     */
    public opCode: UInt8,

    /**
     * Flag set to `true` if the message was sent by a Friend
     * on behalf of a Low Power node (OBO).
     */
    public isOnBehalfOfLowPowerNode: boolean,
    /**
     * 13 least significant bits of SeqAuth (SeqZero).
     */
    public sequenceZero: UInt16,
    /**
     * Acknowledgment for segments which indicate the segments received.
     *
     * The least significant bit, bit 0, shall represent segment 0; and the most
     * significant bit, bit 31, shall represent segment 31. If bit n is set to 1, then
     * segment n is being acknowledged. If bit n is set to 0, then segment n is
     * not being acknowledged. Any bits for segments larger than the SegN field
     * value of the upper transport layer message being acknowledged shall be
     * set to 0 and ignored upon receipt.
     */
    public ackedSegments: UInt32,

    protected $upperTransportPdu: Data,
    protected $type: LowerTransportPduType = LowerTransportPduType.controlMessage,
  ) {
    super();
  }
  /**
   * Creates the ACK for given array of segments. At least one of
   * segments must not be `undefined`.
   *
   * @param segments The list of segments to be acknowledged.
   */
  public static fromSegments(
    segments: Array<SegmentedMessage | undefined>,
  ): SegmentAcknowledgmentMessage {
    const segment = segments.find((segment) => typeof segment !== "undefined")!;

    let ack: UInt32 = 0;
    segments.forEach((segment) => {
      if (typeof segment !== "undefined") {
        ack |= 1 << segment.segmentOffset;
      }
    });

    return new SegmentAcknowledgmentMessage(
      // Assuming all segments have the same source and destination addresses and network key.
      // Swapping source with destination. Destination here is guaranteed to be a Unicast Address.
      segment.destination,
      segment.source,
      segment.networkKey,
      segment.ivIndex,
      0x00,
      // Friendship is not supported
      false,
      segment.sequenceZero,
      ack,
      packUInt32BE(ack),
    );
  }
  /**
   * Creates the Segmented Acknowledgement Message from the given Network PDU.
   * If the PDU is not valid, it will return `undefined`.
   *
   * @param networkPdu The Network PDU received.
   */
  public static fromNetworkPdu(networkPdu: NetworkPdu): SegmentAcknowledgmentMessage | undefined {
    const data = networkPdu.transportPdu;
    if (!(data.length === 7 && (data[0] & 0x80) === 0)) {
      return undefined;
    }

    const opCode = data[0] & 0x7f;
    if (opCode !== 0x00) {
      return undefined;
    }
    const ackedSegments = readUInt32BE(data, 3);
    return new SegmentAcknowledgmentMessage(
      networkPdu.source,
      networkPdu.destination,
      networkPdu.networkKey,
      networkPdu.ivIndex,
      opCode,
      (data[1] & 0x80) !== 0,
      ((data[1] & 0x7f) << 6) | (data[2] >> 2),
      ackedSegments,
      packUInt32BE(ackedSegments),
    );
  }

  /**
   * Returns whether the segment with given index has been received.
   *
   * @pram m The segment number.
   * @returns `True`, if the segment of the given number has been acknowledged, `false` otherwise.
   */
  public isSegmentReceived(m: Int64): boolean {
    return Long.fromNumber(1).shiftLeft(m).and(this.ackedSegments).neq(0);
  }
  toString(): string {
    return `ACK (seqZero: ${this.sequenceZero}, ackedSegments: 0x${this.ackedSegments.toString(16).padStart(8, "0")})`;
  }
}
