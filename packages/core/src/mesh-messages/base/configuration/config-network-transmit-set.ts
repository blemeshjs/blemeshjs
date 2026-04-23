import { AcknowledgedConfigMessage, Data, TimeInterval, UInt32, UInt8 } from "@mesh-link-js/utils";
import { NetworkTransmit } from "../../../mesh-models/node.js";
import { ConfigNetworkTransmitStatus } from "./config-network-transmit-status.js";

export class ConfigNetworkTransmitSet extends AcknowledgedConfigMessage {
  public static opCode: UInt32 = 0x8024;
  public override opCode: UInt32 = 0x8024;
  public responseType = ConfigNetworkTransmitStatus;

  public get parameters(): Data {
    return new Uint8Array((this.count & 0x07) | (this.steps << 3));
  }

  /**
   * Number of message transmissions of Network PDU originating from the
   * Node. Possible values are 0...7, which correspond to 1-8 transmissions
   * in total.
   */
  public count: UInt8;
  /**
   * Number of 10-millisecond steps between transmissions, decremented by 1.
   * Possible values are 0...31, which corresponds to 10-320 milliseconds
   * intervals.
   */
  public steps: UInt8;
  /**
   * The interval between transmissions, in seconds.
   */
  public get interval(): TimeInterval {
    return (this.steps + 1) / 100;
  }

  /**
   * Sets the Network Transmit property of the Node.
   *
   * @param count Number of message transmissions of Network PDU
   * originating from the Node. Possible values are 0...7,
   * which correspond to 1-8 transmissions in total.
   * @param steps Number of 10-millisecond steps between transmissions,
   * decremented by 1. Possible values are 0...31, which
   * corresponds to 10-320 milliseconds intervals.
   */
  public constructor(count: UInt8, steps: UInt8) {
    super();
    this.count = Math.min(7, count);
    this.steps = Math.min(31, steps);
  }

  /**
   * Sets the Network Transmit property of the Node.
   *
   * @param networkTransmit The Network Transmit value.
   */
  public static fromNetworkTransmit(networkTransmit: NetworkTransmit) {
    return new ConfigNetworkTransmitSet(networkTransmit.count - 1, networkTransmit.steps);
  }

  public static fromData(parameters: Data): ConfigNetworkTransmitSet | undefined {
    if (parameters.length !== 1) {
      return undefined;
    }
    return new ConfigNetworkTransmitSet(parameters[0] & 0x07, parameters[0] >> 3);
  }
}
