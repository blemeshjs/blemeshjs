import { Mixin } from "ts-mixer";
import {
  AcknowledgedConfigMessage,
  ConfigNetAndAppKeyMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { ConfigAppKeyStatus } from "./config-app-key-status.js";
import { ApplicationKey } from "../../../mesh-models/index.js";

/**
 * A `ConfigAppKeyDelete` is an acknowledged message used to delete an ``ApplicationKey``
 * from the AppKey List on a Node.
 *
 * To remove the key from the local Node you may use ``MeshNetwork.removeApplicationKey()``.
 *
 * WARN: It is not guaranteed, that the target Node will remove the key from its
 *            AppKey List. To make sure the Node gets excluded, use ``ConfigAppKeyUpdate``
 *            to update the value of the key and skip the Node when distributing the new
 *            value. After the Key Refresh Procedure is complete, the target Node will
 *            effectively be excluded from the mesh network.
 */
export class ConfigAppKeyDelete extends Mixin(
  AcknowledgedConfigMessage,
  ConfigNetAndAppKeyMessage,
) {
  public static readonly opCode: UInt32 = 0x8000;
  public override opCode: UInt32 = 0x8000;
  public responseType = ConfigAppKeyStatus;

  public get parameters(): Data | undefined {
    return this.encodeNetAndAppKeyIndex();
  }

  constructor(
    public networkKeyIndex: KeyIndex,
    public applicationKeyIndex: KeyIndex,
  ) {
    super();
  }

  /**
   * Creates a ``ConfigAppKeyDelete`` message.
   *
   * @param applicationKey The Application Key to be removed.
   */
  public static fromApplicationKey(applicationKey: ApplicationKey) {
    return new ConfigAppKeyDelete(applicationKey.boundNetworkKey.index, applicationKey.index);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 3) {
      return undefined;
    }
    const { networkKeyIndex, applicationKeyIndex } = this.decodeNetAndAppKeyIndex(parameters, 0);
    return new ConfigAppKeyDelete(networkKeyIndex, applicationKeyIndex);
  }
}
