import { describe, expect, it } from "vitest";
import { Algorithm } from "./algorithm.js";

describe("Algorithm", () => {
  it("should have BTM_ECDH_P256_CMAC_AES128_AES_CCM enum value", () => {
    expect(Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM).toBe(128);
  });

  it("should have BTM_ECDH_P256_HMAC_SHA256_AES_CCM enum value", () => {
    expect(Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM).toBe(256);
  });

  describe("value", () => {
    it("should return 0x00 for BTM_ECDH_P256_CMAC_AES128_AES_CCM", () => {
      expect(Algorithm.value(Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM)).toBe(0x00);
    });

    it("should return 0x01 for BTM_ECDH_P256_HMAC_SHA256_AES_CCM", () => {
      expect(Algorithm.value(Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM)).toBe(0x01);
    });
  });

  describe("from", () => {
    it("should return BTM_ECDH_P256_CMAC_AES128_AES_CCM for pdu with value 128", () => {
      const pdu = new Uint8Array([0, 128]);
      expect(Algorithm.from(pdu)).toBe(Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM);
    });

    it("should return BTM_ECDH_P256_HMAC_SHA256_AES_CCM for pdu with value 256", () => {
      const pdu = new Uint8Array([0, 256]);
      expect(Algorithm.from(pdu)).toBe(undefined); // 256 won't fit in a byte, so result is undefined
    });

    it("should return undefined for unknown algorithm", () => {
      const pdu = new Uint8Array([0, 99]);
      expect(Algorithm.from(pdu)).toBeUndefined();
    });
  });

  describe("length", () => {
    it("should return 128 for BTM_ECDH_P256_CMAC_AES128_AES_CCM", () => {
      expect(Algorithm.length(Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM)).toBe(128);
    });

    it("should return 256 for BTM_ECDH_P256_HMAC_SHA256_AES_CCM", () => {
      expect(Algorithm.length(Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM)).toBe(256);
    });
  });
});
