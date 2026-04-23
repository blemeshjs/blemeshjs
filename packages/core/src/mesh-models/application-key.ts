import { KeyIndex, Data, MeshNetworkError, UInt8, Key, MeshCDB } from "@mesh-link-js/utils";
import { MeshNetwork } from "./mesh-network.js";
import { NetworkKey } from "./network-key.js";
import { Crypto } from "@mesh-link-js/crypto";
import { areUint8ArraysEqual, hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { Model } from "./model.js";
import { alias, createModelSchema, custom, SKIP } from "serializr";
import { Nodes } from "../mesh-models-array/nodes.js";

/**
 * Application Keys are used to encrypt mesh messages on Access Layer.
 *
 * The Application Key is 128-bit long and is bound to a single Network Key.
 * To use the Application Key, the bound Network Key must be used to encrypt
 * the message on Network Layer.
 *
 * Each key is identified by a `KeyIndex`. There can be up to 4095
 * Application Keys in a mesh network.
 *
 * AID (Application Key identifier) is derived from the Application Key.
 *
 * The key can be change using Key Refresh Procedure (KRP).
 */
export class ApplicationKey extends Key {
  public meshNetwork?: MeshNetwork;

  public get boundNetworkKeyIndex(): KeyIndex {
    return this.$boundNetworkKeyIndex;
  }
  private set boundNetworkKeyIndex(boundNetworkKeyIndex: KeyIndex) {
    // @ts-expect-error we setting in a setter;
    this.$boundNetworkKeyIndex = boundNetworkKeyIndex;
    this.meshNetwork?.updateTimestamp();
  }

  /**
   * The Network Key bound to this Application Key.
   */
  public get boundNetworkKey(): NetworkKey {
    return this.meshNetwork!.networkKeys.find((key) => key.index.equal(this.boundNetworkKeyIndex))!;
  }

  protected $key!: Data;
  public get key(): Data {
    return super.key;
  }
  public set key(key: Data) {
    this.oldKey = key;
    this.oldAid = this.aid;
    this.$key = key;
    this.regenerateKeyDerivatives();
  }

  private $oldKey?: Data;
  public get oldKey(): Data | undefined {
    return this.$oldKey;
  }
  public set oldKey(oldKey: Data | undefined) {
    this.$oldKey = oldKey;
    if (typeof this.oldKey === "undefined") this.oldAid = undefined;
  }

  public aid!: UInt8;
  public oldAid?: UInt8;

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.AppKey.parse(jv);

    const key = hexToUint8Array(parsed.key);
    const oldKey = parsed.oldKey ? hexToUint8Array(parsed.oldKey) : undefined;
    const applicationKey = new ApplicationKey(
      parsed.name,
      new KeyIndex(parsed.index),
      key,
      new KeyIndex(parsed.boundNetKey),
    );
    applicationKey.$oldKey = oldKey;
    applicationKey.regenerateKeyDerivatives();
    return applicationKey;
  }

  public constructor(
    protected $name: string,
    protected $index: KeyIndex,
    key: Data,
    private readonly $boundNetworkKeyIndex: KeyIndex,
  ) {
    super();
    this.$key = key;
  }

  public static withProperties(
    name: string,
    index: KeyIndex,
    key: Data,
    networkKey: NetworkKey,
  ): ApplicationKey | MeshNetworkError {
    if (key.length !== 16) {
      return MeshNetworkError.invalidKey;
    }
    if (!index.isValidKeyIndex) {
      return MeshNetworkError.keyIndexOutOfRange;
    }
    return new ApplicationKey(name, index, key, networkKey.index);
  }
  private regenerateKeyDerivatives() {
    this.aid = Crypto.calculateAid(this.key);

    // When the Application Key is imported from JSON, old key derivatives must
    // be calculated.
    if (typeof this.oldKey !== "undefined" && typeof this.oldAid === "undefined") {
      this.oldAid = Crypto.calculateAid(this.oldKey);
    }
  }
  /**
   * Bounds the Application Key to the given Network Key.
   * The Application Key must not be in use. If any of the network Nodes
   * already knows this key, this method throws an error.
   *
   * @param networkKey The Network Key to bound the Application Key to.
   * @returns `MeshNetworkError.keyInUse` if the key is already in use, `undefined` otherwise.
   */
  public bindToNetworkKey(networkKey: NetworkKey) {
    if (!this.meshNetwork) return;
    if (this.isUsedIn(this.meshNetwork)) {
      return MeshNetworkError.keyInUse;
    }
    this.boundNetworkKeyIndex = networkKey.index;
  }

  public equals(other: ApplicationKey): boolean {
    return this.index.equal(other.index) &&
      areUint8ArraysEqual(this.key, other.key) &&
      areUint8ArraysEqual(this.oldKey ?? new Uint8Array(), other.oldKey ?? new Uint8Array()) &&
      this.name == other.name &&
      typeof this.boundNetworkKeyIndex === "undefined"
      ? typeof other.boundNetworkKeyIndex === "undefined"
      : this.boundNetworkKeyIndex.equal(other.boundNetworkKeyIndex ?? 0);
  }

  /**
   * Returns whether the Application Key is bound to the given
   * Network Key. The Key comparison bases on Key Index property.
   *
   * @param networkKey The Network Key to check.
   * @returns `True`, if the Application Key is bound to the given Network Key.
   */
  public isBoundToNetworkKey(networkKey: NetworkKey): boolean {
    return this.boundNetworkKeyIndex.equal(networkKey.index);
  }

  /**
   * Returns whether the Application Key is bound to the given Model.
   *
   * @param model The Model to check.
   * @returns `True`, if the Application Key is bound to the Model.
   */
  public isBoundToModel(model: Model): boolean {
    return model.bind.some((index) => index.equal(this.index));
  }

  /**
   * Return whether the Application Key is used in the given mesh network.
   *
   * A Application Key must be added to Application Keys array of the network
   * and be known to at least one node to be used by it.
   *
   * An used Application Key may not be removed from the network.
   *
   * @param meshNetwork The mesh network to look the key in.
   * @returns `True` if the key is used in the given network, `false` otherwise.
   */
  public isUsedIn(meshNetwork: MeshNetwork): boolean {
    const localProvisioner = meshNetwork.localProvisioner;
    return (
      meshNetwork.applicationKeys.some((key) => key.equals(this)) &&
      // Application Key known by at least one node.
      Nodes.knowsApplicationKey(
        meshNetwork.nodes.filter(
          (node) => localProvisioner && !node.uuid.equal(localProvisioner.uuid),
        ),
        this,
      )
    );
  }

  toString() {
    return `${this.name} (index: ${this.index.toString(16)})`;
  }
}

createModelSchema(ApplicationKey, {
  boundNetworkKeyIndex: alias(
    "boundNetKey",
    custom(
      (v: KeyIndex) => v.valueOf(),
      (v: number) => v,
    ),
  ),
  oldKey: custom(
    (v: Data | undefined) => (typeof v === "undefined" ? SKIP : uint8ArrayToHex(v)),
    (v: string) => v,
  ),
});
