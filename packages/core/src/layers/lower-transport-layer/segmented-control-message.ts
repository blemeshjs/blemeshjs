import { Address, Data, MeshMessage, UInt16, UInt32, UInt8 } from "@blemeshjs/utils";
import { SegmentedMessage } from "./segmented-message.js";
import { NetworkKey } from "../../mesh-models/index.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { LowerTransportPduType } from "./lower-transport-pdu.js";
import { NetworkPdu } from "../network-layer/network-pdu.js";

export class SegmentedControlMessage extends SegmentedMessage {
  public constructor(
    protected $message: MeshMessage | undefined,
    protected $userInitiated: boolean,
    protected $source: Address,
    protected $destination: Address,
    protected $networkKey: NetworkKey,
    protected $ivIndex: UInt32,
    public ttl: UInt8,
    /**
     * Message Op Code.
     */
    public opCode: UInt8,
    protected $sequenceZero: UInt16,
    protected $segmentOffset: UInt8,
    protected $lastSegmentNumber: UInt8,
    protected $upperTransportPdu: Data,
    public $type: LowerTransportPduType = LowerTransportPduType.controlMessage,
  ) {
    super();
  }

  public get transportPdu(): Data {
    const octet0 = 0x80 | (this.opCode & 0x7f); // SEG = 1
    const octet1 = this.sequenceZero >> 5;
    const octet2 = ((this.sequenceZero & 0x3f) << 2) | (this.segmentOffset >> 3);
    const octet3 = ((this.segmentOffset & 0x07) << 5) | (this.lastSegmentNumber & 0x1f);
    return concatUint8Arrays([
      new Uint8Array([octet0, octet1, octet2, octet3]),
      this.upperTransportPdu,
    ]);
  }

  /**
   * Creates a Segment of an Control Message from a Network PDU that contains
   * a segmented control message. If the PDU is invalid, the
   * init returns `undefined`.
   *
   * - parameter networkPdu: The received Network PDU with segmented Upper Transport message.
   */
  public static fromSegment(networkPdu: NetworkPdu): SegmentedControlMessage | undefined {
    const data = networkPdu.transportPdu;
    if (!(data.length >= 5 && (data[0] & 0x80) !== 0)) {
      return undefined;
    }
    const opCode = data[0] & 0x7f;
    if (opCode === 0x00) {
      return undefined;
    }
    const sequenceZero = ((data[1] & 0x7f) << 6) | (data[2] >> 2);
    const segmentOffset = ((data[2] & 0x03) << 3) | ((data[3] & 0xe0) >> 5);
    const lastSegmentNumber = data[3] & 0x1f;
    if (segmentOffset > lastSegmentNumber) {
      return undefined;
    }
    const upperTransportPdu = data.slice(4);

    return new SegmentedControlMessage(
      undefined,
      false,
      networkPdu.source,
      networkPdu.destination,
      networkPdu.networkKey,
      networkPdu.ivIndex,
      networkPdu.ttl,
      opCode,
      sequenceZero,
      segmentOffset,
      lastSegmentNumber,
      upperTransportPdu,
    );
  }
  toString(): string {
    return `Segmented ${LowerTransportPduType.toString(this.type)} (opCode: ${this.opCode.toString(16)}, seqZero: ${this.sequenceZero.toString(16)}, segO: ${this.segmentOffset.toString(16)}, segN: ${this.lastSegmentNumber.toString(16)}, data: 0x${uint8ArrayToHex(this.upperTransportPdu)})`;
  }
}
