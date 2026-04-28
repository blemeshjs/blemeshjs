import {
  Address,
  Algorithm,
  Data,
  generateElGamalKeyPair,
  IvIndex,
  KeyRefreshPhase,
  OptionSet,
  packUInt32BE,
  UInt8,
} from "@blemeshjs/utils";
import { areUint8ArraysEqual, concatUint8Arrays, hexToUint8Array } from "uint8array-extras";
import { ProvisioningError } from "./provisioning-state.js";
import { Crypto } from "@blemeshjs/crypto";
import { NetworkKey } from "../mesh-models/network-key.js";
import { Security } from "../mesh-models/security.js";
import { MeshNetwork } from "../mesh-models/mesh-network.js";

class Flags extends OptionSet<UInt8> {
  public static useNewKeys = new Flags(1 << 0);
  public static ivUpdateActive = new Flags(1 << 1);

  constructor(rawValue: UInt8) {
    super(rawValue);
  }

  public static fromIvIndexAndNetworkKey(ivIndex: IvIndex, networkKey: NetworkKey) {
    let value: UInt8 = 0;
    if (KeyRefreshPhase.usingNewKeys === networkKey.phase) {
      value |= 1 << 0;
    }
    if (ivIndex.updateActive) {
      value |= 1 << 1;
    }
    return new Flags(value);
  }
}

export class ProvisioningData {
  private $networkKey!: NetworkKey;
  public get networkKey(): NetworkKey {
    return this.$networkKey;
  }
  private $ivIndex!: IvIndex;
  public get ivIndex(): IvIndex {
    return this.$ivIndex;
  }
  private $unicastAddress!: Address;
  public get unicastAddress(): Address {
    return this.$unicastAddress;
  }

  /**
   * Returns the Node's security level based on the provisioning method.
   */
  public get security(): Security {
    return this.oobPublicKey ? Security.secure : Security.insecure;
  }

  private privateKey!: Data;
  private publicKey!: Data;
  private sharedSecret!: Data;
  private authValue!: Data;
  private deviceConfirmation!: Data;
  private deviceRandom!: Data;
  private oobPublicKey!: boolean;

  private $deviceKey!: Data;
  public get deviceKey(): Data {
    return this.$deviceKey;
  }

  private $provisionerPublicKey!: Data;
  public get provisionerPublicKey(): Data {
    return this.$provisionerPublicKey;
  }
  private $algorithm!: Algorithm;
  public get algorithm(): Algorithm {
    return this.$algorithm;
  }
  private $provisionerRandom!: Data;
  public get provisionerRandom(): Data {
    return this.$provisionerRandom;
  }

  /**
   * Returns the encrypted Provisioning Data together with MIC.
   *
   * Data will be encrypted using Session Key and Session Nonce.
   * For that, all properties should be set when this method is called.
   * Returned value is 25 + 8 bytes long, where the MIC is the last 8 bytes.
   */
  public get encryptedProvisioningDataWithMic(): Data {
    const keys = Crypto.calculateKeys(
      this.confirmationInputs,
      this.sharedSecret,
      this.provisionerRandom,
      this.deviceRandom,
      this.algorithm,
    );
    this.$deviceKey = keys.deviceKey;

    const flags = Flags.fromIvIndexAndNetworkKey(this.ivIndex, this.networkKey);
    const key =
      this.networkKey.phase == KeyRefreshPhase.keyDistribution
        ? this.networkKey.oldKey!
        : this.networkKey.key;
    const data = concatUint8Arrays([
      key,
      this.networkKey.index.bytesBE,
      new Uint8Array([flags.rawValue]),
      packUInt32BE(this.ivIndex.index),
      this.unicastAddress.bytesBE,
    ]);
    return Crypto.encrypt(data, keys.sessionKey, keys.sessionNonce, 8);
  }

