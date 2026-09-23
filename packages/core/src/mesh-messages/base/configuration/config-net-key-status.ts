import {
  ConfigMessageStatus,
  ConfigNetKeyMessage,
  ConfigResponse,
  ConfigStatusMessage,
  Data,
  isEnumCase,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { Mixin } from "ts-mixer";
import { NetworkKey } from "../../../mesh-models/index.js";
import { concatUint8Arrays } from "uint8array-extras";

/**
 * A `ConfigNetKeyStatus` is an unacknowledged message used to report the status of
 * the operation on the NetKey List.
 */
export class ConfigNetKeyStatus extends Mixin(
  ConfigResponse,
  ConfigStatusMessage,
  ConfigNetKeyMessage,
) {
  public static readonly opCode: UInt32 = 0x8044;
  public override opCode: UInt32 = 0x8044;

  public get parameters(): Data | undefined {
    return concatUint8Arrays([new Uint8Array([this.status]), this.encodeNetKeyIndex()]);
  }

  constructor(
    public networkKeyIndex: KeyIndex,
    public status: ConfigMessageStatus,
  ) {
    super();
  }

  /**
   * Creates a ``ConfigNetKeyStatus`` message confirming the request.
   *
   * @param networkKey The Network Key to confirm.
   */
  public static fromNetworkKey(networkKey: NetworkKey) {
    return new ConfigNetKeyStatus(networkKey.index, ConfigMessageStatus.success);
  }

  /**
   * Creates a ``ConfigNetKeyStatus`` message in case of a failure.
   *
   * @param request The request, for which this message is to be sent.
   * @param status The response status.
   */
  public static responseTo(request: ConfigNetKeyMessage, status: ConfigMessageStatus) {
    return new ConfigNetKeyStatus(request.networkKeyIndex, status);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 3) {
      return;
    }
    const status = isEnumCase(parameters[0], ConfigMessageStatus) ? parameters[0] : undefined;
    if (status === undefined) return;

    const networkKeyIndex = this.decodeNetKeyIndex(parameters, 1);

    return new ConfigNetKeyStatus(networkKeyIndex, status);
  }
}
