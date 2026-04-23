import {
  Address,
  BackgroundTimer,
  TimeInterval,
  timeIntervalSinceNow,
  UInt8,
  DispatchQueue,
  LoggerHandler,
  UInt32,
  LogCategory,
  AccessError,
  typeOf,
  AcknowledgedMeshMessage,
  MeshMessage,
  TransactionMessage,
  ConfigMessage,
  ConfigAnyModelMessage,
} from "@mesh-link-js/utils";
import { random } from "lodash";
import { NetworkManager } from "../network-manager.js";
import { MeshAddress, MeshNetwork, MessageHandle } from "../../mesh-models/index.js";
import { Model } from "../../mesh-models/model.js";
import { Element } from "../../mesh-models/element.js";
import { ApplicationKey } from "../../mesh-models/index.js";
import { AccessPdu } from "./access-pdu.js";
import { hasMixin } from "ts-mixer";
import { NetworkKey } from "../../mesh-models/index.js";
import { UpperTransportPdu } from "../upper-transport-layer/upper-transport-pdu.js";
import { UnknownMessage } from "../../mesh-messages/unknown-message.js";
import { ConfigNodeReset } from "../../mesh-messages/index.js";
import { AccessKeySet, DeviceKeySet } from "../../mesh-models/key-set.js";

/**
 * The transaction object is used for Transaction Messages,
 * for example `GenericLevelSet`.
 */
class Transaction {
  /** Last used Transaction Identifier. */
  private lastTid: UInt8 = random(0, 0xff);
  /** The timestamp of the last transaction message sent. */
  private timestamp: number = Date.now();

  /**
   * Returns the last used TID.
   */
  public currentTid(): UInt8 {
    this.timestamp = Date.now();
    return this.lastTid;
  }

  /** Returns the next TID. */
  public nextTid(): UInt8 {
    if (this.lastTid < 255) {
      this.lastTid = this.lastTid + 1;
    } else {
      this.lastTid = 0;
    }
    this.timestamp = Date.now();
    return this.lastTid;
  }

  /** Whether the transaction can be continued. */
  public get isActive(): boolean {
    // A transaction may last up to 6 seconds.
    return timeIntervalSinceNow(this.timestamp) > -6;
  }
}
class AcknowledgmentContext {
  public request: AcknowledgedMeshMessage;
  public source: Address;
  public destination: Address;
  public timeoutTimer?: BackgroundTimer;
  public retryTimer?: BackgroundTimer;

  constructor(
    request: AcknowledgedMeshMessage,
    source: Address,
    destination: Address,
    delay: TimeInterval,
    repeatBlock: () => void | Promise<void>,
    timeout: TimeInterval,
    timeoutBlock: () => void | Promise<void>,
  ) {
    this.request = request;
    this.source = source;
    this.destination = destination;
    this.timeoutTimer = BackgroundTimer.scheduledTimer(
      timeout,
      false,

      async () => {
        this?.invalidate();
        await timeoutBlock();
      },
    );
    this.initializeRetryTimer(delay, repeatBlock);
  }

  /** Invalidates the timers. */
  public invalidate() {
    this.timeoutTimer?.invalidate();
    this.timeoutTimer = undefined;
    this.retryTimer?.invalidate();
    this.retryTimer = undefined;
  }

  private initializeRetryTimer(delay: TimeInterval, callback: () => void | Promise<void>) {
    this.retryTimer?.invalidate();
    this.retryTimer = BackgroundTimer.scheduledTimer(
      delay,
      false,

      async (timer) => {
        if (!this || !this.retryTimer) return;
        await callback();
        this.initializeRetryTimer(timer.interval * 2, callback);
      },
    );
  }
}
export class AccessLayer {
  private networkManager?: NetworkManager;
  private meshNetwork: MeshNetwork;
  private mutex = DispatchQueue.named("AccessLayerMutex");

