import {
  AccessError,
  AcknowledgedConfigMessage,
  AcknowledgedMeshMessage,
  Address,
  BackgroundTimer,
  BindableTinyEmitter,
  CancellationError,
  ConfigResponse,
  Data,
  DispatchQueue,
  Hex,
  LogCategory,
  LoggerHandler,
  LogLevel,
  MeshMessage,
  MeshResponse,
  ProxyConfigurationMessage,
  ProxyFilterEventHandler,
  Result,
  Storage,
  Task,
  TimeInterval,
  UInt32,
  UInt8,
  UnacknowledgedConfigMessage,
} from "@mesh-link-js/utils";
import { MeshAddress, MeshNetwork, MessageHandle, Node } from "../mesh-models/index.js";
import { Model } from "../mesh-models/model.js";
import { NetworkParametersProvider } from "./network-parameters-provider.js";
import { NetworkParameters } from "./network-parameters.js";
import { AccessLayer } from "./access-layer/access-layer.js";
import { UpperTransportLayer } from "./upper-transport-layer/upper-transport-layer.js";
import { LowerTransportLayer } from "./lower-transport-layer/lower-transport-layer.js";
import { NetworkLayer } from "./network-layer/network-layer.js";
import { hasMixin } from "ts-mixer";
import { NetworkManagerHandler } from "./network-manager-handler.js";
import { PduType, Transmitter } from "../bearer/bearer.js";
import { Element } from "../mesh-models/element.js";
import { NetworkKey } from "../mesh-models/index.js";
import { ApplicationKey } from "../mesh-models/index.js";
import { MeshNetworkManager } from "../mesh-models/mesh-network-manager.js";
import { AccessKeySet, DeviceKeySet } from "../mesh-models/key-set.js";

export class NetworkManager extends BindableTinyEmitter<NetworkManagerHandler> {
  public networkParametersProvider?: NetworkParametersProvider;
  public proxy?: ProxyFilterEventHandler<Node>;
  public logger?: LoggerHandler;
  public transmitter?: Transmitter;

  // Layers
  public accessLayer!: AccessLayer;
  public upperTransportLayer!: UpperTransportLayer;
  public lowerTransportLayer!: LowerTransportLayer;
  public networkLayer!: NetworkLayer;

  // Properties
  public meshNetwork: MeshNetwork;
  private readonly $storage: Storage;
  public get storage() {
    return this.$storage;
  }

  private outgoingMessages: Set<Hex> = new Set();

  private deliveryCallbacks: Map<Hex, (result: Result<void, Error>) => void> = new Map();

  private responseCallbacks: Map<
    Hex,
    {
      expectedOpCode: UInt32;
      callback: (result: Result<MeshResponse, Error>) => void;
    }
  > = new Map();

  private configResponseCallbacks: Map<
    Hex,
    {
      expectedOpCode: UInt32;
      callback: (result: Result<ConfigResponse, Error>) => void;
    }
  > = new Map();

  private messageCallbacks: Array<{
    source: Address;
    expectedOpCode: UInt32;
    expectedDestination: MeshAddress | undefined;
    callback: (result: Result<MeshMessage, Error>) => void;
  }> = [];

  /**
   * Mutex for possible thread synchronization.
   */
  private mutex = new DispatchQueue("NetworkManagerMutex");

  /**
   * Network parameters, as given by the `networkParametersProvider`,
   * or `NetworkParameters.default` if not set.
   */
  public get networkParameters() {
    return this.networkParametersProvider?.networkParameters ?? NetworkParameters.default;
  }

  private constructor(meshNetwork: MeshNetwork, storage: Storage) {
    super();
    this.meshNetwork = meshNetwork;
    this.$storage = storage;

    this.networkLayer = new NetworkLayer(this);
    this.lowerTransportLayer = new LowerTransportLayer(this);
    this.upperTransportLayer = new UpperTransportLayer(this);
    this.accessLayer = new AccessLayer(this);
  }

  public static fromMeshNetworkManager(manager: MeshNetworkManager): NetworkManager {
    const networkManager = new NetworkManager(manager.meshNetwork!, manager.storage);

    networkManager.bindAllEvents(manager.networkManagerHandler);
    networkManager.networkParametersProvider = manager;
    networkManager.proxy = manager.proxyFilter;
    networkManager.transmitter = manager.transmitter;
    networkManager.logger = manager.logger;
    return networkManager;
  }

  public async handle(pdu: Data, type: PduType) {
    await this.networkLayer.handleIncomingPdu(pdu, type);
  }

