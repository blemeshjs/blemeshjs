import {
  Address,
  BackgroundTimer,
  DispatchQueue,
  LogCategory,
  LoggerHandler,
  longMin,
  MeshMessage,
  Task,
  UInt16,
  UInt32,
  UInt64,
  UInt8,
  UserDefaults,
} from "@blemeshjs/utils";
import { NetworkManager } from "../network-manager.js";
import { MeshAddress, MeshNetwork } from "../../mesh-models/index.js";
import { SegmentedMessage } from "./segmented-message.js";
import { SegmentAcknowledgmentMessage } from "./segment-acknowledgment-message.js";
import { NetworkKey } from "../../mesh-models/index.js";
import { UpperTransportPdu } from "../upper-transport-layer/upper-transport-pdu.js";
import { SegmentedAccessMessage } from "./segmented-access-message.js";
import { PduType } from "../../bearer/bearer.js";
import { LowerTransportError } from "./lower-transport-error.js";
import { AccessMessage } from "./access-message.js";
import { NetworkPdu } from "../network-layer/network-pdu.js";
import { LowerTransportPdu, LowerTransportPduType } from "./lower-transport-pdu.js";
import { SegmentedControlMessage } from "./segmented-control-message.js";
import { ControlMessage } from "./control-message.js";
import Long from "long";
import { hasMixin } from "ts-mixer";

type Message =
  | { type: "lowerTransportPdu"; pdu: LowerTransportPdu }
  | { type: "acknowledgement"; ack: SegmentAcknowledgmentMessage }
  | { type: "none" };

/**
 * The key used in maps in Lower Transport Layer to keep
 * segments received to or from given source address.
 */
const keyForAddressAndSeqZero = (address: Address, sequenceZero: UInt16): UInt32 => {
  return (address.valueOf() << 16) | (sequenceZero & 0x1fff);
};

/**
 * Returns a list of unacknowledged segments.
 */
const unacknowledged = (
  list: Map<number, SegmentedMessage | undefined>,
): Array<SegmentedMessage> => {
  return Array.from(list.values()).filter((item) => typeof item !== "undefined");
};

/**
 * Returns the first not yet acknowledged segment.
 */
const firstNotAcknowledged = (
  list: Map<number, SegmentedMessage | undefined>,
): SegmentedMessage | undefined => {
  return Array.from(list.values()).find((message) => typeof message !== "undefined");
};

/**
 * Returns whether all the segments were received.
 */
const isComplete = (list: Array<SegmentedMessage | undefined>): list is Array<SegmentedMessage> => {
  return list.every((message) => typeof message !== "undefined");
};

/**
 * Converts the list of segments into either an `AccessMessage`,
 * or a `ControlMessage`, depending on the first element type.
 *
 * All the segments in the Array must not be `undefined`.
 */
const reassembled = (list: Array<SegmentedMessage>): LowerTransportPdu => {
  if (hasMixin(list[0], SegmentedAccessMessage)) {
    return AccessMessage.fromSegments(list as Array<SegmentedAccessMessage>);
  } else {
    return ControlMessage.fromSegments(list as Array<SegmentedControlMessage>);
  }
};

/**
 * Returns whether some segments were not yet acknowledged.
 */
const hasMore = (list?: Map<number, SegmentedMessage | undefined>): boolean => {
  if (typeof list === "undefined") return false;
  return Array.from(list.values()).some((segment) => typeof segment !== "undefined");
};

export class LowerTransportLayer {
  private readonly networkManager?: NetworkManager;
  private meshNetwork: MeshNetwork;
  private mutex = new DispatchQueue("LowerTransportLayerMutex");

  private get logger(): LoggerHandler | undefined {
    return this.networkManager?.logger;
  }

  /**
   * The storage for keeping sequence numbers.
   *
   * Each mesh network (with different UUID) has a unique storage, which can be reloaded
   * when the network is imported after it was used before.
   */
  private defaults: UserDefaults;

  // NOTE: - SAR Receiver

  /**
   * The map of incomplete received segments. Every time a Segmented Message is received
   *it is added to the map to an ordered array. When all segments are received
   *they are sent for processing to higher layer.
   *
   * The key consists of 16 bits of source address in 2 most significant bytes
   * and `sequenceZero` field in 13 least significant bits.
   * See `UInt32(keyFor:sequenceZero)` below.
   */
  private incompleteSegments: Map<UInt32, Array<SegmentedMessage | undefined>>;
  /**
   * This map contains Segment Acknowledgment Messages of completed messages.
   * It is used when a complete Segmented Message has been received and the
   * ACK has been sent but failed to reach the source Node.
   * The Node would then resend all non-acknowledged segments and expect a new ACK.
   * Without this map, this layer would have to complete again all segments in
   * order to send the ACK. By checking if a segment comes from an already
   * acknowledged message, it can immediately send the ACK again.
   *
   * An item is removed when a next message has been received from the same Node.
   */
  private acknowledgments: Map<Address, SegmentAcknowledgmentMessage>;
  /**
   * The map of active SAR Discard Timers.
   *
   * The time is initially set to ``NetworkParameters/discardTimeout`` seconds.
   * It resets every time a new segment of a segmented message is received and
   * is cancelled when the last segment is received. When the timer times out, the
   * message is cancelled and all received segments are deleted.
   *
   * The key consists of 16 bits of source address in 2 most significant bytes
   * and `sequenceZero` field in 13 least significant bits.
   * See `UInt32()` below.
   */
  private discardTimers: Map<UInt32, BackgroundTimer>;
  /**
   * The map of active SAR Acknowledgment timers.
   *
   * After receiving a segment targeting the Unicast Addresses of any of the Elements
   * of the local Node, a timer is started that will send the Segment Acknowledgment Message
   * acknowledging segments received until that time. The timer is invalidated when the message
   * has been completed or cancelled.
   *
   * When a segment of an already received message is received this timer is started
   * to ensure the acknowledgments are not sent too often.
   *
   * The key consists of 16 bits of source address in 2 most significant bytes
   * and `sequenceZero` field in 13 least significant bits.
   * See `UInt32()` below.
   */
  private acknowledgmentTimers: Map<UInt32, BackgroundTimer>;