  private get logger(): LoggerHandler | undefined {
    return this.networkManager?.logger;
  }
  /**
   * A map of current transactions.
   *
   * The key is a value combined from the source and destination addresses.
   */
  private transactions: Map<string, Transaction>;
  /**
   * This array contains information about the expected acknowledgments
   * for acknowledged mesh messages that have been sent, and for which
   * the response has not been received yet.
   */
  private reliableMessageContexts: Array<AcknowledgmentContext>;
  /** Publishers responsible for periodic publication from Models. */
  private publishers: Map<string, BackgroundTimer>;

  constructor(networkManager: NetworkManager) {
    this.networkManager = networkManager;
    this.meshNetwork = networkManager.meshNetwork;
    this.transactions = new Map<string, Transaction>();
    this.reliableMessageContexts = [];
    this.publishers = new Map<string, BackgroundTimer>();

    this.reinitializePublishers();
  }

  public reinitializePublishers() {
    this.networkManager?.meshNetwork.localElements
      .flatMap((element) => element.models)
      .forEach((model) => {
        this.refreshPeriodicPublisher(model);
      });
  }

  public refreshPeriodicPublisher(model: Model) {
    // Cancel current publication
    const $model = this.publishers.get(model.modelId.toString(16));
    $model?.invalidate();
    this.publishers.delete(model.modelId.toString(16));
    // Ensure a new one should start...
    const publish = model.publish;
    if (!(publish && publish.period.interval > 0)) return;
    const composer = model.handler?.publicationMessageComposer;
    if (typeof composer === "undefined") return;
    // ... and start periodic publisher.
    const publisher = BackgroundTimer.scheduledTimer(
      publish.period.interval,
      true,
      async (timer) => {
        const manager = this.networkManager;
        if (typeof manager === "undefined") {
          timer.invalidate();
          return;
        }
        await manager.publish(composer(), model);
      },
    );
    this.publishers.set(model.modelId.toString(16), publisher);
  }

  public async sendMeshMessage(
    message: MeshMessage,
    element: Element,
    destination: MeshAddress,
    initialTtl: UInt8 | undefined,
    applicationKey: ApplicationKey,
    retransmit: boolean,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    // Should the TID be updated?
    let m: MeshMessage = message;
    const transactionMessage = message;
    if (
      hasMixin(transactionMessage, TransactionMessage) &&
      typeof transactionMessage.tid === "undefined"
    ) {
      // Ensure there is a transaction for our destination.
      const k = this.keyForAcknowledgedContext(element, destination);
      this.transactions.set(
        k.toString(16),
        this.transactions.get(k.toString(16)) ?? new Transaction(),
      );
      // Should the last transaction be continued?
      if (
        (retransmit || transactionMessage.continueTransaction) &&
        this.transactions.get(k.toString(16))!.isActive
      ) {
        transactionMessage.tid = this.transactions.get(k.toString(16))!.currentTid();
      } else {
        // If not, start a new transaction by setting a new TID value.
        transactionMessage.tid = this.transactions.get(k.toString(16))!.nextTid();
      }
      m = transactionMessage;
    }

    this.logger?.i(
      LogCategory.model,
      `Sending ${m} from: ${element.unicastAddress.hex}, to: ${destination.hex}`,
    );
    const pdu = AccessPdu.fromMeshMessage(m, element.unicastAddress, destination, true);
    const keySet = new AccessKeySet(applicationKey);
    this.logger?.i(LogCategory.access, `Sending ${pdu}`);

    // Set timers for the acknowledged messages.
    // Acknowledged messages sent to a Group address won't await a Status.
    if (hasMixin(message, AcknowledgedMeshMessage) && destination.address.isUnicast) {
      this.createReliableContext(pdu, element, initialTtl, keySet);
    }

    return networkManager.upperTransportLayer.sendAccessPdu(pdu, initialTtl, keySet);
  }

