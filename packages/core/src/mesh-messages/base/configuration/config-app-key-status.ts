import { Mixin } from "ts-mixer";
import {
  ConfigMessageStatus,
  ConfigNetAndAppKeyMessage,
  ConfigResponse,
  ConfigStatusMessage,
  Data,
  isEnumCase,
  KeyIndex,
  UInt32,
} from "@mesh-link-js/utils";
import { ApplicationKey } from "../../../mesh-models/index.js";
import { concatUint8Arrays } from "uint8array-extras";

/**
 * A `ConfigAppKeyStatus` is an unacknowledged message used to report a status for
 * the requesting message, based on the `NetworkKey.index` identifying the
 * `NetworkKey` on the NetKey List and on the `ApplicationKey.index` identifying
 * the `ApplicationKey` on the AppKey List.
 */
export class ConfigAppKeyStatus extends Mixin(
  ConfigResponse,
  ConfigStatusMessage,
  ConfigNetAndAppKeyMessage,
) {
  public static readonly opCode: UInt32 = 0x8003;
  public override opCode: UInt32 = 0x8003;

  public get parameters(): Data | undefined {
    return concatUint8Arrays([new Uint8Array([this.status]), this.encodeNetAndAppKeyIndex()]);
  }

  constructor(
    public networkKeyIndex: KeyIndex,
    public applicationKeyIndex: KeyIndex,
    public status: ConfigMessageStatus,
  ) {
    super();
  }

  /**
   * Creates a `ConfigAppKeyStatus` message confirming the request.
   *
   * @param applicationKey The Application Key to confirm.
   */
  public static fromApplicationKey(applicationKey: ApplicationKey): ConfigAppKeyStatus {
    return new ConfigAppKeyStatus(
      applicationKey.boundNetworkKey.index,
      applicationKey.index,
      ConfigMessageStatus.success,
    );
  }

  /**
   * Creates a `ConfigAppKeyStatus` message in case of a failure.
   *
   * @param request The request, for which this message is to be sent.
   * @param status The response status.
   */
  public static responseTo(request: ConfigNetAndAppKeyMessage, status: ConfigMessageStatus) {
    return new ConfigAppKeyStatus(request.applicationKeyIndex, request.networkKeyIndex, status);
  }

  public static fromData(parameters: Data): ConfigAppKeyStatus | undefined {
    if (parameters.length !== 4) {
      return undefined;
    }
    const rawValue = parameters[0];
    const status = isEnumCase(rawValue, ConfigMessageStatus) ? rawValue : undefined;
    if (typeof status === "undefined") {
      return undefined;
    }
    const { networkKeyIndex, applicationKeyIndex } = this.decodeNetAndAppKeyIndex(parameters, 1);
    return new ConfigAppKeyStatus(applicationKeyIndex, networkKeyIndex, status);
  }
}
