import { Mixin } from "ts-mixer";
import {
  ConfigMessageStatus,
  ConfigNetKeyMessage,
  ConfigResponse,
  ConfigStatusMessage,
  Data,
  KeyIndex,
  UInt32,
} from "@blemeshjs/utils";
import { concatUint8Arrays } from "uint8array-extras";
import { ConfigAppKeyGet } from "./config-app-key-get.js";
import { ApplicationKey } from "../../../mesh-models/index.js";

/**
 * A `ConfigAppKeyList` is an unacknowledged message reporting all ``ApplicationKey``s
 * bound to requested ``NetworkKey`` that are known to the Node.
 */
export class ConfigAppKeyList extends Mixin(
  ConfigResponse,
  ConfigStatusMessage,
  ConfigNetKeyMessage,
) {
  public static readonly opCode: UInt32 = 0x8002;
  public override opCode: UInt32 = 0x8002;

  public get parameters(): Data | undefined {
    return concatUint8Arrays([
      new Uint8Array([this.status]),
      this.encodeNetKeyIndex(),
      this.encode(this.applicationKeyIndexes),
    ]);
  }

  constructor(
    public status: ConfigMessageStatus,
    public networkKeyIndex: KeyIndex,
    /**
     * Application Key Indexes bound to the Network Key known to the Node.
     */
    public applicationKeyIndexes: Array<KeyIndex>,
  ) {
    super();
  }

  /**
   * Creates a ``ConfigAppKeyList`` message.
   *
   * @param request The request, for which this message is to be sent.
   * @param applicationKeys The list of Application Keys.
   */
  public static responseTo(request: ConfigAppKeyGet, applicationKeys: Array<ApplicationKey>) {
    return new ConfigAppKeyList(
      ConfigMessageStatus.success,
      request.networkKeyIndex,
      applicationKeys.map((key) => key.index),
    );
  }

  /**
   * Creates a ``ConfigAppKeyList`` message in case the request has failed.
   *
   * @param request The request, for which this message is to be sent.
   * @param status The response status.
   */
  public static responseToWithStatus(request: ConfigAppKeyGet, status: ConfigMessageStatus) {
    return new ConfigAppKeyList(status, request.networkKeyIndex, []);
  }

  public static fromData(parameters: Data) {
    if (!(parameters.length < 3)) {
      return undefined;
    }
    const status = ConfigMessageStatus.success;
    return new ConfigAppKeyList(
      status,
      this.decodeNetKeyIndex(parameters, 1),
      this.decode(parameters, 3),
    );
  }
}
