import { Address, MeshMessage } from "@blemeshjs/utils";
import { MeshNetworkManager } from "./mesh-network-manager.js";
import { Element } from "./element.js";
import { MeshAddress } from "./mesh-address.js";

/**
 * The mesh network handler notifies about all received messages as well as
 * statuses of sent messages.
 *
 * The handler is a single object that receives all traffic information, including
 * messages with Op Codes not supported by any of the local Models Such messages
 * are delivered as `UnknownMessage`.
 *
 * Messages targeting the Models on a local Node are also delivered to a corresponding
 * `ModelHandler` if the Model has been bound to the Application Key used
 * to encrypt the message and subscribed to its destination address.
 *
 * Due to the fact, that the *Configuration Server* model and *Configuration
 * Client* model, as well as the *Scene Client* model are supported natively
 * by the library, this handler is the only place to receive messages
 * handled by those models.
 */
export abstract class MeshNetworkHandler {
  /**
   * A callback called whenever a Mesh Message has been received
   * from the mesh network.
   *
   * The `source` is given as an Address, instead of an Element, as
   * the message may be sent by an unknown Node, or a Node which
   * Elements are unknown.
   *
   * The `destination` address may be a Unicast Address of a local
   * Element, a Group or Virtual Address, but also any other address
   * if it was added to the Proxy Filter, e.g. a Unicast Address of
   * an Element on a remote Node.
   *
   * @param manager The manager which has received the message.
   * @param message The received message.
   * @param source The Unicast Address of the Element from which the message was sent.
   * @param destination The address to which the message was sent.
   */
  public abstract meshNetworkManagerDidReceiveMessage(
    manager: MeshNetworkManager,
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
  ): void;

  /**
   * A callback called when an unsegmented message was sent to the
   * `Transmitter`, or when all segments of a segmented message targeting
   * a Unicast Address were acknowledged by the target Node.
   *
   * @param manager The manager used to send the message.
   * @param message The message that has been sent.
   * @param localElement The local Element used as a source of this message.
   * @param destination The address to which the message was sent.
   */
  public abstract meshNetworkManagerDidSendMessage(
    manager: MeshNetworkManager,
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
  ): void;

  /**
   * A callback called when a message failed to be sent to the target
   * Node, or the response for an acknowledged message hasn't been received
   * before the time run out.
   *
   * For unsegmented unacknowledged messages this callback will be invoked when
   * the `MeshNetworkManager.transmitter` was set to `undefined`, or has returned an
   * error from `Transmitter.send()`.
   *
   * For segmented unacknowledged messages targeting a Unicast Address,
   * besides that, it may also be called when sending timed out before all of
   * the segments were acknowledged by the target Node, or when the target
   * Node is busy and not able to proceed the message at the moment.
   *
   * For acknowledged messages the callback will be called when the response
   * has not been received before the time set by `NetworkParameters.acknowledgmentMessageTimeout`
   * run out. The message might have been retransmitted multiple times
   * and might have been received by the target Node. For acknowledged messages
   * sent to a Group or Virtual Address this will be called when the response
   * has not been received from any Node.
   *
   * Possible errors are:
   * - Any error returned by the `Transmitter`.
   * - `BearerError.bearerClosed` - when the `MeshNetworkManager.transmitter` object was not set.
   * - `LowerTransportError.busy` - when the target Node is busy and can't accept the message.
   * - `LowerTransportError.timeout` - when the segmented message targeting a Unicast Address was not acknowledged before the `NetworkParameters.sarUnicastRetransmissionsCount` or `NetworkParameters.sarUnicastRetransmissionsWithoutProgressCount` was reached (for unacknowledged messages only).
   * - `AccessError.timeout` - when the response for an acknowledged message has not been received before the `NetworkParameters.acknowledgmentMessageTimeout` run out (for acknowledged messages only).
   *
   * @param manager The manager used to send the message.
   * @param message The message that has failed to be delivered.
   * @param localElement The local Element used as a source of this message.
   * @param destination The address to which the message was sent.
   * @param error The error that occurred.
   */
  public abstract meshNetworkManagerFailedToSendMessage(
    manager: MeshNetworkManager,
    message: MeshMessage,
    localElement: Element,
    destination: MeshAddress,
    error: Error,
  ): void;
}
