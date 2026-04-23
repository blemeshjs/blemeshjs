import {
  Address,
  assertDirectInstanceOf,
  Data,
  DecodingError,
  IvIndex,
  KeyIndex,
  LocalProvisionerUuidKey,
  Location,
  MeshNetworkError,
  meshTimestamp,
  Storage,
  UInt8,
  UserDefaults,
  UUID,
  MeshCDB,
  ExportConfiguration,
} from "@mesh-link-js/utils";
import { Element } from "./element.js";
import { Provisioner } from "./provisioner.js";
import { Node } from "./node.js";
import { ApplicationKey } from "./application-key.js";
import { NetworkKey } from "./network-key.js";
import { ExclusionList, ExclusionListArray } from "./exclusion-list.js";
import { AddressRange, addressRangeContains } from "./address-range.js";
import {
  alias,
  Clazz,
  createModelSchema,
  custom,
  list,
  object,
  optional,
  primitive,
  serialize,
} from "serializr";
import { areUint8ArraysEqual } from "uint8array-extras";
import { NetworkIdentity } from "./network-identity.js";
import { NodeIdentity } from "./node-identity.js";
import { action, computed, makeObservable, observable } from "mobx";
import { produce } from "immer";
import { Group } from "./group.js";
import { Scene } from "./scene.js";

/**
 * An observer class for the IV Index changes in the mesh network.
 *
 * WARNING: This class is for advanced users and should be used with caution.
 * The IV Index is managed internally by the library. Tracking changes
 * to the IV Index is not necessary for most applications.
 */
export abstract class IvIndexObserver {
  /**
   * Called when the IV Index of the mesh network has changed.
   *
   * NOTE: This method is called from the main dispatch queue.
   *
   * @param ivIndex The new IV Index value.
   */
  public abstract ivIndexDidChange(ivIndex: IvIndex): void;
}

export class MeshNetwork {
  private readonly $schema = "http://json-schema.org/draft-04/schema#";

  private readonly id =
    "https://www.bluetooth.com/specifications/specs/mesh-cdb-1-0-1-schema.json#";
  private readonly version = "1.0.1";
  /**
   * Random 128-bit UUID allows differentiation among multiple mesh networks.
   */
  public uuid: UUID;

  private $timestamp: number;

  public get timestamp(): number {
    return this.$timestamp;
  }

  /**
   * Whether the configuration contains full information about the mesh network,
   * or only partial. In partial configuration Nodes' Device Keys can be `nil`.
   */
  public isPartial: boolean;
  private readonly $meshName!: string;
  /**
   * UTF-8 string, which should be human readable name for this mesh network.
   */
  public get meshName(): string {
    return this.$meshName;
  }
  public set meshName(name: string) {
    // @ts-expect-error we setting in a setter;
    this.$meshName = name;
    this.$timestamp = Date.now();
  }

  public applicationKeys: Array<ApplicationKey>;

  public networkKeys: Array<NetworkKey>;
  /**
   * An array of provisioner objects that includes information about known
   * Provisioners and ranges of addresses and scenes that have been allocated
   * to these Provisioners.
   */
  public provisioners: Array<Provisioner>;
  /**
   * An array of Nodes in the network.
   */
  public nodes: Array<Node>;
  /**
   * An array of Groups in the network.
   */
  public groups: Array<Group>;
  /**
   * An array of Scenes in the network.
   */
  public scenes: Array<Scene>;

  /**
   * Returns the local Provisioner, or `undefined` if the mesh network
   * does not have any.
   *
   * @see `setLocalProvisioner()`
   */
  public get localProvisioner(): Provisioner | undefined {
    return this.provisioners[0];
  }

  public networkExclusions?: Array<ExclusionList>;

  public ivIndexObserver?: IvIndexObserver;

  private readonly $ivIndex!: IvIndex;
  public get ivIndex(): IvIndex {
    return this.$ivIndex;
  }
  public set ivIndex(newValue: IvIndex) {
    const oldValue = this.$ivIndex;
    // @ts-expect-error setting in setter
    this.$ivIndex = newValue;

    if (this.$ivIndex.equals(oldValue)) return;

    const before = this.networkExclusions?.length ?? 0;
    // Clean up the network exclusions
    if (typeof this.networkExclusions !== "undefined")
      this.networkExclusions = ExclusionListArray.cleanUpExclusionsForIvIndex(
        this.networkExclusions,
        this.$ivIndex,
      );
    if (this.networkExclusions?.length === 0) {
      this.networkExclusions = undefined;
    }
    const after = this.networkExclusions?.length ?? 0;
    if (before !== after) {
      // Why the notification isn't posted here?
      // It is, but the timestamp setter. One is enough.
      this.$timestamp = Date.now();
    }
    // Notify the observer about the IV Index change.
    this.ivIndexObserver?.ivIndexDidChange(this.$ivIndex);
  }

