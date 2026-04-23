import { hexToUint8Array } from "uint8array-extras";
import { stringify, validate } from "uuid";

export function uuidToHex(uuid: string): string {
  return uuid.replace(/-/g, "").toLowerCase();
}

export function hexToUuid(hex: string): string {
  return stringify(hexToUint8Array(hex));
}

export function isValidUuid(hex: string): boolean {
  return validate(hex);
}

export function uuidToUint8Array(uuid: string): Uint8Array {
  return hexToUint8Array(uuidToHex(uuid));
}
