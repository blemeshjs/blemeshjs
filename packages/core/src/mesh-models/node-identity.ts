import { Data, MeshProxyService } from "@mesh-link-js/utils";
import {
  areUint8ArraysEqual,
  base64ToUint8Array,
  concatUint8Arrays,
  uint8ArrayToHex,
} from "uint8array-extras";
import { Node } from "./node.js";
import { Crypto } from "@mesh-link-js/crypto";
import z from "zod";

/**
 * The Node Identity contains information from Node Identity or Private Node Identity
 * beacon.
 *
 * It can be used to match advertising device to a specific `Node` in the network.
 *
 */
export interface NodeIdentity {
  /**
   * Returns whether the identity matches given `Node`.
   *
   * @param node The Node to check.
   * @returns True, if the identity matches the Node; false otherwise.
   */
  matches(node: Node): boolean;
}

export function serviceData(advertisementData: Record<string, unknown>): Data | undefined {
  if (
    !z.record(z.string(), z.null().or(z.record(z.any(), z.any()))).safeParse(advertisementData)
      .success
  )
    return;
  const parsedServiceData = z
    .record(z.uuid(), z.base64())
    .safeParse(advertisementData["serviceData"]);
  if (!parsedServiceData.success) return;
  const serviceData = parsedServiceData.data;
  const uuid = serviceData[MeshProxyService.uuid.fullUuidString.toLowerCase()];
  if (!uuid) return;
  return base64ToUint8Array(uuid);
}

/**
 * Representation of Node Identity advertising packet.
 */
export class PublicNodeIdentity implements NodeIdentity {
  /**
   * Function of the included random number and identity information.
   */
  public hash: Data;
  /**
   * 64-bit random number.
   */
  public random: Data;

  /**
   * the Node Identity object from Hash and Random values.
   * @param hash Function of the included random number and identity information.
   * @param random 64-bit random number.
   */
  public constructor(hash: Data, random: Data) {
    this.hash = hash;
    this.random = random;
  }

  /**
   * Creates the Node Identity object from the received advertisement data.
   *
   * @param advertisementData Received advertisement data.
   */
  public static fromAdvertisementData(
    advertisementData: Record<string, unknown>,
  ): PublicNodeIdentity | null {
    const data = serviceData(advertisementData);
    if (typeof data === "undefined" || data.length !== 17 || data[0] !== 0x01) return null;
    return new PublicNodeIdentity(data.slice(1, 9), data.slice(9, 17));
  }

  public matches(node: Node): boolean {
    // Data are: 48 bits of Padding (0s), 64-bit Random and Unicast Address.
    const data = concatUint8Arrays([
      new Uint8Array(6),
      this.random,
      node.primaryUnicastAddress.bytesBE,
    ]);

    for (const networkKey of node.networkKeys) {
      const calculatedHash = Crypto.calculateHash(data, networkKey.keys.identityKey);
      if (areUint8ArraysEqual(calculatedHash, this.hash)) {
        return true;
      }
      // If the Key Refresh Procedure is in place, the identity might have been
      // generated with the old key.
      const oldIdentityKey = networkKey.oldKeys?.identityKey;
      if (typeof oldIdentityKey !== "undefined") {
        const calculatedHash = Crypto.calculateHash(data, oldIdentityKey);
        if (areUint8ArraysEqual(calculatedHash, this.hash)) {
          return true;
        }
      }
    }
    return false;
  }

  public toString(): string {
    return `Node Identity (hash: 0x${uint8ArrayToHex(this.hash)}, random: 0x${uint8ArrayToHex(this.random)})`;
  }
}

/**
 * Representation of Private Node Identity advertising packet.
 */
export class PrivateNodeIdentity implements NodeIdentity {
  /**
   * Function of the included random number and identity information.
   */
  public hash: Data;
  /**
   * 64-bit random number.
   */
  public random: Data;

  /**
   * Creates the Private Node Identity object from Hash and Random values.
   * @param hash Function of the included random number and identity information.
   * @param random 64-bit random number.
   */
  public constructor(hash: Data, random: Data) {
    this.hash = hash;
    this.random = random;
  }

  /**
   * Creates the Private Node Identity object from the received advertisement data.
   *
   * @param advertisementData Received advertisement data.
   */
  public static fromAdvertisementData(
    advertisementData: Record<string, unknown>,
  ): PrivateNodeIdentity | null {
    const data = serviceData(advertisementData);
    if (typeof data === "undefined" || data.length !== 17 || data[0] !== 0x03) return null;
    return new PrivateNodeIdentity(data.slice(1, 9), data.slice(9, 17));
  }

  public matches(node: Node): boolean {
    // Data are: 40 bits of Padding (0s), 0x03, 64 bit Random and Unicast Address.
    const data = concatUint8Arrays([
      new Uint8Array(5),
      new Uint8Array([0x03]),
      this.random,
      node.primaryUnicastAddress.bytesBE,
    ]);

    for (const networkKey of node.networkKeys) {
      const calculatedHash = Crypto.calculateHash(data, networkKey.keys.identityKey);
      if (areUint8ArraysEqual(calculatedHash, this.hash)) {
        return true;
      }
      // If the Key Refresh Procedure is in place, the identity might have been
      // generated with the old key.
      const oldIdentityKey = networkKey.oldKeys?.identityKey;
      if (typeof oldIdentityKey !== "undefined") {
        const calculatedHash = Crypto.calculateHash(data, oldIdentityKey);
        if (areUint8ArraysEqual(calculatedHash, this.hash)) {
          return true;
        }
      }
    }
    return false;
  }
  public toString(): string {
    return `Private Node Identity (hash: 0x${uint8ArrayToHex(this.hash)}, random: 0x${uint8ArrayToHex(this.random)})`;
  }
}