  private readonly $localElements: Array<Element>;
  public get localElements(): Array<Element> {
    return this.$localElements;
  }
  public set localElements(elements: Array<Element>) {
    // Make sure the indexes are correct.
    for (const [index, element] of elements.entries()) {
      element.index = index;
      element.parentNode = this.localProvisioner?.node;
    }
    // @ts-expect-error we're setting in a setter;
    this.$localElements = elements;
    // Make sure there is enough address space for all the Elements
    // that are not taken by other Nodes and are in the local Provisioner's
    // address range. If required, cut the Elements array.
    if (
      typeof this.localProvisioner !== "undefined" &&
      typeof this.localProvisioner.node !== "undefined"
    ) {
      let availableElements = elements;
      const availableElementsCount = this.localProvisioner.maxElementCount(
        this.localProvisioner.node.primaryUnicastAddress,
      );
      if (availableElementsCount.lt(elements.length)) {
        availableElements = elements.slice(
          0,
          -(elements.length - availableElementsCount.toNumber()),
        );
      }
      // Assign the Elements to the Provisioner's Node.
      this.localProvisioner.node.setElements(availableElements);
    }
  }

  /**
   * Next available Key Index that can be assigned to a new Network Key.
   *
   * NOTE: This method searches for any available key index that is not used,
   *         looking for gaps in the key indexes. If there are no gaps, the
   *         next available key index will be the first one after the last one.
   */
  public get nextAvailableNetworkKeyIndex(): KeyIndex | undefined {
    if (this.networkKeys.length === 0) {
      return new KeyIndex(0);
    }
    for (let index = 1; index < 4056; index++) {
      if (!this.networkKeys.some((key) => key.index.valueOf() === index)) {
        return new KeyIndex(index);
      }
    }
    return undefined;
  }

  /**
   * Next available Key Index that can be assigned to a new Application Key.
   *
   * NOTE: This method searches for any available key index that is not used,
   *         looking for gaps in the key indexes. If there are no gaps, the
   *         next available key index will be the first one after the last one.
   */
  public get nextAvailableApplicationKeyIndex(): KeyIndex | undefined {
    if (this.applicationKeys.length === 0) {
      return new KeyIndex(0);
    }
    for (let index = 1; index < 4056; index++) {
      if (!this.applicationKeys.some((key) => key.index.valueOf() === index)) {
        return new KeyIndex(index);
      }
    }
    return undefined;
  }

  public encode() {
    return serialize(this.constructor as Clazz<typeof this>, this);
  }

  public static decode(jv: Record<string, unknown>, storage: Storage): MeshNetwork {
    const parsed = MeshCDB.MeshConfigurationDatabase.parse(jv);

    const meshNetwork = new this("", storage);
    const meshUuid = parsed.meshUUID.trim();
    const uuid = /^[0-9a-fA-F]{32}$/.test(meshUuid)
      ? UUID.fromHex(meshUuid)
      : UUID.fromUuidString(meshUuid);
    assertDirectInstanceOf(uuid, UUID);
    meshNetwork.uuid = uuid;

    meshNetwork.isPartial = parsed.partial;
    // @ts-expect-error we're setting in a setter;
    meshNetwork.$meshName = parsed.meshName;
    meshNetwork.$timestamp = new Date(parsed.timestamp).getTime();

    meshNetwork.provisioners = parsed.provisioners.map((provisioner) =>
      Provisioner.decode(provisioner),
    );

    meshNetwork.networkKeys = parsed.netKeys.map((networkKey) => NetworkKey.decode(networkKey));

    meshNetwork.applicationKeys = parsed.appKeys.map((applicationKey) =>
      ApplicationKey.decode(applicationKey),
    );

    const ns = parsed.nodes.map((node) => Node.decode(node));
    if (!meshNetwork.isPartial && ns.some((node) => typeof node.deviceKey === "undefined")) {
      throw new DecodingError("Device Key cannot be empty in non-partial configuration.");
    }
    meshNetwork.nodes = ns;

    meshNetwork.groups = [];

    meshNetwork.scenes = [];

    if (parsed.networkExclusions) {
      meshNetwork.networkExclusions = parsed.networkExclusions.map((exclusion) =>
        ExclusionList.decode(exclusion),
      );
    }

    // The IV Index is not a shared in the JSON, as it may change.
    // The value will be obtained from the Secure Network beacon moment after
    // connecting to a Proxy node.
    // @ts-expect-error we're setting in a constructor;
    meshNetwork.$ivIndex = new IvIndex();
    // @ts-expect-error we're setting in a setter;
    meshNetwork.$localElements = [Element.primaryElement];

    meshNetwork.provisioners.forEach((provisioner) => {
      provisioner.meshNetwork = meshNetwork;
    });
    meshNetwork.applicationKeys.forEach((applicationKey) => {
      applicationKey.meshNetwork = meshNetwork;
    });
    meshNetwork.nodes.forEach((node) => {
      node.meshNetwork = meshNetwork;
    });
    // Heartbeat publications and subscriptions are disabled when mesh
    // network is loaded.
    if (
      typeof meshNetwork.localProvisioner !== "undefined" &&
      typeof meshNetwork.localProvisioner.node !== "undefined"
    ) {
      // TODO: set the heartbeat publication and subscription
      // meshNetwork.localProvisioner.node.heartbeatPublication = undefined;
      meshNetwork.localProvisioner.node.heartbeatSubscription = undefined;
    }

    return meshNetwork;
  }