  public async publish(message: MeshMessage, model: Model) {
    const publish = model.publish;
    const localElement = model.parentElement;
    if (typeof publish === "undefined" || typeof localElement === "undefined") return;
    const applicationKey = this.meshNetwork.applicationKeys.find((appKey) =>
      appKey.index.equal(publish.index),
    );
    if (typeof applicationKey === "undefined") return;
    // Calculate the TTL to be used.
    const ttl =
      publish.ttl !== 0xff
        ? publish.ttl
        : (localElement.parentNode?.defaultTtl ?? this.networkParameters.defaultTtl);
    // Send the message.
    await this.accessLayer.sendMeshMessage(
      message,
      localElement,
      publish.publicationAddress,
      ttl,
      applicationKey,
      false,
    );
    // If retransmission was configured, start the timer that will retransmit.
    // There is no need to retransmit acknowledged messages, as they have their
    // own retransmission mechanism.
    if (!hasMixin(message, AcknowledgedMeshMessage)) {
      let count = publish.retransmit.count;
      if (count > 0) {
        const interval = publish.retransmit.interval / 1000;

        BackgroundTimer.scheduledTimer(interval, count > 0, async (timer) => {
          if (typeof this === "undefined") {
            timer.invalidate();
            return;
          }
          await this.accessLayer.sendMeshMessage(
            message,
            localElement,
            publish.publicationAddress,
            ttl,
            applicationKey,
            true,
          );
          count -= 1;
          if (count === 0) {
            timer.invalidate();
          }
        });
      }
    }
  }

  public async sendMeshMessage({
    message,
    element,
    destination,
    initialTtl,
    applicationKey,
  }: {
    message: MeshMessage;
    element: Element;
    destination: MeshAddress;
    initialTtl?: UInt8;
    applicationKey: ApplicationKey;
  }): Promise<void> {
    return new Task<void, Error>(async ({ resolve, reject, onCancel }) => {
      onCancel(() => {
        this.cancelMessageWithHandler(
          new MessageHandle(message, element.unicastAddress, destination, this),
        ).catch((e) =>
          this.logger?.log(
            `Failed to cancel message on cancellation: ${e}`,
            LogCategory.network,
            LogLevel.debug,
          ),
        );
      });

      if (this.outgoingMessages.has(destination.hex)) {
        reject(AccessError.busy);
        return;
      }

      this.outgoingMessages.add(destination.hex);
      this.deliveryCallbacks.set(destination.hex, (result) => {
        try {
          resolve(result.getOrThrow());
        } catch (error) {
          reject(error as Error);
        }
      });

      return this.accessLayer.sendMeshMessage(
        message,
        element,
        destination,
        initialTtl,
        applicationKey,
        false,
      );
    }).value();
  }

  public async sendAcknowledgedMeshMessage(
    message: AcknowledgedMeshMessage,
    element: Element,
    destination: Address,
    initialTtl: UInt8 | undefined,
    applicationKey: ApplicationKey,
  ): Promise<MeshResponse> {
    const meshAddress = MeshAddress.fromAddress(destination);
    return new Task<MeshResponse, Error>(async ({ resolve, reject, onCancel }) => {
      onCancel(() => {
        this.cancelMessageWithHandler(
          new MessageHandle(message, element.unicastAddress, meshAddress, this),
        ).catch((e) =>
          this.logger?.log(
            `Error cancelling message on cancellation: ${e}`,
            LogCategory.network,
            LogLevel.debug,
          ),
        );
      });

      if (this.outgoingMessages.has(meshAddress.hex)) {
        reject(AccessError.busy);
        return;
      }

      this.outgoingMessages.add(meshAddress.hex);
      this.responseCallbacks.set(meshAddress.hex, {
        expectedOpCode: message.responseOpCode,
        callback: (result) => {
          try {
            resolve(result.getOrThrow());
          } catch (error) {
            reject(error as Error);
          }
        },
      });

      return this.accessLayer.sendMeshMessage(
        message,
        element,
        meshAddress,
        initialTtl,
        applicationKey,
        false,
      );
    }).value();
  }

