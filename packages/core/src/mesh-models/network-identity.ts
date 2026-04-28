import { Data } from "@blemeshjs/utils";
import { NetworkKey } from "./network-key.js";
import { areUint8ArraysEqual, concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { Crypto } from "@blemeshjs/crypto";
import { serviceData } from "./node-identity.js";

/**
 * The Network Identity contains information from Network Identity or Private Network
 * Identity beacon.
 *
 * Network Identities can be matched to Network Keys in the network.
 *
 */
export interface NetworkIdentity {
  /**
   * Returns whether the identity matches given `NetworkKey`.
   *
   * @param networkKey The Network Key to check.
   * @returns True, if the identity matches the Network Key; false otherwise.
   */
  matches(networkKey: NetworkKey): boolean;
}

/**
 * Representation of Network ID advertising packet.
 */
export class PublicNetworkIdentity implements NetworkIdentity {
  /**
   * The Network ID is 64-bit network identifier derived from the Network Key.
   */
  public networkId: Data;

  /**
   * Creates the Network Identity object from Hash and Random values.
   *
   * @param networkId Identifies the network.
   */
  public constructor(networkId: Data) {
    this.networkId = networkId;
  }

  /**
   * Creates the Network Identity object from the received advertisement data.
   *
   * @param advertisementData Received advertisement data.
   */
  public static fromAdvertisementData(
    advertisementData: Record<string, unknown>,
  ): PublicNetworkIdentity | null {
    const data = serviceData(advertisementData);
    if (typeof data === "undefined" || data.length === 0) return null;
    if (data[0] !== 0x00 || data.length !== 9) return null;
    return new PublicNetworkIdentity(data.slice(1, 9));
  }

  public matches(networkKey: NetworkKey): boolean {
    return (
      areUint8ArraysEqual(this.networkId, networkKey.networkId) ||
      (typeof networkKey.oldNetworkId !== "undefined" &&
        areUint8ArraysEqual(this.networkId, networkKey.oldNetworkId))
    );
  }
  public toString(): string {
    return `Public Network Identity (0x${uint8ArrayToHex(this.networkId)})`;
  }
}

/**
 * Representation of Private Network Identity advertising packet.
 */
export class PrivateNetworkIdentity implements NetworkIdentity {
  /**
   * Function of the included random number and identity information.
   */
  public hash: Data;
  /**
   * 64-bit random number.
   */
  public random: Data;

  /**
   * Creates the Network Identity object from Hash and Random values.
   *@param hash Function of the included random number and identity information.
   *@param random 64-bit random number.
   */
  public constructor(hash: Data, random: Data) {
    this.hash = hash;
    this.random = random;
  }

  /**
   * Creates the Network Identity object from the received advertisement data.
   *
   * @param advertisementData Received advertisement data.
   */
  public static fromAdvertisementData(
    advertisementData: Record<string, unknown>,
  ): PrivateNetworkIdentity | null {
    const data = serviceData(advertisementData);
    if (typeof data === "undefined" || data.length === 0) return null;
    if (data[0] !== 0x02 || data.length !== 17) return null;
    return new PrivateNetworkIdentity(data.slice(1, 9), data.slice(9, 17));
  }

  public matches(networkKey: NetworkKey): boolean {
    // Data are: Network ID and 64-bit Random.
    const data = concatUint8Arrays([networkKey.networkId, this.random]);
    const calculatedHash = Crypto.calculateHash(data, networkKey.keys.identityKey);
    if (areUint8ArraysEqual(calculatedHash, this.hash)) return true;
    // If the Key Refresh Procedure is in place, the identity might have been
    // generated with the old key.
    const oldIdentityKey = networkKey.oldKeys?.identityKey;
    if (typeof oldIdentityKey === "undefined") return false;
    const oldNetworkId = networkKey.oldNetworkId;
    if (typeof oldNetworkId === "undefined") return false;
    const oldData = concatUint8Arrays([oldNetworkId, this.random]);
    const calculatedOldHash = Crypto.calculateHash(oldData, oldIdentityKey);
    return areUint8ArraysEqual(calculatedOldHash, this.hash);
  }

  public toString(): string {
    return `Private Network Identity (hash: 0x${uint8ArrayToHex(this.hash)}, random: 0x${uint8ArrayToHex(this.random)})`;
  }
}