  public constructor(
    name: string,
    private $storage: Storage,
    uuid: UUID = new UUID(),
  ) {
    this.uuid = uuid;
    this.$meshName = name;
    this.isPartial = false;
    this.$timestamp = Date.now();
    this.provisioners = [];
    this.networkKeys = [NetworkKey.primaryNetworkKey()];
    this.applicationKeys = [];
    this.nodes = [];
    this.groups = [];
    this.scenes = [];
    this.networkExclusions = [];
    this.$ivIndex = new IvIndex();
    this.$localElements = [];
    this.localElements = [Element.fromLocation(Location.main)];

    makeObservable<MeshNetwork, "$localElements" | "$ivIndex" | "$meshName" | "$timestamp">(this, {
      // observable
      uuid: observable,
      $timestamp: observable,
      isPartial: observable,
      $meshName: observable,
      applicationKeys: observable,
      networkKeys: observable,
      provisioners: observable,
      nodes: observable,
      groups: observable,
      scenes: observable,
      networkExclusions: observable,
      $ivIndex: observable,
      $localElements: observable,

      // computed
      meshName: computed,
      ivIndex: computed,
      localProvisioner: computed,
      localElements: computed,
      nextAvailableNetworkKeyIndex: computed,
      nextAvailableApplicationKeyIndex: computed,
      timestamp: computed,

      // actions
      addProvisioner: action,
      addProvisionerWithAddress: action,
      addNode: action,
      addGroup: action,
      removeGroup: action,
      addNetworkKey: action,
      addApplicationKey: action,
      addApplicationKeyWithProperties: action,
      addNetworkKeyWithName: action,
      removeApplicationKeyWithKeyIndex: action,
      removeNode: action,
      removeNodeWithUuid: action,
      removeNetworkKeyWithKeyIndex: action,
      updateTimestamp: action,
    });
  }

  public updateTimestamp() {
    this.$timestamp = Date.now();
  }

  /**
   * Returns whether the given address range can be assigned to a new Node.
   *
   * This method does not check if the range is allocated to the current Provisioner.
   * For that, use ``Provisioner/hasAllocated(addressRange:)``.
   *
   * @param range The address range to check.
   * @returns `True`, if the address is available, `false` otherwise.
   */
  public isAddressRangeAvailable(range: AddressRange): boolean {
    return (
      range.isUnicastRange &&
      !this.nodes.some((node) => node.containsElementsWithAddressesOverlapping(range)) &&
      !(
        ExclusionListArray.containsRangeForIvIndex(
          this.networkExclusions ?? [],
          range,
          this.ivIndex,
        ) ?? false
      )
    );
  }

  public nodeForProvisioner(provisioner: Provisioner): Node | undefined {
    if (!this.containsProvisioner(provisioner)) return undefined;

    return this.nodeWithUuid(provisioner.uuid);
  }

  public nodeWithUuid(uuid: UUID): Node | undefined {
    return this.nodes.find((node) => node.uuid.equal(uuid));
  }

  /**
   * Adds the given Network Key to the network.
   *
   * @param key The new Network Key to be added.
   */
  public addNetworkKey(key: NetworkKey) {
    this.networkKeys = produce(this.networkKeys, (draft) => {
      draft.push(key);
    });
    this.$timestamp = Date.now();

    // Make the local Provisioner aware of the new key.
    this.localProvisioner?.node?.addNetworkKey(key);
  }
  /**
   * Adds a new Application Key and binds it to the first Network Key.
   *
   * @param applicationKey The 128-bit Application Key.
   * @param name The human readable name.
   * @param index An optional Key Index to assign. If `undefined`, the next available Key Index will be assigned automatically.
   * @returns This method returns an error if the key is not 128-bit long,
   *           there isn't any Network Key to bind the new key to
   *           or the assigned Key Index is out of range.
   */
  public addApplicationKeyWithProperties(
    applicationKey: Data,
    name: string,
    index?: KeyIndex,
  ): ApplicationKey | MeshNetworkError {
    const defaultNetworkKey = this.networkKeys[0];
    if (!defaultNetworkKey) {
      return MeshNetworkError.noNetworkKey;
    }
    const nextIndex = index ?? this.nextAvailableApplicationKeyIndex;
    if (nextIndex === undefined) {
      return MeshNetworkError.keyIndexOutOfRange;
    }
    if (this.applicationKeys.find((key) => key.index.equal(nextIndex)) !== undefined) {
      return MeshNetworkError.keyIndexAlreadyExists;
    }
    const key = ApplicationKey.withProperties(name, nextIndex, applicationKey, defaultNetworkKey);
    if (key instanceof MeshNetworkError) return key;
    this.addApplicationKey(key);
    return key;
  }

