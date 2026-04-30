import {
  HeartbeatSubscription,
  Address,
  assertDirectInstanceOf,
  assertString,
  Data,
  DecodingError,
  KeyIndex,
  KeyRefreshPhase,
  TimeInterval,
  toPaddedHex16,
  toPaddedHex8,
  UInt16,
  UInt8,
  UUID,
  Location,
  MeshCDB,
} from "@blemeshjs/utils";
import { AddressRange } from "./address-range.js";
import { Element } from "./element.js";
import { MeshNetwork } from "./mesh-network.js";
import { Crypto } from "@blemeshjs/crypto";
import { Security } from "./security.js";
import { Provisioner } from "./provisioner.js";
import { NodeFeaturesState, NodeFeatureState } from "./node-features.js";
import { NetworkKey } from "./network-key.js";
import { ApplicationKey } from "./application-key.js";
import { ConfigNetworkTransmitSet } from "../mesh-messages/base/configuration/config-network-transmit-set.js";
import { ConfigNetworkTransmitStatus } from "../mesh-messages/base/configuration/config-network-transmit-status.js";
import {
  alias,
  Clazz,
  createModelSchema,
  custom,
  list,
  object,
  optional,
  primitive,
  SKIP,
} from "serializr";
import { hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { UnprovisionedDevice } from "../provisioning/index.js";
import { action, computed, makeObservable, observable } from "mobx";
import { ApplicationKeys } from "../mesh-models-array/index.js";
import { NetworkKeys } from "../mesh-models-array/index.js";
import { ConfigCompositionDataStatus, Page0 } from "../mesh-messages/index.js";
import { Model } from "./model.js";
import { produce } from "immer";

export class NodeKey {
  /**
   * The Key index for this network key.
   */
  public get index(): KeyIndex {
    return this.$index;
  }
  /**
   * This flag contains value set to `false`, unless a Key Refresh
   * procedure is in progress and the network has been successfully
   * updated.
   */
  public get updated(): boolean {
    return this.$updated;
  }

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.NodeKey.parse(jv);
    return new NodeKey(new KeyIndex(parsed.index), parsed.updated);
  }

  constructor(
    private $index: KeyIndex,
    private $updated: boolean,
  ) {}
}

/**
 * The object represents parameters of the transmissions of network
 * layer messages originating from a mesh node.
 */
export class NetworkTransmit {
  /**
   * Number of 10-millisecond steps between transmissions.
   */
  public get steps(): UInt8 {
    return Math.min(Math.max(this.interval / 10 - 1, 0), 0xff);
  }
  /**
   * The interval in as `TimeInterval` in seconds.
   */
  public get timeInterval(): TimeInterval {
    return this.interval / 1000.0;
  }
  /**
   * Number of transmissions for network messages.
   * The value is in range from 1 to 8.
   */
  public count: UInt8;
  /**
   * The interval (in milliseconds) between retransmissions
   * (from 10 to 320 ms in 10 ms steps).
   */
  public interval: UInt16;

  public static decode(jv: Record<string, unknown>) {
    assertString(jv.count);
    const parsed = MeshCDB.NetworkRetransmit.parse(jv);
    return new NetworkTransmit(parsed.count, parsed.interval);
  }

  public constructor(count: UInt8, interval: UInt16) {
    this.count = count;
    this.interval = interval;
  }

  public static fromFixingIncorrectNetworkTransmit(
    incorrectNetworkTransmit: NetworkTransmit,
  ): NetworkTransmit {
    return new NetworkTransmit(
      incorrectNetworkTransmit.count,
      incorrectNetworkTransmit.interval * 10,
    );
  }

  public static fromRequest(request: ConfigNetworkTransmitSet) {
    return new NetworkTransmit(request.count + 1, (request.steps + 1) * 10);
  }

  public static fromStatus(status: ConfigNetworkTransmitStatus) {
    return new NetworkTransmit(status.count + 1, (status.steps + 1) * 10);
  }
}

export class Node {
  public meshNetwork: MeshNetwork | undefined = undefined;
  /**
   * Unique Node Identifier.
   */
  public uuid: UUID;

  private readonly $name: string | undefined = undefined;

  public get name(): string | undefined {
    return this.$name;
  }

  public set name(name: string | undefined) {
    // @ts-expect-error readonly but we change it in the setter
    this.$name = name;
    this.meshNetwork?.updateTimestamp();
  }

