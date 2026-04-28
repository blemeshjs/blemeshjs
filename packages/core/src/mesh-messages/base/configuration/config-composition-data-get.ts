import { AcknowledgedConfigMessage, Data, UInt32, UInt8 } from "@blemeshjs/utils";
import { ConfigCompositionDataStatus } from "./config-composition-data-status.js";

export class ConfigCompositionDataGet extends AcknowledgedConfigMessage {
  public static readonly opCode: UInt32 = 0x8008;
  public override opCode: UInt32 = 0x8008;
  public responseType = ConfigCompositionDataStatus;

  public get parameters(): Data | undefined {
    return new Uint8Array([this.page]);
  }

  constructor(
    /**
     * Page number of the Composition Data to get.
     */
    public page: UInt8 = 0,
  ) {
    super();
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 1) {
      return undefined;
    }
    return new ConfigCompositionDataGet(parameters[0]);
  }

  public toString() {
    return `ConfigCompositionDataGet(page: ${this.page})`;
  }
}
