import { AcknowledgedConfigMessage, Data, UInt32 } from "@blemeshjs/utils";
import { ConfigDefaultTtlStatus } from "./config-default-ttl-status.js";

export class ConfigDefaultTtlGet extends AcknowledgedConfigMessage {
  public static readonly opCode: UInt32 = 0x800c;
  public override opCode: UInt32 = 0x800c;
  public responseType = ConfigDefaultTtlStatus;

  public get parameters(): Data | undefined {
    return;
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 0) {
      return;
    }
    return new ConfigDefaultTtlGet();
  }
}