  private readonly $isConfigComplete: boolean = false;
  /**
   * The boolean value represents whether the Mesh Manager
   * has finished configuring this Node. The property is set to `true`
   * once a Mesh Manager is done completing this node's
   * configuration, otherwise it is set to `false`.
   */
  public get isConfigComplete(): boolean {
    return this.$isConfigComplete;
  }
  public set isConfigComplete(value: boolean) {
    // @ts-expect-error readonly but we change it in the setter
    this.$isConfigComplete = value;
    this.meshNetwork?.updateTimestamp();
  }

  protected readonly $networkTransmit: NetworkTransmit | undefined = undefined;
  /**
   * The object represents parameters of the transmissions of network
   * layer messages originating from a mesh node.
   */
  public get networkTransmit(): NetworkTransmit | undefined {
    return this.$networkTransmit;
  }
  public set networkTransmit(networkTransmit: NetworkTransmit | undefined) {
    // @ts-expect-error readonly but we change it in the setter
    this.$networkTransmit = networkTransmit;
    this.meshNetwork?.updateTimestamp();
  }

  /** An array of node's elements. */
  protected $elements: Array<Element>;
  public get elements(): Array<Element> {
    return this.$elements;
  }

  /**
   * Number of Node's Elements.
   */
  public get elementsCount(): UInt8 {
    return this.elements.length;
  }

  /**
   * The Unicast Address range assigned to all Elements of the Node.
   *
   * The address range is continuous and starts with `primaryUnicastAddress`
   * and ends with `lastUnicastAddress`.
   */
  public get unicastAddressRange(): AddressRange {
    return AddressRange.fromAddress(this.primaryUnicastAddress, this.elementsCount);
  }

  private $primaryUnicastAddress: Address;
  /**
   * Primary Unicast Address of the Node.
   */
  public get primaryUnicastAddress(): Address {
    return this.$primaryUnicastAddress;
  }

  /**
   * 128-bit device key for this Node.
   */
  public deviceKey: Data | undefined = undefined;

  /**
   * The level of security for the subnet on which the node has been
   * originally provisioner.
   */
  public security: Security;

  protected $netKeys: Array<NodeKey>;
  public get netKeys(): Array<NodeKey> {
    return this.$netKeys;
  }

  /**
   * An array of Node Network Key objects that include information
   * about the Network Keys known to this node.
   */
  protected $appKeys: Array<NodeKey>;
  /**
   * An array of Node Application Key objects that include information
   * about the Application Keys known to this node.
   */
  public get appKeys(): Array<NodeKey> {
    return this.$appKeys;
  }
  /**
   * The minimum number of Replay Protection List (RPL) entries for this
   * node. The value of this property is obtained from node composition
   * data.
   */
  public minimumNumberOfReplayProtectionList?: UInt16;
  /**
   * The 16-bit Company Identifier (CID) assigned by the Bluetooth SIG.
   * The value of this property is obtained from node composition data.
   */
  public companyIdentifier: UInt16 | undefined = undefined;
  /**
   * The 16-bit vendor-assigned Product Identifier (PID).
   * The value of this property is obtained from node composition data.
   */
  public productIdentifier: UInt16 | undefined = undefined;
  /**
   * The 16-bit vendor-assigned Version Identifier (VID).
   * The value of this property is obtained from node composition data.
   */
  public versionIdentifier: UInt16 | undefined = undefined;
  /**
   * Node's features.
   */
  public features: NodeFeaturesState | undefined = undefined;

  private readonly $ttl: UInt8 | undefined = undefined;
  /**
   * The default Time To Live (TTL) value used when sending messages.
   */
  public get ttl(): UInt8 | undefined {
    return this.$ttl;
  }
  public set ttl(ttl: UInt8 | undefined) {
    // @ts-expect-error readonly but we change it in the setter
    this.$ttl = ttl;
    this.meshNetwork?.updateTimestamp();
  }
  /**
   * The default Time To Live (TTL) value used when sending messages.
   * The TTL may only be set for a Provisioner's Node, or for a Node
   * that has not been added to a mesh network.
   *
   * Use `ConfigDefaultTtlGet` and `ConfigDefaultTtlSet` messages to
   * read or set the default TTL value of a remote Node.
   */
  public get defaultTtl(): UInt8 | undefined {
    return this.ttl;
  }
  private set defaultTtl(ttl: UInt8 | undefined) {
    if (!(typeof this.meshNetwork === "undefined" || this.isProvisioner)) {
      console.log(
        "Default TTL may only be set for a Provisioner's Node. Use ConfigDefaultTtlSet(ttl) message to send new TTL value to a remote Node.",
      );
      return;
    }
    this.ttl = ttl;
  }

