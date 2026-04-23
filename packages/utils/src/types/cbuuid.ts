import { areUint8ArraysEqual, hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { UUID } from "./uuid.js";

const BLUETOOTH_BASE_UUID = "0000000000001000800000805F9B34FB";

/**
 * Represents a Core Bluetooth UUID.
 * Can be constructed from a string, number, or Uint8Array.
 * Provides utility methods for comparison and string representation.
 */
export class CBUUID {
  private readonly data: Uint8Array;

  /**
   * Converts the CBUUID to foundation UUID.
   */
  public get uuid(): UUID {
    return UUID.fromBluetoothUuidString(this.fullUuidString)!;
  }

  public get shortUuid(): string {
    return typeof this.value === "string" ? this.value : uint8ArrayToHex(this.value);
  }

  constructor(private value: string | Uint8Array) {
    if (value instanceof Uint8Array) {
      this.data = this.normalizeUint8Array(value);
    } else {
      this.data = this.normalizeString(value);
    }
  }

  private normalizeUint8Array(arr: Uint8Array): Uint8Array {
    if (arr.length === 2 || arr.length === 4 || arr.length === 16) {
      return this.expandTo128Bit(arr);
    }
    throw new Error("Invalid byte array length. Must be 2, 4, or 16 bytes");
  }

  private normalizeString(str: string): Uint8Array {
    const cleaned = str.replace(/[-:]/g, "").toUpperCase();

    if (!/^[0-9A-F]+$/.test(cleaned)) {
      throw new Error("Invalid UUID format. Must be hexadecimal");
    }

    switch (cleaned.length) {
      case 4:
      case 8:
      case 32:
        return this.expandTo128Bit(hexToUint8Array(cleaned));
      default:
        throw new Error("Invalid UUID length. Must be 4, 8, or 32 characters");
    }
  }

  private expandTo128Bit(short: Uint8Array): Uint8Array {
    const full = hexToUint8Array(BLUETOOTH_BASE_UUID);

    if (short.length === 2) {
      full.set(short, 2); // insert at offset 2
    } else if (short.length === 4) {
      full.set(short, 0); // insert at offset 0
    } else if (short.length === 16) {
      return short;
    }

    return full;
  }

  get uuidString(): string {
    return uint8ArrayToHex(this.data).toUpperCase();
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.data); // Return a copy
  }

  toString(): string {
    return this.uuidString;
  }

  public get fullUuidString(): string {
    const hex = this.uuidString;
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32),
    ]
      .join("-")
      .toUpperCase();
  }

  equals(other: CBUUID): boolean {
    return areUint8ArraysEqual(this.data, other.data);
  }
}