  /**
   * Adds the given Application Key to the network.
   *
   * @param key The new Application Key to be added.
   */
  public addApplicationKey(key: ApplicationKey) {
    key.meshNetwork = this;
    this.applicationKeys = produce(this.applicationKeys, (draft) => {
      draft.push(key);
    });
    this.updateTimestamp();

    // Make the local Provisioner aware of the new key.
    this.localProvisioner?.node?.addApplicationKey(key);
  }

  /**
   * Removes Application Key with given Key Index.
   *
   * @param index The Key Index of a key to be removed.
   * @param force If set to `true`, the key will be deleted even if there are other Nodes known to use this key.
   * @returns The removed key.
   * @returns The method returns if the key is in use and cannot be removed (unless `force` was set to `true`).
   */
  public removeApplicationKeyWithKeyIndex(
    index: KeyIndex,
    force: boolean = false,
  ): ApplicationKey | MeshNetworkError {
    const arrIndex = this.applicationKeys.findIndex((key) => key.index.equal(index));
    if (arrIndex === -1) return MeshNetworkError.invalidKey;
    const applicationKey = this.applicationKeys[arrIndex];

    // Ensure no Node is using this Application Key.
    if (!force && applicationKey?.isUsedIn(this)) {
      return MeshNetworkError.keyInUse;
    }
    applicationKey.meshNetwork = undefined;
    this.applicationKeys = this.applicationKeys.filter((key) => !key.index.equal(index));
    this.updateTimestamp();
    return applicationKey;
  }

  /**
   * Adds a new Network Key.
   *
   * @param networkKey The 128-bit Application Key.
   * @param index The optional Key Index to assign. If `undefined`, the next available Key Index will be assigned automatically.
   * @param name   The human readable name.
   * @returns This method returns an error if the key is not 128-bit long or the assigned Key Index is out of range.
   * @see `MeshNetwork.nextAvailableNetworkKeyIndex`
   */
  public addNetworkKeyWithName(
    networkKey: Data,
    name: string,
    index?: KeyIndex,
  ): NetworkKey | MeshNetworkError {
    const nextIndex = index ?? this.nextAvailableNetworkKeyIndex;
    if (nextIndex === undefined) return MeshNetworkError.keyIndexOutOfRange;
    if (this.networkKeys.find((key) => key.index.equal(nextIndex)) !== undefined)
      return MeshNetworkError.keyIndexAlreadyExists;
    const key = NetworkKey.fromName(name, nextIndex, networkKey);
    if (key instanceof MeshNetworkError) return key;
    this.addNetworkKey(key);
    return key;
  }

  /**
   * Returns the Node with the given Unicast Address. The address may
   * be belong to any of the Node's Elements.
   *
   * @param address A Unicast Address to look for.
   * @returns The Node found, or `undefined` if no such exists.
   */
  public nodeWithAddress(address: Address): Node | undefined {
    if (!address.isUnicast) {
      return undefined;
    }
    return this.nodes.find((node) => node.containsElementWithAddress(address));
  }

  /**
   * Returns whether the Provisioner is in the mesh network.
   *
   * @param provisioner The Provisioner to look for.
   * @returns `True` if the Provisioner was found, `false` otherwise.
   */
  public containsProvisioner(provisioner: Provisioner): boolean {
    return this.provisioners.some(($provisioner) => provisioner.uuid.equal($provisioner.uuid));
  }

  /**
   * Returns whether the Provisioner with given UUID is in the
   * mesh network.
   *
   * @param uuid The Provisioner's UUID to look for.
   * @returns `True` if the Provisioner was found, `false` otherwise.
   */
  public containsProvisionerWithUuid(uuid: UUID): boolean {
    return this.provisioners.some((provisioner) => provisioner.uuid.equal(uuid));
  }
  /**
   * Returns whether the given Node is in the mesh network.
   *
   * @param node The Node to look for.
   * @returns `True` if the Node was found, `false` otherwise.
   */
  public containsNode(node: Node): boolean {
    return this.containsNodeWithUuid(node.uuid);
  }

  /**
   * Returns whether the Node with given UUID is in the
   * mesh network.
   *
   * @paarm uuid The Node's UUID to look for.
   * @returns `True` if the Node was found, `false` otherwise.
   */
  public containsNodeWithUuid(uuid: UUID): boolean {
    return this.nodes.some((node) => node.uuid == uuid);
  }

