import sjcl from "sjcl";
import aesjs from "aes-js";
import { hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { Int64 } from "../types/number.js";

export function getSecureRandomBytes(length: Int64): Uint8Array<ArrayBuffer> | Error {
  if (length.lte(0)) {
    throw new Error("Length must be a positive number");
  }

  if (crypto && typeof crypto.getRandomValues === "function") {
    const buffer = new Uint8Array(length.toNumber());
    crypto.getRandomValues(buffer);
    return buffer;
  }

  return new Error("Secure random byte generation is not supported in this environment");
}

export function encryptAesCcm(
  key: Uint8Array,
  iv: Uint8Array,
  data: Uint8Array,
  aad: Uint8Array | undefined,
  tagLength = 4,
): Uint8Array {
  const keyBits = sjcl.codec.hex.toBits(uint8ArrayToHex(key));
  const ivBits = sjcl.codec.hex.toBits(uint8ArrayToHex(iv));
  const adBits =
    typeof aad === "undefined" ? undefined : sjcl.codec.hex.toBits(uint8ArrayToHex(aad));

  const aes = new sjcl.cipher.aes(keyBits);

  const cipherTextBits = sjcl.mode.ccm.encrypt(
    aes,
    sjcl.codec.hex.toBits(uint8ArrayToHex(data)),
    ivBits,
    adBits,
    tagLength * 8,
  );

  return hexToUint8Array(sjcl.codec.hex.fromBits(cipherTextBits));
}

export function decryptAesCcm(
  key: Uint8Array,
  iv: Uint8Array,
  cipherTextWithTag: Uint8Array,
  aad: Uint8Array | undefined,
  tagLength = 4,
): Uint8Array {
  const keyBits = sjcl.codec.hex.toBits(uint8ArrayToHex(key));
  const ivBits = sjcl.codec.hex.toBits(uint8ArrayToHex(iv));
  const adBits =
    typeof aad === "undefined" ? undefined : sjcl.codec.hex.toBits(uint8ArrayToHex(aad));

  const aes = new sjcl.cipher.aes(keyBits);

  const cipherTextBits = sjcl.codec.hex.toBits(uint8ArrayToHex(cipherTextWithTag));

  const plaintextBits = sjcl.mode.ccm.decrypt(aes, cipherTextBits, ivBits, adBits, tagLength * 8);

  return hexToUint8Array(sjcl.codec.hex.fromBits(plaintextBits));
}

/**
 * Encrypt plaintext (Uint8Array) using AES-ECB mode with a 128/192/256-bit key.
 *
 * @param plaintext Uint8Array (must be multiple of 16 bytes)
 * @param keyBytes Uint8Array (16, 24, or 32 bytes)
 * @returns Uint8Array cipherText (same length as plaintext)
 */
export function encryptAesEcb(plaintext: Uint8Array, keyBytes: Uint8Array) {
  const ecb = new aesjs.ModeOfOperation.ecb(aesjs.utils.hex.toBytes(uint8ArrayToHex(keyBytes)));
  const result = ecb.encrypt(aesjs.utils.hex.toBytes(uint8ArrayToHex(plaintext)));
  return result;
}

export function generateElGamalKeyPair() {
  const curve = sjcl.ecc.curves.c256;
  const keyPair = sjcl.ecc.elGamal.generateKeys(curve, 0); // FIXME: 0 = paranoia level (fast, insecure for prod)

  const privateKey = sjcl.codec.hex.fromBits(keyPair.sec.get());
  const pub = keyPair.pub.get();
  const publicKey = sjcl.codec.hex.fromBits(pub.x.concat(pub.y));

  return {
    publicKey,
    privateKey,
  };
}

export function importKeyFromPrivate(privateKeyHex: string) {
  const curve = sjcl.ecc.curves.c256;

  const d = new sjcl.bn(privateKeyHex);
  const priv = new sjcl.ecc.ecdsa.secretKey(curve, d);

  return sjcl.codec.hex.fromBits(priv.get());
}

export function calculateSharedSecret(privateKeyHex: string, publicKeyHex: string) {
  const curve = sjcl.ecc.curves.c256;

  if (publicKeyHex.length !== 128) {
    throw new Error("Public key must be 64 bytes (128 hex chars) for X||Y");
  }

  const x = new sjcl.bn(publicKeyHex.slice(0, 64));
  const y = new sjcl.bn(publicKeyHex.slice(64));
  const theirPoint = new sjcl.ecc.point(curve, x, y);

  const privScalar = new sjcl.bn(privateKeyHex);
  const sharedPoint = theirPoint.mult(privScalar);

  const sharedXHex = sjcl.codec.hex
    .fromBits(sharedPoint.toBits())
    .substring(0, 64)
    .padStart(64, "0");
  return sharedXHex;
}

export function calculateHMAC_SHA256(key: Uint8Array, data: Uint8Array): Uint8Array {
  const hmac = new sjcl.misc.hmac(sjcl.codec.hex.toBits(uint8ArrayToHex(key)), sjcl.hash.sha256);
  const macBits = hmac.encrypt(sjcl.codec.hex.toBits(uint8ArrayToHex(data)));
  return hexToUint8Array(sjcl.codec.hex.fromBits(macBits));
}
