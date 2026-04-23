import { KeyIndex } from "@mesh-link-js/utils";
import { NetworkKey, ApplicationKey, Node } from "../mesh-models/index.js";

export namespace Nodes {
  /**
   * Returns whether any of elements of this array is using the given
   * Network Key.
   *
   * @param nodes The array of Nodes to check.
   * @param networkKey The Network Key to look for.
   * @returns `True` if any of the Nodes have knowledge about the
   *            Application Key with the same Key Index as given key,
   *            `false` otherwise.
   */
  export function knowsNetworkKey(nodes: Node[], networkKey: NetworkKey): boolean {
    return Nodes.knowsNetworkKeyIndex(nodes, networkKey.index);
  }

  /**
   * Returns whether any of elements of this array is using an
   * Network Key with given Key Index.
   *
   * @param nodes The array of Nodes to check.
   * @param networkKeyIndex The Network Key Index to look for.
   * @returns `True` if any of the Nodes have knowledge about the
   *            Network Key Index, `false` otherwise.
   */
  export function knowsNetworkKeyIndex(nodes: Node[], networkKeyIndex: KeyIndex): boolean {
    return nodes.some((node) => node.knowsNetworkKeyIndex(networkKeyIndex));
  }
  /**
   * Returns whether any of elements of this array is using the given
   * Application Key.
   *
   * @param nodes The array of Nodes to check.
   * @param applicationKey The Application Key to look for.
   * @returns `True` if any of the Nodes have knowledge about the Application Key with the same Key Index as given key, `false` otherwise.
   */
  export function knowsApplicationKey(nodes: Node[], applicationKey: ApplicationKey): boolean {
    return knowsApplicationKeyIndex(nodes, applicationKey.index);
  }

  /**
   * Returns whether any of elements of this array is using an
   * Application Key with given Key Index.
   *
   * @param nodes The array of Nodes to check.
   * @param applicationKeyIndex The Application Key Index to look for.
   * @returns `True` if any of the Nodes have knowledge about the Application Key Index, `false` otherwise.
   */
  export function knowsApplicationKeyIndex(nodes: Node[], applicationKeyIndex: KeyIndex): boolean {
    return nodes.some((node) => node.knowsApplicationKeyIndex(applicationKeyIndex));
  }
}