  /**
   * Sends the `ConfigMessage` to the given destination.
   *
   * The message is encrypted using the Device Key which belongs to the target Node
   * and the given Network Key.
   *
   * @param message The Mesh Config Message to send.
   * @param element The source Element.
   * @param destination The destination address. This must be a Unicast Address.
   * @param initialTtl The initial TTL (Time To Live) value of the message. If `undefined`, the default Node TTL will be used.
   * @param networkKey The Network Key to sign the message with.
   */
  public async sendConfigMessage(
    message: ConfigMessage,
    element: Element,
    destination: Address,
    initialTtl: UInt8 | undefined,
    networkKey: NetworkKey,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const node = this.meshNetwork.nodeWithAddress(destination);
    if (typeof node === "undefined") return;
    const keySet = DeviceKeySet.fromNetworkKey(networkKey, node);
    if (typeof keySet === "undefined") return;

    this.logger?.i(LogCategory.foundationModel, `Sending ${message} to: ${destination.hex}`);
    const pdu = AccessPdu.fromMeshMessage(
      message,
      element.unicastAddress,
      MeshAddress.fromAddress(destination),
      true,
    );
    this.logger?.i(LogCategory.access, `Sending ${pdu}`);

    // Set timers for the acknowledged messages.
    this.createReliableContext(pdu, element, initialTtl, keySet);

    return networkManager.upperTransportLayer.sendAccessPdu(pdu, initialTtl, keySet);
  }

  public keyForAcknowledgedContext(element: Element, destination: MeshAddress): UInt32 {
    return ((element.unicastAddress.valueOf() << 16) | destination.address.valueOf()) >>> 0;
  }

  public createReliableContext(
    pdu: AccessPdu,
    element: Element,
    initialTtl: UInt8 | undefined,
    keySet: AccessKeySet | DeviceKeySet,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const request = pdu.message;
    if (!(hasMixin(request, AcknowledgedMeshMessage) && pdu.destination.address.isUnicast)) return;
    /// The TTL with which the request will be sent.
    const ttl = element.parentNode?.defaultTtl ?? networkManager.networkParameters.defaultTtl;
    /// The delay after which the local Element will try to resend the
    /// request. When the response isn't received after the first retry,
    /// it will try again every time doubling the last delay until the
    /// time goes out.
    const initialDelay = networkManager.networkParameters.acknowledgmentMessageIntervalForTtl(
      ttl,
      pdu.segmentsCount,
    );
    /// The timeout before which the response should be received.
    const timeout = networkManager.networkParameters.acknowledgmentMessageTimeout;

    const ack = new AcknowledgmentContext(
      request,
      pdu.source,
      pdu.destination.address,
      initialDelay,
      async () => {
        const networkManager = this.networkManager;
        if (typeof networkManager === "undefined") return;
        if (!networkManager.upperTransportLayer.isReceivingResponse(pdu.destination.address)) {
          this.logger?.d(LogCategory.access, `Resending ${pdu}`);
          await networkManager.upperTransportLayer.sendAccessPdu(pdu, initialTtl, keySet);
        }
      },
      timeout,
      async () => {
        const networkManager = this.networkManager;
        if (typeof networkManager === "undefined") return;
        this.logger?.w(LogCategory.access, `Response to ${pdu} not received (timeout)`);
        const category: LogCategory = hasMixin(request, AcknowledgedMeshMessage)
          ? LogCategory.foundationModel
          : LogCategory.model;
        this.logger?.w(
          category,
          `${request} sent from: ${pdu.source.hex}, to: ${pdu.destination.hex} timed out.`,
        );
        await this.cancel(new MessageHandle(request, pdu.source, pdu.destination, networkManager));

        this.reliableMessageContexts = this.reliableMessageContexts.filter(
          (ctx) => typeof ctx.timeoutTimer !== "undefined",
        );

        networkManager.notifyAboutError(AccessError.timeout, request, element, pdu.destination);
      },
    );

    this.reliableMessageContexts.push(ack);
  }

