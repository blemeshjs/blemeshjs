import { GenericOnOffStatus, MeshAddress, Model, ModelHandler } from "@mesh-link-js/core";
import {
  MeshResponse,
  Data,
  UnacknowledgedMeshMessage,
  Address,
  MeshMessage,
  AcknowledgedMeshMessage,
} from "@mesh-link-js/utils";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export class GenericOnOffClientHandler extends ModelHandler {
  protected $messageTypes: Map<number, { fromData: (_: Data) => MeshMessage | undefined }>;
  protected $isSubscriptionSupported: boolean = true;
  public get publicationMessageComposer(): (() => MeshMessage) | undefined {
    return;
  }
  private readonly $state = false;
  /**
   * The current state of the Generic On Off Client model.
   */
  public get state(): boolean {
    return this.$state;
  }

  private set state(value: boolean) {
    // @ts-expect-error setting in setter
    this.$state = value;
    this.publishUsing(this.$coreMeshNetworkManager).catch(console.error);
  }

  constructor(private $coreMeshNetworkManager: CoreMeshNetworkManager) {
    super();
    this.$messageTypes = new Map([GenericOnOffStatus].map((message) => [message.opCode, message]));
  }
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