  /**
   * Returns whether the Node belongs to the main Provisioner.
   * The main Provisioner will be used to perform all
   * provisioning and communication on this device. Every device
   * should use a different Provisioner to set up devices in the
   * same mesh network to avoid conflicts with addressing nodes.
   */
  public get isLocalProvisioner(): boolean {
    const localProvisionerUuid = this.meshNetwork?.localProvisioner?.uuid;
    return !!localProvisionerUuid && this.uuid.equal(localProvisionerUuid);
  }

  /**
   * Returns whether the Node belongs to one of the Provisioners
   * of the mesh network.
   */
  public get isProvisioner(): boolean {
    return this.meshNetwork?.containsProvisionerWithUuid(this.uuid) ?? false;
  }

  /**
   * Returns list of Application Keys known to this Node.
   *
   * NOTE: If the Node has been removed from the mesh network this property returns an empty array.
   */
  public get applicationKeys(): Array<ApplicationKey> {
    if (typeof this.meshNetwork === "undefined") return [];
    return ApplicationKeys.knownTo(this.meshNetwork.applicationKeys, this) ?? [];
  }
  /**
   * Returns list of Network Keys known to this Node.
   *
   * NOTE: If the Node has been removed from the mesh network this property returns an empty array.
   */
  public get networkKeys(): Array<NetworkKey> {
    if (typeof this.meshNetwork === "undefined") return [];
    return NetworkKeys.knownToNode(this.meshNetwork.networkKeys, this) ?? [];
  }

  /**
   * Returns weather Composition Data has been applied to the Node.
   */
  public get isCompositionDataReceived(): boolean {
    return typeof this.companyIdentifier !== "undefined";
  }

  private readonly $isExcluded: boolean = false;
  /**
   * The flag is set to `true` when the Node is in the process of being
   * deleted and is excluded from the new network key distribution
   * during the key refresh procedure; otherwise is set to `false`.
   */
  public get isExcluded(): boolean {
    return this.$isExcluded;
  }
  public set isExcluded(value: boolean) {
    // @ts-expect-error readonly but we change it in the setter
    this.$isExcluded = value;
    this.meshNetwork?.updateTimestamp();
  }

  /**
   * The Heartbeat Subscription object represents parameters that define
   * receiving of periodical Heartbeat transport control messages.
   */
  public heartbeatSubscription: HeartbeatSubscription | undefined = undefined;

  /**
   * The Primary Element of the Node.
   *
   * `undefined` is returned if Composition Data has not been received yet.
   */
  public get primaryElement(): Element | undefined {
    // Check whether the Composition Data has been received.
    // The Page 0, among other, contains the Company ID.
    if (this.companyIdentifier === undefined) {
      return undefined;
    }
    return this.elements[0];
  }

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.Node.parse(jv);

    const unicastAddress = Address.fromHex(parsed.unicastAddress);
    if (typeof unicastAddress === "undefined") {
      throw new DecodingError("Address must be 4-character hexadecimal string.");
    }
    if (!unicastAddress.isUnicast) {
      throw new DecodingError(`${parsed.unicastAddress} is not a unicast address.`);
    }

    const node = new Node(parsed.name, unicastAddress, 0);

    const trimmed = parsed.UUID.trim();
    const uuid = /^[0-9a-fA-F]{32}$/.test(trimmed)
      ? UUID.fromHex(trimmed)
      : UUID.fromUuidString(trimmed);
    assertDirectInstanceOf(uuid, UUID);
    node.uuid = uuid;

    if (parsed.deviceKey) {
      const deviceKey = hexToUint8Array(parsed.deviceKey);
      node.deviceKey = deviceKey;
    }

    const security = Security.fromString(parsed.security);
    assertDirectInstanceOf(security, Security);
    node.security = security;
    node.$netKeys = parsed.netKeys.map((nk) => NodeKey.decode(nk));
    node.$appKeys = parsed.appKeys.map((ak) => NodeKey.decode(ak));
    // @ts-expect-error we change readonly constructor
    node.$isConfigComplete = parsed.configComplete;

