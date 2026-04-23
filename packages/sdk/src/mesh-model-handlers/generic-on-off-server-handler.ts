import { StoredWithSceneModelHandler, Model, MeshAddress } from "@mesh-link-js/core";
import {
  SceneNumber,
  MeshMessage,
  AcknowledgedMeshMessage,
  MeshResponse,
  UnacknowledgedMeshMessage,
  TransitionTime,
  UInt8,
  Data,
  Address,
} from "@mesh-link-js/utils";

export class GenericOnOffServerHandler extends StoredWithSceneModelHandler {
  store(_scene: SceneNumber): void {
    throw new Error("Method not implemented.");
  }
  recall(_scene: SceneNumber, _transitionTime?: TransitionTime, _delay?: UInt8): void {
    throw new Error("Method not implemented.");
  }
  protected $messageTypes: Map<number, { fromData: (_: Data) => MeshMessage | undefined }> =
    new Map();
  protected $isSubscriptionSupported: boolean = false;
  public publicationMessageComposer: (() => MeshMessage) | undefined = undefined;
  public modelDidReceiveAcknowledgedMessage(
    _model: Model,
    _request: AcknowledgedMeshMessage,
    _source: Address,
    _destination: MeshAddress,
  ): MeshResponse | Error {
    throw new Error("Method not implemented.");
  }
  public modelDidReceiveUnacknowledgedMessage(
    _model: Model,
    _message: UnacknowledgedMeshMessage,
    _source: Address,
    _destination: MeshAddress,
  ): void {
    throw new Error("Method not implemented.");
  }
  public modelDidReceiveResponse(
    _model: Model,
    _response: MeshResponse,
    _request: AcknowledgedMeshMessage,
    _source: Address,
  ): void {
    throw new Error("Method not implemented.");
  }
}
