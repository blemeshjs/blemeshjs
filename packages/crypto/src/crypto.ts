import {
  encryptAesEcb,
  encryptAesCcm,
  decryptAesCcm,
  calculateHMAC_SHA256 as utilsHmacSHA256,
  getSecureRandomBytes,
  generateElGamalKeyPair,
  calculateSharedSecret as utilsSharedSecret,
  xorUint8Arrays,
  packUInt32BE,
  readUInt32BE,
  Address,
  Algorithm,
  IvIndex,
  UUID,
  UInt8,
  UInt32,
} from "@blemeshjs/utils";
import {
  areUint8ArraysEqual,
  concatUint8Arrays,
  hexToUint8Array,
  uint8ArrayToHex,
} from "uint8array-extras";
import Long from "long";

/**
 * A helper class for handling cryptography.
 *
 * Method implementation is based on Security toolbox and other parts from the
 * Bluetooth Mesh Protocol 1.1.
 *
 * It is backwards compatible with older versions of the specification.
 */
export class Crypto {
  /**
   * Generates random data of given length, given in bits.
   *
   * @param sizeInBits Required size of the random data, in bits.
   * @returns A Uint8Array of cryptographically random bytes.
   */
  static generateRandom(sizeInBits: number): Uint8Array {
    const sizeInBytes = sizeInBits >> 3;
    const result = getSecureRandomBytes(Long.fromNumber(sizeInBytes));
    if (result instanceof Error) throw result;
    return result;
  }

  static generateKey() {
    return this.generateRandom(128);
  }

  /**
   * Obfuscates or deobfuscates given data by XORing it with PECB, which is
   * calculated by encrypting Privacy Plaintext (encrypted data used as Privacy
   * Random, and IV Index) using the given key.
   *
   * Privacy Plaintext = 0x0000000000 || IV Index || Privacy Random
   * PECB = e(PrivacyKey, Privacy Plaintext)
   * ObfuscatedData = (CTL || TTL || SEQ || SRC) ⊕ PECB[0–5]
   */
  static obfuscate(
    data: Uint8Array,
    random: Uint8Array,
    ivIndex: UInt32,
    privacyKey: Uint8Array,
  ): Uint8Array {
    const privacyRandom = random.slice(0, 7);
    const privacyPlaintext = concatUint8Arrays([
      new Uint8Array(5),
      packUInt32BE(ivIndex),
      privacyRandom,
    ]);
    const pecb = ecb(privacyPlaintext, privacyKey);
    return xorUint8Arrays(data, pecb.slice(0, 6));
  }

  /**
   * Calculate the 16-bit Virtual Address based on the 128-bit Label UUID.
   *
   * @param virtualLabel The Virtual Label of a Virtual Group.
   * @returns 16-bit hash, known as Virtual Address.
   */
  // Typo preserved to match existing callers (calculate vs calculate)
  static calculateVirtualAddress(virtualLabel: UUID): Address {
    const vtad = new TextEncoder().encode("vtad");
    const salt = s1(vtad);
    const hash = cmac(hexToUint8Array(virtualLabel.hex), salt);
    let address = (hash[14] << 8) | hash[15];
    address |= 0x8000;
    address &= 0xbfff;
    return new Address(address);
  }

  /**
   * Calculates key derivatives from the given Network Key.
   *
   * Derives: NID (7 bits), Encryption Key, Privacy Key, Identity Key,
   * Beacon Key and Private Beacon Key (all 128 bits).
   */
  static calculateKeyDerivatives(key: Uint8Array): {
    nid: UInt8;
    encryptionKey: Uint8Array;
    privacyKey: Uint8Array;
    identityKey: Uint8Array;
    beaconKey: Uint8Array;
    privateBeaconKey: Uint8Array;
  } {
    const P = new Uint8Array([0x69, 0x64, 0x31, 0x32, 0x38, 0x01]); // "id128" || 0x01
    const enc = new TextEncoder();
    const identityKey = k1(key, s1(enc.encode("nkik")), P);
    const beaconKey = k1(key, s1(enc.encode("nkbk")), P);
    const privateBeaconKey = k1(key, s1(enc.encode("nkpk")), P);
    const { nid, encryptionKey, privacyKey } = k2(key, new Uint8Array([0x00]));
    return { nid, encryptionKey, privacyKey, identityKey, beaconKey, privateBeaconKey };
  }