    if (parsed.cid) {
      const companyIdentifier = parseInt(parsed.cid, 16);
      node.companyIdentifier = companyIdentifier;
    }
    // TODO: add productIdentifier
    if (parsed.crpl) {
      const crpl = parseInt(parsed.crpl, 16);
      node.minimumNumberOfReplayProtectionList = crpl;
    }
    node.features = parsed.features ? NodeFeaturesState.decode(parsed.features) : undefined;
    // TODO: add secureNetworkBeacon
    // @ts-expect-error we change readonly constructor
    node.$ttl = parsed.defaultTTL;
    // @ts-expect-error we change readonly constructor
    node.$networkTransmit = parsed.networkTransmit
      ? NetworkTransmit.decode(parsed.networkTransmit)
      : undefined;
    if (typeof node.networkTransmit !== "undefined") {
      if (node.networkTransmit.interval === 0 || node.networkTransmit.count === 0) {
        // @ts-expect-error we change readonly constructor
        node.$networkTransmit = undefined;
      } else {
        if (!(node.networkTransmit.count >= 1 && node.networkTransmit.count <= 8)) {
          throw new DecodingError("Network Transmit count must be in range 1-8.");
        }
        // @ts-expect-error we change readonly constructor
        node.$networkTransmit = NetworkTransmit.fromFixingIncorrectNetworkTransmit(
          node.networkTransmit,
        );
      }
    }
    // TODO: add relayTransmit
    node.$elements = parsed.elements.map((e) => Element.decode(e));

    // @ts-expect-error we change readonly constructor
    node.$isExcluded = parsed.excluded;

    // TODO: add heartbeatPublication and heartbeatSubscription

