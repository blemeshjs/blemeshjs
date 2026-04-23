import {
  Data,
  Address,
  MeshMessage,
  AcknowledgedMeshMessage,
  MeshResponse,
  UnacknowledgedMeshMessage,
} from "@mesh-link-js/utils";
import { Model } from "../../mesh-models/model.js";
import { MeshAddress, MeshNetwork } from "../../mesh-models/index.js";
import {
  ConfigAppKeyAdd,
  ConfigAppKeyDelete,
  ConfigAppKeyStatus,
  ConfigCompositionDataStatus,
  ConfigDefaultTtlStatus,
  ConfigModelAppBind,
  ConfigModelAppStatus,
  ConfigModelAppUnbind,
  ConfigNetKeyAdd,
  ConfigNetKeyDelete,
  ConfigNetKeyStatus,
  ConfigNodeResetStatus,
} from "../../mesh-messages/index.js";
import { hasMixin } from "ts-mixer";
import { ModelHandler } from "../../mesh-models/model-handler.js";

export class ConfigurationClientHandler extends ModelHandler {
  private meshNetwork: MeshNetwork;
  protected $messageTypes: Map<number, { fromData: (_: Data) => MeshMessage | undefined }>;
  protected $isSubscriptionSupported: boolean = false;
  public publicationMessageComposer: (() => MeshMessage) | undefined = undefined;

  constructor(meshNetwork: MeshNetwork) {
    super();
    this.meshNetwork = meshNetwork;
    this.$messageTypes = new Map(
      [
        ConfigNodeResetStatus,
        ConfigCompositionDataStatus,
        ConfigDefaultTtlStatus,
        ConfigAppKeyStatus,
        ConfigNetKeyStatus,
        ConfigModelAppStatus,
      ].map((message) => [message.opCode, message]),
    );
  }
  public modelDidReceiveAcknowledgedMessage(
    model: Model,
    request: AcknowledgedMeshMessage,
    _source: Address,
    _destination: MeshAddress,
  ): MeshResponse | Error {
    switch (request) {
      default:
        return new Error(`Message not supported: ${request}`);
    }
  }
  public modelDidReceiveUnacknowledgedMessage(
    model: Model,
    message: UnacknowledgedMeshMessage,
    _source: Address,
    _destination: MeshAddress,
  ): void {
    switch (message) {
      default:
        // Ignore.
        break;
    }
  }
  public modelDidReceiveResponse(
    model: Model,
    response: MeshResponse,
    request: AcknowledgedMeshMessage,
    source: Address,
  ): void {
    switch (true) {
      // Application Key Management
      case hasMixin(response, ConfigAppKeyStatus): {
        if (response.isSuccess) {
          const node = this.meshNetwork.nodeWithAddress(source);
          switch (true) {
            case hasMixin(request, ConfigAppKeyAdd):
              node?.addApplicationKeyWithIndex(response.applicationKeyIndex);
              break;
            case hasMixin(request, ConfigAppKeyDelete):
              node?.removeApplicationKeyWithIndex(response.applicationKeyIndex);
              break;
          }
        }
        break;
      }
      // Composition Data
      case hasMixin(response, ConfigCompositionDataStatus): {
        // Do not override your own elements.
        if (this.meshNetwork.localProvisioner?.primaryUnicastAddress?.equal(source)) {
          break;
        }
        const node = this.meshNetwork.nodeWithAddress(source);
        if (node) {
          node.applyCompositionData(response);
        }
        break;
      }

      // Network Keys Management
      case hasMixin(response, ConfigNetKeyStatus): {
        const node = this.meshNetwork.nodeWithAddress(source);
        if (response.isSuccess && node) {
          switch (true) {
            case hasMixin(request, ConfigNetKeyAdd):
              node.addNetworkKeyWithIndex(request.networkKeyIndex);
              break;
            case hasMixin(request, ConfigNetKeyDelete):
              node.removeNetworkKeyWithIndex(request.networkKeyIndex);
            default:
              break;
          }
        }
        break;
      }

      // Model Bindings
      case hasMixin(response, ConfigModelAppStatus): {
        if (response.isSuccess) {
          const node = this.meshNetwork.nodeWithAddress(source);
          const element = node?.elementWithAddress(response.elementAddress);
          const model = element?.modelWithModelId(response.modelId);
          switch (true) {
            case hasMixin(request, ConfigModelAppBind):
              model?.bindApplicationKeyWithIndex(response.applicationKeyIndex);
              break;
            case hasMixin(request, ConfigModelAppUnbind):
              model?.unbindApplicationKeyWithIndex(response.applicationKeyIndex);
              break;
            default:
              break;
          }
        }
        break;
      }

      // Default TTL
      case hasMixin(response, ConfigDefaultTtlStatus): {
        const node = this.meshNetwork.nodeWithAddress(source);
        if (node) {
          node.ttl = response.ttl;
        }
        break;
      }

      // Reset
      case hasMixin(response, ConfigNodeResetStatus): {
        const node = this.meshNetwork.nodeWithAddress(source);
        if (node) {
          this.meshNetwork.removeNode(node);
        }
        break;
      }
    }
  }
}