  public reply(
    origin: Address,
    message: MeshMessage,
    element: Element,
    destination: Address,
    keySet: AccessKeySet | DeviceKeySet,
  ) {
    const category = hasMixin(message, ConfigMessage)
      ? LogCategory.foundationModel
      : LogCategory.model;
    this.logger?.i(category, `Replying with ${message} to: ${destination.hex} from: ${origin.hex}`);
    const pdu = AccessPdu.fromMeshMessage(
      message,
      element.unicastAddress,
      MeshAddress.fromAddress(destination),
      false,
    );

    // If the message is sent in response to a received message that was sent to
    // a Unicast Address, the node should transmit the response message with a random
    // delay between 20 and 50 milliseconds. If the message is sent in response to a
    // received message that was sent to a group address or a virtual address, the node
    // should transmit the response message with a random delay between 20 and 500
    // milliseconds. This reduces the probability of multiple nodes responding to this
    // message at exactly the same time, and therefore increases the probability of
    // message delivery rather than message collisions.
    const delay = origin.isUnicast ? random(0.02, 0.05) : random(0.02, 0.5);

    BackgroundTimer.scheduledTimer(delay, false, async () => {
      this.logger?.i(LogCategory.access, `Sending ${pdu}`);
      await this.networkManager?.upperTransportLayer.sendAccessPdu(pdu, undefined, keySet);
    });
  }

  public async cancel(handle: MessageHandle) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;

    this.logger?.i(
      LogCategory.access,
      `Cancelling messages with opcode: ${handle.opCode.toString(16)}, sent from: ${handle.source.hex} to: ${handle.destination.hex}`,
    );

