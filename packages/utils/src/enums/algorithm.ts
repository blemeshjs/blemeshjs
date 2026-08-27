import { isEnumCase } from "../helpers/enum.js";
import { Data } from "../types/buffer.js";
import { Int32, UInt8 } from "../types/number.js";

export enum Algorithm {
  BTM_ECDH_P256_CMAC_AES128_AES_CCM = 128,
  BTM_ECDH_P256_HMAC_SHA256_AES_CCM = 256,
}

type ProvisioningPdu = Data;

export namespace Algorithm {
  export function value(algorithm: Algorithm): UInt8 {
    switch (algorithm) {
      case Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM:
        return 0x00;
      case Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM:
        return 0x01;
    }
  }

  export function from(pdu: ProvisioningPdu) {
    return isEnumCase(pdu[1], Algorithm) ? pdu[1] : undefined;
  }

  export function length(algorithm: Algorithm): Int32 {
    switch (algorithm) {
      case Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM:
        return 128;
      case Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM:
        return 256;
    }
  }
}
