import { Mixin } from "ts-mixer";
import {
  AcknowledgedConfigMessage,
  ConfigNetKeyMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@mesh-link-js/utils";
import { ConfigNetKeyStatus } from "./config-net-key-status.js";
import { concatUint8Arrays } from "uint8array-extras";
import { NetworkKey } from "../../../mesh-models/index.js";

/**
 * A `ConfigNetKeyAdd` is an acknowledged message used to add an ``NetworkKey``
 * to the NetKey List on a Node.
 *
 * The Network Key is used to authenticate and decrypt messages it receives,
 * as well as authenticate and encrypt messages it sends.
 */
export class ConfigNetKeyAdd extends Mixin(AcknowledgedConfigMessage, ConfigNetKeyMessage) {
  public static readonly opCode: UInt32 = 0x8040;
  public override opCode: UInt32 = 0x8040;
  public responseType = ConfigNetKeyStatus;

  public get parameters(): Data | undefined {
    return concatUint8Arrays([this.encodeNetKeyIndex(), this.key]);
  }

  constructor(
    public networkKeyIndex: KeyIndex,
    /**
     * The 128-bit Application Key data.
     */
    public key: Data,
  ) {
    super();
  }

  public static fromNetworkKey(networkKey: NetworkKey) {
    return new ConfigNetKeyAdd(networkKey.index, networkKey.key);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 18) {
      return;
    }
    return new ConfigNetKeyAdd(this.decodeNetKeyIndex(parameters, 0), parameters.slice(2, 18));
  }
}
