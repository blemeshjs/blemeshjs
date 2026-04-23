import { hasMixin, Mixin } from "ts-mixer";
import { TransitionTime, UInt32, UInt8 } from "../types/index.js";
import { Data } from "../types/index.js";
import { MeshMessageSecurity } from "../enums/index.js";
/**
 * The base interface of every mesh message. Mesh messages can be sent to and
 * received from a mesh network.
 */
export abstract class BaseMeshMessage {
  /**
   * Access Layer payload, including the Op Code.
   */
  public abstract get parameters(): Data | undefined;

  /**
   * This initializer should construct the message based on the received
   * parameters.
   *
   * @param _parameters Received Access Layer parameters.
   */
  public static fromData(_parameters: Data): BaseMeshMessage | undefined {
    throw new Error('method "fromData" is not implemented');
  }
}

/**
 * The base class of every mesh message. Mesh messages can be sent to and
 * received from the mesh network. For messages with the Op Code known
 * during compilation a `StaticMeshMessage` protocol should be preferred.
 *
 * Parameters `MeshMessage.security` and `MeshMessage.isSegmented`
 * are checked and should be set only for outgoing messages.
 */
export abstract class MeshMessage extends BaseMeshMessage {
  /**
   * The message Op Code.
   */
  public abstract opCode: UInt32;
  public static opCode: UInt32;
  /**
   * Returns whether the message should be sent or has been sent using
   * 32-bit or 64-bit TransMIC value. By default, `MeshMessageSecurity/low`
   * is returned.
   *
   * Only Segmented Access Messages can use 64-bit MIC. If the payload
   * is shorter than 11 bytes, make sure you return `true` from
   * `MeshMessage.isSegmented-891sy`, otherwise this field will be ignored.
   */
  public get security(): MeshMessageSecurity {
    return MeshMessageSecurity.low;
  }
  /**
   * Returns whether the message should be sent or was sent as
   * Segmented Access Message. By default, this parameter returns
   * `false`.
   *
   * To force segmentation for shorter messages return `true` despite
   * payload length. If payload size is longer than 11 bytes this
   * field is not checked as the message must be segmented.
   */
  public get isSegmented(): boolean {
    return false;
  }
  /**
   * Whether the message is a Vendor Message, or not.
   *
   * Vendor messages use 3-byte Op Codes, where the 2 most significant
   * bits of the first octet are set to 1. The remaining bits of the
   * first octet are the operation code, while the last 2 bytes are the
   * Company Identifier (Big Endian), as registered by Bluetooth SIG.
   */
  public get isVendorMessage(): boolean {
    return (this.opCode & 0xffc00000) === 0x00c00000;
  }

  /**
   * Whether the message is an acknowledged message, or not.
   */
  public get isAcknowledged(): boolean {
    return hasMixin(this, AcknowledgedMeshMessage);
  }
}

/**
 * The base class for acknowledged messages.
 *
 * An acknowledged message is transmitted and acknowledged by each
 * receiving element by responding to that message. The response is
 * typically a status message. If a response is not received within
 * an arbitrary time period, the message will be retransmitted
 * automatically until the timeout occurs.
 *
 * Acknowledged messages are expected to be replied with a status message
 * with a message of type set as `AcknowledgedMeshMessage.responseOpCode`.
 *
 * Access Layer timer will wait for
 * `NetworkParameters.acknowledgmentMessageTimeout` seconds
 * before throwing a timeout.
 */
export abstract class AcknowledgedMeshMessage extends MeshMessage {
  /**
   * The Op Code of the response message.
   */
  public abstract get responseOpCode(): UInt32;
}

/**
 * The base class for unacknowledged messages.
 */
export abstract class UnacknowledgedMeshMessage extends MeshMessage {
  // No additional fields.
}

/**
 * The base class for response messages.
 */
export abstract class MeshResponse extends UnacknowledgedMeshMessage {
  // No additional fields.
}

