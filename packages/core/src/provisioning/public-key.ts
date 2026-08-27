import { isEnumCase, OptionSet, UInt8 } from "@blemeshjs/utils";
import { ProvisioningPdu } from "./provisioning-pdu.js";

/**
 * The type of Device Public key to be used.
 *
 * This enumeration is used in `ProvisioningRequest.start()`
 * to encode the selected Public Key type.
 */
export enum PublicKeyMethod {
  /**
   * No OOB Public Key is used.
   */
  noOobPublicKey,
  /**
   * OOB Public Key is used. The key must contain the full value of the Public Key,
   * depending on the chosen algorithm.
   */
  oobPublicKey,
}

export namespace PublicKeyMethod {
  export function from(pdu: ProvisioningPdu) {
    return isEnumCase(pdu[2], PublicKeyMethod) ? pdu[2] : undefined;
  }
}

export type PublicKey =
  | { method: PublicKeyMethod.noOobPublicKey }
  | { method: PublicKeyMethod.oobPublicKey; key: Uint8Array };

/**
 * The type of Device Public key to be used.
 *
 * This enumeration is used to specify the Public Key type during provisioning
 * in `ProvisioningManager.provision()`.
 */
export namespace PublicKey {
  /**
   * No OOB Public Key is used.
   */
  export const noOobPublicKey: PublicKey = {
    method: PublicKeyMethod.noOobPublicKey,
  };
  /**
   * OOB Public Key is used. The key must contain the full value of the Public Key,
   * depending on the chosen algorithm.
   *
   * @param key The Public Key consists of 256-bit X and 256-bit Y of a point Q on P256 curve.
   */
  export function oobPublicKey(key: Uint8Array): PublicKey {
    return { method: PublicKeyMethod.oobPublicKey, key };
  }

  export function toString(key: PublicKey): string {
    switch (key.method) {
      case PublicKeyMethod.noOobPublicKey:
        return "No OOB Public Key";
      case PublicKeyMethod.oobPublicKey:
        return "OOB Public Key";
    }
  }
}

/**
 * The type of Public Key information.
 */
export class PublicKeyType extends OptionSet<UInt8> {
  /**
   * Public Key OOB Information is available.
   */
  public static publicKeyOobInformationAvailable = new PublicKeyType(1 << 0);

  public toString(): string {
    if (this.rawValue === 0) {
      return "None";
    }
    return (
      [
        [PublicKeyType.publicKeyOobInformationAvailable, "Public Key OOB Information Available"],
      ] as Array<[PublicKeyType, string]>
    )
      .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
      .join(", ");
  }
}
