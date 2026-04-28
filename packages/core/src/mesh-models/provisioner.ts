import { Address, assertDirectInstanceOf, Int64, UUID, MeshCDB } from "@blemeshjs/utils";
import { MeshNetwork } from "./mesh-network.js";
import { AddressRange } from "./address-range.js";
import { Node } from "./node.js";
import {
  isGroupRanges,
  isUnicastRanges,
  isValidRanges,
  mergedRanges,
  rangesContains,
} from "../mesh-models-array/ranges.js";
import { SceneRange } from "./scene-range.js";
import Long from "long";
import { alias, createModelSchema, custom, list, object, primitive } from "serializr";

/**
 * Representation of a Provisioner in the mesh network.
 *
 * A Provisioner is an entity that is able to provision other device to
 * the mesh network by assigning them Unicast Addresses and providing
 * a Network Key in a secure way. A Provisioner with a Unicast Address
 * assigned may also configure devices and becomes a Node of a network
 * on its own.
 *
 * Each Provisioner has assigned 3 ranges:
 * * Unicast Address range - set of Unicast Addresses which may assign to new
 *   Nodes during provisioning,
 * * Group Address range - set of Group Addresses which the Provisioner may use
 *   to define new groups.
 * * Scene range - set of Scene numbers which it may use to define new scenes.
 *
 * The Provisioner should not assign addresses from outside of its ranges to avoid
 * conflicts with other Provisioners.
 */
export class Provisioner {
  public meshNetwork?: MeshNetwork;
  /**
   * Provisioner's UUID. If the Provisioner has a corresponding Node,
   * the Node's UUID will be equal to this one.
   */
  public uuid: UUID;

  /**
   * An array of unicast range objects.
   */
  public allocatedUnicastRange: Array<AddressRange>;
  /**
   * An array of group range objects.
   */
  public allocatedGroupRange: Array<AddressRange>;
  /**
   * An array of scene range objects.
   */
  public allocatedSceneRange: Array<SceneRange>;

  public get node(): Node | undefined {
    return this.meshNetwork?.nodeForProvisioner(this);
  }

  private readonly $name!: string;
  /**
   * UTF-8 string, which should be a human readable name of the Provisioner.
   */
  public get name(): string {
    return this.$name;
  }
  public set name(newValue: string) {
    // @ts-expect-error we setting in a setter;
    this.$name = newValue;
    if (typeof this.meshNetwork !== "undefined") {
      const node = this.meshNetwork.nodeForProvisioner(this);
      if (typeof node !== "undefined") node.name = newValue;
    }
  }

  /**
   * The Primary Unicast Address of the Provisioner.
   *
   * The Provisioner must be added to a mesh network and
   * must have a Unicast Address assigned, otherwise `undefined`
   * is returned instead.
   */
  public get primaryUnicastAddress(): Address | undefined {
    return this.node?.primaryUnicastAddress;
  }

  /**
   * Returns `true` if all defined ranges are valid.
   *
   * The Unicast Address range may not be empty, as it needs to assign addresses
   * during provisioning.
   */
  public get isValid(): boolean {
    return (
      isUnicastRanges(this.allocatedUnicastRange) &&
      isGroupRanges(this.allocatedGroupRange) &&
      isValidRanges(this.allocatedSceneRange) &&
      this.allocatedUnicastRange.length !== 0
    );
  }

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.Provisioner.parse(jv);

    const provisioner = new Provisioner("", new UUID(), [], [], []);
    provisioner.name = parsed.provisionerName;

    const trimmed = parsed.UUID.trim();
    const uuid = /^[0-9a-fA-F]{32}$/.test(trimmed)
      ? UUID.fromHex(trimmed)
      : UUID.fromUuidString(trimmed);
    assertDirectInstanceOf(uuid, UUID);
    provisioner.uuid = uuid;

