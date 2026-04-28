import { Clazz, createModelSchema, custom, list, primitive } from "serializr";
import { MeshNetwork } from "./mesh-network.js";
import { Address, SceneNumber } from "@blemeshjs/utils";
import { Node } from "./node.js";

/**
 * A Scene represents a set of states stored with a Scene Number.
 *
 * A Scene is identified by a `SceneNumber` and may have a
 * human-readable name associated.
 *
 * A Node having a Scene Server model can store the states of other
 * models and restore them on demand.
 *
 * A Node with a Scene Client can recall Scenes on other Nodes.
 *
 * Use `Scene.elements` to get list of `Element's with
 * the given Scene in their Scene Register.
 */
export abstract class Scene {
  public abstract meshNetwork?: MeshNetwork;
  /**
   * Scene number.
   */
  public abstract number: SceneNumber;
  /**
   * UTF-8 human-readable name of the Scene.
   */
  public abstract name: string;
  /**
   * Addresses of Elements whose Scene Register state contains this Scene.
   */
  protected abstract $addresses: Array<Address>;
  public abstract get addresses(): Array<Address>;

  /**
   * Removes all Unicast Addresses assigned to the given Node from the
   * Scene object.
   *
   * @param node The Node that is may have the Scene in any of its Scene Registers.
   */
  public abstract removeNode(node: Node): void;
}

createModelSchema(Scene as unknown as Clazz<object>, {
  number: custom(
    (v: SceneNumber) => v.hex,
    (v: string) => new SceneNumber(parseInt(v, 16)),
  ),
  name: primitive(),
  addresses: list(
    custom(
      (v: Address) => v.hex,
      (v: string) => new Address(parseInt(v, 16)),
    ),
  ),
});
