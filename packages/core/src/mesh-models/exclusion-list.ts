import { Address, DecodingError, IvIndex, UInt32, MeshCDB } from "@mesh-link-js/utils";
import { Node } from "./node.js";
import { AddressRange } from "./address-range.js";
import { produce } from "immer";
import { createModelSchema, custom, list, primitive } from "serializr";

/**
 * This object contains list of excluded Unicast Addresses for particular IV Index.
 *
 * The excluded addresses cannot be assigned to new Nodes until the current IV Index
 * is greater by 2 or more to the given one. At that point, the Seq Auth value
 * (IV Index + Sequence number) is always greater than the value used by the deleted
 * Node.
 *
 * @see IvIndex
 */
export class ExclusionList {
  /**
   * The IV Index of the mesh network that was in use while the Unicast Addresses
   * were marked as excluded.
   */
  public ivIndex: UInt32;
  /**
   * Excluded Unicast Addresses for the particular IV Index.
   */
  public addresses: Array<Address>;

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.ExclusionList.parse(jv);

    const addresses: Address[] = [];
    parsed.addresses.forEach((hex) => {
      const address = Address.fromHex(hex);
      if (typeof address === "undefined") {
        throw new DecodingError("Address must be 4-character hexadecimal.");
      }
      if (!address.isUnicast) {
        throw new DecodingError("Address must be of unicast type.");
      }
      addresses.push(address);
    });
    addresses.sort((a, b) => a.valueOf() - b.valueOf());
    const list = new ExclusionList(new IvIndex(parsed.ivIndex));
    list.addresses = addresses;
    return list;
  }

  constructor(ivIndex: IvIndex) {
    this.ivIndex = ivIndex.index;
    this.addresses = [];
  }
  /**
   * Returns whether the given Unicast Address is excluded, or not.
   *
   * @param address The Unicast Address to test.
   * @returns `True` if the Address cannot be used; `false` otherwise.
   */
  isExcluded(address: Address): boolean {
    return this.addresses.some(($address) => address.equal($address));
  }

  /**
   * Adds the given Unicast Address to exclusion list.
   *
   * @param address The address to be excluded.
   */
  excludeAddress(address: Address) {
    if (!address.isUnicast) {
      return;
    }
    this.addresses = produce(this.addresses, (draft) => {
      draft.push(address);
    });
  }

  /**
   * Adds all Unicast Addresses of all Elements on the Node to the
   * exclusion list.
   *
   * @param node The removed Node.
   */
  excludeNode(node: Node) {
    node.elements.forEach((element) => {
      this.excludeAddress(element.unicastAddress);
    });
  }
}

createModelSchema(ExclusionList, {
  ivIndex: primitive(),
  addresses: list(
    custom(
      (v: Address) => v.hex,
      (v: string) => Address.fromHex(v),
    ),
  ),
});

export namespace ExclusionListArray {
  /**
   * Removes all exclusion lists that for old values of IV Index.
   *
   * @param exclusions The list of exclusion.
   * @param ivIndex The current IV Index.
   */
  export function cleanUpExclusionsForIvIndex(
    exclusions: Array<ExclusionList>,
    ivIndex: IvIndex,
  ): Array<ExclusionList> {
    const newExclusions: Array<ExclusionList> = exclusions.filter(
      (exclusion) => exclusion.addresses.length === 0,
    );
    if (ivIndex.index < 2) return newExclusions;
    return newExclusions.filter((exclusion) => exclusion.ivIndex <= ivIndex.index - 2);
  }

  /**
   * List of excluded Unicast Addresses for the given IV Index.
   *
   * @param exclusions The list of `ExclusionList` to check.
   * @param ivIndex The current IV Index.
   * @returns An array of excluded Unicast Addresses for the given IV Index.
   */
  export const excludedAddressesForIvIndex = (
    exclusions: Array<ExclusionList>,
    ivIndex: IvIndex,
  ): Array<Address> => {
    return exclusions
      .filter(
        (exclusion) =>
          exclusion.ivIndex === ivIndex.index ||
          (ivIndex.index > 0 && exclusion.ivIndex === ivIndex.index - 1),
      )
      .flatMap((exclusion) => exclusion.addresses);
  };

  /**
   * Checks whether the given Unicast Address range cannot be reassigned to
   * a new Node, as at least one of the addresses from the given range has
   * been used by a recently removed Node.
   *
   * Unicast Addresses may be excluded, as other Nodes may still keep the
   * Sequence number associated with those addresses and may discard packets
   * sent from them until the new Sequence number exceeds the saved one.
   *
   * A Unicast Address may be reassigned to a new Node when the IV Index
   * increments by at least 2 since it has been excluded, after which
   * the Seq Auth value (IV Index + Sequence number) is always greater than
   * one used for the deleted Node.
   *
   * @param exclusions The list of `ExclusionList` to check.
   * @param range The Unicast Address range to check.
   * @param ivIndex The current IV Index.
   * @returns `True` if at least one address from the given address range is excluded; `false` otherwise.
   */
  export const containsRangeForIvIndex = (
    exclusions: Array<ExclusionList>,
    range: AddressRange,
    ivIndex: IvIndex,
  ): boolean => {
    if (exclusions.length <= 0) {
      return false;
    }
    return (
      excludedAddressesForIvIndex(exclusions, ivIndex).filter((address) => range.contains(address))
        .length !== 0
    );
  };

  /**
   * Appends Unicast Addresses of all Elements belonging to the given Node
   * to the exclusion list associated with the given IV Index.
   *
   * @param exclusions The list of `ExclusionList` to update.
   * @param node The removed Node.
   * @param ivIndex The current IV Index.
   */
  export function appendNodeToExclusionListArray(
    exclusions: ExclusionList[],
    node: Node,
    ivIndex: IvIndex,
  ) {
    let entry: ExclusionList | undefined = exclusions.find((ex) => ex.ivIndex === ivIndex.index);
    if (entry === undefined) {
      entry = new ExclusionList(ivIndex);
      exclusions.push(entry);
    }
    entry.excludeNode(node);
    return exclusions;
  }
}
