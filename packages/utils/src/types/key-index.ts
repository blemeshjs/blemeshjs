import { packUInt16BE, packUInt16LE } from "../helpers/number.js";
import { UInt16 } from "../types/number.js";

/**
 * The key index is a 12-bit unsigned integer identifying a Network
 * or an Application Key.
 *
 * The key indexes within Network Keys and Application Keys must
 * be distinct.
 *
 * This type is an alias for `UInt16`. To check the range, use
 * `isValidKeyIndex`.
 *
 */
export class KeyIndex extends Number {
  constructor(value: UInt16) {
    super(value);
  }

  public get bytes(): Uint8Array {
    return packUInt16LE(this.valueOf());
  }

  public get bytesBE(): Uint8Array {
    return packUInt16BE(this.valueOf());
  }

  public equal(other: KeyIndex): boolean {
    return this.valueOf() === other.valueOf();
  }

  public get isValidKeyIndex(): boolean {
    return this.valueOf() >= 0 && this.valueOf() <= 4095;
  }
}