  /**
   * Generates the Network ID based on the given 128-bit key.
   */
  static calculateNetworkId(key: Uint8Array): Uint8Array {
    return k3(key);
  }

  /**
   * Generates the Application Key Identifier (AID) based on the key.
   */
  static calculateAid(key: Uint8Array): UInt8 {
    return k4(key);
  }

  /**
   * Generates Node Identity hash using the given Identity Key.
   * Returns the last 8 bytes of AES-ECB(data, key).
   */
  static calculateHash(data: Uint8Array, key: Uint8Array): Uint8Array {
    return ecb(data, key).slice(8);
  }

  /**
   * Authenticates the received Secure Network beacon using the given Beacon Key.
   *
   * @returns `true` if the beacon is authenticated, `false` otherwise.
   */
  static authenticate(pdu: Uint8Array, key: Uint8Array): boolean {
    const flagsNetworkIdAndIVIndex = pdu.slice(1, 14);
    const authenticationValue = pdu.slice(14, 22);
    const hash = cmac(flagsNetworkIdAndIVIndex, key).slice(0, 8);
    return areUint8ArraysEqual(authenticationValue, hash);
  }

  /**
   * Decodes and authenticates the received Private beacon using the given
   * Private Beacon Key.
   *
   * @returns Network information obtained from the beacon, or `undefined` if
   *          authentication failed.
   */
  static decodeAndAuthenticate(
    pdu: Uint8Array,
    key: Uint8Array,
  ): { keyRefreshFlag: boolean; ivIndex: IvIndex } | undefined {
    // Byte 0 is the Beacon Type (0x02).
    const random = pdu.slice(1, 14);
    const obfuscatedData = pdu.slice(14, 19);
    const authenticationTag = pdu.slice(19, 27);

    // Deobfuscate Private Beacon Data.
    // C1 = 0x01 || random || 0x00 0x01
    const C1 = concatUint8Arrays([new Uint8Array([0x01]), random, new Uint8Array([0x00, 0x01])]);
    const S = ecb(C1, key);
    const privateBeaconData = xorUint8Arrays(S.slice(0, 5), obfuscatedData);

    // Authenticate the beacon.
    const B0 = concatUint8Arrays([new Uint8Array([0x19]), random, new Uint8Array([0x00, 0x05])]);
    const C0 = concatUint8Arrays([new Uint8Array([0x01]), random, new Uint8Array([0x00, 0x00])]);
    const P = concatUint8Arrays([privateBeaconData, new Uint8Array(11)]);
    const T0 = ecb(B0, key);
    const T1 = ecb(xorUint8Arrays(T0, P), key);
    const T2 = xorUint8Arrays(T1, ecb(C0, key));
    const calculatedAuthTag = T2.slice(0, 8);

    if (!areUint8ArraysEqual(authenticationTag, calculatedAuthTag)) {
      return undefined;
    }

    // Decode Private Beacon Data.
    const flags = privateBeaconData[0];
    const keyRefreshFlag = (flags & 0x01) !== 0;
    const updateActive = (flags & 0x02) !== 0;
    const index = readUInt32BE(privateBeaconData, 1);
    return { keyRefreshFlag, ivIndex: new IvIndex(index, updateActive) };
  }

  /**
   * Encrypts data using AES-CCM, appending MIC of `micSize` bytes.
   */
  static encrypt(
    data: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    micSize: number,
    aad?: Uint8Array,
  ): Uint8Array {
    return encryptAesCcm(key, nonce, data, aad, micSize);
  }

  /**
   * Decrypts AES-CCM cipher text and validates the MIC.
   *
   * @returns Decrypted plaintext, or `undefined` if MIC validation fails.
   */
  static decrypt(
    data: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    mic: Uint8Array,
    aad?: Uint8Array,
  ): Uint8Array | undefined {
    try {
      return decryptAesCcm(key, nonce, concatUint8Arrays([data, mic]), aad, mic.length);
    } catch {
      return undefined;
    }
  }

  // MARK: - Provisioning

  /**
   * Generates a P-256 Elliptic Curve key pair for use in provisioning.
   *
   * @returns The Private and Public Key as hex strings.
   */
  static generateKeyPair(_algorithm: Algorithm): {
    privateKey: string;
    publicKey: string;
  } {
    return generateElGamalKeyPair();
  }

