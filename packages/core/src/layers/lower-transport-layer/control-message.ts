import {
  Address,
  Data,
  IvIndex,
  ProxyConfigurationMessage,
  UInt32,
  UInt8,
} from "@blemeshjs/utils";
import { LowerTransportPdu, LowerTransportPduType } from "./lower-transport-pdu.js";
import { NetworkKey } from "../../mesh-models/index.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { NetworkPdu } from "../network-layer/network-pdu.js";
import { SegmentedControlMessage } from "./segmented-control-message.js";
import { HeartbeatMessage } from "./heart-beat-message.js";

export class ControlMessage extends LowerTransportPdu {
  public constructor(
    protected $source: Address,
    protected $destination: Address,
    protected $networkKey: NetworkKey,
    protected $ivIndex: UInt32,
    public ttl: UInt8,
    /**
     * Message Op Code.
     */
    public opCode: UInt8,
    protected $upperTransportPdu: Data,
  ) {
    super();
  }

  public get transportPdu(): Data {
    return concatUint8Arrays([new Uint8Array([this.opCode]), this.upperTransportPdu]);
  }

  public $type: LowerTransportPduType = LowerTransportPduType.controlMessage;

  /**
   * Creates a Control Message from a Network PDU that contains
   * an unsegmented control message.
   *
   * @param networkPdu The received Network PDU with unsegmented Upper Transport message.
   * @returns The Control Message object, or `undefined`, if the given PDU was invalid.
   */
  public static fromNetworkPdu(networkPdu: NetworkPdu): ControlMessage | undefined {
    const data = networkPdu.transportPdu;
    if (!(data.length >= 1 && (data[0] & 0x80) === 0)) {
      return undefined;
    }
    return new ControlMessage(
      networkPdu.source,
      networkPdu.destination,
      networkPdu.networkKey,
      networkPdu.ivIndex,
      networkPdu.ttl,
      data[0] & 0x7f,
      data.slice(1),
    );
  }

  /**
   * Creates a Control Message object from the given list of segments.
   *
   * @param segments List of ordered segments.
   */
  public static fromSegments(segments: Array<SegmentedControlMessage>) {
    // Assuming all segments have the same AID, source and destination addresses and TransMIC.
    const segment = segments[0];
    return new ControlMessage(
      segment.source,
      segment.destination,
      segment.networkKey,
      segment.ivIndex,
      segment.ttl,
      segment.opCode,
      segments.reduce<Data>(
        (acc, cur) => concatUint8Arrays([acc, cur.upperTransportPdu]),
        new Uint8Array(),
      ),
    );
  }

  /**
   * Creates a Control Message from the given Proxy Configuration
   * message. The source should be set to the local Node address.
   * The given Network Key should be known to the Proxy Node.
   *
   * @param message The message to be sent.
   * @param source The address of the local Node.
   * @param networkKey The Network Key to sign the message with.
   * The key should be known to the connected Proxy Node.
   * @param ivIndex The current IV Index of the mesh network.
   */
  public static fromProxyConfigurationMessage(
    message: ProxyConfigurationMessage,
    source: Address,
    networkKey: NetworkKey,
    ivIndex: IvIndex,
  ) {
    return new ControlMessage(
      source,
      Address.unassignedAddress,
      networkKey,
      ivIndex.transmitIndex,
      0,
      message.opCode,
      message.parameters ?? new Uint8Array(),
    );
  }

  public static fromHeartbeatMessage(heartbeatMessage: HeartbeatMessage, networkKey: NetworkKey) {
    return new ControlMessage(
      heartbeatMessage.source,
      heartbeatMessage.destination,
      networkKey,
      heartbeatMessage.ivIndex,
      heartbeatMessage.initialTtl,
      heartbeatMessage.opCode,
      heartbeatMessage.transportPdu,
    );
  }
  toString(): string {
    return `${LowerTransportPduType.toString(this.type)} (opCode: 0x${this.opCode.toString(16)}, data: 0x${uint8ArrayToHex(this.upperTransportPdu)})`;
  }
}
