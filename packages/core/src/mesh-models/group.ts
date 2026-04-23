import { alias, Clazz, createModelSchema, custom, primitive } from "serializr";
import { MeshNetwork } from "./mesh-network.js";
import { MeshAddress } from "./mesh-address.js";

/**
 * The Group object represents a user-defined group of Nodes,
 * identified by Group Address or Virtual Label.
 *
 * A group may be given a human-readable name.
 *
 * In Mesh Configuration Database a Group may have a parent Group,
 * but this is not reflected in the Mesh Profile specification. Groups
 * cannot form circle relationships.
 */
export abstract class Group {
  public abstract meshNetwork?: MeshNetwork;
  /**
   * The address property contains a 4-character hexadecimal
   * string from 0xC000 to 0xFEFF or a 32-character hexadecimal
   * string of virtual label UUID, and is the address of the group.
   */
  public abstract groupAddress: string;

  protected abstract $groupName: string;
  public abstract get groupName(): string;

  /**
   * The parentAddress property contains a 4-character hexadecimal
   * string or a 32-character hexadecimal string and represents
   * an address of a parent Group in which this group is included.
   * The value of "0000" indicates that the group is not included
   * in another group (i.e., the group has no parent).
   */
  public abstract parentAddress: string;

  /**
   * The address of the group.
   */
  public abstract address: MeshAddress;

  /**
   * Returns whether the Group is in use in the given mesh network.
   *
   * A Group in use may either be a parent of some other Group,
   * or set as a publication or subscription for any Model or any
   * Element of any Node belonging to this network.
   *
   * @returns Whether the Group is in use in the mesh network.
   */
  public abstract get isUsed(): boolean;

  public abstract equal(other: typeof this): boolean;
  /**
   * Returns whether this Group is a direct child group of the
   * given one.
   *
   * @param parent The Group to compare.
   * @returns `True` if this Group is a child group of the given one, otherwise `false`.
   */
  public abstract isDirectChildOf(parent: typeof this): boolean;

  /**
   * Returns whether this Group is the parent group of the
   * given one.
   *
   * @param child The Group to compare.
   * @returns `True` if the given Group is a child group of this one, otherwise `false`.
   */
  public abstract isDirectParentOf(child: typeof this): boolean;
}

createModelSchema(Group as unknown as Clazz<object>, {
  $groupName: alias("name", primitive()),
  address: custom(
    (v: MeshAddress) => v.hex,
    (v: string) => MeshAddress.fromHex(v),
  ),
  parentAddress: primitive(),
});