  // NOTE: - SAR Transmitter

  /**
   * The map of outgoing segmented messages.
   *
   * The key is the `sequenceZero` of the message.
   */
  private outgoingSegments: Map<
    UInt16,
    {
      destination: MeshAddress;
      segments: Map<number, SegmentedMessage | undefined>;
    }
  >;
  /**
   * The map of SAR Unicast Retransmissions timers.
   *
   * The key of the map is the `sequenceZero` of a segmented message that is being sent
   * to a Unicast Address.
   */
  private unicastRetransmissionsTimers: Map<UInt16, BackgroundTimer>;
  /**
   * The map contains the number of remaining retransmissions and the number
   * of remaining retransmissions without progress of a segmented message
   * that is sent to a Unicast Address.
   *
   * The number of retransmissions without progress is reset to its initial value each time a
   * Segment Acknowledgment message indicating a progress in receiving segments is received.
   *
   * The transmission is cancelled with a timeout when any of the counters reaches zero.
   */
  private remainingNumberOfUnicastRetransmissions: Map<
    UInt16,
    { total: UInt8; withoutProgress: UInt8 }
  >;

  /**
   * The map of SAR Multicast Retransmissions timers.
   *
   * The key is the `sequenceZero` of the message.
   */
  private multicastRetransmissionsTimers: Map<UInt16, BackgroundTimer>;
  /**
   * The map contains the number of remaining retransmissions of a segmented message
   * that is sent to a Group Address or a Virtual Address.
   *
   * The transmission is completed when the counter reaches zero.
   */
  private remainingNumberOfMulticastRetransmissions: Map<UInt16, UInt8>;
  /**
   * The initial TTL values.
   *
   * The key is the `sequenceZero` of the message.
   */
  private segmentTtl: Map<UInt16, UInt8>;

  public constructor(networkManager: NetworkManager) {
    this.networkManager = networkManager;
    this.meshNetwork = networkManager.meshNetwork;
    this.defaults = UserDefaults.instance(
      this.meshNetwork.uuid.uuidString,
      networkManager.storage,
    )!;
    this.incompleteSegments = new Map();
    this.discardTimers = new Map();
    this.acknowledgmentTimers = new Map();
    this.outgoingSegments = new Map();
    this.unicastRetransmissionsTimers = new Map();
    this.multicastRetransmissionsTimers = new Map();
    this.remainingNumberOfUnicastRetransmissions = new Map();
    this.remainingNumberOfMulticastRetransmissions = new Map();
    this.acknowledgments = new Map();
    this.segmentTtl = new Map();
  }

