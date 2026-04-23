import {
  Address,
  BackgroundTimer,
  DispatchQueue,
  LogCategory,
  LoggerHandler,
  UInt8,
} from "@mesh-link-js/utils";
import { MeshNetwork, MessageHandle } from "../../mesh-models/index.js";
import { NetworkManager } from "../network-manager.js";
import { NetworkKey } from "../../mesh-models/index.js";
import { UpperTransportPdu } from "./upper-transport-pdu.js";
import { AccessPdu } from "../access-layer/access-pdu.js";
import { LowerTransportError } from "../lower-transport-layer/lower-transport-error.js";
import {
  LowerTransportPdu,
  LowerTransportPduType,
} from "../lower-transport-layer/lower-transport-pdu.js";
import { AccessMessage } from "../lower-transport-layer/access-message.js";
import { ControlMessage } from "../lower-transport-layer/control-message.js";
import { HeartbeatMessage } from "../lower-transport-layer/heart-beat-message.js";
import { AccessKeySet, DeviceKeySet } from "../../mesh-models/key-set.js";

export class UpperTransportLayer {
  private readonly networkManager?: NetworkManager;
  private readonly meshNetwork: MeshNetwork;
  private mutex = new DispatchQueue("UpperTransportLayerMutex");

  /**
   * This timer is responsible for publishing periodic Heartbeat messages
   * if they were requested by a remote provisioner using
   * `ConfigHeartbeatPublicationSet` message.
   */
  private heartbeatPublisher?: BackgroundTimer;

  private get logger(): LoggerHandler | undefined {
    return this.networkManager?.logger;
  }

  /**
   * The upper transport layer shall not transmit a new segmented
   * Upper Transport PDU to a given destination until the previous
   * Upper Transport PDU to that destination has been either completed
   * or cancelled.
   *
   * This map contains queues of messages targeting each destination.
   */
  private queues: Map<
    Address,
    Array<{ pdu: UpperTransportPdu; ttl?: UInt8; networkKey: NetworkKey }>
  >;

  public constructor(networkManager: NetworkManager) {
    this.networkManager = networkManager;
    this.meshNetwork = networkManager.meshNetwork;
    this.queues = new Map();
  }
  /**
   * Encrypts the Access PDU using given key set and sends it down to
   * Lower Transport Layer.
   *
   * @param accessPdu
   * @param initialTtl The initial TTL (Time To Live) value of the message.
   * If `undefined`, the default Node TTL will be used.
   * @param keySet The set of keys to encrypt the message with.
   */
  public async sendAccessPdu(
    accessPdu: AccessPdu,
    initialTtl: UInt8 | undefined,
    keySet: AccessKeySet | DeviceKeySet,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    // Get the current sequence number for source Element's address.
    const sequence = await networkManager.networkLayer.nextSequenceNumber(accessPdu.source);

    const pdu = UpperTransportPdu.fromAccessPdu(
      accessPdu,
      keySet,
      sequence,
      this.meshNetwork.ivIndex,
    );

    this.logger?.i(LogCategory.upperTransport, `Sending ${pdu} encrypted using key: ${keySet}`);

    const isSegmented = pdu.transportPdu.length > 15 || accessPdu.isSegmented;
    if (isSegmented) {
      // Enqueue the PDU. If the queue was empty, the PDU will be sent
      // immediately.
      this.enqueue(pdu, initialTtl, keySet.networkKey);
    } else {
      await networkManager.lowerTransportLayer.sendUnsegmentedUpperTransportPdu(
        pdu,
        initialTtl,
        keySet.networkKey,
      );
    }
  }

  /**
   * Returns whether the underlying layer is in progress of
   * receiving a message from the given address.
   *
   * @param address The source address.
   * @returns `True` is some, but not all packets of a segmented
   * message were received from the given source address;
   * `false` if no packets were received or the message
   * was complete before calling this method.
   */
  public isReceivingResponse(address: Address): boolean {
    return this.networkManager?.lowerTransportLayer.isReceivingMessage(address) ?? false;
  }

  /**
   * Enqueues the PDU to be sent using the given Network Key.
   *
   * @param pdu The Upper Transport PDU to be sent.
   * @param initialTtl The initial TTL (Time To Live) value of the message. If `undefined`, the default Node TTL will be used.
   * @param networkKey The Network Key to encrypt the PDU with.
   */
  public enqueue(pdu: UpperTransportPdu, initialTtl: UInt8 | undefined, networkKey: NetworkKey) {
    const destination = pdu.destination.address;
    let count = 0;
    this.queues.set(destination, this.queues.get(destination) ?? []);
    this.queues.get(destination)!.push({ pdu: pdu, ttl: initialTtl, networkKey: networkKey });
    count = this.queues.get(destination)!.length;
    if (count === 1) {
      this.sendNext(destination);
    }
  }

  /**
   * Sends the next enqueued PDU.
   *
   * If the queue for the given destination does not exist or is empty,
   * this method does nothing.
   *
   * @param destination The destination address.
   */
  public sendNext(destination: Address) {
    const pdus = this.queues.get(destination);
    if (typeof pdus === "undefined" || !pdus.length) return;
    const { ttl, networkKey, pdu } = pdus[0];
    // If another PDU has been enqueued, send it.
    this.networkManager?.lowerTransportLayer.sendSegmentedUpperTransportPdu(pdu, ttl, networkKey);
  }

