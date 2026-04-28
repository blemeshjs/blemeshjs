import { AcknowledgedConfigMessage, Data, UInt32 } from "@blemeshjs/utils";
import { ConfigNodeResetStatus } from "./config-node-reset-status.js";

export class ConfigNodeReset extends AcknowledgedConfigMessage {
  public static readonly opCode: UInt32 = 0x8049;
  public override opCode: UInt32 = 0x8049;
  public responseType = ConfigNodeResetStatus;

  public get parameters(): Data | undefined {
    return undefined;
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 0) {
      return undefined;
    }
    return new ConfigNodeReset();
  }
}
