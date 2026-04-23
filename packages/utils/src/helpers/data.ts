import sjcl from "sjcl";
import { UInt16, UInt32 } from "../types/number.js";

export function bitArrayToUint8Array(signedInts: sjcl.BitArray): Uint8Array {
  const uint8 = new Uint8Array(signedInts.length * 4);

  for (let i = 0; i < signedInts.length; i++) {
    const unsigned = signedInts[i] >>> 0;
    uint8[i * 4] = (unsigned >>> 24) & 0xff;
    uint8[i * 4 + 1] = (unsigned >>> 16) & 0xff;
    uint8[i * 4 + 2] = (unsigned >>> 8) & 0xff;
    uint8[i * 4 + 3] = unsigned & 0xff;
  }

  return uint8;
}

/**
 * Convert a DataView to a Uint8Array.
 * This is useful for extracting raw binary data from a DataView.
 *
 * @param view The DataView to convert
 * @return A Uint8Array containing the data from the DataView
 */
export function dataViewToUint8Array(view: DataView): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

/**
 * Bitwise XOR of two Uint8Arrays of equal length.
 *
 * @param a First input
 * @param b Second input
 * @returns New Uint8Array with a[i] ^ b[i]
 * @throws If arrays are not the same length
 */
export function xorUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error("Uint8Arrays must be of the same length");
  }
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i % b.length];
  }
  return result;
}

/**
 * Reads a 32-bit unsigned integer from the given byte array at the specified offset in big-endian order.
 * @param bytes - The source Uint8Array containing the bytes.
 * @param offset - The offset within the array to start reading from.
 * @returns The 32-bit unsigned integer value.
 */
export function readUInt32BE(bytes: Uint8Array, offset: number): UInt32 {
  return new DataView(bytes.buffer, bytes.byteOffset).getUint32(offset, false);
}

/**
 * Reads an unsigned 32-bit little-endian integer from a Uint8Array at the specified offset.
 * @param data - The Uint8Array to read from.
 * @param offset - The offset in the array to start reading (default is 0).
 * @returns The unsigned 32-bit integer value.
 */
export function readUInt32LE(data: Uint8Array, offset = 0): UInt32 {
  return (
    (data[offset] |
      (data[offset + 1] << 8) |
      (data[offset + 2] << 16) |
      (data[offset + 3] << 24)) >>>
    0
  );
}

/**
 * Reads an unsigned 16-bit little-endian integer from a Uint8Array at the specified offset.
 * @param data - The Uint8Array to read from.
 * @param offset - The offset in the array to start reading (default is 0).
 * @returns The unsigned 16-bit integer value.
 */
export function readUInt16LE(data: Uint8Array, offset = 0): UInt16 {
  return data[offset] | (data[offset + 1] << 8);
}

/**
 * Reads an unsigned 16-bit big-endian integer from a Uint8Array at the specified offset.
 * @param data - The Uint8Array to read from.
 * @param offset - The offset in the array to start reading (default is 0).
 * @returns The unsigned 16-bit big-endian integer value.
 */
export function readUInt16BE(data: Uint8Array, offset = 0): UInt16 {
  return (data[offset] << 8) | data[offset + 1];
}
