import { hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import {
  encryptAesEcb,
  getSecureRandomBytes,
  encryptAesCcm,
  decryptAesCcm,
  generateElGamalKeyPair,
  importKeyFromPrivate,
  calculateSharedSecret,
  calculateHMAC_SHA256,
} from "./crypto.js";
import { describe, expect, it } from "vitest";
import Long from "long";

describe("Crypto Helper Tests", () => {
  describe("encryptAesEcb", () => {
    it("should encrypt 1 block", () => {
      const keyHex = "2b7e151628aed2a6abf7158809cf4f3c";
      const ptHex = "6bc1bee22e409f96e93d7e117393172a";
      const expectedCtHex = "3ad77bb40d7a3660a89ecaf32466ef97";

      const key = hexToUint8Array(keyHex);
      const pt = hexToUint8Array(ptHex);
      const ct = encryptAesEcb(pt, key);

      expect(uint8ArrayToHex(ct)).toEqual(expectedCtHex);
    });

    it("should encrypt multiple blocks", () => {
      const keyHex = "2b7e151628aed2a6abf7158809cf4f3c";
      const ptHex = "6bc1bee22e409f96e93d7e117393172a6bc1bee22e409f96e93d7e117393172a";

      const key = hexToUint8Array(keyHex);
      const pt = hexToUint8Array(ptHex);
      const ct = encryptAesEcb(pt, key);

      expect(ct.length).toBe(32);
    });
  });

  describe("getSecureRandomBytes", () => {
    it("should generate random bytes of specified length", () => {
      const length = Long.fromNumber(16);
      const result = getSecureRandomBytes(length);

      expect(result).toBeInstanceOf(Uint8Array);
      expect((result as Uint8Array).length).toBe(16);
    });

    it("should generate different random bytes on each call", () => {
      const length = Long.fromNumber(16);
      const result1 = getSecureRandomBytes(length) as Uint8Array;
      const result2 = getSecureRandomBytes(length) as Uint8Array;

      expect(uint8ArrayToHex(result1)).not.toBe(uint8ArrayToHex(result2));
    });

    it("should throw error for non-positive length", () => {
      const length = Long.fromNumber(0);
      expect(() => getSecureRandomBytes(length)).toThrow("Length must be a positive number");
    });

    it("should throw error for negative length", () => {
      const length = Long.fromNumber(-1);
      expect(() => getSecureRandomBytes(length)).toThrow("Length must be a positive number");
    });
  });

  describe("encryptAesCcm and decryptAesCcm", () => {
    it("should encrypt and decrypt data with CCM mode", () => {
      const key = hexToUint8Array("2b7e151628aed2a6abf7158809cf4f3c");
      const iv = hexToUint8Array("000102030405060708090a0b0c");
      const plaintext = hexToUint8Array("48656c6c6f20576f726c64");
      const aad = hexToUint8Array("0001020304");

      const cipherText = encryptAesCcm(key, iv, plaintext, aad, 4);
      const decrypted = decryptAesCcm(key, iv, cipherText, aad, 4);

      expect(uint8ArrayToHex(decrypted)).toBe(uint8ArrayToHex(plaintext));
    });

    it("should encrypt and decrypt without AAD", () => {
      const key = hexToUint8Array("2b7e151628aed2a6abf7158809cf4f3c");
      const iv = hexToUint8Array("000102030405060708090a0b0c");
      const plaintext = hexToUint8Array("48656c6c6f");

      const cipherText = encryptAesCcm(key, iv, plaintext, undefined, 4);
      const decrypted = decryptAesCcm(key, iv, cipherText, undefined, 4);

      expect(uint8ArrayToHex(decrypted)).toBe(uint8ArrayToHex(plaintext));
    });

    it("should work with different tag lengths", () => {
      const key = hexToUint8Array("2b7e151628aed2a6abf7158809cf4f3c");
      const iv = hexToUint8Array("000102030405060708090a0b0c");
      const plaintext = hexToUint8Array("48656c6c6f");

      const cipherText = encryptAesCcm(key, iv, plaintext, undefined, 8);
      const decrypted = decryptAesCcm(key, iv, cipherText, undefined, 8);

      expect(uint8ArrayToHex(decrypted)).toBe(uint8ArrayToHex(plaintext));
    });
  });

  describe("generateElGamalKeyPair", () => {
    it("should generate a key pair", () => {
      const keyPair = generateElGamalKeyPair();

      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(typeof keyPair.publicKey).toBe("string");
      expect(typeof keyPair.privateKey).toBe("string");
      expect(keyPair.publicKey.length).toBe(128); // 64 bytes in hex
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it("should generate different key pairs on each call", () => {
      const keyPair1 = generateElGamalKeyPair();
      const keyPair2 = generateElGamalKeyPair();

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe("importKeyFromPrivate", () => {
    it("should import a private key", () => {
      const keyPair = generateElGamalKeyPair();
      const imported = importKeyFromPrivate(keyPair.privateKey);

      expect(imported).toBeDefined();
      expect(typeof imported).toBe("string");
    });
  });

  describe("calculateSharedSecret", () => {
    it("should calculate shared secret between two parties", () => {
      const keyPair1 = generateElGamalKeyPair();
      const keyPair2 = generateElGamalKeyPair();

      const sharedSecret1 = calculateSharedSecret(keyPair1.privateKey, keyPair2.publicKey);
      const sharedSecret2 = calculateSharedSecret(keyPair2.privateKey, keyPair1.publicKey);

      expect(sharedSecret1).toBe(sharedSecret2);
      expect(sharedSecret1.length).toBe(64); // 32 bytes in hex
    });

    it("should throw error for invalid public key length", () => {
      const keyPair = generateElGamalKeyPair();
      const shortPublicKey = "1234567890";

      expect(() => calculateSharedSecret(keyPair.privateKey, shortPublicKey)).toThrow(
        "Public key must be 64 bytes (128 hex chars) for X||Y",
      );
    });
  });

  describe("calculateHMAC_SHA256", () => {
    it("should calculate HMAC-SHA256", () => {
      const key = hexToUint8Array("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
      const data = hexToUint8Array("4869205468657265"); // "Hi There"

      const hmac = calculateHMAC_SHA256(key, data);

      expect(hmac).toBeDefined();
      expect(hmac.length).toBe(32); // SHA256 produces 32 bytes
    });

    it("should produce consistent HMAC for same inputs", () => {
      const key = hexToUint8Array("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
      const data = hexToUint8Array("48656c6c6f");

      const hmac1 = calculateHMAC_SHA256(key, data);
      const hmac2 = calculateHMAC_SHA256(key, data);

      expect(uint8ArrayToHex(hmac1)).toBe(uint8ArrayToHex(hmac2));
    });

    it("should produce different HMAC for different keys", () => {
      const key1 = hexToUint8Array("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
      const key2 = hexToUint8Array("0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c");
      const data = hexToUint8Array("48656c6c6f");

      const hmac1 = calculateHMAC_SHA256(key1, data);
      const hmac2 = calculateHMAC_SHA256(key2, data);

      expect(uint8ArrayToHex(hmac1)).not.toBe(uint8ArrayToHex(hmac2));
    });
  });
});
