import { ProxyFilterType } from "./proxy-filter-type.js";
import { ProxyConfigurationMessage } from "../mesh-messages/index.js";
import { Address } from "../constants/index.js";
import { UInt16 } from "./number.js";

export interface ProxyFilterEventHandler<T = unknown> {
  /**
   * Clears the current Proxy Filter state.
   */
  newNetworkCreated(): void;

  /**
   * Callback called when a possible change of Proxy Node have been discovered.
   *
   * This method is called in two cases: when the first Secure Network
   * beacon was received (which indicates the first successful connection
   * to a Proxy since app was started) or when the received Secure Network
   * beacon contained information about the same Network Key as one
   * received before. This happens during a reconnection to the same
   * or a different Proxy on the same subnetwork, but may also happen
   * in other Circumstances, for example when the IV Update or Key Refresh
   * Procedure is in progress, or a Network Key was removed and added again.
   *
   * This method reloads the Proxy Filter for the local Provisioner,
   * adding all the addresses the Provisioner is subscribed to, including
   * its Unicast Addresses and All Nodes address.
   */
  newProxyDidConnect(): Promise<void>;

  /**
   * Callback called when a Proxy Configuration Message has been sent.
   *
   * This method refreshes the local type and list of addresses.
   *
   * @param message The message sent.
   */
  managerDidDeliverMessage(message: ProxyConfigurationMessage): void;

  /**
   * Callback called when the manager failed to send the Proxy
   * Configuration Message.
   *
   * This method clears the local filter and sets it back to `ProxyFilerType/acceptList`.
   * All the messages waiting to be sent are cancelled.
   *
   * @param message The message that has not been sent.
   * @param error The error received.
   */
  managerFailedToDeliverMessage(message: ProxyConfigurationMessage, error: Error): void;

  /**
   * Handler for the received Proxy Configuration Messages.
   *
   * This method notifies the delegate about changes in the Proxy Filter.
   *
   * If a mismatch is detected between the local list of services and
   * the list size received, the method will try to clear the remote
   * filter and send all the addresses again.
   *
   * If a Node with a Unicast Address of the received `FilterStatus` message
   * does not exist in the local database, the method will return an `UnknownNode`.
   *
   * @param message The message received.
   * @param proxy The connected Proxy `Node`, or `UnknownNode` if the Node
   * does not exist in the local mesh network configuration.
   */
  handle(message: ProxyConfigurationMessage, proxy: T): Promise<void>;
}
/**
 * The delegate that will be notified about changes of the Proxy Filter.
 */
export abstract class ProxyFilterHandler {
  /**
   * Method called when the Proxy Filter has been sent to proxy.
   *
   * This method is followed by `proxyFilterUpdateAcknowledged()``
   * or `proxyFilterLimitReached()`, depending on the
   * acknowledged list size.
   *
   * @param type The current Proxy Filter type.
   * @param addresses The addresses in the filter.
   */
  abstract proxyFilterUpdated(type: ProxyFilterType, addresses: Map<string, Address>): void;

  /**
   * Method called when the Proxy Filter has been acknowledged by proxy
   * and the reported list size is equal to the requested one.
   *
   * In case the reported list size is lower than expected
   * ``proxyFilterLimitReached(type:maxSize:)-1e1hd`` is called
   * instead.
   *
   * @param type The current Proxy Filter type.
   * @param listSize The addresses list's size in the filter
   */
  abstract proxyFilterUpdateAcknowledged(type: ProxyFilterType, listSize: UInt16): void;

  /**
   * This method is called when the max size of Proxy Filter list has been reached
   * and no more addresses can be added.
   *
   * The delegate can switch to ``ProxyFilerType/rejectList``
   * filter type using ``ProxyFilter/setType(_:)``. This will allow receiving
   * messages sent to more addresses than supported by the ``ProxyFilerType/acceptList``.
   *
   * @param type The current Proxy Filter type.
   * @param maxSize The maximum Proxy Filter list size.
   */
  abstract proxyFilterLimitReached(type: ProxyFilterType, maxSize: UInt16): void;
}
/**
 * An enumeration for different initial configurations of the Proxy Filter.
 */
export enum ProxyFilterSetupType {
  /**
   * In automatic Proxy Filter setup the filter will be set to
   * `ProxyFilterType.acceptList` with Unicast Addresses of all
   * local Elements, all Group Addresses with at least one local Model
   * subscribed and the All Nodes (0xFFFF) address.
   *
   * This is the default configuration.
   */
  automatic,

  /**
   * The Proxy Filter on each connected Proxy Node will be set to
   * `ProxyFilterType.acceptList` with given set of addresses.
   */
  acceptList,

  /**
   * The Proxy Filter on each connected Proxy Node will be set to
   * `ProxyFilerType.rejectList` with given set of addresses.
   */
  rejectList,
}
export type ProxyFilterSetup =
  | { type: ProxyFilterSetupType.automatic }
  | { type: ProxyFilterSetupType.acceptList; addresses: Map<string, Address> }
  | { type: ProxyFilterSetupType.rejectList; addresses: Map<string, Address> };

export namespace ProxyFilterSetup {
  export const automatic = {
    type: ProxyFilterSetupType.automatic,
  } as const;
  export function acceptList(addresses: Map<string, Address>) {
    return { type: ProxyFilterSetupType.acceptList, addresses } as const;
  }
  export function rejectList(addresses: Map<string, Address>) {
    return { type: ProxyFilterSetupType.rejectList, addresses } as const;
  }
}
