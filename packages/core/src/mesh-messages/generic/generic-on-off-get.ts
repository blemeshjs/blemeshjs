import { Data, StaticAcknowledgedMeshMessage, UInt32 } from "@blemeshjs/utils";
import { GenericOnOffStatus } from "./generic-on-off-status.js";

export class GenericOnOffGet extends StaticAcknowledgedMeshMessage {
  public static readonly opCode: UInt32 = 0x8201;
  public override opCode: UInt32 = 0x8201;
  public responseType = GenericOnOffStatus;

  public get parameters(): Data | undefined {
    return undefined;
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 0) {
      return undefined;
    }
  }
}
