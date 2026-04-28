import { Algorithm, Data, Int32, OptionSet, readUInt16BE, UInt16 } from "@blemeshjs/utils";

/**
 * A set of algorithms supported by the Unprovisioned Device.
 */
export class Algorithms extends OptionSet<UInt16> {
  /**
   * BTM_ECDH_P256_CMAC_AES128_AES_CCM algorithm is supported.
   */
  public static BTM_ECDH_P256_CMAC_AES128_AES_CCM = new Algorithms(1 << 0);
  /**
   * BTM_ECDH_P256_HMAC_SHA256_AES_CCM algorithm is supported.
   */
  public static BTM_ECDH_P256_HMAC_SHA256_AES_CCM = new Algorithms(1 << 1);

  static fromData(data: Data, offset: Int32) {
    return new Algorithms(readUInt16BE(data.slice(offset)));
  }

  /**
   * Returns the strongest provisioning algorithm supported by the device.
   */
  public get strongest(): Algorithm {
    if (this.contains(Algorithms.BTM_ECDH_P256_HMAC_SHA256_AES_CCM.rawValue)) {
      return Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM;
    }
    return Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM;
  }
  public toString(): string {
    if (this.rawValue == 0) {
      return "None";
    }
    return (
      [
        [Algorithms.BTM_ECDH_P256_CMAC_AES128_AES_CCM, "BTM ECDH P256 CMAC AES128 AES CCM"],
        [Algorithms.BTM_ECDH_P256_HMAC_SHA256_AES_CCM, "BTM ECDH P256 HMAC SHA256 AES CCM"],
      ] as Array<[Algorithms, string]>
    )
      .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
      .filter((name): name is string => name !== undefined)
      .join(", ");
  }
}
