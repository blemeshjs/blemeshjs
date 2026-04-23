import {
  Address,
  BindableTinyEmitter,
  chunkedMap,
  DispatchQueue,
  LogCategory,
  LoggerHandler,
  ProxyConfigurationMessage,
  ProxyFilterEventHandler,
  ProxyFilterHandler,
  ProxyFilterSetup,
  ProxyFilterSetupType,
  ProxyFilterType,
} from "@mesh-link-js/utils";
import { MeshNetworkManager } from "./mesh-network-manager.js";
import { SetFilterType } from "../mesh-messages/proxy-configuration/filter-type.js";
import { AddAddressesToFilter } from "../mesh-messages/proxy-configuration/add-addresses-to-filter.js";
import { BearerError } from "../bearer/bearer-error.js";
import { hasMixin } from "ts-mixer";
import { FilterStatus } from "../mesh-messages/proxy-configuration/filter-status.js";
import { RemoveAddressesFromFilter } from "../mesh-messages/proxy-configuration/remove-addresses-from-filter.js";
import { Provisioner } from "./provisioner.js";
import { Node } from "./node.js";

/**
 * The Proxy Filter class allows modification of the proxy filter on the
 * connected Proxy Node.
 *
 * Initially, upon connection to a Proxy Node, the manager will automatically
 * subscribe to the Unicast Addresses of all local Elements and all Groups
 * that at least one local Model is subscribed to, including address 0xFFFF
 * (All Nodes).
 *
 * NOTE: When a local Model gets subscribed to a new Group,
 * or is unsubscribed from a Group that no other local Model is
 * subscribed to, the proxy filter needs to be modified manually
 * by calling proper `ProxyFilter.addAddress()`
 * or `ProxyFilter.removeAddress()` method.
 */
