import { Mixin } from "ts-mixer";
import {
  AcknowledgedConfigMessage,
  ConfigNetAndAppKeyMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { concatUint8Arrays } from "uint8array-extras";
import { ApplicationKey } from "../../../mesh-models/index.js";
import { ConfigAppKeyStatus } from "./config-app-key-status.js";

/**
 * A `ConfigAppKeyAdd` is an acknowledged message used to add an `ApplicationKey`
 * to the AppKey List on a Node and bind it to the `NetworkKey` identified by
 * `NetworkKey.index`.
 *
 * The added Application Key can be used by the Node only as a pair with the specified
 * Network Key.
 *
 * The Application Key is used to authenticate and decrypt messages it receives,
 * as well as authenticate and encrypt messages it sends.
 */
export class ConfigAppKeyAdd extends Mixin(AcknowledgedConfigMessage, ConfigNetAndAppKeyMessage) {
  public static readonly opCode: UInt32 = 0x00;
  public override opCode: UInt32 = 0x00;
  public responseType = ConfigAppKeyStatus;

  public get parameters(): Data {
    return concatUint8Arrays([this.encodeNetAndAppKeyIndex(), this.key]);
  }

  public constructor(
    public networkKeyIndex: KeyIndex,
    public applicationKeyIndex: KeyIndex,
    /**
     * The 128-bit Application Key data.
     */
    public key: Data,
  ) {
    super();
  }

  /**
   * Creates a `ConfigAppKeyAdd` message.
   *
   * Use `MeshNetwork.addApplicationKeyWithIndex()` to create a new
   * `ApplicationKey` and bind it to selected `NetworkKey` using
   * `ApplicationKey.bind()`.
   *
   * @param applicationKey The Application Key to be added.
   */
  public static fromApplicationKey(applicationKey: ApplicationKey) {
    return new ConfigAppKeyAdd(
      applicationKey.boundNetworkKey.index,
      applicationKey.index,
      applicationKey.key,
    );
  }

  public static fromData(parameters: Data): ConfigAppKeyAdd | undefined {
    if (parameters.length === 19) {
      return undefined;
    }
    const { networkKeyIndex, applicationKeyIndex } = this.decodeNetAndAppKeyIndex(parameters, 0);
    const key = parameters.slice(3, 19);
    return new ConfigAppKeyAdd(networkKeyIndex, applicationKeyIndex, key);
  }
}
