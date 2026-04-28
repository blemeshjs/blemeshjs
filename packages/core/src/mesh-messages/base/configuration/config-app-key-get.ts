import {
  AcknowledgedConfigMessage,
  ConfigNetKeyMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { Mixin } from "ts-mixer";
import { ConfigAppKeyList } from "./config-app-key-list.js";
import { NetworkKey } from "../../../mesh-models/index.js";

/**
 * A `ConfigAppKeyGet` is an acknowledged message used to report all ``ApplicationKey``s
 * known to the Node that are bound to the given ``NetworkKey``.
 *
 * The response to this message is a ``ConfigNetKeyList`` message.
 */
export class ConfigAppKeyGet extends Mixin(AcknowledgedConfigMessage, ConfigNetKeyMessage) {
  public static readonly opCode: UInt32 = 0x8001;
  public override opCode: UInt32 = 0x8001;
  public responseType = ConfigAppKeyList;

  public get parameters(): Data | undefined {
    return this.encodeNetKeyIndex();
  }

  constructor(public networkKeyIndex: KeyIndex) {
    super();
  }

  /**
   * Creates a ``ConfigAppKeyGet`` message.
   *
   * @param networkKey The Network Key for which Application Keys are requested.
   */
  public static fromNetworkKey(networkKey: NetworkKey) {
    return new ConfigAppKeyGet(networkKey.index);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 2) {
      return undefined;
    }
    return new ConfigAppKeyGet(this.decodeNetKeyIndex(parameters, 0));
  }
}
