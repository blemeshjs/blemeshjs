import {
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuidVersion,
  parse as uuidParse,
} from "uuid";
import { Data } from "./buffer.js";

/**
 * Represents a universally unique identifier (UUID) with Swift-like API
 */
export class UUID {
  /**
   * Create a UUID instance
   * @param $uuidString - Optional UUID string (default: random v4 UUID)
   */
  constructor(protected $uuidString: string = uuidv4()) {}

  static fromUuidString(uuidString: string): UUID | undefined {
    if (!UUID.isValidUUIDString(uuidString)) return undefined;
    return new UUID(uuidString);
  }

  static fromBluetoothUuidString(uuidString: string): UUID | undefined {
    if (!UUID.isBluetoothUUID(uuidString)) return undefined;
    return new UUID(uuidString);
  }

  /**
   * Creates the UUID from a 32-character hexadecimal string.
   */
  static fromHex(hex: string): UUID | undefined {
    if (hex.length !== 32) {
      return undefined;
    }

    let uuidString = "";

    for (const [offset, character] of hex.split("").entries()) {
      if (offset === 8 || offset === 12 || offset === 16 || offset === 20) {
        uuidString += "-";
      }
      uuidString += character;
    }
    return UUID.fromUuidString(uuidString);
  }

  /**
   * Generate a random UUID instance
   */
  static random(): UUID {
    return new UUID();
  }

  /**
   * Get the UUID string representation
   */
  get uuidString(): string {
    return this.$uuidString;
  }

  /**
   * Returns the uuidString without dashes.
   */
  get hex(): string {
    return this.uuidString.replace(/-/g, "");
  }

  /**
   * String representation (same as uuidString)
   */
  toString(): string {
    return this.$uuidString;
  }

  /**
   * Validate a UUID string
   * @param uuidString - String to validate
   * @returns True if valid RFC 4122 UUID
   */
  static isValidUUIDString(uuidString: string): boolean {
    return uuidValidate(uuidString) && uuidVersion(uuidString) === 4;
  }

  /**
   * Checks if the given string is a valid Bluetooth UUID.
   * Bluetooth UUIDs follow the format: xxxxxxxx-xxxx-1000-8000-00805F9B34FB
   * @param str - The string to check.
   * @returns True if the string is a valid Bluetooth UUID, false otherwise.
   */
  static isBluetoothUUID(str: string): boolean {
    return /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-1000-8000-00805F9B34FB$/.test(str);
  }

  /**
   * The UUID as Data.
   */
  public get bytes(): Data {
    return uuidParse(this.$uuidString);
  }

  /**
   * Checks if this UUID is equal to another UUID.
   * @param other - The other UUID instance to compare.
   * @returns True if both UUIDs have the same string representation.
   */
  public equal(other: UUID): boolean {
    return this.$uuidString === other.$uuidString;
  }
}
