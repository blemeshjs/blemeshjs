import {
  KeyIndex,
  Data,
  KeyRefreshPhase,
  UInt8,
  MeshNetworkError,
  meshTimestamp,
  assertDirectInstanceOf,
  Key,
  MeshCDB,
} from "@mesh-link-js/utils";
import { Crypto } from "@mesh-link-js/crypto";
import { Security } from "./security.js";
import { areUint8ArraysEqual, hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { createModelSchema, custom, primitive, SKIP } from "serializr";
import { MeshNetwork } from "./mesh-network.js";
import { Nodes } from "../mesh-models-array/nodes.js";
import { ApplicationKeys } from "../mesh-models-array/index.js";

export class NetworkKeyDerivatives {
  /** The Identity Key. */
  identityKey: Data;
  /** The Beacon Key. */
  beaconKey: Data;
  /** The Private Beacon Key. */
  privateBeaconKey: Data;
  /** The Encryption Key. */
  encryptionKey: Data;
  /** The Privacy Key. */
  privacyKey: Data;
  /** Network identifier. */
  nid: UInt8;

  constructor(key: Data) {
    const { nid, encryptionKey, privacyKey, identityKey, beaconKey, privateBeaconKey } =
      Crypto.calculateKeyDerivatives(key);
    this.identityKey = identityKey;
    this.beaconKey = beaconKey;
    this.privateBeaconKey = privateBeaconKey;
    this.encryptionKey = encryptionKey;
    this.nid = nid;
    this.privacyKey = privacyKey;
  }
}

export class NetworkKey extends Key {
  protected $name: string;

  protected $index!: KeyIndex;
  public get index(): KeyIndex {
    return super.index;
  }
  public set index(newValue: KeyIndex) {
    this.$index = newValue;
  }

  /**
   * The timestamp represents the last time the phase property has been
   * updated.
   */
  private $timestamp!: number;
  public get timestamp(): number {
    return this.$timestamp;
  }
  protected set timestamp(newValue: number) {
    this.$timestamp = newValue;
  }

  /**
   * Key Refresh Phase
   */
  private $phase: KeyRefreshPhase = KeyRefreshPhase.normalOperation;
  public get phase(): KeyRefreshPhase {
    return this.$phase;
  }
  public set phase(newValue: KeyRefreshPhase) {
    this.$phase = newValue;
    this.timestamp = Date.now();
  }

  protected $key: Data;
  public get key(): Data {
    return super.key;
  }
  public set key(newValue: Data) {
    this.oldKey = this.key;
    this.oldNetworkId = this.networkId;
    this.$oldKeys = this.$keys;
    this.$key = newValue;
    this.$phase = KeyRefreshPhase.keyDistribution;
    this.regenerateKeyDerivatives();
  }

  private $oldKey: Data | undefined;
  /**
   * The old Network Key is present when the phase property has a different
   * value than `KeyRefreshPhase.normalOperation`, such as when a Key Refresh
   * procedure is in progress.
   */
  public get oldKey(): Data | undefined {
    return this.$oldKey;
  }
  public set oldKey(newValue: Data | undefined) {
    this.$oldKey = newValue;
    if (newValue === undefined) {
      this.oldNetworkId = undefined;
      this.$oldKeys = undefined;
      this.phase = KeyRefreshPhase.normalOperation;
    }
  }
  private $oldNetworkId: Data | undefined;
  /**
   * The Network ID derived from the old Network Key. This identifier
   * is public information. It is set when `NetworkKey.oldKey` is set.
   */
  public get oldNetworkId(): Data | undefined {
    return this.$oldNetworkId;
  }
  private set oldNetworkId(newValue: Data | undefined) {
    this.$oldNetworkId = newValue;
  }

  /** Network Key Derivatives */
  private $keys!: NetworkKeyDerivatives;
  public get keys(): NetworkKeyDerivatives {
    return this.$keys;
  }
  /** Network Key Derivatives */
  private $oldKeys?: NetworkKeyDerivatives;
  public get oldKeys(): NetworkKeyDerivatives | undefined {
    return this.$oldKeys;
  }
  /**
   * Returns the key set that should be used for encrypting outgoing packets.
   */
  public get transmitKeys(): NetworkKeyDerivatives {
    if (this.phase === KeyRefreshPhase.keyDistribution && typeof this.oldKeys !== "undefined") {
      return this.oldKeys;
    }
    return this.keys;
  }
  private $networkId!: Data;
  /**
   * The Network ID derived from this Network Key. This identifier
   * is public information.
   */
  public get networkId(): Data {
    return this.$networkId;
  }
  private set networkId(newValue: Data) {
    this.$networkId = newValue;
  }

  private $minSecurity!: Security;
  /**
   * Minimum security level for a subnet associated with this Network Key.
   *
   * If all Nodes on the subnet associated with this network key have been
   * provisioned using the Secure Provisioning procedure, then
   * the value of this property for the subnet is set to `Security.secure`;
   * otherwise the value is set to `Security.insecure` and the subnet
   * is considered less secure.
   */
  public get minSecurity(): Security {
    return this.$minSecurity;
  }
  private set minSecurity(newValue: Security) {
    this.$minSecurity = newValue;
  }

  /**
   * Returns whether the Network Key is the Primary Network Key.
   * The Primary key is the one which Key Index is equal to 0.
   *
   * A Primary Network Key may not be removed from the mesh network,
   * but can be removed from any Node using Config Net Key Delete
   * messages encrypted using an Application Key bound to a different
   * Network Key.
   */
  public get isPrimary(): boolean {
    return this.index.valueOf() === 0;
  }

  /**
   * Returns whether the Network Key is a secondary Network Key,
   * that is the Key Index is NOT equal to 0.
   */
  public get isSecondary(): boolean {
    return !this.isPrimary;
  }

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.NetKey.parse(jv);

    const key = new NetworkKey("", new KeyIndex(0), new Uint8Array());
    key.name = parsed.name;
    key.index = new KeyIndex(parsed.index);
    key.$key = hexToUint8Array(parsed.key);
    key.networkId = Crypto.calculateNetworkId(key.key);
    key.$oldKey = parsed.oldKey ? hexToUint8Array(parsed.oldKey) : undefined;
    key.$phase = parsed.phase;
    const minSecurity = Security.fromString(parsed.minSecurity);
    assertDirectInstanceOf(minSecurity, Security);
    key.minSecurity = minSecurity;
    if (parsed.timestamp) {
      key.timestamp = new Date(parsed.timestamp).getTime();
    }

    key.regenerateKeyDerivatives();
    return key;
  }

  public constructor(name: string, index: KeyIndex, key: Data) {
    super();
    this.$name = name;
    this.index = index;
    this.$key = key;
    // Initially, a Network Key is considered secure, as there are no Nodes
    // that know it other than the Provisioner's one.
    this.minSecurity = Security.secure;
    this.timestamp = Date.now();

    this.regenerateKeyDerivatives();
  }

  public static fromName(name: string, index: KeyIndex, key: Data): NetworkKey | MeshNetworkError {
    if (key.length !== 16) {
      return MeshNetworkError.invalidKey;
    }
    if (!index.isValidKeyIndex) {
      return MeshNetworkError.keyIndexOutOfRange;
    }
    return new NetworkKey(name, index, key);
  }

  /**
   * Creates the primary Network Key for a mesh network.
   */
  public static primaryNetworkKey(): NetworkKey {
    return new NetworkKey("Primary Network Key", new KeyIndex(0), Crypto.generateRandom(128));
  }

  private regenerateKeyDerivatives(): void {
    // Calculate Network ID.
    this.networkId = Crypto.calculateNetworkId(this.key);
    // Calculate other keys.
    this.$keys = new NetworkKeyDerivatives(this.key);

    // When the Network Key is imported from JSON, old key derivatives must
    // be calculated as well.
    if (typeof this.oldKey !== "undefined" && typeof this.oldNetworkId === "undefined") {
      // Calculate Network ID.
      this.oldNetworkId = Crypto.calculateNetworkId(this.oldKey);
      // Calculate other keys.
      this.$oldKeys = new NetworkKeyDerivatives(this.oldKey);
    }
  }

  public equals(other: NetworkKey): boolean {
    return (
      this.index.valueOf() === other.index.valueOf() &&
      this.phase === other.phase &&
      areUint8ArraysEqual(this.key, other.key) &&
      areUint8ArraysEqual(this.oldKey ?? new Uint8Array(), other.oldKey ?? new Uint8Array()) &&
      this.name === other.name
    );
  }

  /**
   * This method lowers the minimum security level of the Network Key to
   * `Security.insecure`.
   *
   * @see `Security`
   * @see `NetworkKey.minSecurity`
   */
  public lowerSecurity() {
    this.minSecurity = Security.insecure;
  }

  /**
   * Return whether the Network Key is used in the given mesh network.
   *
   * A `true` is returned when the Network Key is added to Network Keys
   * array of the network and is known to at least one node, or bound
   * to an existing Application Key.
   *
   * A used Network Key may not be removed from the network.
   *
   * @param meshNetwork The mesh network to look the key in.
   * @returns `True` if the key is used in the given network, `false` otherwise.
   */
  public isUsedInMeshNetwork(meshNetwork: MeshNetwork): boolean {
    const localProvisioner = meshNetwork.localProvisioner;
    return (
      meshNetwork.networkKeys.some((key) => key.equals(this)) &&
      // Network Key known by at least one node (except the local Provisioner).
      (Nodes.knowsNetworkKey(
        localProvisioner?.uuid
          ? meshNetwork.nodes.filter((node) => !node.uuid.equal(localProvisioner.uuid))
          : meshNetwork.nodes,
        this,
      ) ||
        // Network Key bound to an Application Key.
        ApplicationKeys.containsKeyBoundTo(meshNetwork.applicationKeys, this))
    );
  }

  public toString(): string {
    if (this.phase !== KeyRefreshPhase.normalOperation) {
      return `${this.name} (index: ${this.index}, phase: ${this.phase})`;
    }
    return `${this.name} (index: ${this.index})`;
  }
}

createModelSchema(NetworkKey, {
  timestamp: custom(
    (v: number) => meshTimestamp(v),
    (v: string) => v,
  ),
  phase: primitive(),
  oldKey: custom(
    (v?: Data) => (typeof v === "undefined" ? SKIP : uint8ArrayToHex(v)),
    (v: string) => v,
  ),
  minSecurity: custom(
    (v: Security) => v.value,
    (v: string) => v,
  ),
});
