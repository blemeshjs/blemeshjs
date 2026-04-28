import {
  AcknowledgedMeshMessage,
  Address,
  Data,
  MeshMessage,
  MeshResponse,
  SceneNumber,
  TransitionTime,
  UInt32,
  UInt8,
  UnacknowledgedMeshMessage,
} from "@blemeshjs/utils";
import { Model } from "./model.js";
import { AccessPdu } from "../layers/access-layer/access-pdu.js";
import { hasMixin } from "ts-mixer";
import { MeshNetworkManager } from "./mesh-network-manager.js";
import { MeshAddress } from "./mesh-address.js";
import { MessageHandle } from "./message-handle.js";

type MessageComposer = () => MeshMessage;

/**
 * Model handler defines the functionality of a `Model` on the
 * Local Node.
 *
 * Model Delegates are assigned to the Models during setting up
 * the `MeshNetworkManager.localElements`.
 *
 * The Model Delegate must declare a map of mesh message type
 * supported by this Model. Whenever a mesh message matching any
 * of the declared Op Codes is received, and the Model instance is bound
 * to the Application Key used to encrypt the message, one of the message
 * handlers will be called:
 * * `ModelDelegate.modelDidReceiveUnacknowledgedMessage()`
 * * `ModelDelegate.modelDidReceiveAcknowledgedMessage()`
 * * `ModelDelegate.modelDidReceiveResponse()`
 *
 * The Model Delegate also specifies should the Model support subscription
 * and defines publication composer for automatic publications.
 */
export abstract class ModelHandler {
  /**
   * A map of mesh message types that the associated Model may receive
   * and handle. It should not contain types of messages that this
   * Model only sends. Items of this map are used to instantiate a
   * message when an Access PDU with given opcode is received.
   *
   * The key in the map should be the opcode and the value
   * the message type supported by the handler.
   */
  protected abstract $messageTypes: Map<UInt32, { fromData: (_: Data) => MeshMessage | undefined }>;
  public get messageTypes(): Map<UInt32, { fromData: (_: Data) => MeshMessage | undefined }> {
    return this.$messageTypes;
  }

  /**
   * A flag whether this Model supports subscription mechanism.
   * When set to `false`, the library will return error
   * `ConfigMessageStatus.notASubscribeModel` whenever subscription
   * change was initiated.
   */
  protected abstract $isSubscriptionSupported: boolean;
  public get isSubscriptionSupported(): boolean {
    return this.$isSubscriptionSupported;
  }

  /**
   * The message composer that will be used to create a Mesh Message.
   *
   * The composer will be used whenever model is about to publish its
   * state using the publishing information specified in the Model.
   *
   * When set to `undefined`, the library will return error
   * `ConfigMessageStatus.invalidPublishParameters` for each Config
   * Model Publication Set and Config Model Publication Virtual Address Set.
   */
  public abstract get publicationMessageComposer(): MessageComposer | undefined;

  /**
   * This method should handle the received Acknowledged Message.
   *
   * @param model The Model associated with this Model Delegate.
   * @param request The Acknowledged Message received.
   * @param source  The source Unicast Address.
   * @param destination The destination address of the request.
   * @returns The response message to be sent to the sender or The method should returns a `ModelError` if the receive message is invalid and no response should be replied.
   */
  public abstract modelDidReceiveAcknowledgedMessage(
    model: Model,
    request: AcknowledgedMeshMessage,
    source: Address,
    destination: MeshAddress,
  ): MeshResponse | Error;

  /**
   * This method should handle the received Unacknowledged Message.
   *
   * @param model The Model associated with this Model Delegate.
   * @param message The Unacknowledged Message received.
   * @param source The source Unicast Address.
   * @param destination The destination address of the request.
   */
  public abstract modelDidReceiveUnacknowledgedMessage(
    model: Model,
    message: UnacknowledgedMeshMessage,
    source: Address,
    destination: MeshAddress,
  ): void;

  /**
   * This method should handle the received response to the
   * previously sent request.
   *
   * @param model The Model associated with this Model Delegate.
   * @param response The response received.
   * @param request The Acknowledged Message sent.
   * @param source The Unicast Address of the Element that sent the
   *             response.
   */
  public abstract modelDidReceiveResponse(
    model: Model,
    response: MeshResponse,
    request: AcknowledgedMeshMessage,
    source: Address,
  ): void;