  /**
   * Cancels sending all segmented messages matching given handle.
   * Unsegmented messages are sent almost instantaneously and cannot be
   * cancelled.
   *
   * @param handle The message handle.
   */
  public async cancel(handle: MessageHandle) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    let shouldSendNext = false;

    // Check if the message that is currently being sent matches the
    // handler data. If so, cancel it.
    const first = (() => {
      const pdus = this.queues.get(handle.destination.address);
      if (typeof pdus !== "undefined") return pdus[0];
      return undefined;
    })();

    if (typeof first === "undefined") return;
    if (first.pdu.message!.opCode === handle.opCode && first.pdu.source.equal(handle.source)) {
      this.logger?.d(LogCategory.upperTransport, `Cancelling sending ${first.pdu}`);
      networkManager.lowerTransportLayer.cancelSendingSegmentedUpperTransportPdu(first.pdu);
      shouldSendNext = true;
    }

    // Notify user about the cancellation of the messages.
    const localNode = networkManager.meshNetwork.localProvisioner?.node;
    if (typeof localNode !== "undefined") {
      const element = localNode.elementWithAddress(handle.source);
      if (typeof element !== "undefined") {
        await this.queues
          .get(handle.destination.address)
          ?.filter(
            (pdus) =>
              pdus.pdu.message!.opCode == handle.opCode &&
              pdus.pdu.source.equal(handle.source) &&
              pdus.pdu.destination.equal(handle.destination),
          )
          .reduce<Promise<unknown>>(
            (promise, pdus) =>
              promise.then(() =>
                networkManager.notifyAboutError(
                  LowerTransportError.cancelled,
                  pdus.pdu.message!,
                  element,
                  handle.destination,
                ),
              ),
            Promise.resolve(),
          );
      }
    }
    // Remove all enqueued messages that match the handler.
    this.queues.set(
      handle.destination.address,
      (this.queues.get(handle.destination.address) ?? []).filter((pdus) => {
        const condition =
          pdus.pdu.message!.opCode === handle.opCode &&
          pdus.pdu.source.equal(handle.source) &&
          pdus.pdu.destination.equal(handle.destination);
        return !condition;
      }),
    );
    // If sending a message was cancelled, try sending another one.
    if (shouldSendNext) {
      this.lowerTransportLayerDidSend(handle.destination.address);
    }
  }

  /**
   * A callback called by the lower transport layer when the segmented PDU
   * has been sent to the destination or has failed.
   *
   * This method removes the sent PDU from the queue and initiates sending
   * a next one, had it been enqueued.
   *
   * @param destination The destination address.
   */
  public lowerTransportLayerDidSend(destination: Address) {
    (() => {
      if (this.queues.get(destination)?.length === 0) {
        return;
      }
      // Remove the PDU that has just been sent.
      this.queues.set(destination, (this.queues.get(destination) ?? []).slice(1));
    })();
    // Try to send the next one.
    this.sendNext(destination);
  }

  /**
   * Handles received Lower Transport PDU.
   * Depending on the PDU type, the message will be either propagated to
   * Access Layer, or handled internally.
   *
   * @param lowerTransportPdu The Lower Transport PDU received.
   */
  public handleLowerTransportPdu(lowerTransportPdu: LowerTransportPdu) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    switch (lowerTransportPdu.type) {
      case LowerTransportPduType.accessMessage:
        const accessMessage = lowerTransportPdu as AccessMessage;
        const decoded = UpperTransportPdu.decode(accessMessage, this.meshNetwork);
        if (typeof decoded !== "undefined") {
          const { keySet, pdu: upperTransportPdu } = decoded;
          this.logger?.i(LogCategory.upperTransport, `${upperTransportPdu} received`);
          networkManager.accessLayer.handleUpperTransportPdu(upperTransportPdu, keySet);
        } else {
          this.logger?.w(LogCategory.upperTransport, "Failed to decode PDU");
        }
        break;
      case LowerTransportPduType.controlMessage:
        const controlMessage = lowerTransportPdu as ControlMessage;
        switch (controlMessage.opCode) {
          case HeartbeatMessage.opCode:
            const heartbeat = HeartbeatMessage.fromControlMessage(controlMessage);
            if (typeof heartbeat !== "undefined") {
              this.logger?.i(
                LogCategory.upperTransport,
                `${heartbeat} received from ${heartbeat.source.hex}`,
              );
              this.handleHeartbeat(heartbeat);
            }
            break;
          default:
            this.logger?.w(
              LogCategory.upperTransport,
              `Unsupported Control Message received (opCode: ${controlMessage.opCode})`,
            );
            // Other Control Messages are not supported.
            break;
        }
    }
  }

  /**
   * Handles received Heartbeat message. If the local Node has active subscription
   * matching received Heartbeat, the count value will be incremented.
   *
   * @param heartbeat Received Heartbeat message.
   */
  public handleHeartbeat(heartbeat: HeartbeatMessage) {
    const localNode = this.meshNetwork.localProvisioner?.node;
    if (typeof localNode === "undefined") return;
    const heartbeatSubscription = localNode.heartbeatSubscription;
    if (typeof heartbeatSubscription === "undefined") return;
    heartbeatSubscription.updateIfMatches(heartbeat);
  }
}