    provisioner.allocatedUnicastRange = mergedRanges(
      parsed.allocatedUnicastRange.map((range) => AddressRange.decode(range)),
    );
    provisioner.allocatedGroupRange = mergedRanges(
      parsed.allocatedGroupRange.map((range) => AddressRange.decode(range)),
    );
    provisioner.allocatedSceneRange = mergedRanges(
      parsed.allocatedSceneRange.map((range) => SceneRange.decode(range)),
    );
    return provisioner;
  }

  public constructor(
    name: string,
    uuid: UUID,
    allocatedUnicastRange: Array<AddressRange>,
    allocatedGroupRange: Array<AddressRange>,
    allocatedSceneRange: Array<SceneRange>,
  ) {
    this.$name = name;
    this.uuid = uuid;
    this.allocatedUnicastRange = mergedRanges(allocatedUnicastRange);
    this.allocatedGroupRange = mergedRanges(allocatedGroupRange);
    this.allocatedSceneRange = mergedRanges(allocatedSceneRange);
  }

  public static fromName(name: string): Provisioner {
    return new Provisioner(
      name,
      new UUID(),
      [AddressRange.allUnicastAddresses],
      [AddressRange.allGroupAddresses],
      [SceneRange.allScenes],
    );
  }
  public static fromNameWithRanges(
    name: string,
    allocatedUnicastRange: Array<AddressRange>,
    allocatedGroupRange: Array<AddressRange>,
    allocatedSceneRange: Array<SceneRange>,
  ): Provisioner {
    return new Provisioner(
      name,
      new UUID(),
      allocatedUnicastRange,
      allocatedGroupRange,
      allocatedSceneRange,
    );
  }

  public maxElementCount(address: Address): Int64 {
    let count = 0;
    if (!address.isUnicast) {
      return Long.fromNumber(count);
    }
    // Check the maximum number of Elements that fit inside a single range.
    for (const range of this.allocatedUnicastRange) {
      if (range.contains(address)) {
        count = Math.min(range.highAddress.valueOf() - address.valueOf() + 1, 0xff); // This must fit in UInt8.
        break;
      }
    }
    // The requested address is not in Provisioner's range.
    if (count <= 0) {
      return Long.fromNumber(0);
    }
    // If the Provisioner is added to a network,
    if (typeof this.meshNetwork !== "undefined") {
      const otherNodes = this.meshNetwork.nodes.filter(
        (node) => !node.primaryUnicastAddress.equal(address),
      );
      const range = AddressRange.fromAddress(address, count);
      for (const node of otherNodes) {
        if (node.containsElementsWithAddressesOverlapping(range)) {
          count = node.primaryUnicastAddress.valueOf() - address.valueOf();
        }
      }
    }
    return Long.fromNumber(count);
  }
  /**
   * Returns `true` if at least one range overlaps with the given Provisioner.
   *
   * @param provisioner The Provisioner to check ranges with.
   * @returns `True` if this and the given Provisioner have overlapping ranges, `false` otherwise.
   */
  public hasOverlappingRanges(provisioner: Provisioner): boolean {
    return (
      this.hasOverlappingUnicastRanges(provisioner) ||
      this.hasOverlappingGroupRanges(provisioner) ||
      this.hasOverlappingSceneRanges(provisioner)
    );
  }

  /**
   * Returns `true` if at least one Unicast Address range overlaps with address
   * ranges of the given Provisioner.
   *
   * @param provisioner The Provisioner to check ranges with.
   * @returns `True` if this and the given Provisioner have overlapping unicast ranges, `false` otherwise.
   */
  public hasOverlappingUnicastRanges(provisioner: Provisioner): boolean {
    // Verify Unicast ranges
    for (const range of this.allocatedUnicastRange) {
      for (const other of provisioner.allocatedUnicastRange) {
        if (range.overlaps(other)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Returns `true` if at least one Group Address range overlaps with address
   * ranges of the given Provisioner.
   *
   * @param provisioner The Provisioner to check ranges with.
   * @returns `True` if this and the given Provisioner have overlapping group ranges, `false` otherwise.
   */
  public hasOverlappingGroupRanges(provisioner: Provisioner): boolean {
    // Verify Group ranges
    for (const range of this.allocatedGroupRange) {
      for (const other of provisioner.allocatedGroupRange) {
        if (range.overlaps(other)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Returns `true` if at least one Scene range overlaps with scene ranges of
   * the given Provisioner.
   *
   * @param provisioner The Provisioner to check ranges with.
   * @returns `True` if this and the given Provisioner have overlapping scene ranges, `false` otherwise.
   */
  public hasOverlappingSceneRanges(provisioner: Provisioner): boolean {
    // Verify Scene ranges
    for (const range of this.allocatedSceneRange) {
      for (const other of provisioner.allocatedSceneRange) {
        if (range.overlaps(other)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Returns whether given address range is within any of the ranges allocated
   * to the Provisioner.
   *
   * The address may be a Unicast or a Group Address range.
   *
   * @param range The address range to be checked.
   * @returns `True` if the address is in allocated ranges, `false` otherwise.
   */
  public hasAllocatedAddressRange(range: AddressRange): boolean {
    if (!range.isUnicastRange && !range.isGroupRange) {
      return false;
    }

    const ranges = range.isUnicastRange ? this.allocatedUnicastRange : this.allocatedGroupRange;
    return rangesContains(ranges, range);
  }
}

createModelSchema(Provisioner, {
  uuid: alias(
    "UUID",
    custom(
      (v: UUID) => v.uuidString,
      (v) => v as unknown,
    ),
  ),
  allocatedUnicastRange: list(object(AddressRange)),
  allocatedGroupRange: list(object(AddressRange)),
  allocatedSceneRange: list(object(SceneRange)),
  name: alias("provisionerName", primitive()),
});
