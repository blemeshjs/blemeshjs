import { UInt8 } from "../types/number.js";
import { Data } from "../types/buffer.js";
import { Key } from "../types/index.js";

export abstract class KeySet {
  /**
   * The Access Layer key used to encrypt the message.
   */
  public abstract get accessKey(): Data;
  /**
   * Application Key identifier, or `undefined` for Device Key.
   */
  public abstract get aid(): UInt8 | undefined;
  /**
   * The Network Key used to encrypt the message.
   */
  public abstract get networkKey(): Key;
}