export class ProxyFilter
  extends BindableTinyEmitter<ProxyFilterHandler>
  implements ProxyFilterEventHandler<Node>
{
  /**
   * The owner manager instance.
   *
   * The reference is weak to avoid cyclic reference.
   */
  private manager?: MeshNetworkManager;

  /**
   * A queue to call handler methods on.
   *
   * The value is set in the `MeshNetworkManager` initializer.
   */
  private handlerQueue: DispatchQueue;

  /**
   * A mutex object for internal synchronization.
   */
  private mutex = new DispatchQueue("ProxyFilterMutex");

  private $type: ProxyFilterType = ProxyFilterType.acceptList;
  /**
   * The active Proxy Filter type.
   *
   * By default, the Proxy Filter is set to `ProxyFilerType.acceptList`.
   */
  public get type(): ProxyFilterType {
    return this.$type;
  }

  private $addresses: Map<string, Address> = new Map();
  /**
   * List of addresses currently added to the Proxy Filter.
   */
  public get addresses() {
    return this.$addresses;
  }

  /**
   * A queue of proxy configuration messages enqueued to be sent.
   */
  private buffer: Array<ProxyConfigurationMessage> = [];

  /**
   * The flag is set to `true` when a request has been sent to the connected proxy.
   * It is cleared when a response was received, or in case of an error.
   */
  private busy = false;

  private $proxy?: Node;
  /**
   * The connected Proxy Node.
   *
   * This is `undefined` if no GATT Proxy Node is connected, or `UnknownNode` if the
   * connected Node is not in the local mesh configuration database.
   */
  public get proxy(): Node | undefined {
    return this.$proxy;
  }

  /**
   * The last Proxy Configuration message sent.
   */
  private request?: ProxyConfigurationMessage;

  /**
   * A shortcut to the manager's logger.
   */
  private get logger(): LoggerHandler | undefined {
    return this.manager?.logger;
  }
  /**
   * Initial configuration of the Proxy Filter for each new
   * connection to a Proxy Node.
   */
  public initialState: ProxyFilterSetup = ProxyFilterSetup.automatic;

  constructor(handlerQueue: DispatchQueue) {
    super();
    this.handlerQueue = handlerQueue;
  }

  public use(manager: MeshNetworkManager): void {
    this.manager = manager;
  }

  // NOTE: Proxy Filter Event Handler methods
  public newNetworkCreated(): void {
    this.$type = ProxyFilterType.acceptList;
    this.$addresses.clear();
    this.buffer.length = 0;
    this.busy = false;
    this.$proxy = undefined;
    this.request = undefined;
  }

  public async newProxyDidConnect() {
    const manager = this.manager;
    if (!manager) return;

    this.newNetworkCreated();
    this.logger?.i(LogCategory.proxy, "New Proxy connected");
    const localProvisioner = manager.meshNetwork?.localProvisioner;
    if (localProvisioner) {
      switch (this.initialState.type) {
        case ProxyFilterSetupType.automatic:
          await this.setup(localProvisioner);
          break;
        case ProxyFilterSetupType.rejectList:
          await this.setType(ProxyFilterType.rejectList);
          await this.addAddresses(this.initialState.addresses);
          break;
        case ProxyFilterSetupType.acceptList:
          await this.addAddresses(this.initialState.addresses);
          break;
      }
    }
  }
  public managerDidDeliverMessage(message: ProxyConfigurationMessage) {
    this.request = message;
  }

  public managerFailedToDeliverMessage(_message: ProxyConfigurationMessage, error: Error) {
    this.busy = false;
    if (error instanceof BearerError && error === BearerError.bearerClosed) {
      this.proxyDidDisconnect();
    }
  }

  public async handle(message: ProxyConfigurationMessage, proxy: Node) {
    const manager = this.manager;
    if (!manager) return;

    switch (true) {
      case hasMixin(message, FilterStatus):
        {
          let expectedListSize: number = this.addresses.size;
          this.$proxy = proxy;

          // Based on the request for which status was received, and the status
          // itself, calculate the final list of addresses.
          if (this.request) {
            switch (true) {
              // Addresses were sent in ascending order (primary unicast address first).
              // On every device there's an upper limit of the size of Proxy Filter List.
              // Assuming that devices are added in the order they were sent (as they should),
              // we must cut above the limit.
              case hasMixin(this.request, AddAddressesToFilter):
                expectedListSize = this.addresses.size + this.request.addresses.size;
                for (const [key, value] of this.request.addresses.entries()) {
                  this.$addresses.set(key, value);
                }
                break;

              // Removing is easy. We always remove all requested.
              case hasMixin(this.request, RemoveAddressesFromFilter):
                for (const key of this.request.addresses.keys()) {
                  this.$addresses.delete(key);
                }
                expectedListSize = this.addresses.size;
                break;

              // Setting the filter always resets the list.
              case hasMixin(this.request, SetFilterType):
                this.$type = this.request.filterType;
                this.addresses.clear();
                expectedListSize = 0;
                break;

              // Other values are not possible.
              default:
                break;
            }
            this.request = undefined;
          }

          // Handle buffered messages.
          const nextMessage = (() => {
            if (this.buffer.length === 0) return undefined;

            return this.buffer.shift();
          })();
          if (nextMessage) {
            // Add more addresses only when we're below the limit.
            if (expectedListSize === this.addresses.size) {
              await this.manager?.sendProxyConfigurationMessage(nextMessage);
              return;
            } else {
              this.buffer = [];
            }
          }
          this.busy = false;
          // Notify the delegate.
          void this.handlerQueue.async(() => {
            this.emit("proxyFilterUpdated", this.type, this.addresses);
          });

          // Ensure the current information about the filter is up to date.
          if (!(this.type === message.filterType && expectedListSize === message.listSize)) {
            this.logger?.w(
              LogCategory.proxy,
              `Proxy Filter limit reached: ${message.listSize} (expected: ${expectedListSize})`,
            );
            void this.handlerQueue.async(() => {
              this.emit("proxyFilterLimitReached", this.type, message.listSize);
            });
            return;
          }
        }
        break;
      default:
        // Ignore.
        break;
    }
  }

  /**
   * Clears the current filter.
   */
  public clear() {
    return this.send(new SetFilterType(this.type));
  }
  /**
   * Sends the given message to the Proxy Server. If a previous message
   * is still waiting for status, this will buffer the message and send
   * it after the status is received.
   *
   * @param message The message to be sent.
   */
  public async send(message: ProxyConfigurationMessage) {
    const manager = this.manager;
    if (!manager) return;

    if (this.busy) {
      this.buffer.push(message);
      return;
    }

    this.busy = true;

    await manager.sendProxyConfigurationMessage(message).catch(() => {
      this.busy = false;
    });
  }
  /**
   * Notifies the Proxy Filter that the connection to GATT Proxy is closed.
   *
   * This method will unset the `busy` flag.
   */
  public proxyDidDisconnect() {
    this.newNetworkCreated();

    // Clear the Proxy Network Key. This way we make sure the
    // Network Layer will handle the new incoming Secure Network beacon
    // property, even if it belongs to a non-primary network.
    if (this.manager?.networkManager?.networkLayer.proxyNetworkKey) {
      this.manager.networkManager.networkLayer.proxyNetworkKey = undefined;
    }

    // Notify the delegate.
    void this.handlerQueue.async(() => {
      this.emit("proxyFilterUpdated", ProxyFilterType.acceptList, new Map());
    });
  }

  /**
   * Adds all the addresses the Provisioner is subscribed to the
   * Proxy Filter.
   */
  public async setup(provisioner: Provisioner) {
    const node = provisioner.node;
    if (!node) return;
    // Reset the proxy filter to an empty accept list.
    await this.setType(ProxyFilterType.acceptList);
    // Add Unicast Addresses of all Elements of the Provisioner's Node.
    const addresses: Map<string, Address> = new Map(
      node.elements.map((el) => [el.unicastAddress.hex, el.unicastAddress]),
    );
    // Add all addresses that the Node's Models are subscribed to.
    const models = node.elements.flatMap((el) => el.models);
    const subscriptions = models.flatMap((el) => el.subscriptions);
    for (const address of subscriptions.map((s) => s.address.address)) {
      addresses.set(address.hex, address);
    }
    // Add All Nodes group address.
    addresses.set(Address.allNodes.hex, Address.allNodes);
    // Submit.
    await this.addAddresses(addresses);
  }

  /**
   * Adds the given Addresses to the active filter.
   *
   * @param addresses The addresses to add to the filter.
   */
  public async addAddresses(addresses: Map<string, Address>) {
    // Proxy message must fit in a single Network PDU,
    // therefore may contain maximum 5 addresses.
    for (const map of chunkedMap(addresses, 5)) {
      await this.send(new AddAddressesToFilter(map));
    }
  }

  /**
   * Sets the Filter Type on the connected GATT Proxy Node.
   * The filter will be emptied.
   *
   * @param type The new proxy filter type.
   */
  public async setType(type: ProxyFilterType) {
    await this.send(new SetFilterType(type));
  }
}