  /**
   * Calculates the ECDH Shared Secret from the local private key and
   * the remote device's public key.
   *
   * @param privateKey Local private key.
   * @param publicKey  Remote device's public key (64 bytes, X || Y).
   * @returns The shared secret as a hex string.
   */
  static calculateSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): string {
    return utilsSharedSecret(uint8ArrayToHex(privateKey), uint8ArrayToHex(publicKey));
  }

  /**
   * Calculates the Provisioning Confirmation value.
   */
  static calculateConfirmation(
    confirmationInputs: Uint8Array,
    sharedSecret: Uint8Array,
    random: Uint8Array,
    authValue: Uint8Array,
    algorithm: Algorithm,
  ): Uint8Array {
    switch (algorithm) {
      case Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM: {
        // Confirmation Salt = s1(confirmationInputs)
        // Confirmation Key  = k1(sharedSecret, confirmationSalt, "prck")
        // Confirmation      = CMAC(random || authValue, confirmationKey)
        const confirmationSalt = s1(confirmationInputs);
        const confirmationKey = k1(
          sharedSecret,
          confirmationSalt,
          new TextEncoder().encode("prck"),
        );
        return cmac(concatUint8Arrays([random, authValue]), confirmationKey);
      }
      case Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM: {
        // Confirmation Salt = s2(confirmationInputs)
        // Confirmation Key  = k5(sharedSecret || authValue, confirmationSalt, "prck256")
        // Confirmation      = HMAC-SHA-256(random, confirmationKey)
        const confirmationSalt = s2(confirmationInputs);
        const confirmationKey = k5(
          concatUint8Arrays([sharedSecret, authValue]),
          confirmationSalt,
          new TextEncoder().encode("prck256"),
        );
        return utilsHmacSHA256(confirmationKey, random);
      }
    }
  }

  /**
   * Calculates the Session Key, Session Nonce and Device Key from provisioning
   * inputs.
   */
  static calculateKeys(
    confirmationInputs: Uint8Array,
    sharedSecret: Uint8Array,
    provisionerRandom: Uint8Array,
    deviceRandom: Uint8Array,
    algorithm: Algorithm,
  ): { sessionKey: Uint8Array; sessionNonce: Uint8Array; deviceKey: Uint8Array } {
    // Confirmation Salt
    const confirmationSalt =
      algorithm === Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM
        ? s1(confirmationInputs)
        : s2(confirmationInputs);

    // Provisioning Salt = s1(confirmationSalt || provisionerRandom || deviceRandom)
    const provisioningSalt = s1(
      concatUint8Arrays([confirmationSalt, provisionerRandom, deviceRandom]),
    );

    const enc = new TextEncoder();
    // Session Key   = k1(sharedSecret, provisioningSalt, "prsk")
    const sessionKey = k1(sharedSecret, provisioningSalt, enc.encode("prsk"));
    // Session Nonce = k1(sharedSecret, provisioningSalt, "prsn")[3..15]
    const sessionNonce = k1(sharedSecret, provisioningSalt, enc.encode("prsn")).slice(3);
    // Device Key    = k1(sharedSecret, provisioningSalt, "prdk")
    const deviceKey = k1(sharedSecret, provisioningSalt, enc.encode("prdk"));

    return { sessionKey, sessionNonce, deviceKey };
  }
}

// ---------------------------------------------------------------------------
// Private module-level helpers
// ---------------------------------------------------------------------------

/** AES-ECB block cipher (single 16-byte block or multiple). */
function ecb(data: Uint8Array, key: Uint8Array): Uint8Array {
  return new Uint8Array(encryptAesEcb(data, key));
}

/**
 * AES-CMAC (RFC 4493) – Cipher-based Message Authentication Code using
 * AES-128 as the block cipher.
 */