  /**
   * Returns whether the given address can be reassigned to the given Node.
   *
   * The Unicast Addresses already assigned to the given Node are excluded from
   * checking address collisions, that is `true` is returned as if they were available.
   *
   * @param address The first address to check.
   * @param node The Node, which address is to change. It will be excluded from checking address collisions.
   * @returns `True`, if the address is available, `false` otherwise.
   */
  public isAddressAvailableForNode(address: Address, node: Node): boolean {
    const range = AddressRange.fromAddress(address, node.elementsCount);
    const otherNodes = this.nodes.filter(($node) => !$node.equals(node));
    return (
      range.isUnicastRange &&
      !otherNodes.some(($node) => $node.containsElementsWithAddressesOverlapping(range)) &&
      !(typeof this.networkExclusions === "undefined"
        ? false
        : ExclusionListArray.containsRangeForIvIndex(this.networkExclusions, range, this.ivIndex))
    );
  }

  /**
   * Adds the Node to the local database.
   *
   * NOTE: This method should only be used to add debug Nodes, or Nodes that have already been provisioned.
   * Use `MeshNetworkManager.provisionUnprovisionedDevice()` to provision a Node to the mesh network.
   *
   * @param node A Node to be added.
   * @returns This method returns an error if the Node's address is not available, the Node does not have a Network Key, the Network Key does not belong to the mesh network, or a Node with the same UUID already exists in the network.
   */
  public addNode(node: Node): MeshNetworkError | void {
    // Make sure the Node does not exist already.
    if (this.containsNode(node)) {
      return MeshNetworkError.nodeAlreadyExist;
    }
    // Verify if the address range is available for the new Node.
    if (!this.isAddressAvailableForNode(node.primaryUnicastAddress, node)) {
      return MeshNetworkError.addressNotAvailable;
    }
    // Ensure the Network Key exists.
    const netKeyIndex = node.netKeys[0]?.index;
    if (typeof netKeyIndex === "undefined") {
      return MeshNetworkError.noNetworkKey;
    }
    // Make sure the network contains a Network Key with the same Key Index.
    if (!this.networkKeys.some((netKey) => netKey.index.equal(netKeyIndex))) {
      return MeshNetworkError.invalidKey;
    }

    node.meshNetwork = this;
    this.nodes = produce(this.nodes, (draft) => {
      draft.push(node);
    });
    this.$timestamp = Date.now();
  }
  /**
   * Checks if a Group with the same address as the given one exists in the network.
   *
   * @param group A Group to look for.
   * @returns `True` if the Group was found, `false` otherwise.
   */
  public containsGroup(group: Group): boolean {
    return this.groups.some(($group) => $group.groupAddress === group.groupAddress);
  }

  /**
   * Adds a new Group to the network.
   *
   * If the mesh network already contains a Group with the same address,
   * this method returns an error.
   *
   * Groups with predefined addresses (i.e. All Nodes) cannot be added as
   * custom groups.
   *
   * @param _group The Group to be added.
   * @returns This method returns an error if a Group with the same address already exists in the mesh network, or it is a Special Group.
   */
  public addGroup(_group: Group): MeshNetworkError | undefined {
    return undefined;
  }

  /**
   * Removes the given Group from the network.
   *
   * The Group must not be in use, i.e. it may not be a parent of
   * another Group.
   *
   * @param _group The Group to be removed.
   * @returns This method returns ``MeshNetworkError/groupInUse`` when the Group is in use in this mesh network.
   */
  public removeGroup(_group: Group): MeshNetworkError | undefined {
    return undefined;
  }

  /**
   * Adds the Provisioner and assigns a Unicast Address to it.
   *
   * This method does nothing if the Provisioner is already added to the
   * mesh network.
   *
   * NOTE: To add a Provisioner object without assigning it a Unicast Address
   * use `addProvisionerWithAddress()`` passing `undefined` as the `address`.
   *
   * @param provisioner The Provisioner to be added.
   * @throws `MeshNetworkError` - if the ranges allocated to the Provisioner are invalid ranges or ranges overlapping with an existing Provisioner.
   */
  async addProvisioner(provisioner: Provisioner): Promise<void> {
    // Find the Unicast Address to be assigned.
    const address = this.nextAvailableUnicastAddressForProvisioner(provisioner);
    if (typeof address === "undefined") {
      throw MeshNetworkError.noAddressAvailable;
    }

    return this.addProvisionerWithAddress(provisioner, address);
  }

