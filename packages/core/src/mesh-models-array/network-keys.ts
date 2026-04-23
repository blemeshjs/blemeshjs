import { NetworkKey, Node } from "../mesh-models/index.js";

export namespace NetworkKeys {
  /**
   * The primary Network Key, that is the one with key index 0.
   * If the primary Network Key is not known, it returns to `undefined`.
   */
  export const primaryKey = (networkKeys: Array<NetworkKey>): NetworkKey | undefined => {
    return networkKeys.find((key) => key.isPrimary);
  };

  /**
   * Returns a new list of Network Keys containing all the Network Keys
   * of this list known to the given Node.
   *
   * @param networkKeys An array of Network Keys to filter.
   * @param node The Node used to filter Network Keys.
   * @returns A new list containing all the Network Keys of this list known to the given node.
   */
  export const knownToNode = (networkKeys: Array<NetworkKey>, node: Node): Array<NetworkKey> => {
    return networkKeys.filter((networkKey) => node.knowsNetworkKey(networkKey));
  };
  /**
   * Returns a new list of Network Keys containing all the Network Keys
   * of this list NOT known to the given Node.
   *
   * @param networkKeys An array of Network Keys to filter.
   * @param node The Node used to filter Network Keys.
   * @returns A new list containing all the Network Keys of this list NOT known to the given node.
   */
  export const notKnownTo = (networkKeys: Array<NetworkKey>, node: Node): Array<NetworkKey> => {
    return networkKeys.filter((key) => !node.knowsNetworkKey(key));
  };
}