  /**
   * Returns the Provisioner Confirmation value.
   *
   * The Auth Value must be set prior to calling this method.
   */
  public get provisionerConfirmation(): Data {
    return Crypto.calculateConfirmation(
      this.confirmationInputs,
      this.sharedSecret,
      this.provisionerRandom,
      this.authValue,
      this.algorithm,
    );
  }

  /**
   * The Confirmation Inputs is built over the provisioning process.
   *
   * It is composed of (in that order):
   * - Provisioning Invite PDU,
   * - Provisioning Capabilities PDU,
   * - Provisioning Start PDU,
   * - Provisioner's Public Key,
   * - Provisionee's Public Key.
   */
  private confirmationInputs: Data = new Uint8Array(); // TODO: maybe find something like Data(capacity: )

  /**
   * method adds the given PDU to the Provisioning Inputs.
   * Provisioning Inputs are used for authenticating the Provisioner
   * and the Unprovisioned Device.
   *
   * This method must be called (in order) for:
   * * Provisioning Invite,
   * * Provisioning Capabilities,
   * * Provisioning Start,
   * * Provisioner's Public Key,
   * * Provisionee's Public Key.
   */
  public accumulate(pdu: Data) {
    this.confirmationInputs = concatUint8Arrays([this.confirmationInputs, pdu]);
  }

  /**
   * Call this method when the Provisionee's Public Key has been
   * obtained.
   *
   * This must be called after generating keys.
   *
   * @param key The Provisionee's Public Key.
   * @param oob A flag indicating whether the Public Key was obtained Out-Of-Band.
   * @return This method returns when generating ECDH Secure Secret failed.
   */
  public provisionerDidObtain(key: Data, oob: boolean): ProvisioningError | undefined {
    if (this.privateKey === undefined) return ProvisioningError.invalidState;

    try {
      this.sharedSecret = hexToUint8Array(Crypto.calculateSharedSecret(this.privateKey, key));
      this.oobPublicKey = oob;
    } catch (_error) {
      return ProvisioningError.invalidPublicKey;
    }
  }
  /**
   * This method validates the received Provisioning Confirmation and
   * matches it with one calculated locally based on the Provisioning
   * Random received from the device and Auth Value.
   *
   * @returns The method returns when the validation failed, or it was called before all data were ready.
   */
  public validateConfirmation() {
    if (!this.deviceRandom || !this.authValue || !this.sharedSecret)
      return ProvisioningError.invalidState;
    const confirmation = Crypto.calculateConfirmation(
      this.confirmationInputs,
      this.sharedSecret,
      this.deviceRandom,
      this.authValue,
      this.algorithm,
    );
    if (!areUint8ArraysEqual(this.deviceConfirmation, confirmation))
      return ProvisioningError.confirmationFailed;
  }

  /**
   * Call this method when the device Provisioning Random has been obtained.
   */
  public provisionerDidObtainDeviceRandom(data: Data) {
    this.deviceRandom = data;
  }

  /**
   * Call this method when the device Provisioning Confirmation has been obtained.
   */
  public provisionerDidObtainDeviceConfirmation(data: Data) {
    this.deviceConfirmation = data;
  }

  /**
   * Call this method when the Auth Value has been obtained.
   */
  public provisionerDidObtainAuthValue(data: Data) {
    this.authValue = data;
  }

  public generateKeys(algorithm: Algorithm) {
    // Generate Private and Public Keys.
    // TODO: use algorithm
    const { privateKey, publicKey } = generateElGamalKeyPair();
    this.privateKey = hexToUint8Array(privateKey);
    this.publicKey = hexToUint8Array(publicKey);
    this.$provisionerPublicKey = hexToUint8Array(publicKey);

    this.$algorithm = algorithm;

    // Generate Provisioner Random.
    this.$provisionerRandom = Crypto.generateRandom(Algorithm.length(algorithm));
  }

  public prepare(network: MeshNetwork, networkKey: NetworkKey, unicastAddress: Address) {
    this.$networkKey = networkKey;
    this.$ivIndex = network.ivIndex;
    this.$unicastAddress = unicastAddress;
  }
}
