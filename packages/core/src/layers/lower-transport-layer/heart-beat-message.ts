import { Address, Data, UInt32, UInt8 } from "@mesh-link-js/utils";
import { ControlMessage } from "./control-message.js";
import { NodeFeatures } from "../../mesh-models/node-features.js";

export class HeartbeatMessage {
  public static opCode: UInt8 = 0x0a;

  public constructor(
    /**
     * Message Op Code.
     */
    public opCode: UInt8,
    /**
     * The Unicast Address of the originating Node.
     */
    public source: Address,
    /**
     * The destination Address. This can be either Unicast or Group Address.
     */
    public destination: Address,
    /**
     * Currently active features of the Node.
     *
     * - If the Relay feature is set, the Relay feature of a Node is in use.
     * - If the Proxy feature is set, the GATT Proxy feature of a Node is in use.
     * - If the Friend feature is set, the Friend feature of a Node is in use.
     * - If the Low Power feature is set, the Node has active relationship with a Friend Node.
     */
    public features: NodeFeatures,
    /**
     * Initial TTL used when sending the message.
     */
    public initialTtl: UInt8,

    /**
     * The raw data of Upper Transport Layer PDU.
     */
    public transportPdu: Data,
    /**
     * The IV Index used to encode this message.
     */
    public ivIndex: UInt32,
    /**
     * TTL value with which the Heartbeat message was received.
     *
     * This is set to `undefined` for outgoing Heartbeat messages.
     */
    public receivedTtl?: UInt8,
  ) {}

  /**
   * Number of hops that this message went through.
   */
  public get hops(): UInt8 {
    if (typeof this.receivedTtl === "undefined") {
      // Received TTL is undefined for outgoing Heartbeat messages.
      return 0;
    }
    return this.initialTtl + 1 - this.receivedTtl;
  }

  public static fromControlMessage(message: ControlMessage): HeartbeatMessage | undefined {
    const opCode = message.opCode;
    const data = message.upperTransportPdu;
    if (!(opCode === HeartbeatMessage.opCode && data.length === 3)) {
      return undefined;
    }
    return new HeartbeatMessage(
      opCode,
      message.source,
      message.destination,
      new NodeFeatures((data[1] << 8) | data[2]),
      data[0] & 0x7f,
      message.upperTransportPdu,
      message.ivIndex,
      message.ttl,
    );
  }

  toString(): string {
    if (typeof this.receivedTtl !== "undefined") {
      return `Heartbeat Message (initial TTL: ${this.initialTtl.toString(16)}, received TTL: ${this.receivedTtl.toString(16)}, hops: ${this.hops.toString(16)}, features: ${this.features})`;
    } else {
      return `Heartbeat Message (initial TTL: ${this.initialTtl.toString(16)}, features: ${this.features})`;
    }
  }
}