function cmac(data: Uint8Array, key: Uint8Array): Uint8Array {
  const BLOCK = 16;
  const Rb = new Uint8Array(BLOCK);
  Rb[BLOCK - 1] = 0x87;

  // Step 1 – generate subkeys K1, K2 from AES-ECB(0^128, key).
  const L = ecb(new Uint8Array(BLOCK), key);
  let K1 = shiftLeft1(L);
  if (L[0] & 0x80) K1 = xorUint8Arrays(K1, Rb);
  let K2 = shiftLeft1(K1);
  if (K1[0] & 0x80) K2 = xorUint8Arrays(K2, Rb);

  // Step 2 – process message blocks with CBC-MAC.
  const n = Math.max(1, Math.ceil(data.length / BLOCK));
  const lastBlockComplete = data.length > 0 && data.length % BLOCK === 0;

  let X: Uint8Array = new Uint8Array(BLOCK);
  for (let i = 0; i < n - 1; i++) {
    const block = data.slice(i * BLOCK, (i + 1) * BLOCK);
    X = ecb(xorUint8Arrays(X, block), key);
  }

  // Step 3 – last block (XOR with K1 if complete, pad and XOR with K2 otherwise).
  const lastStart = (n - 1) * BLOCK;
  let lastBlock: Uint8Array;
  if (lastBlockComplete) {
    lastBlock = xorUint8Arrays(data.slice(lastStart), K1);
  } else {
    const padded = new Uint8Array(BLOCK);
    padded.set(data.slice(lastStart));
    padded[data.length - lastStart] = 0x80;
    lastBlock = xorUint8Arrays(padded, K2);
  }

  return ecb(xorUint8Arrays(X, lastBlock), key);
}

/** Shift a byte array 1 bit to the left (MSB first). */
function shiftLeft1(input: Uint8Array): Uint8Array {
  const out = new Uint8Array(input.length);
  let carry = 0;
  for (let i = input.length - 1; i >= 0; i--) {
    out[i] = ((input[i] << 1) | carry) & 0xff;
    carry = (input[i] >> 7) & 0x01;
  }
  return out;
}

/** s1 salt function: CMAC with a 128-bit zero key. */
function s1(data: Uint8Array): Uint8Array {
  return cmac(data, new Uint8Array(16));
}

/** s2 salt function: HMAC-SHA-256 with a 256-bit zero key. */
function s2(data: Uint8Array): Uint8Array {
  return utilsHmacSHA256(new Uint8Array(32), data);
}

/**
 * k1 – network key material derivation using AES-CMAC.
 * k1(N, salt, P) = AES-CMAC(T)(P), where T = AES-CMAC(salt)(N)
 */
function k1(N: Uint8Array, salt: Uint8Array, P: Uint8Array): Uint8Array {
  const T = cmac(N, salt);
  return cmac(P, T);
}

/**
 * k2 – derives NID, Encryption Key and Privacy Key using AES-CMAC.
 */
function k2(
  N: Uint8Array,
  P: Uint8Array,
): { nid: UInt8; encryptionKey: Uint8Array; privacyKey: Uint8Array } {
  const smk2 = new Uint8Array([0x73, 0x6d, 0x6b, 0x32]); // "smk2"
  const T = cmac(N, s1(smk2));
  const T1 = cmac(concatUint8Arrays([P, new Uint8Array([0x01])]), T);
  const T2 = cmac(concatUint8Arrays([T1, P, new Uint8Array([0x02])]), T);
  const T3 = cmac(concatUint8Arrays([T2, P, new Uint8Array([0x03])]), T);
  return { nid: T1[15] & 0x7f, encryptionKey: T2, privacyKey: T3 };
}

/**
 * k3 – derives a 64-bit public value from a 128-bit private key using AES-CMAC.
 */
function k3(N: Uint8Array): Uint8Array {
  const smk3 = new Uint8Array([0x73, 0x6d, 0x6b, 0x33]); // "smk3"
  const T = cmac(N, s1(smk3));
  const id64 = new Uint8Array([0x69, 0x64, 0x36, 0x34, 0x01]); // "id64" || 0x01
  const result = cmac(id64, T);
  return result.slice(result.length - 8);
}

/**
 * k4 – derives a 6-bit public value from a 128-bit private key using AES-CMAC.
 */
function k4(N: Uint8Array): UInt8 {
  const smk4 = new Uint8Array([0x73, 0x6d, 0x6b, 0x34]); // "smk4"
  const T = cmac(N, s1(smk4));
  const id6 = new Uint8Array([0x69, 0x64, 0x36, 0x01]); // "id6" || 0x01
  return cmac(id6, T)[15] & 0x3f;
}

/**
 * k5 – provisioning material derivation using HMAC-SHA-256.
 * k5(N, salt, P) = HMAC-SHA-256(T)(P), where T = HMAC-SHA-256(salt)(N)
 */
function k5(N: Uint8Array, salt: Uint8Array, P: Uint8Array): Uint8Array {
  const T = utilsHmacSHA256(salt, N);
  return utilsHmacSHA256(T, P);
}