    node.elements.forEach((e) => {
      e.parentNode = node;
    });
    return node;
  }

  constructor(name: string | undefined, unicastAddress: Address, elements: UInt8) {
    this.uuid = new UUID();
    this.$name = name;
    this.$primaryUnicastAddress = unicastAddress;
    this.deviceKey = Crypto.generateRandom(128);
    this.security = Security.secure;
    // Default values.
    this.$netKeys = [new NodeKey(new KeyIndex(0), false)];
    this.$appKeys = [];
    this.$elements = [];

    for (let i = 0; i < elements; i++) {
      this.addElement(Element.fromLocation(Location.unknown));
    }

    makeObservable<
      Node,
      | "$name"
      | "$isConfigComplete"
      | "$elements"
      | "$primaryUnicastAddress"
      | "$netKeys"
      | "$appKeys"
      | "$ttl"
      | "$isExcluded"
    >(this, {
      $name: observable,
      name: computed,
      $isConfigComplete: observable,
      isConfigComplete: computed,
      $elements: observable,
      elements: computed,
      elementsCount: computed,
      primaryUnicastAddress: computed,
      $primaryUnicastAddress: observable,
      unicastAddressRange: computed,
      deviceKey: observable,
      security: observable,
      $netKeys: observable,
      netKeys: computed,
      $appKeys: observable,
      appKeys: computed,
      companyIdentifier: observable,
      applyCompositionData: action,
      versionIdentifier: observable,
      productIdentifier: observable,
      features: observable,
      $ttl: observable,
      ttl: computed,
      defaultTtl: computed,
      isLocalProvisioner: computed,
      meshNetwork: observable,
      applicationKeys: computed,
      networkKeys: computed,
      isCompositionDataReceived: computed,
      $isExcluded: observable,
      isExcluded: computed,
      heartbeatSubscription: observable,
      removeNetworkKeyWithIndex: action,
      addApplicationKey: action,
      addApplicationKeyWithIndex: action,
      removeApplicationKeyWithIndex: action,
      addNetworkKey: action,
      addElement: action,
      addNetworkKeyWithIndex: action,
      addElements: action,
      setApplicationKeys: action,
      setApplicationKeysWithIndexes: action,
    });
  }

  private static withAllProperties(
    name: string | undefined,
    uuid: UUID,
    deviceKey: Data,
    security: Security,
    networkKey: NetworkKey,
    address: Address,
  ) {
    const node = new Node(name, address, 0);
    node.uuid = uuid;
    node.deviceKey = deviceKey;
    node.security = security;
    // Composition Data were not obtained.
    // @ts-expect-error we change readonly constructor
    node.$isConfigComplete = false;

    // The updated flag is set to true if the Node was provisioned using
    // a Network Key in Phase 2 (Using New Keys).
    const updated = networkKey.phase === KeyRefreshPhase.usingNewKeys;
    node.$netKeys = [new NodeKey(networkKey.index, updated)];
    node.$appKeys = [];
    node.$elements = [];

    // If the Node as provisioned in an insecure way, lower the minimum security
    // of the Network Key.
    if (security === Security.insecure) {
      networkKey.lowerSecurity();
    }
    return node;
  }
  /**
   * Initializes the Provisioner's Node.
   *
   * The Provisioner's node has the same name and node UUID as the Provisioner.
   *
   * @param provisioner The Provisioner for which the node is added.
   * @param address The unicast address to be assigned to the Node.
   */
  public static forProvisionerWithAddress(provisioner: Provisioner, address: Address) {
    const node = new Node(provisioner.name, address, 0);
    node.uuid = provisioner.uuid;
    node.deviceKey = Crypto.generateRandom(128);
    node.security = Security.secure;
    // @ts-expect-error we change readonly constructor
    node.$ttl = undefined;
    // iDevice can handle a lot of addresses.
    node.minimumNumberOfReplayProtectionList = Address.maxUnicastAddress.valueOf();
    // A flag that there is no need to perform configuration of
    // a Provisioner's node.
    node.isConfigComplete = true;
    // This Provisioner does not support any of those features.
    node.features = NodeFeaturesState.fromStates(
      NodeFeatureState.notSupported,
      NodeFeatureState.notSupported,
      NodeFeatureState.notSupported,
      NodeFeatureState.notSupported,
    );

    // Keys will be added later.
    node.$netKeys = [];
    node.$appKeys = [];
    // Initialize elements.
    node.$elements = [];
    return node;
  }
  /**
   * Initializes a Node for given unprovisioned device.
   *
   * The Node will have the same UUID as the device in the advertising
   * packet.
   *
   * @param unprovisionedDevice The newly provisioned device.
   * @param n Number of Elements on the new Node.
   * @param deviceKey The Device Key.
   * @param security The Node's security. A Node is considered secure if it was provisioned using a OOB Public Key.
   * @param networkKey The Network Key.
   * @param address The Unicast Address to be assigned to the Node.
   */
  public static forUnprovisionedDevice(
    unprovisionedDevice: UnprovisionedDevice,
    n: UInt8,
    deviceKey: Data,
    security: Security,
    networkKey: NetworkKey,
    address: Address,
  ) {
    const node = Node.withAllProperties(
      unprovisionedDevice.name,
      unprovisionedDevice.uuid,
      deviceKey,
      security,
      networkKey,
      address,
    );
    // Elements will be queried with Composition Data.
    // Let's just add n empty Elements to reserve addresses.
    for (let i = 0; i < n; i++) {
      node.addElement(Element.fromLocation(Location.unknown));
    }
    return node;
  }

  /**
   * Returns whether any of the Node's Elements has a Unicast Address from the given
   * range.
   *
   * @param range Address range to check.
   * @returns `True`, if the node address range overlaps with the given range, `false` otherwise.
   */
  public containsElementsWithAddressesOverlapping(range: AddressRange): boolean {
    return this.unicastAddressRange.overlaps(range);
  }

  /**
   * Returns whether the Node has the given Unicast Address assigned to one
   * of its Elements.
   *
   * @param address Address to check.
   * @returns `True` if any of node's elements (or the node itself) was assigned the given address, `false` otherwise.
   */
  public containsElementWithAddress(address: Address): boolean {
    return this.unicastAddressRange.contains(address);
  }

  public setElements(elements: Array<Element>) {
    // Look for matching Models. A matching model has the same Element index and Model id.
    for (let e = 0; e < Math.min(this.elements.length, elements.length); e++) {
      const oldElement = this.elements[e];
      const newElement = elements[e];
      for (let m = 0; m < Math.min(oldElement.models.length, newElement.models.length); m++) {
        const oldModel = oldElement.models[m];
        const newModel = newElement.models[m];
        if (oldModel.modelId == newModel.modelId) {
          newModel.copyFrom(oldModel);
          // If at least one Model matches, assume the Element didn't
          // change much and copy the name of it.
          if (typeof oldElement.name !== "undefined") {
            newElement.name = oldElement.name;
          }
        }
      }
    }
    // Remove the old Elements.
    this.elements.forEach((element) => {
      element.parentNode = undefined;
      element.index = 0;
    });
    this.elements.length = 0;
    // And add new ones.
    this.addElements(elements);
  }

  /**
   * Adds the given Element to the Node.
   *
   * @param element The Element to be added.
   */
  public addElement(element: Element) {
    const index: UInt8 = this.elements.length;
    this.$elements = produce(this.$elements, (draft) => {
      draft.push(element);
    });
    element.parentNode = this;
    element.index = index;
  }

  /**
   * Adds given list of Elements to the Node.
   *
   * @param elements The list of Elements to be added.
   */
  public addElements(elements: Array<Element>) {
    elements.forEach((element) => {
      this.addElement(element);
    });
  }

  /**
   * Sets the Network Keys to the Node.
   *
   * This method overwrites previous keys.
   *
   * @param networkKeys The Network Keys to set.
   */
  public setNetworkKeys(networkKeys: Array<NetworkKey>) {
    this.setNetworkKeysWithIndexes(networkKeys.map((key) => key.index));
  }

  /**
   * Sets the Network Keys with given indexes to the Node.
   *
   * This method overwrites previous keys.
   *
   * @param networkKeyIndexes The Network Key indexes to set.
   */
  public setNetworkKeysWithIndexes(networkKeyIndexes: Array<KeyIndex>) {
    this.$netKeys = networkKeyIndexes
      .map((index) => new NodeKey(index, false))
      .sort((a, b) => a.index.valueOf() - b.index.valueOf());
    // Remove any Application Keys bound to Network Keys which are not in the list.
    this.$appKeys = this.$appKeys.filter((appKey) => {
      const applicationKey = this.applicationKeys.find((applicationKey) =>
        applicationKey.index.equal(appKey.index),
      );
      if (typeof applicationKey !== "undefined") {
        return networkKeyIndexes.some((keyIndex) =>
          keyIndex.equal(applicationKey.boundNetworkKeyIndex),
        );
      }
      // If the Application Key is not known, leave it.
      return true;
    });
    // If an insecure Node received a Network Key, make sure to lower
    // the minSecurity field of all the keys it .
    if (this.security == Security.insecure) {
      this.networkKeys.forEach((networkKey) => {
        networkKey.lowerSecurity();
      });
    }
    this.meshNetwork?.updateTimestamp();
  }

  /**
   * Sets the Application Keys to the Node.
   * This will overwrite the previous keys.
   *
   * @param applicationKeys The Application Keys to set.
   */
  public setApplicationKeys(applicationKeys: Array<ApplicationKey>) {
    this.setApplicationKeysWithIndexes(
      applicationKeys.map((applicationKey) => applicationKey.index),
    );
  }

  /**
   * Sets the Application Keys with given indexes to the Node.
   *
   * This method overwrites previous keys.
   *
   * @param applicationKeyIndexes The Application Key indexes to set.
   */
  public setApplicationKeysWithIndexes(applicationKeyIndexes: Array<KeyIndex>) {
    this.$appKeys = applicationKeyIndexes.map((keyIndex) => new NodeKey(keyIndex, false));
    this.$appKeys.sort((a, b) => a.index.valueOf() - b.index.valueOf());
    this.meshNetwork?.updateTimestamp();
  }

  /**
   * Returns the Element that belongs to this Node with the given
   * Unicast Address, or `undefined`, if such does not exist.
   *
   * @param address The Unicast Address of an Element to get.
   * @returns The Element found, or `undefined`, if no such exist.
   */
  public elementWithAddress(address: Address) {
    const index = address.valueOf() - this.primaryUnicastAddress.valueOf();
    if (index >= 0 && index < this.elements.length) {
      return this.elements[index];
    }
    return undefined;
  }

  /**
   * Returns whether the Node has knowledge about the given Application Key.
   * The Application Key comparison bases only on the Key Index.
   *
   * @param applicationKey The Application Key to look for.
   * @returns `True` if the Node has knowledge about the Application Key with the same Key Index as given key, `false` otherwise.
   */
  public knowsApplicationKey(applicationKey: ApplicationKey) {
    return this.knowsApplicationKeyIndex(applicationKey.index);
  }

  /**
   * Returns whether the Node has knowledge about Application Key with the
   * given index.
   *
   * @param applicationKeyIndex The Application Key Index to look for.
   * @returns `True` if the Node has knowledge about the Application Key index, `false` otherwise.
   */
  public knowsApplicationKeyIndex(applicationKeyIndex: KeyIndex): boolean {
    return this.appKeys.some((appKey) => appKey.index.equal(applicationKeyIndex));
  }

  /**
   * Returns whether the Node has knowledge about the given Network Key.
   * The Network Key comparison bases only on the Key Index.
   *
   * @param networkKey The Network Key to look for.
   * @returns `True` if the Node has knowledge about the Network Key with the same Key Index as given key, `false` otherwise.
   */
  public knowsNetworkKey(networkKey: NetworkKey): boolean {
    return this.knowsNetworkKeyIndex(networkKey.index);
  }

  /**
   * Returns whether the Node has knowledge about Network Key with the
   * given index.
   *
   * @param networkKeyIndex The Network Key Index to look for.
   * @returns `True` if the Node has knowledge about the Network Key index, `false` otherwise.
   */
  public knowsNetworkKeyIndex(networkKeyIndex: KeyIndex): boolean {
    return this.netKeys.some((networkKey) => networkKey.index.equal(networkKeyIndex));
  }

  public equals(other: Node): boolean {
    return (
      this.uuid === other.uuid &&
      this.isConfigComplete === other.isConfigComplete &&
      this.isCompositionDataReceived === other.isCompositionDataReceived &&
      this.isExcluded == other.isExcluded &&
      this.name === other.name &&
      this.defaultTtl === other.defaultTtl
    );
  }
  /**
   * Adds the Application Key to the Node.
   *
   * @param applicationKey The Application Key to add.
   */
  public addApplicationKey(applicationKey: ApplicationKey) {
    this.addApplicationKeyWithIndex(applicationKey.index);
  }

  /**
   * Adds the Application Key with given index to the Node.
   *
   * @param applicationKeyIndex The Application Key index to add.
   */
  public addApplicationKeyWithIndex(applicationKeyIndex: KeyIndex) {
    const applicationKeyKnown = this.appKeys.some((appKey) =>
      appKey.index.equal(applicationKeyIndex),
    );
    if (!applicationKeyKnown) {
      this.$appKeys = produce(this.$appKeys, (draft) => {
        draft.push(new NodeKey(applicationKeyIndex, false));
      });
      this.meshNetwork?.updateTimestamp();
    }
  }

  /**
   * Adds the Network Key with given index to the Node.
   *
   * @param networkKeyIndex The Network Key index to add.
   */
  public addNetworkKeyWithIndex(networkKeyIndex: KeyIndex) {
    if (this.netKeys.find((key) => key.index.equal(networkKeyIndex)) === undefined) {
      this.$netKeys = produce(this.$netKeys, (draft) => {
        draft.push(new NodeKey(networkKeyIndex, false));
      });
      // If an insecure Node received a Network Key, make sure to lower
      // the minSecurity field of that key.
      if (this.security === Security.insecure) {
        this.meshNetwork?.networkKeys
          .find((key) => key.index.equal(networkKeyIndex))
          ?.lowerSecurity();
      }
      if (this.meshNetwork) this.meshNetwork?.updateTimestamp();
    }
  }

  /**
   * Adds the Network Key to the Node.
   *
   * @param networkKey The Network Key to add.
   */
  public addNetworkKey(networkKey: NetworkKey) {
    this.addNetworkKeyWithIndex(networkKey.index);
  }

  /**
   * Removes the Network Key with given index and all Application Keys
   * bound to it from the Node. This method also removes all Model bindings
   * that point any of the removed Application Keys and the publications
   * that are using this key, including Heartbeat publication.
   *
   * @param networkKeyIndex The Key Index of Network Key to be removed.
   */
  public removeNetworkKeyWithIndex(networkKeyIndex: KeyIndex) {
    const index = this.netKeys.findIndex((key) => key.index.equal(networkKeyIndex));
    if (index !== -1) {
      // Remove the Key Index from 'netKeys'.
      this.$netKeys = produce(this.$netKeys, (draft) => {
        draft.splice(index, 1);
      });
      // Remove all Application Keys bound to the removed Network Key.
      this.applicationKeys
        .filter((key) => key.boundNetworkKeyIndex.equal(networkKeyIndex))
        .forEach((key) => this.removeApplicationKeyWithIndex(key.index));
      // TODO: Remove Heartbeat publication, if set to use the removed Network Key.
      this.meshNetwork?.updateTimestamp();
    }
  }

  /**
   * Removes the Application Key with given index and all Model bindings
   * that point to it and the publications that are using this key.
   *
   * @param applicationKeyIndex The Key Index of Application Key to be removed.
   */
  public removeApplicationKeyWithIndex(applicationKeyIndex: KeyIndex) {
    const index = this.appKeys.findIndex((key) => key.index.equal(applicationKeyIndex));
    if (index !== -1) {
      // Remove the Key Index from 'appKeys'.
      this.$appKeys = produce(this.$appKeys, (draft) => {
        draft.splice(index, 1);
      });
      // Remove all bindings with given Key Index from all models.
      this.elements
        .flatMap((el) => el.models)
        .forEach((model) =>
          // Remove the Key Index from bound keys.
          // This will also clear the publication if it was using
          // the same Application Key.
          model.unbindApplicationKeyWithIndex(applicationKeyIndex),
        );
      this.meshNetwork?.updateTimestamp();
    }
  }
  /**
   * Applies the result of Composition Data to the Node.
   *
   * This method does nothing if the Node already was configured
   * or the Composition Data Status does not have Page 0.
   *
   * @param compositionData The result of Config Composition Data Get with page 0.
   */
  public applyCompositionData(compositionData: ConfigCompositionDataStatus) {
    const page0 = compositionData.page instanceof Page0 ? compositionData.page : undefined;
    if (!page0) return;
    this.companyIdentifier = page0.companyIdentifier;
    this.productIdentifier = page0.productIdentifier;
    this.versionIdentifier = page0.versionIdentifier;
    this.minimumNumberOfReplayProtectionList = page0.minimumNumberOfReplayProtectionList;
    // Don't override features if they already were known.
    // Accurate features states could have been acquired by reading each feature state,
    // while the Page 0 of the Composition Data contains only Supported / Not Supported.
    if (this.features !== undefined) {
      this.features.applyMissing(page0.features);
    } else {
      this.features = page0.features;
    }
    // And set the Elements received.
    const elements = page0.elements.map((element) => {
      const models = element.models.map((model) => new Model(model.modelId));
      return new Element(undefined, element.location, models);
    });
    this.setElements(elements);
    this.meshNetwork?.updateTimestamp();
  }

  public static withAssignedNetworkKeyAndAddress(
    name: string | undefined,
    uuid: UUID,
    deviceKey: Data,
    security: Security,
    networkKey: NetworkKey,
    address: Address,
  ) {
    const node = new Node(name, address, 0);
    node.uuid = uuid;
    node.deviceKey = deviceKey;
    node.security = security;
    // Composition Data were not obtained.
    node.isConfigComplete = false;

    // The updated flag is set to true if the Node was provisioned using
    // a Network Key in Phase 2 (Using New Keys).
    const updated = networkKey.phase === KeyRefreshPhase.usingNewKeys;
    node.$netKeys = [new NodeKey(networkKey.index, updated)];
    node.$appKeys = [];
    node.$elements = [];

    // If the Node as provisioned in an insecure way, lower the minimum security
    // of the Network Key.
    if (security === Security.insecure) {
      networkKey.lowerSecurity();
    }
    return node;
  }
}

