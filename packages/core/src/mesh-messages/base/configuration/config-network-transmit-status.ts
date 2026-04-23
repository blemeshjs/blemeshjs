import { ConfigResponse, Data, TimeInterval, UInt32, UInt8 } from "@mesh-link-js/utils";
import { Node } from "../../../mesh-models/node.js";

export class ConfigNetworkTransmitStatus extends ConfigResponse {
  public static readonly opCode: UInt32 = 0x8025;
  public override opCode: UInt32 = 0x8025;
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
   * Creates the Config Network Transmit Status message.
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

  public static fromNode(node: Node): ConfigNetworkTransmitStatus {
    const transmit = node.networkTransmit;
    return new ConfigNetworkTransmitStatus((transmit?.count ?? 1) - 1, transmit?.steps ?? 0);
  }

  public static fromData(parameters: Data): ConfigNetworkTransmitStatus | undefined {
    if (parameters.length !== 1) {
      return undefined;
    }
    return new ConfigNetworkTransmitStatus(parameters[0] & 0x07, parameters[0] >> 3);
  }
}
