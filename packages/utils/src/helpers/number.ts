import { pack, unpack, packTo } from "byte-data";
import Long from "long";
import { UInt8, UInt16, UInt32 } from "../types/number.js";

/** Signed 16-bit little endian integer */
export function packInt16LE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 16, signed: true, be: false }));
}
export function unpackInt16LE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 16, signed: true, be: false }, offset, safe);
}
export function writeInt16LE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 16, signed: true, be: false }, out, offset, clamp);
}

/** Unsigned 16-bit little endian integer */
export function packUInt16LE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 16, signed: false, be: false }));
}
export function unpackUInt16LE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 16, signed: false, be: false }, offset, safe);
}
export function writeUInt16LE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 16, signed: false, be: false }, out, offset, clamp);
}

/** Signed 32-bit little endian integer */
export function packInt32LE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 32, signed: true, be: false }));
}
export function unpackInt32LE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 32, signed: true, be: false }, offset, safe);
}
export function writeInt32LE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 32, signed: true, be: false }, out, offset, clamp);
}

/** Unsigned 32-bit little endian integer */
export function packUInt32LE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 32, signed: false, be: false }));
}
export function unpackUInt32LE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 32, signed: false, be: false }, offset, safe);
}
export function writeUInt32LE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 32, signed: false, be: false }, out, offset, clamp);
}

/**
 * Signed 16-bit big-endian integer
 */
export function packInt16BE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 16, signed: true, be: true }));
}
export function unpackInt16BE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 16, signed: true, be: true }, offset, safe);
}
export function writeInt16BE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 16, signed: true, be: true }, out, offset, clamp);
}

/**
 * Unsigned 16-bit big-endian integer
 */
export function packUInt16BE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 16, signed: false, be: true }));
}
export function unpackUInt16BE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 16, signed: false, be: true }, offset, safe);
}
export function writeUInt16BE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 16, signed: false, be: true }, out, offset, clamp);
}

/**
 * Signed 32-bit big-endian integer
 */
export function packInt32BE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 32, signed: true, be: true }));
}
export function unpackInt32BE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 32, signed: true, be: true }, offset, safe);
}
export function writeInt32BE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 32, signed: true, be: true }, out, offset, clamp);
}

/**
 * Unsigned 32-bit big-endian integer
 */
export function packUInt32BE(n: number): Uint8Array {
  return Uint8Array.from(pack(n, { bits: 32, signed: false, be: true }));
}
export function unpackUInt32BE(bytes: Uint8Array | number[], offset = 0, safe = false): number {
  return unpack(bytes, { bits: 32, signed: false, be: true }, offset, safe);
}
export function writeUInt32BE(n: number, out: Uint8Array, offset = 0, clamp = false): number {
  return packTo(n, { bits: 32, signed: false, be: true }, out, offset, clamp);
}

/**
 * Returns the minimum of two Long values.
 * Compares a and b, and returns the smaller value.
 * @param a - The first Long value.
 * @param b - The second Long value.
 * @returns The smaller of a and b.
 */
export function longMin(a: Long, b: Long): Long {
  return a.compare(b) <= 0 ? a : b;
}

export function toPaddedHex8(value: UInt8): string {
  // 8-bit → 2 hex digits
  return (value & 0xff).toString(16).padStart(2, "0");
}

export function toPaddedHex16(value: UInt16): string {
  // 16-bit → 4 hex digits
  return (value & 0xffff).toString(16).padStart(4, "0");
}

export function toPaddedHex32(value: UInt32): string {
  // 32-bit → 8 hex digits
  // >>> 0 forces unsigned 32-bit interpretation
  return (value >>> 0).toString(16).padStart(8, "0");
}

export function toPaddedHex64(value: Long): string {
  // Convert to unsigned and get hex string padded to 16 hex chars (64 bits)
  return value.toUnsigned().toString(16).padStart(16, "0");
}

export function toPaddedHex64Signed(value: Long): string {
  // Signed 64-bit hex, two's complement
  // Use .toString(16) directly, pad to 16 chars
  let hex = value.toString(16);
  // Pad negative numbers correctly (long.js produces negative hex without padding)
  if (value.isNegative()) {
    // For negative, pad with 'f' to 16 chars to represent 2's complement correctly
    hex = hex.padStart(16, "f");
  } else {
    hex = hex.padStart(16, "0");
  }
  return hex;
}
