import {
  AcknowledgedMeshMessage,
  Address,
  ConfigMessageStatus,
  Data,
  MeshMessage,
  MeshResponse,
  UnacknowledgedMeshMessage,
} from "@blemeshjs/utils";
import { MeshAddress, MeshNetwork } from "../../mesh-models/index.js";
import { ConfigNetKeyDelete } from "../../mesh-messages/index.js";
import { Model } from "../../mesh-models/model.js";
import { ConfigNodeReset } from "../../mesh-messages/index.js";
import { hasMixin } from "ts-mixer";
import { ConfigNetKeyStatus } from "../../mesh-messages/index.js";
import { ConfigNodeResetStatus } from "../../mesh-messages/index.js";
import {
  ConfigAppKeyDelete,
  ConfigAppKeyStatus,
  ConfigCompositionDataGet,
  ConfigCompositionDataStatus,
  ConfigDefaultTtlGet,
  ConfigDefaultTtlStatus,
  ConfigModelAppBind,
  ConfigModelAppStatus,
  ConfigModelAppUnbind,
  ConfigNetKeyAdd,
  Page0,
} from "../../mesh-messages/index.js";
import { areUint8ArraysEqual } from "uint8array-extras";
import { ModelHandler } from "../../mesh-models/model-handler.js";

export class ConfigurationServerHandler extends ModelHandler {
  private meshNetwork!: MeshNetwork;
  protected $messageTypes: Map<number, { fromData: (_: Data) => MeshMessage | undefined }>;
  protected $isSubscriptionSupported: boolean = false;
  public publicationMessageComposer: (() => MeshMessage) | undefined = undefined;

  constructor(meshNetwork: MeshNetwork) {
    super();
    this.$messageTypes = new Map(
      [
        ConfigDefaultTtlGet,
        ConfigNetKeyAdd,
        ConfigAppKeyDelete,
        ConfigNetKeyDelete,
        ConfigNodeReset,
        ConfigModelAppBind,
        ConfigModelAppUnbind,
        ConfigCompositionDataGet,
      ].map((message) => [message.opCode, message]),
    );
    this.meshNetwork = meshNetwork;
  }

