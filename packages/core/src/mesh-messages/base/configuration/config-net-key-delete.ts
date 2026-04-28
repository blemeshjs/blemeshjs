import { Mixin } from "ts-mixer";
import {
  AcknowledgedConfigMessage,
  ConfigNetKeyMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { NetworkKey } from "../../../mesh-models/index.js";
import { ConfigNetKeyStatus } from "./config-net-key-status.js";

/**
 * `ConfigNetKeyDelete` is an acknowledged message used to delete an `NetworkKey`
 * from the NetKey List on a Node.
 *
 * To remove the key from the local Node you may use `MeshNetwork.remove()`.
 *
 * WARN: It is not guaranteed, that the target Node will remove the key from its
 *            NetKey List. To make sure the Node gets excluded, use ``ConfigNetKeyUpdate``
 *            to update the value of the key and skip the Node when distributing the new
 *            value. After the Key Refresh Procedure is complete, the target Node will
 *            effectively be excluded from the mesh network.
 */
export class ConfigNetKeyDelete extends Mixin(AcknowledgedConfigMessage, ConfigNetKeyMessage) {
  public responseType = ConfigNetKeyStatus;
  public static readonly opCode: UInt32 = 0x8041;
  public override opCode: UInt32 = 0x8041;

  public get parameters(): Data | undefined {
    return this.encodeNetKeyIndex();
  }

  constructor(public networkKeyIndex: KeyIndex) {
    super();
  }

  /**
   * Creates a ``ConfigNetKeyDelete`` message.
   *
   * @param networkKey The Network Key to be removed.
   */
  public static fromNetworkKey(networkKey: NetworkKey) {
    return new ConfigNetKeyDelete(networkKey.index);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 2) {
      return undefined;
    }
    return new ConfigNetKeyDelete(this.decodeNetKeyIndex(parameters, 0));
  }
}
