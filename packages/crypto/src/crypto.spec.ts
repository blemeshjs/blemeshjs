import { describe, it, expect } from "vitest";
import { concatUint8Arrays, hexToUint8Array } from "uint8array-extras";
import { Algorithm, packUInt16BE, packUInt32BE, UUID } from "@mesh-link-js/utils";
import { Crypto } from "./crypto.js";

describe("Crypto", () => {
  const data = hexToUint8Array("00112233445566778899AABBCCDDEEFF");
  const key = hexToUint8Array("0123456789ABCDEF0123456789ABCDEF");
  const nonce = hexToUint8Array("00112233445566778899AABBCC");
  // UUID bytes used as AAD: 12345678-1234-1234-1234-12345678ABCD → 16 raw bytes
  const label = new UUID("12345678-1234-1234-1234-12345678ABCD");
  const labelBytes = hexToUint8Array(label.hex); // "1234567812341234123412345678ABCD"

  it("generates random bytes of the requested size", () => {
    expect(Crypto.generateRandom(128).length).toBe(16);
    expect(Crypto.generateRandom(256).length).toBe(32);
  });

  it("calculates virtual address from UUID label", () => {
    // Expected: 0xADD5
    expect(Crypto.calculateVirtualAddress(label).valueOf()).toBe(0xadd5);
  });

  it("encrypts and decrypts with MIC-4", () => {
    const expected = hexToUint8Array("6C7854C1E573CD62155BFA987C70673D273AB343");
    const result = Crypto.encrypt(data, key, nonce, 4);
    expect(result).toEqual(expected);

    const ciphertext = result.slice(0, data.length);
    const mic = result.slice(data.length);
    expect(Crypto.decrypt(ciphertext, key, nonce, mic)).toEqual(data);
  });

  it("encrypts and decrypts with MIC-8", () => {
    const expected = hexToUint8Array("6C7854C1E573CD62155BFA987C70673D5CFCB5AC7E3CEA62");
    const result = Crypto.encrypt(data, key, nonce, 8);
    expect(result).toEqual(expected);

    const ciphertext = result.slice(0, data.length);
    const mic = result.slice(data.length);
    expect(Crypto.decrypt(ciphertext, key, nonce, mic)).toEqual(data);
  });

  it("encrypts and decrypts with MIC-4 and additional data", () => {
    const expected = hexToUint8Array("6C7854C1E573CD62155BFA987C70673D19F0C64D");
    const result = Crypto.encrypt(data, key, nonce, 4, labelBytes);
    expect(result).toEqual(expected);

    const ciphertext = result.slice(0, data.length);
    const mic = result.slice(data.length);
    expect(Crypto.decrypt(ciphertext, key, nonce, mic, labelBytes)).toEqual(data);
  });

  it("encrypts and decrypts with MIC-8 and additional data", () => {
    const expected = hexToUint8Array("6C7854C1E573CD62155BFA987C70673D37D0CC6CAEF67CFC");
    const result = Crypto.encrypt(data, key, nonce, 8, labelBytes);
    expect(result).toEqual(expected);

    const ciphertext = result.slice(0, data.length);
    const mic = result.slice(data.length);
    expect(Crypto.decrypt(ciphertext, key, nonce, mic, labelBytes)).toEqual(data);
  });

  it("obfuscates and deobfuscates data", () => {
    const source = hexToUint8Array("050102030001");
    const random = hexToUint8Array("00112233445566");
    const ivIndex = 0x12345678;
    const expected = hexToUint8Array("9C0DAE8BC512");

    const obfuscated = Crypto.obfuscate(source, random, ivIndex, key);
    expect(obfuscated).toEqual(expected);

    // Obfuscation is its own inverse
    expect(Crypto.obfuscate(obfuscated, random, ivIndex, key)).toEqual(source);
  });

  it("calculates key derivatives from a network key", () => {
    const networkKey = hexToUint8Array("f7a2a44f8e8a8029064f173ddc1e2b00");
    const { nid, encryptionKey, privacyKey, identityKey, beaconKey, privateBeaconKey } =
      Crypto.calculateKeyDerivatives(networkKey);

    expect(nid).toBe(0x7f);
    expect(encryptionKey).toEqual(hexToUint8Array("9f589181a0f50de73c8070c7a6d27f46"));
    expect(privacyKey).toEqual(hexToUint8Array("4c715bd4a64b938f99b453351653124f"));
    expect(identityKey).toEqual(hexToUint8Array("877DE1A131C87A8C6767E655061963A7"));
    expect(beaconKey).toEqual(hexToUint8Array("CCAE3C53A3BB6FAB728EE94A390DC91F"));
    expect(privateBeaconKey).toEqual(hexToUint8Array("6be76842460b2d3a5850d4698409f1bb"));
  });

  it("calculates network ID (k3)", () => {
    const networkKey = hexToUint8Array("f7a2a44f8e8a8029064f173ddc1e2b00");
    expect(Crypto.calculateNetworkId(networkKey)).toEqual(hexToUint8Array("ff046958233db014"));
  });

  it("calculates application key identifier – AID (k4)", () => {
    const appKey = hexToUint8Array("3216d1509884b533248541792b877f98");
    expect(Crypto.calculateAid(appKey)).toBe(0x38);
  });

  describe("Private Beacon", () => {
    // §8.4.6.1 – IV update in progress
    it("decodes and authenticates a beacon with IV update in progress", () => {
      const pdu = hexToUint8Array("02435f18f85cf78a3121f58478a561e488e7cbf3174f022a514741");
      const beaconKey = hexToUint8Array("6be76842460b2d3a5850d4698409f1bb");
      const result = Crypto.decodeAndAuthenticate(pdu, beaconKey);

      expect(result).toBeDefined();
      expect(result!.keyRefreshFlag).toBe(false);
      expect(result!.ivIndex.updateActive).toBe(true);
      expect(result!.ivIndex.index).toBe(0x1010abcd);
    });

    // §8.4.6.2 – IV update complete
    it("decodes and authenticates a beacon with IV update complete", () => {
      const pdu = hexToUint8Array("021b998f82927535ea6f3076f422ce827408ab2f0ffb94cf97f881");
      const beaconKey = hexToUint8Array("ca478cdac626b7a8522d7272dd124f26");
      const result = Crypto.decodeAndAuthenticate(pdu, beaconKey);

      expect(result).toBeDefined();
      expect(result!.keyRefreshFlag).toBe(false);
      expect(result!.ivIndex.updateActive).toBe(false);
      expect(result!.ivIndex.index).toBe(0x00000000);
    });

    it("returns undefined for a beacon with a tampered authentication tag", () => {
      const pdu = hexToUint8Array("021b998f82927535ea6f3076f422ce827408ab0123456789ABCDEF");
      const beaconKey = hexToUint8Array("ca478cdac626b7a8522d7272dd124f26");

      expect(Crypto.decodeAndAuthenticate(pdu, beaconKey)).toBeUndefined();
    });
  });

  describe("Provisioning (§8.17.1 / §8.17.2)", () => {
    // Shared test vectors
    const provisionerPublicKey = hexToUint8Array(
      "2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f",
    );
    const provisioneePublicKey = hexToUint8Array(
      "f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279",
    );
    const provisioneePrivateKey = hexToUint8Array(
      "529aa0670d72cd6497502ed473502b037e8803b5c60829a5a3caa219505530ba",
    );
    const expectedSharedSecretHex =
      "ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69";

    it("calculates ECDH shared secret", () => {
      const secret = Crypto.calculateSharedSecret(provisioneePrivateKey, provisionerPublicKey);
      expect(secret).toBe(expectedSharedSecretHex);
    });

    // §8.17.1 – BTM_ECDH_P256_CMAC_AES128_AES_CCM
    it("calculates confirmation values using BTM_ECDH_P256_CMAC_AES128_AES_CCM", () => {
      const confirmationInputs = concatUint8Arrays([
        hexToUint8Array("00"), // Invite PDU
        hexToUint8Array("0100010000000000000000"), // Capabilities PDU
        hexToUint8Array("0000000000"), // Start PDU
        provisionerPublicKey,
        provisioneePublicKey,
      ]);
      const authValue = hexToUint8Array("00000000000000000000000000000000");
      const sharedSecret = hexToUint8Array(expectedSharedSecretHex);

      const confirmProvisioner = Crypto.calculateConfirmation(
        confirmationInputs,
        sharedSecret,
        hexToUint8Array("8b19ac31d58b124c946209b5db1021b9"),
        authValue,
        Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM,
      );
      expect(confirmProvisioner).toEqual(hexToUint8Array("b38a114dfdca1fe153bd2c1e0dc46ac2"));

      const confirmDevice = Crypto.calculateConfirmation(
        confirmationInputs,
        sharedSecret,
        hexToUint8Array("55a2a2bca04cd32ff6f346bd0a0c1a3a"),
        authValue,
        Algorithm.BTM_ECDH_P256_CMAC_AES128_AES_CCM,
      );
      expect(confirmDevice).toEqual(hexToUint8Array("eeba521c196b52cc2e37aa40329f554e"));
    });

    // §8.17.2 – BTM_ECDH_P256_HMAC_SHA256_AES_CCM
    it("calculates confirmation values using BTM_ECDH_P256_HMAC_SHA256_AES_CCM", () => {
      const confirmationInputs = concatUint8Arrays([
        hexToUint8Array("00"), // Invite PDU
        hexToUint8Array("0100030001000000000000"), // Capabilities PDU
        hexToUint8Array("0100010000"), // Start PDU
        provisionerPublicKey,
        provisioneePublicKey,
      ]);
      const authValue = hexToUint8Array(
        "906d73a3c7a7cb3ff730dca68a46b9c18d673f50e078202311473ebbe253669f",
      );
      const sharedSecret = hexToUint8Array(expectedSharedSecretHex);

      const confirmProvisioner = Crypto.calculateConfirmation(
        confirmationInputs,
        sharedSecret,
        hexToUint8Array("36f968b94a13000e64b223576390db6bcc6d62f02617c369ee3f5b3e89df7e1f"),
        authValue,
        Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM,
      );
      expect(confirmProvisioner).toEqual(
        hexToUint8Array("c99b54617ae646f5f32cf7e1ea6fcc49fd69066078eba9580fa6c7031833e6c8"),
      );

      const confirmDevice = Crypto.calculateConfirmation(
        confirmationInputs,
        sharedSecret,
        hexToUint8Array("5b9b1fc6a64b2de8bece53187ee989c6566db1fc7dc8580a73dafdd6211d56a5"),
        authValue,
        Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM,
      );
      expect(confirmDevice).toEqual(
        hexToUint8Array("56e3722d291373d38c995d6f942c02928c96abb015c233557d7974b6e2df662b"),
      );
    });

    // §8.17.2 – session key / nonce / device key derivation
    it("derives session key, session nonce, and device key", () => {
      const confirmationInputs = concatUint8Arrays([
        hexToUint8Array("00"),
        hexToUint8Array("0100030001000000000000"),
        hexToUint8Array("0100010000"),
        provisionerPublicKey,
        provisioneePublicKey,
      ]);
      const sharedSecret = hexToUint8Array(expectedSharedSecretHex);

      const keys = Crypto.calculateKeys(
        confirmationInputs,
        sharedSecret,
        hexToUint8Array("36f968b94a13000e64b223576390db6bcc6d62f02617c369ee3f5b3e89df7e1f"),
        hexToUint8Array("5b9b1fc6a64b2de8bece53187ee989c6566db1fc7dc8580a73dafdd6211d56a5"),
        Algorithm.BTM_ECDH_P256_HMAC_SHA256_AES_CCM,
      );

      expect(keys.deviceKey).toEqual(hexToUint8Array("2770852a737cf05d8813768f22af3a2d"));
      expect(keys.sessionKey).toEqual(hexToUint8Array("df4a494da3d45405e402f1d6a6cea338"));
      expect(keys.sessionNonce).toEqual(hexToUint8Array("11b987db2ae41fbb9e96b80446"));
    });

    // §8.17.2 – provisioning data encryption
    it("encrypts provisioning data with MIC-8", () => {
      const sessionKey = hexToUint8Array("df4a494da3d45405e402f1d6a6cea338");
      const sessionNonce = hexToUint8Array("11b987db2ae41fbb9e96b80446");

      // data = networkKey || keyIndex (BE) || flags || ivIndex (BE) || unicastAddress (BE)
      const provisioningData = concatUint8Arrays([
        hexToUint8Array("efb2255e6422d330088e09bb015ed707"), // network key
        packUInt16BE(0x0567), // key index
        new Uint8Array([0x00]), // flags
        packUInt32BE(0x01020304), // IV index
        packUInt16BE(0x0b0c), // unicast address
      ]);

      const encrypted = Crypto.encrypt(provisioningData, sessionKey, sessionNonce, 8);
      expect(encrypted).toEqual(
        concatUint8Arrays([
          hexToUint8Array("f9df98cbb736be1f600659ac4c37821a82db31e410a03de769"), // ciphertext
          hexToUint8Array("3a2a0428fbdaf321"), // MIC
        ]),
      );
    });
  });
});