  public modelDidReceiveAcknowledgedMessage(
    model: Model,
    request: AcknowledgedMeshMessage,
    _source: Address,
    _destination: MeshAddress,
  ): MeshResponse | Error {
    const localNode = model.parentElement!.parentNode!;

    switch (true) {
      // Composition Data
      case hasMixin(request, ConfigCompositionDataGet):
        const compositionData = Page0.fromNode(localNode);
        return new ConfigCompositionDataStatus(compositionData);

      // Resetting Node
      case hasMixin(request, ConfigNodeReset):
        return new ConfigNodeResetStatus();

      // Default TTL
      case hasMixin(request, ConfigDefaultTtlGet):
        return new ConfigDefaultTtlStatus(localNode.defaultTtl ?? 5); // TODO: networkManager.defaultTtl

      // Network Keys Management
      case hasMixin(request, ConfigNetKeyAdd): {
        const keyIndex = request.networkKeyIndex;
        // Make sure the key with given index didn't exist or was identical to the
        // one in the request. Otherwise, return .keyIndexAlreadyStored.
        let networkKey = this.meshNetwork.networkKeys.find((key) => key.index.equal(keyIndex));
        if (!(networkKey === undefined || areUint8ArraysEqual(networkKey.key, request.key))) {
          return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.keyIndexAlreadyStored);
        }
        if (networkKey === undefined) {
          const keyOrErr = this.meshNetwork.addNetworkKeyWithName(
            request.key,
            `Network Key ${keyIndex.valueOf() + 1}`,
            keyIndex,
          );
          if (keyOrErr instanceof Error) {
            return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.unspecifiedError);
          }
          networkKey = keyOrErr;
          // Add the Network Key index to the local Node.
          localNode.addNetworkKeyWithIndex(keyIndex);
          return ConfigNetKeyStatus.fromNetworkKey(networkKey);
        }
        return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.unspecifiedError);
      }

      case hasMixin(request, ConfigNetKeyDelete): {
        const keyIndex = request.networkKeyIndex;
        // When an element receives a Config NetKey Delete message that identifies a
        // Network Key that is not in the Network Key List, it responds with Success,
        // because the result of deleting the key that does not exist in the Network Key
        // List will be the same as if the key was deleted from the List.
        if (!this.meshNetwork.networkKeys.find((key) => key.index.equal(keyIndex))) {
          return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.success);
        }
        // It is not possible to remove the last key.
        if (this.meshNetwork.networkKeys.length <= 1) {
          return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.cannotRemove);
        }
        // Force delete the key from the global configuration.
        this.meshNetwork.removeNetworkKeyWithKeyIndex(keyIndex, true);
        // Remove the key also from the local Node. This will also remove all
        // Application Keys bound to it.
        localNode.removeNetworkKeyWithIndex(keyIndex);
        return ConfigNetKeyStatus.responseTo(request, ConfigMessageStatus.success);
      }

      case hasMixin(request, ConfigAppKeyDelete): {
        // If the Network Key does not exist, return .invalidNetKeyIndex.
        const networkKey = this.meshNetwork.networkKeys.find((key) =>
          key.index.equal(request.networkKeyIndex),
        );
        if (!networkKey) {
          return ConfigAppKeyStatus.responseTo(request, ConfigMessageStatus.invalidNetKeyIndex);
        }
        const keyIndex = request.applicationKeyIndex;
        // When an element receives a Config AppKey Delete message that identifies
        // an Application Key that is not in the Application Key List, it responds
        // with Success, because the result of deleting the key that does not exist
        // in the Application Key List will be the same as if the key was deleted
        // from the AppKey List.
        const applicationKey = this.meshNetwork.applicationKeys.find((key) =>
          key.index.equal(keyIndex),
        );
        if (!applicationKey) {
          return ConfigAppKeyStatus.responseTo(request, ConfigMessageStatus.success);
        }
        // Check if the binding is correct. Otherwise, returner .invalidBinding.
        if (!applicationKey.isBoundToNetworkKey(networkKey)) {
          return ConfigAppKeyStatus.responseTo(request, ConfigMessageStatus.invalidBinding);
        }
        // Force delete the key from the global configuration.
        this.meshNetwork.removeApplicationKeyWithKeyIndex(keyIndex, true);
        // Remove the key also from the local Node. This will also remove all
        // Application Keys bound to it.
        localNode.removeApplicationKeyWithIndex(keyIndex);
        return ConfigAppKeyStatus.responseTo(request, ConfigMessageStatus.success);
      }

      // Model Bindings
      case hasMixin(request, ConfigModelAppBind): {
        const element = localNode.elementWithAddress(request.elementAddress);
        if (!element) {
          return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.invalidAddress);
        }
        const model = element.modelWithModelId(request.modelId);
        if (!model) {
          return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.invalidModel);
        }
        if (
          !this.meshNetwork.applicationKeys.find((key) =>
            key.index.equal(request.applicationKeyIndex),
          )
        ) {
          return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.invalidAppKeyIndex);
        }
        model.bindApplicationKeyWithIndex(request.applicationKeyIndex);
        return ConfigModelAppStatus.confirm(request);
      }
      case hasMixin(request, ConfigModelAppUnbind): {
        const element = localNode.elementWithAddress(request.elementAddress);
        if (!element) {
          return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.invalidAddress);
        }
        const model = element.modelWithModelId(request.modelId);
        if (!model) {
          return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.invalidModel);
        }
        model.unbindApplicationKeyWithIndex(request.applicationKeyIndex);
        return ConfigModelAppStatus.confirm(request);
      }

      default:
        return new Error(`Message not handled: ${request}`);
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
        console.error(`Message not supported: ${message}`);
    }
  }

  public modelDidReceiveResponse(
    model: Model,
    response: MeshResponse,
    _request: AcknowledgedMeshMessage,
    _source: Address,
  ): void {
    switch (response) {
      default:
        console.error(`Message not supported: ${response}`);
    }
  }
}