createModelSchema(NodeKey, {
  index: custom(
    (v: KeyIndex) => v.valueOf(),
    (v: number) => v,
  ),
  updated: primitive(),
});

createModelSchema(NetworkTransmit, {
  steps: custom(
    (v: number) => toPaddedHex8(v),
    (v: string) => v,
  ),
  timeInterval: custom(
    (v: number) => v.toPrecision(21),
    (v: string) => v,
  ),
  count: custom(
    (v: number) => toPaddedHex8(v),
    (v: string) => v,
  ),
  interval: custom(
    (v: number) => toPaddedHex16(v),
    (v: string) => v,
  ),
});

createModelSchema(Node, {
  uuid: alias(
    "UUID",
    custom(
      (v: UUID) => v.uuidString,
      (v: string) => v,
    ),
  ),
  name: optional(primitive()),
  isConfigComplete: alias("configComplete", primitive()),
  $networkTransmit: object(NetworkTransmit),
  elements: list(object(Element)),
  primaryUnicastAddress: alias(
    "unicastAddress",
    custom(
      (v: Address) => v.hex,
      (v: string) => v,
    ),
  ),
  deviceKey: custom(
    (v?: Data) => (typeof v === "undefined" ? SKIP : uint8ArrayToHex(v)),
    (v: string) => v,
  ),
  security: custom(
    (v: Security) => v.value,
    (v: string) => v,
  ),
  netKeys: list(object(NodeKey)),
  appKeys: list(object(NodeKey)),
  minimumNumberOfReplayProtectionList: alias(
    "crpl",
    custom(
      (v?: number) => (typeof v === "undefined" ? SKIP : toPaddedHex16(v)),
      (v: string) => v,
    ),
  ),
  companyIdentifier: alias(
    "cid",
    custom(
      (v?: number) => (typeof v === "undefined" ? SKIP : toPaddedHex16(v)),
      (v: string) => v,
    ),
  ),
  versionIdentifier: alias(
    "vid",
    custom(
      (v?: number) => (typeof v === "undefined" ? SKIP : toPaddedHex16(v)),
      (v: string) => v,
    ),
  ),
  productIdentifier: alias(
    "pid",
    custom(
      (v?: number) => (typeof v === "undefined" ? SKIP : toPaddedHex16(v)),
      (v: string) => v,
    ),
  ),
  features: object(NodeFeaturesState),
  $ttl: alias(
    "defaultTTL",
    custom(
      (v?: number) => (typeof v === "undefined" ? SKIP : v),
      (v?: number) => v,
    ),
  ),
  isExcluded: alias("excluded", primitive()),
  heartbeatSubscription: alias(
    "heartbeatSub",
    object(HeartbeatSubscription as unknown as Clazz<object>),
  ),
});