  /**
   * Adds the Provisioner and assigns the given Unicast Address to it.
   *
   * This method does nothing if the Provisioner is already added to the
   * mesh network.
   *
   * @param provisioner The Provisioner to be added.
   * @param unicastAddress The Unicast Address to be used by the Provisioner.
   * A `undefined` address means that the Provisioner is not able to perform configuration operations.
   * @throws `MeshNetworkError` - if validation of the Provisioner has failed.
   */
  public async addProvisionerWithAddress(
    provisioner: Provisioner,
    unicastAddress?: Address,
  ): Promise<void> {
    // Already added to another network?
    if (typeof provisioner.meshNetwork !== "undefined") {
      throw MeshNetworkError.provisionerUsedInAnotherNetwork;
    }

    // Is it valid?
    if (!provisioner.isValid) {
      throw MeshNetworkError.invalidRange;
    }

    // Does it have non-overlapping ranges?
    for (const other of this.provisioners) {
      if (provisioner.hasOverlappingRanges(other)) {
        throw MeshNetworkError.overlappingProvisionerRanges;
      }
    }

    if (typeof unicastAddress !== "undefined") {
      // Is the given address inside Provisioner's address range?
      if (!addressRangeContains(provisioner.allocatedUnicastRange, unicastAddress.valueOf())) {
        throw MeshNetworkError.addressNotInAllocatedRange;
      }

      // No other node uses the same address?
      if (this.nodes.some((node) => node.containsElementWithAddress(unicastAddress))) {
        throw MeshNetworkError.addressNotAvailable;
      }
    }

    // Is it already added?
    if (this.containsProvisioner(provisioner)) {
      return;
    }

    // Is there a node with the Provisioner's UUID?
    if (this.containsNodeWithUuid(provisioner.uuid)) {
      // The UUID conflict is super unlikely to happen. All UUIDs are
      // randomly generated.
      // TODO: Should a new UUID be autogenerated instead?
      throw MeshNetworkError.nodeAlreadyExist;
    }

    // Add the Provisioner's Node.
    if (typeof unicastAddress !== "undefined") {
      const node = Node.forProvisionerWithAddress(provisioner, unicastAddress);
      // The new Provisioner will be aware of all currently existing
      // Network and Application Keys.
      node.setNetworkKeys(this.networkKeys);
      node.setApplicationKeys(this.applicationKeys);
      // Set the Node's Elements.
      if (this.provisioners.length === 0) {
        node.addElements(this.localElements);
        node.companyIdentifier = 0x004c; // Apple Inc.
        node.minimumNumberOfReplayProtectionList = Address.maxUnicastAddress.valueOf();
      } else {
        node.addElement(Element.primaryElement);
      }
      // Add the Node to the Network.
      const error = this.addNode(node);
      if (error instanceof MeshNetworkError) throw error;
    }

    // And finally, add the Provisioner.
    provisioner.meshNetwork = this;
    this.provisioners.push(provisioner);
    this.$timestamp = Date.now();

    // When the local Provisioner has been added, save its UUID.
    if (this.provisioners.length === 1) {
      const defaults = UserDefaults.instance(this.uuid.uuidString, this.$storage);
      await defaults.set(LocalProvisionerUuidKey, provisioner.uuid.uuidString);
    }
  }

  /**
   * Returns the next available Unicast Address from the Unicast Address range
   * assigned to the given Provisioner that can be assigned to that Provisioner's Node.
   *
   * This method is assuming that the Provisioner has only 1 element.
   *
   * @param provisioner The Provisioner that is creating the Node for itself. The address will be taken from it's allocated range.
   * @returns The next available Unicast Address that can be assigned to a node, or `undefined`, if there are no more available addresses in the allocated range.
   * @see `nextAvailableUnicastAddressStartingFrom()``
   */
  public nextAvailableUnicastAddressForProvisioner(provisioner: Provisioner): Address | undefined {
    return this.nextAvailableUnicastAddressStartingFrom(1, provisioner);
  }

  /**
   * Returns the next available Group Address from the Group Address range
   * assigned to the given Provisioner that can be assigned to a new Group.
   *
   * @param provisioner The Provisioner, which range is to be used for address generation.
   * @returns The next available Group Address that can be assigned to a new Group, or `undefined`, if there are no more available addresses in the allocated range.
   */
  public nextAvailableGroupAddress(provisioner: Provisioner): Address | undefined {
    const sortedGroups = this.groups
      .slice()
      .sort((a, b) => parseInt(a.groupAddress, 16) - parseInt(b.groupAddress, 16));

    // Iterate through all groups just once, while iterating over ranges.
    let index = 0;
    for (const range of provisioner.allocatedGroupRange) {
      // Start from the beginning of the current range.
      let address = range.lowAddress;

      // Iterate through groups that weren't checked yet.
      for (let i = index; i < sortedGroups.length; i++) {
        const group = sortedGroups[index];
        index += 1;

        // Skip groups with addresses below the range.
        if (address.dec > group.address.address.dec) {
          continue;
        }
        // If we found a space before the current node, return the address.
        if (address.dec < group.address.address.dec) {
          return address;
        }
        // Else, move the address to the next available address.
        address = new Address(group.address.address.dec + 1);

        // If the new address is outside of the range, go to the next one.
        if (address.dec > range.highAddress.dec) {
          break;
        }
      }

      // If the range has available space, return the address.
      if (address.dec <= range.highAddress.dec) {
        return address;
      }
    }
    // No address was found :(
    return;
  }

