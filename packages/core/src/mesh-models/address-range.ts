import {
  Address,
  RangeObject,
  ClosedRange,
  UInt8,
  UInt16,
  DecodingError,
  MeshCDB,
} from "@blemeshjs/utils";
import { z } from "zod";
import { Node } from "./node.js";
import { createModelSchema, custom } from "serializr";

// Create schemas for address ranges - these are embedded in Provisioner schema
const UnicastRangeSchema = z
  .object({
    highAddress: MeshCDB.UnicastAddress,
    lowAddress: MeshCDB.UnicastAddress,
  })
  .strict();

const GroupRangeSchema = z
  .object({
    highAddress: MeshCDB.GroupAddress,
    lowAddress: MeshCDB.GroupAddress,
  })
  .strict();

/**
 * Returns whether the given value is in the range array.
 *
 * @param range The range array to be checked.
 * @param value The value to be checked.
 * @returns `True` if the value is inside the range array, `false` otherwise.
 */
export const addressRangeContains = (range: Array<AddressRange>, value: UInt16): boolean => {
  return range.some(($range) => $range.contains(new Address(value)));
};

/**
 * The range of addresses of Unicast or Group type.
 */
export class AddressRange extends RangeObject<Address> {
  /**
   * A range containing all valid Unicast Addresses.
   */
  public static allUnicastAddresses = new AddressRange(
    new ClosedRange(Address.minUnicastAddress, Address.maxUnicastAddress),
  );
  /**
   * A range containing all Group Addresses.
   *
   * This range does not exclude Fixed Group Addresses or Virtual Addresses.
   */
  public static allGroupAddresses = new AddressRange(
    new ClosedRange(Address.minGroupAddress, Address.maxGroupAddress),
  );

  /** The lower bound of the range. */
  public get lowAddress(): Address {
    return this.range.lowerBound;
  }

  /** The upper bound of the range. */
  public get highAddress(): Address {
    return this.range.upperBound;
  }

  /**
   * Returns `true` if the address range is valid. Valid address ranges
   * are in Unicast or Group ranges.
   *
   * @returns `True` if the address range is in Unicast or Group range, `false` otherwise.
   */
  public get isValid(): boolean {
    return this.isUnicastRange || this.isGroupRange;
  }

  /**
   * Returns `true` if the address range is in Unicast address range
   *
   * @returns `True` if the address range is in Unicast address range, `false` otherwise.
   */
  public get isUnicastRange(): boolean {
    return this.lowAddress.isUnicast && this.highAddress.isUnicast;
  }

  /**
   * Returns `true` if the address range is in Group address range.
   *
   * @returns `True` if the address range is in Group address range, `false` otherwise.
   */
  public get isGroupRange(): boolean {
    return this.lowAddress.isGroup && this.highAddress.isGroup;
  }

  public static decode(jv: Record<string, unknown>) {
    // Try parsing as unicast range first, then group range
    const unicastResult = UnicastRangeSchema.safeParse(jv);
    const groupResult = GroupRangeSchema.safeParse(jv);

    if (!unicastResult.success && !groupResult.success) {
      throw new DecodingError("Address range must be valid unicast or group address range.");
    }

    const parsed = unicastResult.success ? unicastResult.data : groupResult.data!;
    const lowAddress = Address.fromHex(parsed.lowAddress);
    const highAddress = Address.fromHex(parsed.highAddress);

    if (typeof lowAddress === "undefined" || typeof highAddress === "undefined") {
      throw new DecodingError("Address must be 4-character hexadecimal string.");
    }

    return new AddressRange(new ClosedRange(lowAddress, highAddress));
  }

  public static fromAddress(address: Address, elementsCount: UInt8) {
    return new AddressRange(
      new ClosedRange(address, new Address(address.valueOf() + elementsCount - 1)),
    );
  }

  public static fromNode(node: Node) {
    return new AddressRange(node.unicastAddressRange.range);
  }
}

createModelSchema(AddressRange, {
  lowAddress: custom(
    (v: Address) => v.hex,
    (v) => v as unknown,
  ),
  highAddress: custom(
    (v: Address) => v.hex,
    (v) => v as unknown,
  ),
});