    const index = this.reliableMessageContexts.findIndex(
      (context) =>
        context.request.opCode === handle.opCode &&
        context.source.equal(handle.source) &&
        context.destination.equal(handle.destination.address),
    );
    if (index >= 0) {
      const context = this.reliableMessageContexts.splice(index, 1)[0];
      context.invalidate();
      const localNode = networkManager.meshNetwork.localProvisioner?.node;
      if (typeof localNode === "undefined") return;
      const element = localNode.elementWithAddress(handle.source);
      if (typeof element === "undefined") return;
      networkManager.notifyAboutError(
        AccessError.cancelled,
        context.request,
        element,
        handle.destination,
      );
    }
    await networkManager.upperTransportLayer.cancel(handle);
  }

  /**
   * This method handles the Upper Transport PDU and reads the Opcode.
   * If the Opcode is supported, a message object is created and sent
   * to the delegate. Otherwise, a generic MeshMessage object is created
   * for the app to handle.
   *
   * @param upperTransportPdu The decoded Upper Transport PDU.
   * @param keySet The keySet that the message was encrypted with.
   */
  public handleUpperTransportPdu(
    upperTransportPdu: UpperTransportPdu,
    keySet: AccessKeySet | DeviceKeySet,
  ) {
    const accessPdu = AccessPdu.fromUpperTransportPdu(upperTransportPdu);
    if (typeof accessPdu === "undefined") {
      return;
    }

    // If a response to a sent request has been received, cancel the context.
    let request: AcknowledgedMeshMessage | undefined;
    const index = this.reliableMessageContexts.findIndex(
      (ctx) =>
        ctx.source.equal(upperTransportPdu.destination.address) &&
        ctx.request.responseOpCode === accessPdu.opCode &&
        ctx.destination.equal(upperTransportPdu.source),
    );
    if (upperTransportPdu.destination.address.isUnicast && index !== -1) {
      const context = this.reliableMessageContexts.splice(index, 1)[0];
      request = context.request;
      context.invalidate();
      this.logger?.i(
        LogCategory.access,
        `Response ${accessPdu} received (decrypted using key: ${keySet})`,
      );
    } else {
      this.logger?.i(LogCategory.access, `${accessPdu} received (decrypted using key: ${keySet})`);
    }
    this.handleAccessPdu(accessPdu, keySet, request);
  }
  /**
   * This method delivers the received PDU to all Models that support
   * it and are subscribed to the message destination address.
   *
   * In general, each Access PDU should be consumed only by one Model
   * in an Element. For example, Generic OnOff Client may send Generic
   * OnOff Set message to the corresponding Server, which can decode it,
   * change its state and reply with Generic OnOff Status message, that
   * will be consumed by the Client.
   *
   * However, nothing stop the developers to reuse the same opcode in
   * multiple Models. For example, there may be a Log Model on an Element,
   * which accepts all opcodes supported by other Models on this Element,
   * and logs the received data. The Log Models, instead of decoding the
   * received Access PDU to Generic OnOff Set message, it may decode it as
   * some "Message X" type.
   *
   * This method will make sure that each Model will receive a message
   * decoded to the type specified in `ModelHandler.messageTypes` in its
   * `ModelHandler`, but the manager's handler will be notified with
   * the first message only.
   *
   * @param accessPdu The Access PDU received.
   * @param keySet The set of keys that the message was encrypted with.
   * @param request The previously sent request message, that the received message responds to, or `undefined`, if no request has been sent.
   */
  public handleAccessPdu(
    accessPdu: AccessPdu,
    keySet: AccessKeySet | DeviceKeySet,
    request: AcknowledgedMeshMessage | undefined,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const localNode = this.meshNetwork.localProvisioner?.node;
    if (typeof localNode === "undefined") return;

    // The Access PDU is decoded into a Mesh Message.
    let newMessage: MeshMessage | undefined;

    // If the message was encrypted using an Application Key...
    if (keySet instanceof AccessKeySet) {
      // ..iterate through all the Elements of the local Node.
      for (const element of localNode.elements) {
        // For each of the Models (except those that require Device Key)...
        const models = element.models.filter((model) => !model.requiresDeviceKey);
        for (const model of models) {
          // check, if the delegate is set, and it supports the opcode
          // specified in the received Access PDU.
          const handler = model.handler;
          if (typeof handler !== "undefined") {
            const message = handler.decode(accessPdu);
            if (typeof message !== "undefined") {
              // Save and log only the first decoded message (see method's comment).
              if (typeof newMessage === "undefined") {
                this.logger?.i(
                  LogCategory.model,
                  `${message} received from: ${accessPdu.source.hex}, to: ${accessPdu.destination.hex}`,
                );
                newMessage = message;
              } else if (
                typeof newMessage !== "undefined" &&
                typeOf(message) !== typeOf(newMessage)
              ) {
                // If another model's delegate decoded the same message to a different
                // type, log this with a warning. This other type will be delivered
                // to the delegate, but not to the global network delegate.
                this.logger?.w(LogCategory.model, `${message} already decoded as ${newMessage}`);
              }
              // Deliver the message to the Model if it was signed with an
              // Application Key bound to this Model and the message is
              // targeting this Element, or the Model is subscribed to the
              // destination address.
              //
              // Note:   Messages sent to .allNodes address shall be processed
              //         only by Models on the Primary Element.
              //         See Bluetooth Mesh Profile 1.0.1, chapter 3.4.2.4.
              // Note 2: As the iOS implementation does not support Relay, Proxy or Friend
              //         Features, the messages sent to those addresses shall only be
              //         processed if the Model is explicitly subscribed to these addresses.
              if (
                (accessPdu.destination.address.equal(Address.allNodes) && element.isPrimary) ||
                accessPdu.destination.address.equal(element.unicastAddress) ||
                model.isSubscribedToMeshAddress(accessPdu.destination)
              ) {
                if (keySet.applicationKey.isBoundToModel(model)) {
                  const response = handler.modelDidReceiveMessage(
                    model,
                    message,
                    accessPdu.source,
                    accessPdu.destination,
                    request,
                  );
                  if (typeof response !== "undefined") {
                    networkManager.replyToAcknowledgedMessage(
                      accessPdu.destination.address,
                      response,
                      element,
                      accessPdu.source,
                      keySet,
                    );
                  }
                  // TODO: handle scene client handler.
                  // if (hasMixin(handler, SceneClientHandler)) {
                  //   networkManager.handler?.networkDidChange();
                  // }
                } else {
                  const modelName = model.name ?? "model";
                  const element = model.parentElement!;
                  this.logger?.w(
                    LogCategory.model,
                    `Local ${modelName} model on ${element} not bound to key: ${keySet.applicationKey}`,
                  );
                }
              }
            }
          }
        }
      }
    } else {
      // .. otherwise, the Device Key was used.
      const models = localNode.elements.flatMap((element) =>
        element.models.filter((model) => model.supportsDeviceKey),
      );
      for (const model of models) {
        // Check, if the delegate is set, and it supports the opcode
        // specified in the received Access PDU.
        const handler = model.handler;
        if (typeof handler !== "undefined") {
          const message = handler.decode(accessPdu);
          if (typeof message !== "undefined") {
            newMessage = message;
            // Is this message targeting the local Node?
            if (localNode.containsElementWithAddress(accessPdu.destination.address)) {
              this.logger?.i(
                LogCategory.foundationModel,
                `${message} received from: ${accessPdu.source.hex}`,
              );
              const response = handler.modelDidReceiveMessage(
                model,
                message,
                accessPdu.source,
                accessPdu.destination,
                request,
              );
              if (typeof response !== "undefined") {
                networkManager.replyToAcknowledgedMessage(
                  accessPdu.destination.address,
                  response,
                  model.parentElement!,
                  accessPdu.source,
                  keySet,
                );

                // Some Config Messages require special handling.
                this.handleMeshMessage(message);
              }
              networkManager.emit("networkDidChange");
            } else {
              // If not, it was received by adding another Node's address to the Proxy Filter.
              this.logger?.i(
                LogCategory.foundationModel,
                `${message} received from: ${accessPdu.source.hex}, to: ${accessPdu.destination.hex}`,
              );
            }
            // A message can only be handled by a single Model, so we can break here.
            break;
          }
        }
      }
    }
    // If the message has not been decoded and handled by any Model Delegate,
    // return it to the user as an Unknown Message.
    // To support it, create a Model Delegate and add it to local elements.
    if (typeof newMessage === "undefined") {
      const unknownMessage = UnknownMessage.fromParameters(accessPdu.parameters);
      unknownMessage.opCode = accessPdu.opCode;
      newMessage = unknownMessage;
    }
    networkManager.notifyAboutNewMessage(newMessage, accessPdu.source, accessPdu.destination);
  }
  /**
   * This method handles selected config messages in a special way.
   */
  handleMeshMessage(message: MeshMessage) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    // TODO: Reload Heartbeat publishing.
    // if (hasMixin(message, ConfigHeartbeatPublicationSet)) {
    //   networkManager.upperTransportLayer.refreshHeartbeatPublisher();
    // }
    //
    // Reload Model publishing.
    // TODO: implement other messages that require periodic publishing.
    // (hasMixin(message, ConfigModelPublicationSet) ||
    //   hasMixin(message, ConfigModelPublicationVirtualAddressSet)) &&
    if (hasMixin(message, ConfigAnyModelMessage)) {
      const localNode = this.meshNetwork.localProvisioner?.node;
      if (typeof localNode !== "undefined") {
        const element = localNode.elementWithAddress(message.elementAddress);
        if (typeof element !== "undefined") {
          const model = element.modelWithModelId(message.modelId);
          if (typeof model !== "undefined") {
            this.refreshPeriodicPublisher(model);
          }
        }
      }
    }
    // TODO: Handle a case when a remote Node resets the local one.
    // The ConfigResetStatus has already been sent.
    if (hasMixin(message, ConfigNodeReset)) {
      networkManager.emit("networkDidReset");
    }
  }
}