  /**
   * Returns the next available Unicast Address from the Unicast Address range
   * assigned to the given Provisioner that can be assigned to a new Node with the given
   * number of Elements.
   *
   * The returned address can be set as the primary Unicast Address of the Node.
   * Each following Element will be identified by a subsequent Unicast Address.
   *
   * @param elementsCount The number of Node's Elements.
   * @param provisioner The Provisioner that is creating the node. The address will be taken from it's allocated range.
   * @param offset The primary Unicast Address to be assigned.
   * @returns The next available Unicast Address that can be assigned to a Node, or `undefined`, if there are no more available addresses in the allocated range.
   */
  public nextAvailableUnicastAddressStartingFrom(
    elementsCount: UInt8,
    provisioner: Provisioner,
    offset: Address = Address.minUnicastAddress,
  ): Address | undefined {
    const exclusions = ExclusionListArray.excludedAddressesForIvIndex(
      this.networkExclusions ?? [],
      this.ivIndex,
    ).sort((a, b) => a.valueOf() - b.valueOf());
    const usedAddresses = exclusions
      .concat(this.nodes.flatMap((node) => node.elements).map((element) => element.unicastAddress))
      .sort((a, b) => a.valueOf() - b.valueOf());

    // Iterate through all addresses just once, while iterating over ranges.
    for (const range of provisioner.allocatedUnicastRange) {
      // Start from the beginning of the current range.
      let address = range.lowAddress;

      if (range.contains(offset) && address < offset) {
        address = offset;
      }

      // Iterate through addresses that weren't checked yet.
      for (let index = 0; index < usedAddresses.length; index++) {
        const usedAddress = usedAddresses[index];

        // Skip addresses below the range.
        if (address > usedAddress) {
          continue;
        }

        if (address.valueOf() + elementsCount - 1 < usedAddress.valueOf()) {
          return address;
        }

        address = new Address(usedAddress.valueOf() + 1);

        // If the new address is outside of the range, go to the next one.
        if (address.valueOf() + elementsCount - 1 > range.highAddress.valueOf()) {
          break;
        }
      }

      // If the range has available space, return the address.
      if (address.valueOf() + elementsCount - 1 <= range.highAddress.valueOf()) {
        return address;
      }
    }
    // No address was found :(
    return undefined;
  }

  /**
   * Returns whether any of the Network Keys in the mesh network
   * matches the given Network Identity.
   *
   * @param networkIdentity The Network Identity.
   * @returns `True` if the Network ID matches any subnetwork of this mesh network, `false` otherwise.
   */
  public matchesNetworkIdentity(networkIdentity: NetworkIdentity): boolean {
    return this.networkKeys.some((key) => networkIdentity.matches(key));
  }
  /**
   * Returns a Node that matches the Node Identity, or `nil`.
   *
   * This method may be used to match the Node Identity or Private Node Identity beacons.
   *
   * @param nodeIdentity Node Identity obtained from the advertising packet.
   * @returns A Node that matches the given Node Identity; or `undefined` otherwise.
   */
  public nodeMatchingNodeIdentity(nodeIdentity: NodeIdentity): Node | undefined {
    return this.nodes.find((node) => nodeIdentity.matches(node));
  }

  /**
   * Returns whether any of the Nodes in the mesh network matches
   * the given Node Identity.
   *
   * This method may be used to match the Node Identity or Private Node Identity beacons.
   *
   * @param nodeIdentity Node Identity obtained from the advertising packet.
   * @returns `True` if the given Node Identity match any Node of this mesh network; `false` otherwise.
   */
  public matchesNodeIdentity(nodeIdentity: NodeIdentity): boolean {
    return this.nodeMatchingNodeIdentity(nodeIdentity) !== undefined;
  }

  /**
   * Returns whether any of the Network Keys in the mesh network
   * matches the given Network ID.
   *
   * @param networkId The Network ID.
   * @returns `True` if the Network ID matches any subnetwork of this mesh network, `false` otherwise.
   */
  public matchesNetworkId(networkId: Data): boolean {
    return this.networkKeys.some(
      (key) =>
        areUint8ArraysEqual(key.networkId, networkId) ||
        (typeof key.oldNetworkId !== "undefined" &&
          areUint8ArraysEqual(key.oldNetworkId, networkId)),
    );
  }
  /**
   * Removes the Node from the local database.
   *
   * This method only removes the Node from the local database, but the Node
   * may still be able to interact with the network. To reset the Node
   * send a ``ConfigNodeReset`` message to the remote Node.
   * It will be removed from the local database automatically when
   * ``ConfigNodeResetStatus`` message is received.
   *
   * NOTE: Sending Config Node Reset message does not guarantee that the
   *              Node won't be able to communicate with the network. To make sure
   *              that the Node will not be able to send and receive messages from
   *              the network all the Network Keys (and optionally Application Keys)
   *              known by the Node must to be updated using Key Refresh Procedure,
   *              or removed from other Nodes.
   *              See Bluetooth Mesh Profile 1.0.1, chapter: 3.10.7 Node Removal
   *              procedure.
   *
   * @param node The Node to be removed.
   */
  public removeNode(node: Node) {
    this.removeNodeWithUuid(node.uuid);
  }