/**
 * A type of a mesh message which opcode is known during compilation time.
 */
export abstract class StaticMeshMessage extends MeshMessage {}

/**
 * The base class for unacknowledged messages with an opcode known at the
 * compilation time.
 */
export abstract class StaticUnacknowledgedMeshMessage extends Mixin(
  StaticMeshMessage,
  UnacknowledgedMeshMessage,
) {
  // No additional fields.
}

/**
 * The base class for response messages with an opcode known at the
 * compilation time.
 */
export abstract class StaticMeshResponse extends Mixin(
  MeshResponse,
  StaticUnacknowledgedMeshMessage,
) {
  // No additional fields.
}

/**
 * A base class for acknowledged messages which opcode and the type of the
 * response message are known during compilation time.
 *
 * The message must have the ``StaticAcknowledgedMeshMessage/responseType``
 * specified.
 */
export abstract class StaticAcknowledgedMeshMessage extends Mixin(
  StaticMeshMessage,
  AcknowledgedMeshMessage,
) {
  /**
   * The Type of the response message.
   */
  public abstract responseType: Pick<typeof StaticMeshResponse, "fromData" | "opCode">;

  public get responseOpCode(): UInt32 {
    return this.responseType.opCode;
  }
}

/**
 * A message with Transaction Identifier.
 *
 * The Transaction Identifier will automatically be set and incremented
 * each time a message is sent. The counter is reused for all types that
 * extend this protocol.
 */
export abstract class TransactionMessage extends MeshMessage {
  /**
   * Transaction identifier. If not set, this field will automatically
   * be set when the message is being sent or received.
   */
  public abstract tid: UInt8;
  /**
   * Whether the message should start a new transaction.
   *
   * The messages within a transaction carry the cumulative values of
   * a field. In case one or more messages within a transaction are not
   * received by the Server (e.g., as a result of radio collisions),
   * the next received message will make up for the lost messages,
   * carrying cumulative values of the field.
   *
   * A new transaction is started when this field is set to `true`,
   * or when the last message of the transaction was sent 6 or
   * more seconds earlier.
   *
   * This defaults to `false`, which means that each new message will
   * receive a new transaction identifier (if not set explicitly).
   */
  public get continueTransaction(): boolean {
    return false;
  }
}

/**
 * A mesh message containing the operation status.
 */
export abstract class StatusMessage extends MeshMessage {
  /**
   * Returns whether the operation was successful or not.
   */
  public abstract get isSuccess(): boolean;
  /**
   * The status as String.
   */
  public abstract get message(): string;
}

/**
 * A base protocol for messages sent as responses to
 * ``TransitionMessage``s.
 */
export abstract class TransitionStatusMessage extends MeshMessage {
  /**
   * The Remaining Time field identifies the time that an element will
   * take to transition to the target state from the present state.
   */
  public abstract get remainingTime(): TransitionTime | undefined;
}

/**
 * A base protocol for a message that can initiate a non-immediate
 * state transition.
 */
export abstract class TransitionMessage extends MeshMessage {
  /**
   * The Transition Time field identifies the time that an Element will
   * take to transition to the target state from the present state.
   */
  public abstract get transitionTime(): TransitionTime | undefined;
  /**
   * execution delay in 5 millisecond steps.
   *
   * The purpose of this field is to synchronize transitions initiated
   * by sending the same message multiple times with a short delay.
   * For example, a Node would want to send a Generic On Off Set
   * Unacknowledged message to a Group Address. In order to increase
   * changes of successful delivery, such message can be repeated.
   * The first message could be sent with longer ``TransitionMessage/delay``
   * and each following with a shorter one, so when different Nodes
   * receive different messages, the action they take seems more
   * synchronized.
   *
   * This file has to be set together with ``TransitionMessage/transitionTime``.
   */
  public abstract get delay(): UInt8 | undefined;
}