  /**
   * This method handles the received Network PDU. If needed, it will reassembly
   * the message, send block acknowledgment to the sender, and pass the Upper
   * Transport PDU to the Upper Transport Layer.
   *
   * @param networkPdu The Network PDU received.
   */
  public async handleNetworkPdu(networkPdu: NetworkPdu) {
    // Some validation, just to be sure. This should pass for sure.
    if (networkPdu.transportPdu.length <= 1) {
      return;
    }

    // Segmented messages must be validated and assembled in a thread safe way.
    await this.mutex.async(async () => {
      if (!(await this.checkAgainstReplayAttack(networkPdu))) {
        return;
      }

      // Lower Transport layer can receive Unsegmented or Segmented messages.
      // This information is stored in the most significant bit of the first octet.
      const segmented = networkPdu.isSegmented;

      let message: Message | undefined;
      if (segmented) {
        switch (networkPdu.type) {
          case LowerTransportPduType.accessMessage: {
            const segment = SegmentedAccessMessage.fromSegmentPdu(networkPdu);
            if (typeof segment !== "undefined") {
              this.logger?.d(
                LogCategory.lowerTransport,
                `${segment} received (decrypted using key: ${segment.networkKey})`,
              );
              const pdu = this.assemble(segment, networkPdu);
              if (typeof pdu !== "undefined") {
                message = { type: "lowerTransportPdu", pdu };
              }
            }
            break;
          }
          case LowerTransportPduType.controlMessage: {
            const segment = SegmentedControlMessage.fromSegment(networkPdu);
            if (typeof segment !== "undefined") {
              this.logger?.d(
                LogCategory.lowerTransport,
                `${segment} received (decrypted using key: ${segment.networkKey})`,
              );
              const pdu = this.assemble(segment, networkPdu);
              if (typeof pdu !== "undefined") {
                message = { type: "lowerTransportPdu", pdu };
              }
            }
            break;
          }
        }
      } else {
        switch (networkPdu.type) {
          case LowerTransportPduType.accessMessage:
            const accessMessage = AccessMessage.fromUnsegmentedPdu(networkPdu);
            if (typeof accessMessage !== "undefined") {
              this.logger?.i(
                LogCategory.lowerTransport,
                `${accessMessage} received (decrypted using key: ${accessMessage.networkKey})`,
              );
              // Unsegmented message is not acknowledged. Just pass it to higher layer.
              message = { type: "lowerTransportPdu", pdu: accessMessage };
            }
            break;
          case LowerTransportPduType.controlMessage:
            const opCode = networkPdu.transportPdu[0] & 0x7f;
            switch (opCode) {
              case 0x00:
                const ack = SegmentAcknowledgmentMessage.fromNetworkPdu(networkPdu);
                if (typeof ack !== "undefined") {
                  this.logger?.d(
                    LogCategory.lowerTransport,
                    `${ack} received (decrypted using key: ${ack.networkKey})`,
                  );
                  message = { type: "acknowledgement", ack };
                }
                break;
              default:
                const controlMessage = ControlMessage.fromNetworkPdu(networkPdu);
                if (typeof controlMessage !== "undefined") {
                  this.logger?.i(
                    LogCategory.lowerTransport,
                    `${controlMessage} received (decrypted using key: ${controlMessage.networkKey})`,
                  );
                  // Unsegmented message is not acknowledged. Just pass it to higher layer.
                  message = { type: "lowerTransportPdu", pdu: controlMessage };
                }
                break;
            }
        }
      }
      if (typeof message !== "undefined") {
        // Process the message on the original queue.
        switch (message.type) {
          case "lowerTransportPdu":
            queueMicrotask(() => {
              this?.networkManager?.upperTransportLayer.handleLowerTransportPdu(message.pdu);
            });
            break;
          case "acknowledgement":
            this.handleAck(message.ack);
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * This method handles the Segment Acknowledgment Message.
   *
   * @param ack The Segment Acknowledgment Message received.
   */
  public handleAck(ack: SegmentAcknowledgmentMessage) {
    // Ensure the ACK is for some message that has been sent.
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const outgoing = this.outgoingSegments.get(ack.sequenceZero);
    if (typeof outgoing === "undefined") return;
    const { destination, segments } = outgoing;
    if (!(ack.source.equal(destination.address) || ack.isOnBehalfOfLowPowerNode)) return;
    const remaining = this.remainingNumberOfUnicastRetransmissions.get(ack.sequenceZero);
    if (typeof remaining === "undefined") return;
    const { total, withoutProgress: withProgress } = remaining;
    const segment = firstNotAcknowledged(segments);
    if (typeof segment === "undefined") return;
    const message = segment.message;
    if (typeof message === "undefined") return;

    // Is the target Node busy?
    if (ack.isBusy) {
      this.finalize(destination, ack.sequenceZero);
      this.notifyAboutCompletingSending(
        message,
        segment.source,
        destination,
        LowerTransportError.busy,
      );
      return;
    }

    /// Whether a progress has been made since the previous ACK.
    let progress = false;

    // Clear all acknowledged segments.
    for (let index = 0; index < segments.size; index++) {
      if (ack.isSegmentReceived(Long.fromNumber(index))) {
        if (
          typeof this.outgoingSegments.get(ack.sequenceZero)?.segments.get(index) !== "undefined"
        ) {
          progress = true;
          this.outgoingSegments.get(ack.sequenceZero)!.segments.set(index, undefined);
        }
      }
    }

    // If all the segments were acknowledged, notify the manager.
    if (!hasMore(this.outgoingSegments.get(ack.sequenceZero)?.segments)) {
      this.finalize(destination, ack.sequenceZero);
      this.notifyAboutCompletingSending(message, segment.source, destination);
    } else {
      // Check if the SAR Unicast Retransmission timer is running.
      if (typeof this.unicastRetransmissionsTimers.get(ack.sequenceZero) !== "undefined") {
        // If not, that means that the segments are just being retransmitted
        // and we're done here. We shall receive a new acknowledgment in a bit.
        return;
      }
      // Check if more retransmissions are possible.
      if (!(total > 0 && withProgress > 0)) {
        // If not, the running SAR Unicast Retransmissions timer will cancel
        // the message when it expires. Perhaps another acknowledgment will
        // be received before acknowledging all segments.
        return;
      }
      // Stop the SAR Unicast Retransmissions timer.
      this.unicastRetransmissionsTimers.get(ack.sequenceZero)?.invalidate();
      this.unicastRetransmissionsTimers.delete(ack.sequenceZero);
      // Decrement the counters.
      // If a progress has been made, reset the remaining number of
      // retransmissions with progress to its initial value.
      this.remainingNumberOfUnicastRetransmissions.set(ack.sequenceZero, {
        total: total - 1,
        withoutProgress: progress
          ? networkManager.networkParameters.sarUnicastRetransmissionsWithoutProgressCount
          : withProgress - 1,
      });
      // Lastly, send again all packets that were not acknowledged.
      this.sendSegmentsForSequenceZero(ack.sequenceZero);
    }
  }

  /**
   * This method checks the given Network PDU against replay attacks.
   *
   * Unsegmented messages are checked against their sequence number.
   *
   * Segmented messages are checked against the SeqAuth value of the first
   * segment of the message. Segments may be received in random order
   * and unless the message SeqAuth is always greater, the replay attack
   * is not possible.
   *
   * **IMPORTANT**: Messages sent to a Unicast Address assigned to other Nodes
   * than the local one are not checked against reply attacks.
   *
   * @param networkPdu The Network PDU to validate.
   */
  public async checkAgainstReplayAttack(networkPdu: NetworkPdu): Promise<boolean> {
    // Don't check messages sent to other Nodes.
    if (networkPdu.destination.isUnicast) return true;
    if (
      this.meshNetwork.localProvisioner?.node?.containsElementWithAddress(networkPdu.destination) ??
      true
    )
      return true;

    /// The SeqAuth value of the message.
    ///
    /// SeqAuth is 56-bit long and contains the IV Index (32-bit) and SEQ (24-bit).
    const receivedSeqAuth: UInt64 = Long.fromNumber(networkPdu.ivIndex)
      .shiftLeft(24)
      .or(networkPdu.sequence);
    /// Last SeqAuth value received from the source Element.
    ///
    /// This is `undefined` if no message was ever received from the source Element.
    const lastSeqAuth = await this.defaults.lastSeqAuthValue(networkPdu.source);

    if (typeof lastSeqAuth !== "undefined") {
      // In general, the SeqAuth of the received message must be greater
      // than SeqAuth of any previously received message from the same source.
      // However, for SAR (Segmentation and Reassembly) sessions, it is
      // the SeqAuth of the message, not segment, that is being checked.
      // If SAR is active (at least one segment for the same SeqAuth has
      // been previously received), the segments may be processed in any order.
      // The SeqAuth of this message must be greater or equal to the last one.
      let reassemblyInProgress = false;
      if (networkPdu.isSegmented && typeof networkPdu.sequenceZero !== "undefined") {
        const key = keyForAddressAndSeqZero(networkPdu.source, networkPdu.sequenceZero);
        reassemblyInProgress =
          typeof this.incompleteSegments.get(key) !== "undefined" ||
          this.acknowledgments.get(networkPdu.source)?.sequenceZero === networkPdu.sequenceZero;
      }

      // As the messages are processed in a concurrent queue, it may happen that two
      // messages sent almost immediately were received in the right order, but are
      // processed in the opposite order. To handle that case, the previous SeqAuth
      // is stored. If the received message has SeqAuth less than the last one, but
      // greater than the previous one, it could not be used to replay attack, as no
      // message with that SeqAuth was ever received.
      //
      // NOTE: Only the single previous SeqAuth is stored, so if 3 or more messages are
      //       sent one after another, some of them still may be discarded despite being
      //       received in the correct order.
      let missed = false;
      const previousSeqAuth = await this.defaults.previousSeqAuthValue(networkPdu.source);
      if (typeof previousSeqAuth !== "undefined") {
        missed = receivedSeqAuth.lt(lastSeqAuth) && receivedSeqAuth.gt(previousSeqAuth);
      }

      // Validate.
      if (!(receivedSeqAuth.gt(lastSeqAuth) || missed || reassemblyInProgress)) {
        // Ignore that message.
        this.logger?.w(
          LogCategory.lowerTransport,
          `Discarding packet (seqAuth: ${receivedSeqAuth.toString(16)}, expected > ${lastSeqAuth.toString(16)})`,
        );
        return false;
      }

      // The message is valid. Remember the previous SeqAuth.
      const newPreviousSeqAuth = longMin(receivedSeqAuth, lastSeqAuth);
      await this.defaults.storePreviousSeqAuthValue(newPreviousSeqAuth, networkPdu.source);

      // If the message was processed after its successor, don't overwrite the last SeqAuth.
      if (missed) {
        return true;
      }
    }
    // SeqAuth is valid, save the new sequence authentication value.
    await this.defaults.storeLastSeqAuthValue(receivedSeqAuth, networkPdu.source);
    return true;
  }

  /**
   * Handles the segment created from the given network PDU.
   *
   * @param segment The segment to handle.
   * @param networkPdu The Network PDU from which the segment was decoded.
   * @returns The Lower Transport PDU had it been fully assembled,`undefined` otherwise.
   */
  public assemble(
    segment: SegmentedMessage,
    networkPdu: NetworkPdu,
  ): LowerTransportPdu | undefined {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;

    const key = keyForAddressAndSeqZero(networkPdu.source, segment.sequenceZero);

    // If the received segment comes from an already completed and
    // acknowledged message, send the same ACK immediately.
    const lastAck = this.acknowledgments.get(segment.source);
    if (typeof lastAck !== "undefined" && lastAck.sequenceZero === segment.sequenceZero) {
      const provisionerNode = this.meshNetwork.localProvisioner?.node;
      if (typeof provisionerNode !== "undefined") {
        // The lower transport layer shall not send more than one
        // Segment Acknowledgment message for the same SeqAuth in a
        // period of `completeAcknowledgementTimerInterval`.
        if (typeof this.acknowledgmentTimers.get(key) !== "undefined") {
          this.logger?.d(
            LogCategory.lowerTransport,
            "Message already acknowledged, ACK sent recently",
          );
          return undefined;
        }
        this.acknowledgmentTimers.set(
          key,
          BackgroundTimer.scheduledTimer(
            networkManager.networkParameters.completeAcknowledgmentTimerInterval,
            false,
            () => {
              // Until this timer is not executed no Segment Acknowledgment Message
              // will be sent for the same completed message.
              this?.acknowledgmentTimers.get(key)?.invalidate();
              this?.acknowledgmentTimers.delete(key);
            },
            this.mutex,
          ),
        );
        // Now we're sure that the ACK has not been sent in a while.
        this.logger?.d(
          LogCategory.lowerTransport,
          "Message already acknowledged, sending ACK again",
        );
        const ttl =
          networkPdu.ttl > 0
            ? (provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl)
            : 0;
        this.sendAck(lastAck, ttl);
      } else {
        this.acknowledgments.delete(segment.source);
      }
      return undefined;
    }
    // Remove the last ACK. The source Node has sent a new message, so
    // the last ACK must have been received.
    this.acknowledgments.delete(segment.source);

    // A segmented message may be composed of 1 or more segments.
    if (segment.isSingleSegment) {
      const message = reassembled([segment]);
      this.logger?.i(LogCategory.lowerTransport, `${message} received`);
      // A single segment message may immediately be acknowledged.
      const provisionerNode = this.meshNetwork.localProvisioner?.node;
      if (
        typeof provisionerNode !== "undefined" &&
        provisionerNode.containsElementWithAddress(networkPdu.destination)
      ) {
        const ttl =
          networkPdu.ttl > 0
            ? (provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl)
            : 0;
        this.sendAckForSegments([segment], ttl);
      }
      return message;
    } else {
      // If a message is composed of multiple segments, they all need to
      // be received before it can be processed.
      if (typeof this.incompleteSegments.get(key) === "undefined") {
        this.incompleteSegments.set(
          key,
          new Array<SegmentedMessage | undefined>(segment.count.toNumber()).fill(undefined),
        );
      }
      if (segment.index.gt(this.incompleteSegments.get(key)!.length)) {
        // Segment is invalid. We can stop here.
        this.logger?.w(LogCategory.lowerTransport, "Invalid segment");
        return undefined;
      }
      this.incompleteSegments.get(key)![segment.index.toNumber()] = segment;

      // If all segments were received, send ACK and send the PDU to Upper
      // Transport Layer for processing.
      const allSegments = this.incompleteSegments.get(key)!;
      if (isComplete(allSegments)) {
        this.incompleteSegments.delete(key);
        const message = reassembled(allSegments);
        this.logger?.i(LogCategory.lowerTransport, `${message} received`);
        // If the access message was targeting directly the local Provisioner...
        const provisionerNode = this.meshNetwork.localProvisioner?.node;
        if (
          typeof provisionerNode !== "undefined" &&
          provisionerNode.containsElementWithAddress(networkPdu.destination)
        ) {
          // ...invalidate timers...
          this.discardTimers.get(key)?.invalidate();
          this.discardTimers.delete(key);
          this.acknowledgmentTimers.get(key)?.invalidate();
          this.acknowledgmentTimers.delete(key);

          // ...and send the ACK that all segments were received.
          const ttl =
            networkPdu.ttl > 0
              ? (provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl)
              : 0;
          this.sendAckForSegments(allSegments, ttl);
        }
        return message;
      } else {
        // The Provisioner shall send block acknowledgment only if the message was
        // send directly to it's Unicast Address.
        const provisionerNode = this.meshNetwork.localProvisioner?.node;
        if (
          typeof provisionerNode === "undefined" ||
          !provisionerNode.containsElementWithAddress(networkPdu.destination)
        ) {
          return undefined;
        }
        // If the Lower Transport Layer receives any segment while the SAR Discard Timer
        // is active, the timer shall be restarted.
        this.discardTimers.get(key)?.invalidate();
        this.discardTimers.delete(key);
        this.discardTimers.set(
          key,
          BackgroundTimer.scheduledTimer(
            networkManager.networkParameters.discardTimeout,
            false,
            () => {
              if (typeof this === "undefined") return;
              const segments = this.incompleteSegments.get(key);
              this.incompleteSegments.delete(key);
              if (typeof segments !== "undefined") {
                let marks: UInt32 = 0;
                segments.forEach((segment) => {
                  if (typeof segment !== "undefined") {
                    marks |= 1 << segment.segmentOffset;
                  }
                });
                this.logger?.w(
                  LogCategory.lowerTransport,
                  `Discard timeout expired, cancelling message (src: ${new Address(key >> 16).hex}, seqZero: ${key & 0x1fff}, received segments: 0x${marks.toString(16)})`,
                );
              }
              this.discardTimers.get(key)?.invalidate();
              this.discardTimers.delete(key);
              this.acknowledgmentTimers.get(key)?.invalidate();
              this.acknowledgmentTimers.delete(key);
            },
            this.mutex,
          ),
        );
        // When a segment is received the SAR Acknowledgment timer shall be (re)started.
        this.acknowledgmentTimers.get(key)?.invalidate();

        let ttl = provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl;
        const interval = networkManager.networkParameters.acknowledgmentTimerInterval(
          segment.lastSegmentNumber,
        );
        this.acknowledgmentTimers.set(
          key,
          BackgroundTimer.scheduledTimer(
            interval,
            false,

            () => {
              if (typeof networkManager === "undefined") return;
              const segments = this.incompleteSegments.get(key);
              if (typeof segments === "undefined") {
                this.acknowledgmentTimers.delete(key);
                return;
              }
              // When the SAR Acknowledgment timer expires, the lower transport
              // layer shall send a Segment Acknowledgment message.
              ttl = networkPdu.ttl > 0 ? ttl : 0;
              this.logger?.d(
                LogCategory.lowerTransport,
                "SAR Acknowledgment timer expired, sending ACK",
              );
              this.sendAckForSegments(segments, ttl);

              // If Segment Acknowledgment retransmission is enabled and the
              // number of segments of the segmented message is longer than the
              // SAR Segments Threshold, the lower transport layer should retransmit
              // the acknowledgment specified number of times.
              const initialCount =
                networkManager.networkParameters.sarAcknowledgmentRetransmissionsCount;
              let count = initialCount;
              if (
                count > 0 &&
                segment.lastSegmentNumber >= networkManager.networkParameters.sarSegmentsThreshold
              ) {
                const interval = networkManager.networkParameters.segmentReceptionInterval;
                this.acknowledgmentTimers.set(
                  key,
                  BackgroundTimer.scheduledTimer(
                    interval,
                    count > 1,

                    (retransmissionTimer) => {
                      // The Segment Acknowledgment message shall be retransmitted with a new SEQ number.
                      this.logger?.d(
                        LogCategory.lowerTransport,
                        `Retransmitting ACK (${1 + initialCount - count}/${initialCount})`,
                      );
                      this.sendAckForSegments(segments, ttl);
                      // Decrement the counter.
                      count = count - 1;
                      // Stop retransmissions when the counter has reached 0.
                      if (count === 0) {
                        retransmissionTimer.invalidate();
                        this.acknowledgmentTimers.delete(key);
                      }
                    },
                    this.mutex,
                  ),
                );
              }
            },
            this.mutex,
          ),
        );
        return undefined;
      }
    }
  }

  /**
   * This method tries to send the Segment Acknowledgment Message to the
   * given address. It will try to send if the local Provisioner is set and
   * has the Unicast Address assigned.
   *
   * If the `transporter` throws an error during sending, this error will be ignored.
   *
   * - parameters:
   * @param segments The array of message segments, of which at least one has to be not `undefined`.
   * @param ttl Initial Time To Live (TTL) value.
   */
  public sendAckForSegments(segments: Array<SegmentedMessage | undefined>, ttl: UInt8) {
    const ack = SegmentAcknowledgmentMessage.fromSegments(segments);
    if (isComplete(segments)) {
      this.acknowledgments.set(ack.destination, ack);
    }
    this.sendAck(ack, ttl);
  }

  /**
   * Sends the given ACK.
   *
   * NOTE: The ACK used to be sent on a background queue, however this was causing
   *         issues. Effectively, this was delaying sending the ACK and another packet
   *         could have been sent before. The ACK would then be dropped due to too low
   *         sequence number.
   *
   * @param ack The Segment Acknowledgment Message to sent.
   * @param ttl Initial Time To Live (TTL) value.
   */
  public sendAck(ack: SegmentAcknowledgmentMessage, ttl: UInt8) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    this.logger?.d(LogCategory.lowerTransport, `Sending ${ack}`);
    networkManager.networkLayer
      .sendLowerTransportPdu(ack, PduType.networkPdu, ttl)
      .catch((error) => {
        this.logger?.w(
          LogCategory.lowerTransport,
          error instanceof Error ? error.message : "Unknown send ack error",
        );
      });
  }

  /**
   * Returns whether the Lower Transport Layer is in progress of
   * receiving a segmented message from the given address.
   *
   * @param address The source address.
   * @returns `True` if some, but not all packets of a segmented
   * message were received from the given source address;
   * `false` if no packets were received or the message
   * was complete before calling this method.
   */
  public isReceivingMessage(address: Address): boolean {
    for (const key of this.incompleteSegments.keys()) {
      if (((key >> 16) & 0xffff) === address.valueOf()) return true;
    }
    return false;
  }

  /**
   * This method tries to send the Upper Transport Message.
   *
   * @param pdu The segmented Upper Transport PDU to be sent.
   * @param initialTtl The initial TTL (Time To Live) value of the message.
   * If `undefined`, the default Node TTL will be used.
   * @param networkKey The Network Key to be used to encrypt the message on Network Layer.
   */
  public sendSegmentedUpperTransportPdu(
    pdu: UpperTransportPdu,
    initialTtl: UInt8 | undefined,
    networkKey: NetworkKey,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const provisionerNode = this.meshNetwork.localProvisioner?.node;
    if (typeof provisionerNode === "undefined") return;
    /// Last 13 bits of the sequence number are known as seqZero.
    const sequenceZero = pdu.sequence & 0x1fff;
    /// Number of segments to be sent.
    const count = Math.floor((pdu.transportPdu.length + 11) / 12);

    // Create all segments to be sent.
    this.outgoingSegments.set(sequenceZero, {
      destination: pdu.destination,
      segments: new Map(new Array(count).fill(undefined).map((v: undefined, i) => [i, v])),
    });
    for (let i = 0; i < count; i++) {
      this.outgoingSegments
        .get(sequenceZero)!
        .segments.set(i, SegmentedAccessMessage.fromUpperTransportPdu(pdu, networkKey, i));
    }
    // Store the TTL with which the segments are to be sent.
    this.segmentTtl.set(
      sequenceZero,
      initialTtl ?? provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl,
    );
    // Initialize the retransmission counters.
    if (pdu.destination.address.isUnicast) {
      this.remainingNumberOfUnicastRetransmissions.set(sequenceZero, {
        total: networkManager.networkParameters.sarUnicastRetransmissionsCount,
        withoutProgress:
          networkManager.networkParameters.sarUnicastRetransmissionsWithoutProgressCount,
      });
    } else {
      this.remainingNumberOfMulticastRetransmissions.set(
        sequenceZero,
        networkManager.networkParameters.sarMulticastRetransmissionsCount,
      );
    }
    // Finally, start sending segments.
    this.sendSegmentsForSequenceZero(sequenceZero);
  }

  /**
   * Sends all unacknowledged segments with the given `sequenceZero` and starts
   * a retransmissions timer.
   *
   * NOTE: This is an asynchronous method, It will initiate sending the remaining segments
   *         and finish immediately.
   *
   * @param sequenceZero The key to get segments from the map.
   */
  public sendSegmentsForSequenceZero(sequenceZero: UInt16) {
    const $segments = this.outgoingSegments.get(sequenceZero);
    if (typeof $segments === "undefined") return;
    const { segments, destination } = $segments;
    if (segments.size <= 0) {
      return;
    }

    /// The list of segments to be sent.
    ///
    /// The list contains only unacknowledged segments. Acknowledge segments are
    /// set to `undefined` when the Segment Acknowledgment message is received.
    ///
    /// NOTE: When the destination is a Group or Virtual Address there are no
    ///         acknowledgments, in which case all segments are unacknowledged.
    const remainingSegments = unacknowledged(segments);

    queueMicrotask(() => {
      this?.sendSegmentsForSegmentedMessage(remainingSegments).catch((e) =>
        this.logger?.w(
          LogCategory.lowerTransport,
          e instanceof Error ? e.message : "Unknown send segments error",
        ),
      );

      // When the last remaining segment has been sent, the lower transport
      // layer should start the SAR Unicast Retransmissions timer or the
      // SAR Multicast Retransmissions timer.
      if (destination.address.isUnicast) {
        this?.startUnicastRetransmissionsTimer(sequenceZero);
      } else {
        this?.startMulticastRetransmissionsTimer(sequenceZero);
      }
    });
  }
  /**
   * Starts the SAR Multicast Retransmissions timer for the message with given
   * `sequenceZero`.
   *
   * If the remaining number of retransmissions must be set before the timer is started.
   *
   * @param sequenceZero The key to get segments from the map.
   */
  public startMulticastRetransmissionsTimer(sequenceZero: UInt16) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const remainingNumberOfRetransmissions =
      this.remainingNumberOfMulticastRetransmissions.get(sequenceZero);
    if (typeof remainingNumberOfRetransmissions === "undefined") return;
    const outgoing = this.outgoingSegments.get(sequenceZero);
    if (typeof outgoing === "undefined") return;
    const { segments, destination } = outgoing;
    const segment = firstNotAcknowledged(segments);
    if (typeof segment === "undefined") return;
    const message = segment.message;
    if (typeof message === "undefined") return;

    /// The initial value of the SAR Multicast Retransmissions timer.
    const interval = networkManager.networkParameters.multicastRetransmissionsInterval;

    // Start the SAR Multicast Retransmissions timer.
    this.multicastRetransmissionsTimers.set(
      sequenceZero,
      BackgroundTimer.scheduledTimer(
        interval,
        false,
        () => {
          if (typeof this === "undefined") return;
          // The timer has expired, remove it.
          this.multicastRetransmissionsTimers.delete(sequenceZero);

          // When the SAR Multicast Retransmissions timer expires and the remaining
          // number of retransmissions value is 0, the lower transport layer shall
          // cancel the transmission of the Upper Transport PDU, shall delete the number
          // of retransmissions value and the number of retransmissions without progress value,
          // shall remove the destination address stored for this segmented message,
          // and shall notify the higher layer that the transmission of the Upper Transport PDU
          // has been completed.
          if (remainingNumberOfRetransmissions <= 0) {
            this.finalize(destination, sequenceZero);
            this.notifyAboutCompletingSending(message, segment.source, destination);
            return;
          }
          // Decrement the counter.
          this.remainingNumberOfMulticastRetransmissions.set(
            sequenceZero,
            remainingNumberOfRetransmissions - 1,
          );
          // Send again all segments and restart the timer.
          this.sendSegmentsForSequenceZero(sequenceZero);
        },
        this.mutex,
      ),
    );
  }

  /**
   * Starts the SAR Unicast Retransmissions timer for the message with given
   * `sequenceZero`.
   *
   * If the remaining number of retransmissions and the remaining number of
   * retransmissions without progress must be set before the timer is started.
   *
   * @param sequenceZero The key to get segments from the map.
   */
  public startUnicastRetransmissionsTimer(sequenceZero: UInt16) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const remainingNumberOfUnicastRetransmissions =
      this.remainingNumberOfUnicastRetransmissions.get(sequenceZero);
    if (typeof remainingNumberOfUnicastRetransmissions === "undefined") return;
    const outgoing = this.outgoingSegments.get(sequenceZero);
    if (typeof outgoing === "undefined") return;
    const { segments, destination } = outgoing;
    const segment = firstNotAcknowledged(segments);
    if (typeof segment === "undefined") return;
    const message = segment.message;
    if (typeof message === "undefined") return;
    const ttl = this.segmentTtl.get(sequenceZero);
    if (typeof ttl === "undefined") return;

    /// Remaining number of retransmissions of segments of an segmented message
    /// sent to a Unicast Address. When the number goes to 0 the retransmissions stop.
    const remainingNumberOfRetransmissions = remainingNumberOfUnicastRetransmissions.total;
    /// Remaining number of retransmissions without progress of segments of an segmented
    /// message sent to a Unicast Address. When the number goes to 0 the retransmissions stop.
    const remainingNumberOfRetransmissionsWithoutProgress =
      remainingNumberOfUnicastRetransmissions.withoutProgress;

    /// The initial value of the SAR Unicast Retransmissions timer.
    const interval = networkManager.networkParameters.unicastRetransmissionsInterval(ttl);

    // Start the SAR Unicast Retransmissions timer.
    this.unicastRetransmissionsTimers.set(
      sequenceZero,
      BackgroundTimer.scheduledTimer(
        interval,
        false,
        () => {
          if (typeof this === "undefined") return;
          // The timer has expired, remove it.
          this.unicastRetransmissionsTimers.delete(sequenceZero);

          // When the SAR Unicast Retransmissions timer expires and either the remaining
          // number of retransmissions or the remaining number of retransmissions without progress is 0,
          // the lower transport layer shall cancel the transmission of the Upper Transport PDU,
          // shall delete the number of retransmissions value and the number of retransmissions without progress value,
          // shall remove the destination address and the SeqAuth stored for this segmented message,
          // and shall notify the upper transport layer that the transmission of the Upper Transport PDU has timed out.
          if (
            !(
              remainingNumberOfRetransmissions > 0 &&
              remainingNumberOfRetransmissionsWithoutProgress > 0
            )
          ) {
            this.finalize(destination, sequenceZero);

            // Notify the user about a timeout only if sending the message was initiated
            // by the user (that means it is not sent as an automatic response to a
            // acknowledged request) and if the message is not acknowledged
            // (in which case the Access Layer may retry).
            if (segment.userInitiated && !message.isAcknowledged) {
              this.notifyAboutCompletingSending(
                message,
                segment.source,
                destination,
                LowerTransportError.timeout,
              );
            }
            return;
          }
          // Decrement both counters. As the SAR Unicast Retransmission timer
          // has expired, no progress has been made.
          this.remainingNumberOfUnicastRetransmissions.set(sequenceZero, {
            total: remainingNumberOfRetransmissions - 1,
            withoutProgress: remainingNumberOfRetransmissionsWithoutProgress - 1,
          });
          // Send again unacknowledged segments and restart the timer.
          this.sendSegmentsForSequenceZero(sequenceZero);
        },
        this.mutex,
      ),
    );
  }

  /**
   * Sends the given segments one by one with an interval determined by the segment
   * transmission interval.
   *
   * @param segments List of segments to be sent.
   */
  public async sendSegmentsForSegmentedMessage(segments: Array<SegmentedMessage>) {
    // The interval with which segments are sent by the lower transport layer.
    const segmentTransmissionInterval =
      this.networkManager?.networkParameters.segmentTransmissionInterval;
    if (typeof segmentTransmissionInterval === "undefined") {
      return;
    }

    // Start sending segments in the same order as they are in the list.
    // Note: Each segment is sent with a delay, therefore each time we
    //       check if the network manager still exists.
    for (const segment of segments) {
      // Make sure the network manager is alive.
      const networkManager = this.networkManager;
      if (typeof networkManager === "undefined") return;
      const networkLayer = networkManager.networkLayer;
      if (typeof networkLayer === "undefined") return;
      // Make sure all the segments were not already acknowledged.
      // This will return undefined when all segments were acknowledged.
      const ttl = this.segmentTtl.get(segment.sequenceZero);
      if (typeof ttl === "undefined") return;
      // Send the segment and wait the segment transmission interval.
      this.logger?.d(LogCategory.lowerTransport, `Sending ${segment}`);
      try {
        await networkLayer.sendLowerTransportPdu(segment, PduType.networkPdu, ttl);
        await Task.sleep(segmentTransmissionInterval).value();
      } catch (error) {
        this.logger?.w(
          LogCategory.lowerTransport,
          error instanceof Error ? error.message : "Unknown send segment error",
        );
      }
    }
  }

  /**
   * This method tries to send the Upper Transport Message.
   *
   * @param pdu The unsegmented Upper Transport PDU to be sent.
   * @param initialTtl The initial TTL (Time To Live) value of the message. If `undefined`, the default Node TTL will be used.
   * @param networkKey The Network Key to be used to encrypt the message on Network Layer.
   */
  public async sendUnsegmentedUpperTransportPdu(
    pdu: UpperTransportPdu,
    initialTtl: UInt8 | undefined,
    networkKey: NetworkKey,
  ) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const provisionerNode = this.meshNetwork.localProvisioner?.node;
    if (typeof provisionerNode === "undefined") return;
    const localElement = provisionerNode.elementWithAddress(pdu.source);
    if (typeof localElement === "undefined") return;

    /// The Time To Live value.
    const ttl =
      initialTtl ?? provisionerNode.defaultTtl ?? networkManager.networkParameters.defaultTtl;
    const message = AccessMessage.fromUnsegmentedUpperTransportPdu(pdu, networkKey);
    this.logger?.i(LogCategory.lowerTransport, `Sending ${message}`);
    try {
      await networkManager.networkLayer.sendLowerTransportPdu(message, PduType.networkPdu, ttl);
      networkManager.notifyAboutDeliveringMessage(pdu.message!, localElement, pdu.destination);
    } catch (error) {
      if (error instanceof Error) {
        this.logger?.w(LogCategory.lowerTransport, error.message);
        if (!pdu.message!.isAcknowledged) {
          networkManager.notifyAboutError(error, pdu.message!, localElement, pdu.destination);
        }
      } else {
        this.logger?.w(LogCategory.lowerTransport, "Unknown send error");
      }
    }
  }
  /**
   * Removes remaining segments and counters associated with the message with the
   * given `sequenceZero`.
   *
   * @param destination The target address of the message.
   * @param sequenceZero The key to get segments from the map.
   */
  public finalize(destination: MeshAddress, sequenceZero: UInt16) {
    this.remainingNumberOfUnicastRetransmissions.delete(sequenceZero);
    this.remainingNumberOfMulticastRetransmissions.delete(sequenceZero);
    this.outgoingSegments.delete(sequenceZero);
    this.segmentTtl.delete(sequenceZero);

    return queueMicrotask(() => {
      this?.networkManager?.upperTransportLayer.lowerTransportLayerDidSend(destination.address);
    });
  }

  /**
   * Notifies the `networkManager` about completing transfer of segmented
   * message.
   *
   * The transfer could succeed or fail with an error.
   *
   * @param message The Access Layer message which was being sent.
   * @param source The Unicast Address of the source Element on the local Node.
   * @param destination The target address of the message.
   * @param error Optional error if transmission failed.
   */
  public notifyAboutCompletingSending(
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
    error?: Error,
  ) {
    queueMicrotask(() => {
      const networkManager = this?.networkManager;
      if (typeof networkManager === "undefined") return;
      // Find the source Element.
      const provisionerNode = this?.meshNetwork.localProvisioner?.node;
      if (typeof provisionerNode === "undefined") return;
      const element = provisionerNode.elementWithAddress(source);
      if (typeof element === "undefined") return;
      if (typeof error !== "undefined") {
        this.networkManager?.notifyAboutError(error, message, element, destination);
      } else {
        this.networkManager?.notifyAboutDeliveringMessage(message, element, destination);
      }
    });
  }

  /**
   * Cancels sending segmented Upper Transport PDU.
   *
   * @param pdu The Upper Transport PDU.
   */
  public cancelSendingSegmentedUpperTransportPdu(pdu: UpperTransportPdu) {
    /// Last 13 bits of the sequence number are known as seqZero.
    const sequenceZero = pdu.sequence & 0x1fff;

    this.logger?.d(
      LogCategory.lowerTransport,
      `Cancelling sending segments with seqZero: ${sequenceZero}`,
    );
    this.outgoingSegments.delete(sequenceZero);
    this.segmentTtl.delete(sequenceZero);
    this.unicastRetransmissionsTimers.get(sequenceZero)?.invalidate();
    this.unicastRetransmissionsTimers.delete(sequenceZero);
    this.remainingNumberOfUnicastRetransmissions.delete(sequenceZero);
    this.multicastRetransmissionsTimers.get(sequenceZero)?.invalidate();
    this.multicastRetransmissionsTimers.delete(sequenceZero);
    this.remainingNumberOfMulticastRetransmissions.delete(sequenceZero);
  }
}
