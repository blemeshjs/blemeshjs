import {
  AccessError,
  Address,
  BindableTinyEmitter,
  Data,
  Location,
  DispatchQueue,
  IvIndex,
  LogCategory,
  LoggerHandler,
  MeshNetworkError,
  Result,
  Storage,
  Task,
  UInt8,
  UserDefaults,
  AttentionTimerHandler,
  MeshMessage,
  ProxyConfigurationMessage,
  AcknowledgedMeshMessage,
  MeshResponse,
  UnacknowledgedMeshMessage,
  AcknowledgedConfigMessage,
  ConfigResponse,
} from "@blemeshjs/utils";
import { NetworkManagerHandler } from "../layers/network-manager-handler.js";
import { MeshNetworkHandler } from "./mesh-network-handler.js";
import { MeshData } from "./mesh-data.js";
import { NetworkParametersProvider } from "../layers/network-parameters-provider.js";
import { NetworkManager } from "../layers/network-manager.js";
import { ProxyFilter } from "./proxy-filter.js";
import { Bearer, PduType, ProvisioningBearer, Transmitter } from "../bearer/bearer.js";
import { NetworkParameters } from "../layers/index.js";
import {
  ApplicationKey,
  Element,
  MeshAddress,
  MeshNetwork,
  MessageHandle,
  Model,
  NetworkKey,
  Node,
  Provisioner,
} from "./index.js";
import { action, computed, makeObservable } from "mobx";
import { z } from "zod";
import { uint8ArrayToString } from "uint8array-extras";
import { serialize } from "serializr";
import { ProvisioningManager, UnprovisionedDevice } from "../provisioning/index.js";
import { hasMixin } from "ts-mixer";
import { ConfigNetKeyDelete } from "../mesh-messages/index.js";

export type MeshDataCtor<T extends MeshData> = {
  new (): T;
};

export type MeshNetworkCtor<T extends MeshNetwork> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any): T;
};

class $NetworkManagerHandler implements NetworkManagerHandler {
  constructor(public manager: MeshNetworkManager) {}

  public networkDidChange() {
    this.manager
      .save()
      .catch((error: Error) =>
        this.manager.logger?.e(
          LogCategory.network,
          `Failed to save Mesh Network Manager state: ${error}`,
        ),
      );
  }

  public networkDidReset(): void {
    const meshNetwork = this.manager.meshNetwork;
    if (meshNetwork === undefined) return;
    const provisioner = meshNetwork.localProvisioner;
    if (provisioner === undefined) return;
    // Create a new network. The same local Provisioner can be used.
    // List of Local Elements is restored for the new network.
    const localElements = this.manager.localElements;
    provisioner.meshNetwork = undefined;
    this.manager.createNewMeshNetworkWithNameAndProvisioner(meshNetwork.meshName, provisioner);
    this.manager.localElements = localElements;
  }

  // NOTE: Network Manager Handler Methods
  public networkManagerDidReceiveMessage(
    _manager: NetworkManager,
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
  ): void {
    void this.manager.handlerQueue.async(() => {
      this.manager.emit(
        "meshNetworkManagerDidReceiveMessage",
        this.manager,
        message,
        source,
        destination,
      );
    });
  }

  public networkManagerDidSendMessage(
    _manager: NetworkManager,
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
  ): void {
    void this.manager.handlerQueue.async(() => {
      this.manager.emit(
        "meshNetworkManagerDidSendMessage",
        this.manager,
        message,
        localElement,
        destination,
      );
    });
  }

  public networkManagerFailedToSendMessage(
    _manager: NetworkManager,
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
    error: Error,
  ): void {
    void this.manager.handlerQueue.async(() => {
      this.manager.emit(
        "meshNetworkManagerFailedToSendMessage",
        this.manager,
        message,
        localElement,
        destination,
        error,
      );
    });
  }
}

/**
 * The main object responsible for managing the mesh network.
 */