  /**
   * Removes the Node with given UUID from the mesh network.
   *
   * @param uuid The UUID of a Node to remove.
   */
  public removeNodeWithUuid(uuid: UUID): Node | undefined {
    const map = new Map(this.nodes.map((node) => [node.uuid.uuidString, node]));
    const node = map.get(uuid.uuidString);
    if (!node) return;
    map.delete(uuid.uuidString);
    this.nodes = Array.from(map.values());
    // TODO: Verify that no Node is publishing to this Node.
    //       If such Node is found, this method should throw, as
    //       the Node is in use.

    // When a Node is removed from the network, the Unicast Addresses
    // it used to use cannot be assigned to another Node until the
    // IV Index is incremented by 2 (which effectively resets all Sequence
    // number counters on all Nodes).
    this.networkExclusions = this.networkExclusions ?? [];
    this.networkExclusions = ExclusionListArray.appendNodeToExclusionListArray(
      this.networkExclusions,
      node,
      this.ivIndex,
    );

    // As the Node is no longer part of the mesh network, remove
    // the reference to it.
    node.meshNetwork = undefined;
    this.$timestamp = Date.now();

    // The stored SeqAuth value cannot be removed, as that could
    // lead to accepting repeated messages.
    /*
      // Forget the last sequence number for the device.
      let meshUuid = self.uuid
      if let defaults = UserDefaults(suiteName: meshUuid.uuidString) {
          defaults.removeSeqAuthValues(of: node)
      }
    */
    return node;
  }

  /**
   * Removes Network Key with given Key Index.
   *
   * @param index The Key Index of a key to be removed.
   * @param force If set to `true`, the key will be deleted even if there are other Nodes known to use this key.
   * @returns The method returns an error if the key is in use and cannot be
   *           removed (unless `force` was set to `true`).
   */
  public removeNetworkKeyWithKeyIndex(index: KeyIndex, force = false) {
    const $index = this.networkKeys.findIndex((key) => key.index.equal(index));
    if ($index !== -1) {
      const networkKey = this.networkKeys[$index];
      // Ensure no Node is using this Application Key.
      if (!(force || (!networkKey.isPrimary && !networkKey.isUsedInMeshNetwork(this)))) {
        return MeshNetworkError.keyInUse;
      }
      this.networkKeys = produce(this.networkKeys, (draft) => {
        draft.splice($index, 1);
      });
      this.$timestamp = Date.now();
      return networkKey;
    }
    return MeshNetworkError.keyNotKnown;
  }

  public copy(configuration: ExportConfiguration): MeshNetwork {
    if (ExportConfiguration.full === configuration) {
      return this;
    } else return this;
  }

  public static copy(network: MeshNetwork, configuration: ExportConfiguration) {
    const $network = new this(network.meshName, network.$storage, network.uuid);
    $network.$timestamp = network.timestamp;
    $network.ivIndex = network.ivIndex;

    $network.networkExclusions = network.networkExclusions;
    $network.localElements = [];

    switch (configuration) {
      case ExportConfiguration.full:
        $network.isPartial = false;
        $network.provisioners = network.provisioners;
        $network.nodes = network.nodes;
        $network.networkKeys = network.networkKeys;
        $network.applicationKeys = network.applicationKeys;
        $network.groups = network.groups;
        $network.scenes = network.scenes;
        break;
    }
    return $network;
  }
}

createModelSchema(MeshNetwork, {
  $schema: primitive(),
  id: primitive(),
  version: primitive(),
  uuid: alias(
    "meshUUID",
    custom(
      (v: UUID) => v.uuidString,
      (v: string) => v,
    ),
  ),
  timestamp: custom(
    (v: number) => meshTimestamp(v),
    (v: string) => v,
  ),
  isPartial: alias("partial", primitive()),
  meshName: primitive(),
  applicationKeys: alias("appKeys", list(object(ApplicationKey))),
  networkKeys: alias("netKeys", list(object(NetworkKey))),
  provisioners: list(object(Provisioner)),
  nodes: list(object(Node)),
  groups: list(object(Group as unknown as Clazz<Group>)),
  scenes: list(object(Scene as unknown as Clazz<Scene>)),
  networkExclusions: optional(list(object(ExclusionList))),
});