  public async sendUnAcknowledgedConfigMessage(
    configMessage: UnacknowledgedConfigMessage,
    element: Element,
    destination: Address,
    initialTtl: UInt8 | undefined,
    networkKey: NetworkKey,
  ): Promise<void> {
    const meshAddress = MeshAddress.fromAddress(destination);
    return new Task<void, Error>(async ({ resolve, reject, onCancel }) => {
      onCancel(() => {
        this.cancelMessageWithHandler(
          new MessageHandle(configMessage, element.unicastAddress, meshAddress, this),
        ).catch((e) =>
          this.logger?.log(
            `Error cancelling message on cancellation: ${e}`,
            LogCategory.network,
            LogLevel.debug,
          ),
        );
      });

      if (this.outgoingMessages.has(meshAddress.hex)) {
        reject(AccessError.busy);
        return;
      }

      this.outgoingMessages.add(meshAddress.hex);
      this.deliveryCallbacks.set(meshAddress.hex, (result) => {
        try {
          resolve(result.getOrThrow());
        } catch (error) {
          reject(error as Error);
        }
      });

      return this.accessLayer.sendConfigMessage(
        configMessage,
        element,
        destination,
        initialTtl,
        networkKey,
      );
    }).value();
  }

  public async sendAcknowledgedConfigMessage(
    configMessage: AcknowledgedConfigMessage,
    element: Element,
    destination: Address,
    initialTtl: UInt8 | undefined,
    networkKey: NetworkKey,
  ): Promise<ConfigResponse> {
    const meshAddress = MeshAddress.fromAddress(destination);
    return new Task<ConfigResponse, Error>(async ({ resolve, reject, onCancel }) => {
      onCancel(() => {
        this.cancelMessageWithHandler(
          new MessageHandle(configMessage, element.unicastAddress, meshAddress, this),
        ).catch((e) =>
          this.logger?.log(
            `Error cancelling message on cancellation: ${e}`,
            LogCategory.network,
            LogLevel.debug,
          ),
        );
      });

      if (this.outgoingMessages.has(meshAddress.hex)) {
        reject(AccessError.busy);
        return;
      }

      this.outgoingMessages.add(meshAddress.hex);
      this.configResponseCallbacks.set(meshAddress.hex, {
        expectedOpCode: configMessage.responseOpCode,
        callback: (result) => {
          try {
            resolve(result.getOrThrow());
          } catch (error) {
            reject(error as Error);
          }
        },
      });

      return this.accessLayer.sendConfigMessage(
        configMessage,
        element,
        destination,
        initialTtl,
        networkKey,
      );
    }).value();
  }

  public async waitForMessageWithOpCode(
    opCode: UInt32,
    address: Address,
    destination: MeshAddress | undefined,
    timeout: TimeInterval,
  ): Promise<MeshMessage> {
    return Promise.resolve()
      .then(
        () =>
          new Task<MeshMessage, Error>(({ resolve, reject, onCancel }) => {
            // Check if there is no awaiting callback for given parameters.
            const existingCallback = this.messageCallbacks.find(
              (cb) =>
                cb.source.equal(address) &&
                cb.expectedOpCode === opCode &&
                (typeof cb.expectedDestination === "undefined" ||
                  cb.expectedDestination.equal(destination)),
            );
            if (typeof existingCallback !== "undefined") {
              reject(AccessError.busy);
              return;
            }
            this.messageCallbacks.push({
              source: address,
              expectedOpCode: opCode,
              expectedDestination: destination,
              callback: (result) => {
                try {
                  resolve(result.getOrThrow());
                } catch (error) {
                  reject(error as Error);
                }
              },
            });

            onCancel(() => {
              this.notifyCallbackAwaitingMessageWithOpCode(
                opCode,
                address,
                destination,
                Result.failure(AccessError.timeout),
              );
            });
          }),
      )
      .then(async (task) => {
        const timeoutTask =
          timeout === 0
            ? undefined
            : new Task<void>(async ({ resolve }) => {
                await Task.sleep(timeout * 1000).value();
                resolve();
              });

        const result = await Promise.race([timeoutTask?.value(), task.value()]);
        timeoutTask?.cancel();
        task.cancel();

        if (hasMixin(result, MeshMessage)) return result;
        throw AccessError.timeout;
      });
  }

  public async sendProxyConfigurationMessage(message: ProxyConfigurationMessage) {
    await this.networkLayer.sendProxyConfigurationMessage(message);
  }

  public replyToAcknowledgedMessage(
    origin: Address,
    message: MeshResponse,
    element: Element,
    destination: Address,
    keySet: AccessKeySet | DeviceKeySet,
  ) {
    this.accessLayer.reply(origin, message, element, destination, keySet);
  }

  public async cancelMessageWithHandler(handler: MessageHandle) {
    await this.accessLayer.cancel(handler);
  }

