import { Address, Data, UInt32, UInt8 } from "@blemeshjs/utils";
import { NetworkKey } from "../../mesh-models/network-key.js";
import { LowerTransportPdu, LowerTransportPduType } from "./lower-transport-pdu.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { UpperTransportPdu } from "../upper-transport-layer/upper-transport-pdu.js";
import { NetworkPdu } from "../network-layer/network-pdu.js";
import { SegmentedAccessMessage } from "./segmented-access-message.js";

export class AccessMessage extends LowerTransportPdu {
  public constructor(
    /**
     * 6-bit Application Key identifier. This field is set to `undefined`
     * if the message is signed with a Device Key instead.
     */
    public aid: UInt8 | undefined,
    protected $upperTransportPdu: Data,
    /**
     * The size of Transport MIC: 4 or 8 bytes.
     */
    public transportMicSize: UInt8,
    protected $source: Address,
    protected $destination: Address,
    /**
     * The sequence number used to encode this message.
     */
    public sequence: UInt32,

    protected $networkKey: NetworkKey,
    protected $ivIndex: UInt32,
    protected $type: LowerTransportPduType = LowerTransportPduType.accessMessage,
  ) {
    super();
  }

  public get transportPdu(): Data {
    let octet0: UInt8 = 0x00; // SEG = 0
    if (typeof this.aid !== "undefined") {
      octet0 |= 0b01000000; // AKF = 1
      octet0 |= this.aid;
    }
    return concatUint8Arrays([new Uint8Array([octet0]), this.upperTransportPdu]);
  }

  /**
   * Creates an Access Message from a Network PDU that contains
   * an unsegmented access message. If the PDU is invalid, the
   * init returns `undefined`.
   *
   * @param networkPdu The received Network PDU with unsegmented Upper Transport message.
   */
  public static fromUnsegmentedPdu(networkPdu: NetworkPdu): AccessMessage | undefined {
    const data = networkPdu.transportPdu;
    if (data.length < 6 || (data[0] & 0x80) !== 0) {
      return undefined;
    }
    const akf = (data[0] & 0b01000000) !== 0;
    let aid: UInt8 | undefined;
    if (akf) {
      aid = data[0] & 0x3f;
    }

    return new AccessMessage(
      aid,
      data.slice(1),
      // For unsegmented messages, the size of the TransMIC is 32 bits.
      4,
      networkPdu.source,
      networkPdu.destination,
      networkPdu.sequence,
      networkPdu.networkKey,
      networkPdu.ivIndex,
    );
  }

  /**
   * Creates an Access Message object from the given list of segments.
   *
   * @param segments List of ordered segments.
   */
  public static fromSegments(segments: Array<SegmentedAccessMessage>) {
    // Assuming all segments have the same AID, source and destination addresses and TransMIC.
    const segment = segments[0];

    // Segments are already sorted by `segmentOffset`.
    const upperTransportPdu = segments.reduce<Data>(
      (acc, cur) => concatUint8Arrays([acc, cur.upperTransportPdu]),
      new Uint8Array(),
    );
    return new AccessMessage(
      segment.aid,
      upperTransportPdu,
      segment.transportMicSize,
      segment.source,
      segment.destination,
      segment.sequence,
      segment.networkKey,
      segment.ivIndex,
    );
  }

  /**
   * Creates an Access Message object from the Upper Transport PDU.
   *
   * @param pdu The Upper Transport PDU.
   * @param networkKey The Network Key to encrypt the PDU with.
   */
  public static fromUnsegmentedUpperTransportPdu(pdu: UpperTransportPdu, networkKey: NetworkKey) {
    return new AccessMessage(
      pdu.aid,
      pdu.transportPdu,
      4,
      pdu.source,
      pdu.destination.address,
      pdu.sequence,
      networkKey,
      pdu.ivIndex,
    );
  }

  toString(): string {
    return `${LowerTransportPduType.toString(this.type)} (akf: ${typeof this.aid !== "undefined" ? `1, aid: 0x${this.aid.toString(16).padStart(2, "0")}` : "0"}, szmic: ${this.transportMicSize === 4 ? 0 : 1}, data: 0x${uint8ArrayToHex(this.upperTransportPdu)})`;
  }
}
