import {
  ConfigModelAppBind,
  ConfigModelAppStatus,
  ConfigModelAppUnbind,
  ConfigNodeReset,
  Model as $Model,
  ApplicationKey,
} from "@blemeshjs/core";
import { hasMixin } from "ts-mixer";
import { ModelExtension } from "../types";
import { NodeError } from "../types";
import { createProxy, keysOf } from "../types";
import { ConfigMessage, ConfigMessageStatus } from "@blemeshjs/utils";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export type Model = ReturnType<typeof InternalModel.toProxy>;

export class InternalModel {
  public static toProxy(model: $Model, coreMeshNetworkManager: CoreMeshNetworkManager) {
    return createProxy(
      model,
      new InternalModel(model, coreMeshNetworkManager),
      keysOf<$Model>()([]),
      keysOf<$Model>()([
        "companyIdentifier",
        "modelId",
        "applicationKeys",
        "name",
        "companyName",
        "isBluetoothSIGAssigned",
        "modelIdentifier",
        "isGenericOnOffServer",
        "boundApplicationKeys",
      ]),
    );
  }

  private constructor(
    private $model: $Model,
    private $coreMeshNetworkManger: CoreMeshNetworkManager,
  ) {}

  public bindApplicationKey = (applicationKey: ApplicationKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigModelAppBind.fromApplicationKey(applicationKey, this.$model);
      const node = this.$model.parentElement?.parentNode;
      if (message === undefined)
        return reject(new Error("Failed to create ConfigModelAppBind message"));
      if (!node) return reject(new Error("Model is not part of a Node"));
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManger
        .sendAcknowledgedConfigMessageToNode({ message, node })
        .catch((error: Error) => {
          console.error("Failed to send ConfigModelAppBind message", error);
          reject(error);
        });
    });
  };

  public unbindApplicationKey = (applicationKey: ApplicationKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigModelAppUnbind.fromApplicationKey(applicationKey, this.$model);
      const node = this.$model.parentElement?.parentNode;
      if (message === undefined)
        return reject(new Error("Failed to create ConfigModelAppBind message"));
      if (!node) return reject(new Error("Model is not part of a Node"));
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManger
        .sendAcknowledgedConfigMessageToNode({ message, node })
        .catch((error: Error) => {
          console.error("Failed to send ConfigModelAppBind message", error);
          reject(error);
        });
    });
  };

  private addMessageListeners = (resolve: () => void, reject: (error: Error) => void) => {
    const remove = this.$coreMeshNetworkManger.bindAllEvents({
      meshNetworkManagerDidReceiveMessage: (_manager, message, source, destination) => {
        // Has the Node been reset remotely.
        if (
          hasMixin(message, ConfigNodeReset) &&
          !source.equal(destination.address) // TODO: verify if this should even happen
        ) {
          reject(NodeError.NodeReset);
          remove();
          return;
        }

        // Is the message targeting the current Node?
        if (!this.$model.parentElement?.parentNode?.primaryUnicastAddress.equal(source)) {
          return;
        }

        // Handle the message based on its type.
        switch (true) {
          // Response to Config App Key Delete.
          case hasMixin(message, ConfigModelAppStatus):
            remove();
            if (message.isSuccess) {
              resolve();
            } else {
              reject(new Error(`${ConfigMessageStatus.toString(message.status)}`));
            }
            break;
        }
      },

      meshNetworkManagerFailedToSendMessage: (
        _manager,
        message,
        _localElement,
        _destination,
        error,
      ) => {
        // Ignore messages sent using model publication
        if (!hasMixin(message, ConfigMessage)) {
          return;
        }
        remove();
        reject(error);
      },
    });
  };

  use<T>(ext: ModelExtension<T>): T {
    const instance = ext(this.$model, this.$coreMeshNetworkManger);
    (this as unknown as Record<string, unknown>)[ext.key] = instance;
    return instance;
  }
}