  public cancelAwaitingMessageWithOpCode(opCode: UInt32, address: Address) {
    this.notifyCallbackAwaitingMessageWithOpCode(
      opCode,
      address,
      undefined,
      Result.failure(new CancellationError()),
    );
  }

  public notifyAboutNewMessage(message: MeshMessage, source: Address, destination: MeshAddress) {
    // Notify the callback awaiting the received message.
    this.notifyCallbackAwaitingMessageWithOpCode(
      message.opCode,
      source,
      destination,
      Result.success(message),
    );
    // Notify callback awaiting a response.
    if (hasMixin(message, ConfigResponse)) {
      const handler = this.configResponseCallbacks.get(source.hex);
      if (typeof handler !== "undefined" && handler.expectedOpCode === message.opCode) {
        this.configResponseCallbacks.delete(source.hex);
        handler.callback?.(Result.success(message));
      }
    }

    if (hasMixin(message, MeshResponse)) {
      const handler = this.responseCallbacks.get(source.hex);
      if (typeof handler !== "undefined" && handler.expectedOpCode === message.opCode) {
        this.responseCallbacks.delete(source.hex);
        handler.callback?.(Result.success(message));
      }
    }
    // Notify the global handler.
    this.emit("networkManagerDidReceiveMessage", this, message, source, destination);
  }

  public notifyAboutDeliveringMessage(
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
  ) {
    // Notify the delivery callback
    this.outgoingMessages.delete(destination.address.hex);

    const callback = this.deliveryCallbacks.get(destination.address.hex);
    this.deliveryCallbacks.delete(destination.address.hex);
    callback?.(Result.success(void null));

    // Notify the global handler.
    this.emit("networkManagerDidSendMessage", this, message, localElement, destination);
  }

  public notifyAboutError(
    error: Error,
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
  ) {
    // Notify the callback, that sending has failed.
    this.outgoingMessages.delete(destination.hex);

    // Notify callback awaiting a response, that sending the message has failed.
    switch (true) {
      case hasMixin(message, AcknowledgedConfigMessage): {
        let callback: ((res: Result<ConfigResponse, Error>) => void) | undefined;

        const response = this.configResponseCallbacks.get(destination.address.hex);
        if (response && response.expectedOpCode === (message.responseOpCode ?? 0)) {
          this.configResponseCallbacks.delete(destination.address.hex);
          callback = response.callback;
        }
        callback?.(Result.failure(error));
        break;
      }
      case hasMixin(message, AcknowledgedMeshMessage): {
        let callback: ((result: Result<MeshResponse, Error>) => void) | undefined;
        const response = this.responseCallbacks.get(destination.address.hex);
        if (response && response.expectedOpCode === (message.responseOpCode ?? 0)) {
          this.responseCallbacks.delete(destination.address.hex);
          callback = response.callback;
        }
        callback?.(Result.failure(error));
        break;
      }
      default: {
        const callback = this.deliveryCallbacks.get(destination.address.hex);
        this.deliveryCallbacks.delete(destination.address.hex);
        callback?.(Result.failure(error));
      }
    }

    // Notify the global handler.
    this.emit("networkManagerFailedToSendMessage", this, message, localElement, destination, error);
  }

  public notifyCallbackAwaitingMessageWithOpCode(
    opCode: UInt32,
    address: Address,
    destination: MeshAddress | undefined,
    result: Result<MeshMessage, Error>,
  ) {
    // Search for a callback matching the given criteria.
    let messageCallback: ((result: Result<MeshMessage, Error>) => void) | undefined;
    const index = this.messageCallbacks.findIndex((callback) => {
      // The source Unicast Address must match.
      const callbackSource = callback.source.equal(address);
      // The OpCode must match.
      const callbackOpCode = callback.expectedOpCode === opCode;
      // If the destination is set, it must either match the expected one,
      // or the expected should not be set (blind card).
      // The destination is not set when cancelling the callback.
      const destinationMatch =
        typeof callback.expectedDestination === "undefined" ||
        typeof destination === "undefined" ||
        destination.equal(callback.expectedDestination);
      return callbackSource && callbackOpCode && destinationMatch;
    });
    // When found, remove it, as message callbacks are single use only.
    if (index >= 0) {
      messageCallback = this.messageCallbacks.splice(index, 1)[0].callback;
    }
    // Notify the callback. It has already been removed from `messageCallbacks`
    messageCallback?.(result);
  }
}