export class MeshNetworkManager<
  MD extends MeshData = MeshData,
  MN extends MeshNetwork = MeshNetwork,
>
  extends BindableTinyEmitter<AttentionTimerHandler & MeshNetworkHandler>
  implements NetworkParametersProvider
{
  private meshData: MD;
  /**
   * The delegate will receive callbacks whenever a complete
   * Mesh Message has been received and reassembled.
   */
  private $networkManagerHandler: $NetworkManagerHandler = new $NetworkManagerHandler(this);

  public get networkManagerHandler(): $NetworkManagerHandler {
    return this.$networkManagerHandler;
  }

  /**
   * The Network Layer handler.
   */
  private $networkManager?: NetworkManager;

  public get networkManager(): NetworkManager | undefined {
    return this.$networkManager;
  }

  /**
   * Storage to keep the app data.
   */
  private readonly $storage: Storage;

  public get storage(): Storage {
    return this.$storage;
  }

  /**
   * A queue to call handler methods on.
   */
  public handlerQueue: DispatchQueue;

  /**
   * The Proxy Filter state.
   */
  public proxyFilter: ProxyFilter;

  private $transmitter?: Transmitter;
  /**
   * The sender object should send PDUs created by the manager
   * using any Bearer.
   */
  public get transmitter(): Transmitter | undefined {
    return this.$transmitter;
  }
  public set transmitter(value: Transmitter) {
    this.$transmitter = value;
    if (this.$networkManager) {
      this.$networkManager.transmitter = value;
    }
  }
  private readonly $logger?: LoggerHandler;
  /**
   * The logger handler will be called whenever a new log entry is created.
   */
  public get logger(): LoggerHandler | undefined {
    return this.$logger;
  }
  public set logger(value: LoggerHandler) {
    // @ts-expect-error set logger is readonly
    this.$logger = value;
    if (this.$networkManager) {
      this.$networkManager.logger = value;
    }
  }

  public networkParameters: NetworkParameters = NetworkParameters.default;

  public get meshNetwork(): MeshNetwork | undefined {
    return this.meshData.meshNetwork;
  }

  public get isNetworkCreated(): boolean {
    return typeof this.meshData.meshNetwork !== "undefined";
  }

  public get localElements(): Array<Element> {
    return this.meshNetwork?.localElements ?? [];
  }

  public set localElements(elements: Array<Element>) {
    if (typeof this.meshNetwork === "undefined" || typeof this.$networkManager === "undefined") {
      return;
    }
    // Some models, which are supported by the library, will be added automatically.
    // Let's make sure they are not in the array.
    elements.forEach((element) => {
      element.removePrimaryElementModels();
    });
    // Remove all empty Elements.
    elements = elements.filter((element) => element.models.length > 0);
    // Add the required Models in the Primary Element.
    if (elements.length === 0) {
      elements.push(Element.fromLocation(Location.unknown));
    }
    elements[0].addPrimaryElementModels(this.meshNetwork, this);

    this.meshNetwork.localElements = elements;
    this.$networkManager.accessLayer.reinitializePublishers();
  }

  public constructor(
    storage: Storage,
    MeshDataClass: MeshDataCtor<MD>,
    private MeshNetworkClass: MeshNetworkCtor<MN>,
    handlerQueue: DispatchQueue = DispatchQueue.main,
  ) {
    super();
    this.$storage = storage;
    this.meshData = new MeshDataClass();
    this.handlerQueue = handlerQueue;
    this.proxyFilter = new ProxyFilter(handlerQueue);

    // Only now this can be used.
    this.proxyFilter.use(this);

    makeObservable(this, {
      isNetworkCreated: computed,
      clear: action,
      load: action,
      createNewMeshNetworkWithNameAndProvisioner: action,
    });
  }

  // NOTE: Mesh Network API
  /**
   * Generates a new Mesh Network configuration with default values.
   *
   * This method will override the existing configuration, if such exists.
   * The mesh network will contain one `Provisioner` with the given name
   * and randomly generated Primary Network Key.
   *
   * @param name The user given network name.
   * @param provisionerName The user given local provisioner name.
   */
  public createNewMeshNetworkWithNameAndProvisionerName(
    name: string,
    provisionerName: string,
  ): MeshNetwork | MeshNetworkError {
    return this.createNewMeshNetworkWithNameAndProvisioner(
      name,
      Provisioner.fromName(provisionerName),
    );
  }

  /**
   * Generates a new Mesh Network configuration with default values.
   *
   * This method will override the existing configuration, if such exists.
   * The mesh network will contain the given ``Provisioner``
   * and randomly generated Primary Network Key.
   *
   * @param name The user given network name.
   * @param provisioner The default Provisioner.
   */
  public createNewMeshNetworkWithNameAndProvisioner(
    name: string,
    provisioner: Provisioner,
  ): MeshNetwork | MeshNetworkError {
    const network = new this.MeshNetworkClass(name, this.storage);

    // Add a new default provisioner.
    const error = network.addProvisioner(provisioner);

    if (error instanceof MeshNetworkError) return error;

    this.meshData.meshNetwork = network;
    this.$networkManager = NetworkManager.fromMeshNetworkManager(this);
    return network;
  }

  /**
   * Loads the Mesh Network configuration from the `Storage` set in the initiator
   * of the manager.
   */
  public async load(): Promise<void> {
    const data = await this.$storage.load();
    if (typeof data === "undefined") throw new Error("No data to load");
    const StringToAnyObject = z.record(z.string(), z.any());
    const json = StringToAnyObject.parse(JSON.parse(uint8ArrayToString(data)));
    const decoded = this.meshData.decode(json, this.$storage);
    if (!decoded) throw new Error("Failed to decode Mesh Network data");
    const meshNetwork = this.meshData.meshNetwork;
    if (typeof meshNetwork === "undefined")
      throw new Error("No Mesh Network found in the loaded data");
    // Restore the last IV Index.
    const defaults = UserDefaults.instance(meshNetwork.uuid.uuidString, this.$storage);
    if (typeof defaults !== "undefined") {
      const map = StringToAnyObject.safeParse(await defaults.get(IvIndex.indexKey));
      if (map.success) {
        const ivIndex = IvIndex.fromMap(map.data);
        if (typeof ivIndex !== "undefined") {
          meshNetwork.ivIndex = ivIndex;
        }
      }
      this.$networkManager = NetworkManager.fromMeshNetworkManager(this);
      this.proxyFilter.newNetworkCreated();
      return;
    }
    throw new Error("Could not load Mesh Network");
  }

  /**
   * Saves the Mesh Network configuration in the ``Storage`` given in the initiator
   * of the manager.
   *
   * If storage was not specified, the local file will be used.
   */
  public async save(): Promise<void> {
    if (this.meshData.meshNetwork !== undefined) {
      const data = serialize(MeshNetwork, this.meshNetwork);
      await this.$storage.set("meshNetwork", data);
      return;
    }
    throw new Error("No Mesh Network to save");
  }

  /**
   * Forgets the currently loaded network and saves the state.
   *
   * The manager gets to the state as if no ``load()`` or ``createNewMeshNetwork()``
   * was called.
   */
  public async clear(): Promise<void> {
    this.meshData.meshNetwork = undefined;
    this.$networkManager = undefined;
    await this.storage.clear();
  }

  public async export(): Promise<Data> {
    const data = await this.storage.load();
    if (!data) throw new Error("No data to export");
    return data;
  }

  /**
   * This method should be called whenever a PDU has been received from the mesh
   * network using any bearer.
   *
   * When a complete Mesh Message is received and reassembled, the delegate's
   * `MeshNetworkDelegate.meshNetworkManager()`
   * will be called.
   *
   * For easier integration with `GattBearer`, instead of calling this method,
   * set the manager as Bearer's `Bearer.dataDelegate`.
   *
   * @param data The PDU received.
   * @param type The PDU type.
   */
  bearerDidDeliverData = (_bearer: Bearer, data: Data, type: PduType) => {
    const networkManager = this.$networkManager;
    if (typeof networkManager === "undefined") return;
    queueMicrotask(() => {
      networkManager.handle(data, type).catch((error: Error) => {
        console.error("Error handling PDU:", error);
      });
    });
  };

  /**
   * This method returns the `ProvisioningManager` that can be used
   * to provision the given device.
   *
   * @param unprovisionedDevice The device to be added to mesh network.
   * @param bearer The Provisioning Bearer to be used for sending provisioning PDUs.
   * @returns The Provisioning manager that should be used to continue provisioning process after identification.
   * @returns This method returns an error when the mesh network has not been created, or a Node or a Provisioner with the same UUID already exist in the network.
   */
  provisionUnprovisionedDevice(
    unprovisionedDevice: UnprovisionedDevice,
    bearer: ProvisioningBearer,
  ): ProvisioningManager | MeshNetworkError {
    const meshNetwork = this.meshNetwork;
    if (typeof meshNetwork === "undefined") return MeshNetworkError.noNetwork;
    return new ProvisioningManager(unprovisionedDevice, bearer, meshNetwork);
  }

  /**
   * Sends the Proxy Configuration Message to the connected Proxy Node.
   *
   * This method will only work if the bearer uses is GATT Proxy.
   *
   * The message will be encrypted and sent to the `Transmitter`, which
   * should deliver the PDU to the connected Node.
   *
   * @param message The Proxy Configuration message to be sent.
   * @throws This method throws when the mesh network has not been created.
   */
  async sendProxyConfigurationMessage(message: ProxyConfigurationMessage) {
    const networkManager = this.$networkManager;
    if (!networkManager) {
      console.error("Error: Mesh Network not created");
      throw MeshNetworkError.noNetwork;
    }
    await new Task<void>(async ({ resolve }) => {
      await networkManager.sendProxyConfigurationMessage(message);
      resolve();
    }).value();
  }
  /**
   * Sends a Configuration Message to the Node with given destination Address.
   *
   * The `destination` must be a Unicast Address, otherwise the method
   * throws an `AccessError.invalidDestination` error.
   *
   * Apart from the `completion` callback, an appropriate callback of the
   * `MeshNetworkHandler` will be called when the message has been sent
   * successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param destination The destination Unicast Address.
   * @param initialTtl The initial TTL (Time To Live) value of the message.
   *                  If `undefined`, the default Node TTL will be used.
   * @param networkKey  The Network Key to sign the message. The Node must
   *                  know this key. If `nil`, the first Network Key known to the
   *                  Node (that is not being deleted), which is also known by the
   *                  GATT Proxy Node, will be used.
   * @param completion The completion handler which is called when the response
   *                  has been received.
   * @throws This method throws when the mesh network has not been created,
   *           the local Node does not have configuration capabilities
   *           (no Unicast Address assigned), or the destination address
   *           is not a Unicast Address or it belongs to an unknown Node.
   *           Error `AccessError.cannotDelete` is sent when trying to
   *           delete the last Network Key on the device.
   * @returns Message handle that can be used to cancel sending.
   */
  public async sendAcknowledgedConfigMessageToAddress({
    message,
    destination,
    initialTtl,
    networkKey,
    completion,
  }: {
    message: AcknowledgedConfigMessage;
    destination: Address;
    initialTtl?: UInt8;
    networkKey?: NetworkKey;
    completion?: (result: Result<ConfigResponse, Error>) => void;
  }): Promise<MessageHandle> {
    const networkManager = this.$networkManager;
    const meshNetwork = networkManager?.meshNetwork;
    if (!networkManager || !meshNetwork) {
      console.error("Error: Mesh Network not created");
      throw MeshNetworkError.noNetwork;
    }

    const localProvisioner = meshNetwork.localProvisioner;
    const source = localProvisioner?.node?.primaryElement;
    if (!localProvisioner || !source) {
      console.error("Error: Local Provisioner has no Unicast Address assigned");
      throw AccessError.invalidSource;
    }

    if (!destination.isUnicast) {
      console.error(`Error: Address: 0x${destination.hex} is not a Unicast Address`);
      throw AccessError.invalidDestination;
    }

    const node = meshNetwork.nodeWithAddress(destination);
    if (node === undefined) {
      console.error("Error: Unknown destination Node");
      throw AccessError.invalidDestination;
    }
    if (networkKey) {
      if (!node.knowsNetworkKey(networkKey)) {
        console.error("Error: Node does not know the given Network Key");
        throw AccessError.invalidKey;
      }
    }

    networkKey =
      networkKey ??
      node.networkKeys.find((key) => {
        // A key that is being deleted cannot be used to send a message.
        return (
          (hasMixin(message, ConfigNetKeyDelete)
            ? !message?.networkKeyIndex.equal(key.index)
            : true) &&
          // Unless the message is sent locally, take only keys known to the Proxy Node.
          (node.isLocalProvisioner || this.proxyFilter.proxy?.knowsNetworkKey(key) == true)
        );
      });
    if (!networkKey) {
      if (hasMixin(message, ConfigNetKeyDelete)) {
        console.error(
          "Error: Cannot delete the last Network Key or a key used to secure the message",
        );
        throw AccessError.cannotDelete;
      }
      console.error("Error: No GATT Proxy connected or no common Network Keys");
      throw AccessError.cannotRelay;
    }

    if (!node.deviceKey) {
      console.error("Error: Node's Device Key is unknown");
      throw AccessError.noDeviceKey;
    }
    if (initialTtl !== undefined && initialTtl <= 127) {
      console.error(`Error: TTL value ${initialTtl} is invalid`);
      throw AccessError.invalidTtl;
    }
    await new Task(async () => {
      try {
        this.ensureNetworkKey(networkKey);

        const response = await networkManager.sendAcknowledgedConfigMessage(
          message,
          source,
          destination,
          initialTtl,
          networkKey,
        );
        if (completion) {
          await this.handlerQueue.async(() => {
            completion(Result.success(response));
          });
        }
      } catch (error) {
        if (completion) {
          await this.handlerQueue.async(() => {
            completion(Result.failure(error instanceof Error ? error : new Error(String(error))));
          });
        }
      }
    }).value();
    return new MessageHandle(
      message,
      source.unicastAddress,
      MeshAddress.fromAddress(destination),
      networkManager,
    );
  }

  /**
   * Sends a Configuration Message to the primary Element on the given `Node`.
   *
   * Apart from the `completion` callback, an appropriate callback of the
   * `MeshNetworkHandler` will be called when the message has been sent
   * successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param node The destination Node.
   * @param initialTtl The initial TTL (Time To Live) value of the message.
   *                 If `undefined`, the default Node TTL will be used.
   * @param networkKey The Network Key to sign the message. The Node must
   *                 know this key. If `undefined`, the first Network Key known to the
   *                 Node (that is not being deleted), which is also known by the
   *                 GATT Proxy Node, will be used.
   * @param completion The completion handler which is called when the response
   *                 has been received.
   * @returns This method throws when the mesh network has not been created,
   *           the local Node does not have configuration capabilities
   *           (no Unicast Address assigned), or the destination address
   *           is not a Unicast Address or it belongs to an unknown Node.
   *           Error `AccessError.cannotDelete` is sent when trying to
   *           delete the last Network Key on the device.
   * @returns Message handle that can be used to cancel sending.
   */
  public sendAcknowledgedConfigMessageToNode({
    message,
    node,
    initialTtl,
    networkKey,
    completion,
  }: {
    message: AcknowledgedConfigMessage;
    node: Node;
    initialTtl?: UInt8;
    networkKey?: NetworkKey;
    completion?: (result: Result<ConfigResponse, Error>) => void;
  }): Promise<MessageHandle> {
    return this.sendAcknowledgedConfigMessageToAddress({
      message,
      destination: node.primaryUnicastAddress,
      initialTtl,
      networkKey,
      completion,
    });
  }

  /**
   * Encrypts the message with the given Application Key and the Network Key
   * bound to it, and sends it to the Node to which the Model belongs to.
   *
   * The key must be bound to the given Model. If the key is not provided, the first
   * Application Key bound to the target Model, which is also known by the GATT Proxy
   * Node, will be used.
   *
   * An appropriate callback of the ``MeshNetworkDelegate`` will be called when
   * the message has been sent successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param localElement The source Element. If `undefined`, the primary
   *                     Element will be used. The Element must belong
   *                     to the local Provisioner's Node.
   * @param model The destination Model.
   * @param initialTtl The initial TTL (Time To Live) value of the message.
   *                     If `undefined`, the default Node TTL will be used.
   * @param applicationKey The Application Key to sign the message. The key must
   *                     be bound to the given Model. If `undefined`, the first
   *                     Application Key bound to the Model will be used.
   * @throws This method throws when the mesh network has not been created,
   *           the target Model does not belong to any Element, or has
   *           no Application Key bound to it, or when
   *           the local Node does not have configuration capabilities
   *           (no Unicast Address assigned), or the given local Element
   *           does not belong to the local Node.
   * @returns The response with the expected ``AcknowledgedMeshMessage/responseOpCode``
   *            received from the target Node.
   */
  public async sendAcknowledgedMeshMessageToModel({
    message,
    localElement,
    model,
    initialTtl,
    applicationKey,
  }: {
    message: AcknowledgedMeshMessage;
    localElement?: Element;
    model: Model;
    initialTtl?: UInt8;
    applicationKey?: ApplicationKey;
  }): Promise<MeshResponse> {
    const networkManager = this.$networkManager;
    const meshNetwork = this.meshNetwork;
    if (!meshNetwork || !networkManager) {
      console.error("Error: Mesh Network not created");
      throw MeshNetworkError.noNetwork;
    }

    const element = model.parentElement;
    const node = element?.parentNode;
    if (!element || !node) {
      console.error("Error: Element does not belong to a Node");
      throw AccessError.invalidDestination;
    }

    // If the Application Key is given, check if it is bound to the Model.
    if (applicationKey) {
      if (!applicationKey.isBoundToModel(model)) {
        console.error("Error: Application Key is not bound to the Model");
        throw AccessError.modelNotBoundToAppKey;
      }
    } else {
      // If not, make sure there are any bound Application Keys.
      if (model.boundApplicationKeys.length === 0) {
        console.error("Error: No Application Keys bound to the Model");
        throw AccessError.modelNotBoundToAppKey;
      }
    }
    // Check if the Application Key is known to the Proxy Node, or
    // the message is sent to the local Node.

    applicationKey =
      applicationKey ??
      model.boundApplicationKeys.find(
        (key) =>
          // Unless the message is sent locally, take only keys known to the Proxy Node.
          node.isLocalProvisioner ||
          this.proxyFilter.proxy?.knowsNetworkKey(key.boundNetworkKey) === true,
      );
    if (!applicationKey) {
      console.error("Error: No GATT Proxy connected or no common Network Keys");
      throw AccessError.cannotRelay;
    }

    const localNode = meshNetwork.localProvisioner?.node;
    const source = localElement ?? localNode?.elements[0];
    if (!localNode || !source) {
      console.error("Error: Local Provisioner has no Unicast Address assigned");
      throw AccessError.invalidSource;
    }
    if (!source.parentNode?.equals(localNode)) {
      console.error("Error: The Element does not belong to the local Node");
      throw AccessError.invalidElement;
    }
    if (initialTtl !== undefined && initialTtl <= 127) {
      console.error(`Error: TTL value ${initialTtl} is invalid`);
      throw AccessError.invalidTtl;
    }
    this.ensureNetworkKey(applicationKey.boundNetworkKey);
    return networkManager.sendAcknowledgedMeshMessage(
      message,
      source,
      element.unicastAddress,
      initialTtl,
      applicationKey,
    );
  }

  /**
   * This message checks whether a message encrypted with the given Network Key
   * can be relayed using the connected GATT Proxy Node.
   *
   * A message may be sent to a local Node, or using a GATT Proxy Node.
   * Check if the message can be relayed to the destination using a Proxy Node.
   * The Proxy Node must know the Network Key; otherwise it will not be able to
   * decode the destination and decrement TTL.
   *
   * @param networkKey The Network Key to be used to send the message.
   */
  public ensureNetworkKey(networkKey: NetworkKey) {
    const proxy = this.proxyFilter.proxy;
    if (proxy) {
      if (!proxy.knowsNetworkKey(networkKey)) {
        this.logger?.w(
          LogCategory.proxy,
          `${proxy.name ?? "The GATT Proxy Node"} cannot relay messages using ${networkKey}, message will be sent only to the local Node.`,
        );
      }
    } else {
      this.logger?.w(
        LogCategory.proxy,
        "No GATT Proxy connected, message will be sent only to the local Node.",
      );
    }
  }

  /**
   * This method tries to publish the given message using the
   * publication information set in the ``Model``.
   *
   * If the retransmission is set to a value greater than 0, and the message
   * is unacknowledged, this method will retransmit it number of times
   * with the count and interval specified in the retransmission object.
   *
   * If the publication is not configured for the given Model, this method
   * does nothing.
   *
   * - note: This method does not check whether the given Model does support
   *         the given message. It will publish whatever message is given using
   *         the publication configuration of the given Model.
   *
   * An appropriate callback of the ``MeshNetworkDelegate`` will be called when
   * the message has been sent successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param model The model from which to send the message.
   * @returns Message handle that can be used to cancel sending.
   */
  public async publish(message: MeshMessage, model: Model): Promise<MessageHandle | undefined> {
    const networkManager = this.$networkManager;
    if (!networkManager) return;
    const publish = model.publish;
    if (!publish) return;
    const localElement = model.parentElement;
    if (!localElement) return;
    if (!this.meshNetwork?.applicationKeys.some((key) => key.index.equal(publish.index))) return;
    await new Task(async () => {
      await networkManager.publish(message, model);
    }).value();
    return new MessageHandle(
      message,
      localElement.unicastAddress,
      publish.publicationAddress,
      networkManager,
    );
  }

  /**
   * Encrypts the message with the given Application Key and the Network Key
   * bound to it, and sends it to the Node to which the Model belongs to.
   *
   * The key must be bound to the given Model. If the key is not provided, the first
   * Application Key bound to the target Model, which is also known by the GATT Proxy
   * Node, will be used.
   *
   * The method completes when the message has been sent or an error occurred.
   *
   * An appropriate callback of the ``MeshNetworkHandler`` will be called when
   * the message has been sent successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param localElement The source Element. If `undefined`, the primary Element will be used. The Element must belong to the local Provisioner's Node.
   * @param model The destination Model.
   * @param initialTtl The initial TTL (Time To Live) value of the message. If `undefined`, the default Node TTL will be used.
   * @param applicationKey The Application Key to sign the message. The key must be bound to the given Model. If `undefined`, the first Application Key bound to the Model will be used.
   * @throws This method throws when the mesh network has not been created,
   *           the target Model does not belong to any Element, or has
   *           no Application Key bound to it, or when
   *           the local Node does not have configuration capabilities
   *           (no Unicast Address assigned), or the given local Element
   *           does not belong to the local Node, or the manager failed to
   *           send the message.
   */
  public async sendUnacknowledgedMeshMessageToModel({
    message,
    localElement,
    initialTtl,
    applicationKey,
    model,
  }: {
    message: UnacknowledgedMeshMessage;
    localElement?: Element;
    model: Model;
    initialTtl?: UInt8;
    applicationKey?: ApplicationKey;
  }) {
    const element = model.parentElement;
    const node = element?.parentNode;
    if (!element || !node) {
      console.error("Error: Element does not belong to a Node");
      throw AccessError.invalidDestination;
    }
    // If the Application Key is given, check if it is bound to the Model.
    if (applicationKey) {
      if (!applicationKey.isBoundToModel(model)) {
        console.error("Error: Application Key is not bound to the Model");
        throw AccessError.invalidKey;
      }
    } else {
      // If not, make sure there are any bound Application Keys.
      if (model.boundApplicationKeys.length === 0) {
        console.error("Error: No Application Key bound to the Model");
        throw AccessError.modelNotBoundToAppKey;
      }
    }
    // Check if the Application Key is known to the Proxy Node, or
    // the message is sent to the local Node.
    applicationKey =
      applicationKey ??
      model.boundApplicationKeys.find(
        (key) =>
          // Unless the message is sent locally, take only keys known to the Proxy Node.
          node.isLocalProvisioner ||
          this.proxyFilter.proxy?.knowsNetworkKey(key.boundNetworkKey) == true,
      );
    if (!applicationKey) {
      console.error("Error: No GATT Proxy connected or no common Network Keys");
      throw AccessError.cannotRelay;
    }
    return this.sendMeshMessageToMeshAddress({
      message,
      localElement,
      initialTtl,
      applicationKey,
      destination: MeshAddress.fromAddress(element.unicastAddress),
    });
  }

  /**
   * Encrypts the message with the Application Key and the Network Key
   * bound to it, and sends to the given destination address.
   *
   * The method completes when the message has been sent or an error occurred.
   *
   * An appropriate callback of the ``MeshNetworkDelegate`` will be called when
   * the message has been sent successfully or a problem occurred.
   *
   * @param message The message to be sent.
   * @param localElement The source Element. If `undefined`, the primary Element will be used. The Element must belong to the local Provisioner's Node.
   * @param destination The destination address.
   * @param initialTtl The initial TTL (Time To Live) value of the message. If `undefined`, the default Node TTL will be used.
   * @param applicationKey The Application Key to sign the message.
   * @throws This method throws when the mesh network has not been created,
   *           the local Node does not have configuration capabilities
   *           (no Unicast Address assigned), or the given local Element
   *           does not belong to the local Node, or the manager failed to
   *           send the message.
   */
  public async sendMeshMessageToMeshAddress({
    message,
    localElement,
    destination,
    initialTtl,
    applicationKey,
  }: {
    message: MeshMessage;
    localElement?: Element;
    destination: MeshAddress;
    initialTtl?: UInt8;
    applicationKey: ApplicationKey;
  }) {
    const networkManager = this.networkManager;
    const meshNetwork = this.meshNetwork;
    if (!networkManager || !meshNetwork) {
      console.error("Error: Mesh Network not created");
      throw MeshNetworkError.noNetwork;
    }
    const localNode = meshNetwork.localProvisioner?.node;
    const element = localElement ?? localNode?.elements[0];
    if (!localNode || !element) {
      console.error("Error: Local Provisioner has no Unicast Address assigned");
      throw AccessError.invalidSource;
    }
    if (!element.parentNode?.equals(localNode)) {
      console.error("Error: The Element does not belong to the local Node");
      throw AccessError.invalidElement;
    }
    if (!(initialTtl === undefined || initialTtl <= 127)) {
      console.error(`Error: TTL value ${initialTtl} is invalid`);
      throw AccessError.invalidTtl;
    }
    this.ensureNetworkKey(applicationKey.boundNetworkKey);
    return networkManager.sendMeshMessage({
      message,
      element,
      destination,
      initialTtl,
      applicationKey,
    });
  }
}
