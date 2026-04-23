import { ApplicationKey } from "../mesh-models/application-key.js";
import { Model } from "../mesh-models/model.js";
import { NetworkKey } from "../mesh-models/network-key.js";
import { Node } from "../mesh-models/node.js";

export namespace ApplicationKeys {
  /**
   * Returns a new list of Application Keys containing all the Application Keys
   * of this list NOT known to the given Node.
   *
   * @param applicationKeys List of Application Keys to filter.
   * @param node The Node used to filter Application Keys.
   * @returns A new list containing all the Application Keys of this list
   *            NOT known to the given node.
   */
  export const notKnownTo = (
    applicationKeys: Array<ApplicationKey>,
    node: Node,
  ): Array<ApplicationKey> => {
    return applicationKeys.filter((key) => !node.knowsApplicationKey(key));
  };

  /**
   * Filters the list to contain only those Application Keys, that are
   * bound to the given Network Key.
   *
   * @param applicationKeys List of Application Keys to filter.
   * @param networkKey The Network Key of interest.
   * @returns Filtered list of Application Keys.
   */
  export const boundToNetworkKey = (
    applicationKeys: Array<ApplicationKey>,
    networkKey: NetworkKey,
  ) => {
    return applicationKeys.filter((applicationKey) =>
      applicationKey.isBoundToNetworkKey(networkKey),
    );
  };

  /**
   * Returns a new list of Application Keys containing all the Application Keys
   * of this list known to the given Node.
   *
   * @param applicationKeys List of Application Keys to filter.
   * @param node The Node used to filter Application Keys.
   * @returns A new list containing all the Application Keys of this list known to the given node.
   */
  export const knownTo = (
    applicationKeys: Array<ApplicationKey>,
    node: Node,
  ): Array<ApplicationKey> => {
    return applicationKeys.filter((applicationKey) => node.knowsApplicationKey(applicationKey));
  };

  /**
   * Returns whether any of the Application Keys in the array is bound to
   * the given Network Key. The Key comparison bases on Key Index property.
   *
   * @param applicationKeys List of Application Keys to check.
   * @param networkKey The Network Key to check.
   * @returns `True`, if the array contains an Application Key bound to
   *            the given Network Key, `false` otherwise.
   */
  export function containsKeyBoundTo(
    applicationKeys: ApplicationKey[],
    networkKey: NetworkKey,
  ): boolean {
    return applicationKeys.some((key) => key.isBoundToNetworkKey(networkKey));
  }

  /**
   * Returns a list of Application Keys known to the Node, that are not
   * bound to the given Model, and therefore can be bound to it.
   *
   * @param applicationKeys List of Application Keys to check.
   * @param model The Model which keys will be excluded.
   * @returns List of Application Keys that may be bound to the given Model.
   */
  export function applicationKeysAvailableForModel(
    applicationKeys: Array<ApplicationKey>,
    model: Model,
  ): Array<ApplicationKey> {
    return applicationKeys.filter(
      (key) => !model.boundApplicationKeys.some(($key) => key.equals($key)),
    );
  }
}