  /**
   * This method tries to decode the Access PDU into a Message.
   *
   * The Model Handler must support the opcode and specify to
   * which type should the message be decoded.
   *
   * @param accessPdu The Access PDU received.
   * @returns The decoded message, or `undefined`, if the message is not supported or invalid.
   */
  decode(accessPdu: AccessPdu): MeshMessage | undefined {
    const type = this.messageTypes.get(accessPdu.opCode);
    if (typeof type !== "undefined") {
      return type.fromData(accessPdu.parameters);
    }
    return undefined;
  }

  /**
   * This method handles the decoded message and passes it to
   * the proper handle method, depending on its type or whether
   * it is a response to a previously sent request.
   *
   * @param model The local Model that received the message.
   * @param message The decoded message.
   * @param source The Unicast Address of the Element that the message originates from.
   * @param destination The destination address of the request.
   * @param request The request message sent previously that this message replies to, or `undefined`, if this is not a response.
   * @returns The response message, if the received message is an Acknowledged Mesh Message that needs to be replied.
   */
  public modelDidReceiveMessage(
    model: Model,
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
    request?: AcknowledgedMeshMessage,
  ): MeshResponse | undefined {
    if (typeof request !== "undefined") {
      if (hasMixin(message, MeshResponse)) {
        this.modelDidReceiveResponse(model, message, request, source);
        return undefined;
      }
      // NOTE: fatalError, so shouldn't happen
      throw new Error(`${message} is not MeshResponse`);
    }
    if (hasMixin(message, AcknowledgedMeshMessage)) {
      const errOrResp = this.modelDidReceiveAcknowledgedMessage(
        model,
        message,
        source,
        destination,
      );
      if (errOrResp instanceof Error) return undefined;
      return errOrResp;
    }
    if (hasMixin(message, UnacknowledgedMeshMessage)) {
      this.modelDidReceiveUnacknowledgedMessage(model, message, source, destination);
      return undefined;
    }
    // NOTE: fatalError, so shouldn't happen
    throw new Error(`${message} is neither Acknowledged nor Unacknowledged`);
  }
  /**
   * Publishes a single message created by Model's message composer using
   * the Publish information set in the underlying Model.
   *
   * @param manager The manager to be used for publishing.
   * @returns The Message Handler that can be used to cancel sending.
   */
  public publishUsing(manager: MeshNetworkManager): Promise<MessageHandle | undefined> {
    if (!this.publicationMessageComposer) {
      return Promise.resolve(undefined);
    }
    return this.publish(this.publicationMessageComposer(), manager);
  }
  /**
   * Publishes a single message given as a parameter using the
   * Publish information set in the underlying Model.
   *
   * @param message The message to be published.
   * @param manager The manager to be used for publishing.
   * @returns The Message Handler that can be used to cancel sending.
   */
  public publish(
    message: MeshMessage,
    manager: MeshNetworkManager,
  ): Promise<MessageHandle | undefined> {
    const model = manager.localElements
      .flatMap((element) => element.models)
      .find((model) => model.handler === this);
    if (model) return manager.publish(message, model);
    return Promise.resolve(undefined);
  }
}

/**
 * The Model Handler which should be used for Models that allow storing
 * the state with a Scene.
 *
 * In addition to handling messages, the Model Handler should also
 * store and recall the current state whenever
 * ``StoredWithSceneModelHandler.store()``
 * and ``StoredWithSceneModelHandler.recall()``
 * calls are received.
 *
 * Whenever the state changes due to any other reason than receiving
 * a Scene Recall message, the handler should call
 * ``StoredWithSceneModelHandler.networkDidExitStoredWithSceneState()``
 * to clear the Current State in the Scene Server model.
 */
export abstract class StoredWithSceneModelHandler extends ModelHandler {
  /**
   * This method should store the current States of the Model and
   * associate them with the given Scene number.
   *
   * @param scene The Scene number.
   */
  abstract store(scene: SceneNumber): void;

  /**
   * This method should recall the States of the Model associated with
   * the given Scene number.
   *
   * @param scene The Scene number.
   * @param transitionTime The Transition Time field identifies the time
   *                     that an element will take to transition to the
   *                     target state from the present state.
   * @param delay Message execution delay in 5 millisecond steps.
   */
  abstract recall(scene: SceneNumber, transitionTime?: TransitionTime, delay?: UInt8): void;
}
