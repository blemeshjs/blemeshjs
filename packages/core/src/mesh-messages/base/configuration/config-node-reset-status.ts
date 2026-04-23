import { ConfigResponse, Data, UInt32 } from "@mesh-link-js/utils";

export class ConfigNodeResetStatus extends ConfigResponse {
  public static readonly opCode: UInt32 = 0x804a;
  public override opCode: UInt32 = 0x804a;

  public get parameters(): Data | undefined {
    return undefined;
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 0) {
      return undefined;
    }
    return new ConfigNodeResetStatus();
  }
}
