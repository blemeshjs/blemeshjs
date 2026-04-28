import { ConfigResponse, Data, UInt32, UInt8 } from "@blemeshjs/utils";

export class ConfigDefaultTtlStatus extends ConfigResponse {
  public static readonly opCode: UInt32 = 0x800e;
  public override opCode: UInt32 = 0x800e;

  public get parameters(): Data | undefined {
    return new Uint8Array([this.ttl]);
  }

  constructor(
    /**
     * The Time To Live (TTL) value. Valid value is in range 1...127.
     */
    public ttl: UInt8,
  ) {
    super();
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 1) {
      return;
    }
    return new ConfigDefaultTtlStatus(parameters[0]);
  }
}
