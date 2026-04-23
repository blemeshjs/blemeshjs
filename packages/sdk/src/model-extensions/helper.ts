import { ConfigNodeReset, GenericOnOffStatus, Model } from "@mesh-link-js/core";
import { hasMixin } from "ts-mixer";
import {
  AcknowledgedMeshMessage,
  UnacknowledgedMeshMessage,
  ConfigMessage,
} from "@mesh-link-js/utils";
import { MeshNetworkManager } from "../mesh-network";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export const addMessageListeners = <T = unknown>(
  model: Model,
  coreMeshNetworkManager: CoreMeshNetworkManager,
  resolve: (value: T) => void,
  reject: (error: Error) => void,
) => {
  const remove = coreMeshNetworkManager.bindAllEvents({
    meshNetworkManagerDidReceiveMessage: (_manager, message, source, destination) => {
      // Has the Node been reset remotely.
      if (hasMixin(message, ConfigNodeReset) && !source.equal(destination.address)) {
        MeshNetworkManager.instance.meshNetworkDidChange();
        reject(new Error("Node has been reset remotely"));
        remove();
        return;
      }

      // Is the message targeting the current Node or Model?
      if (
        !model.parentElement?.unicastAddress.equal(source) &&
        !model.parentElement?.unicastAddress.equal(destination.address) &&
        !(
          model.parentElement?.parentNode!.primaryUnicastAddress.equal(source) &&
          hasMixin(message, ConfigMessage)
        )
      ) {
        return;
      }

      // Handle the message based on its type.
      switch (true) {
        case hasMixin(message, GenericOnOffStatus):
          remove();
          resolve(message as T);
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

export const sendMessageToModel = <T = unknown>(
  model: Model,
  coreMeshNetworkManager: CoreMeshNetworkManager,
  message: AcknowledgedMeshMessage | UnacknowledgedMeshMessage,
) => {
  return new Promise<T>((resolve, reject) => {
    addMessageListeners<T>(model, coreMeshNetworkManager, resolve, reject);
    switch (true) {
      case hasMixin(message, AcknowledgedMeshMessage): {
        coreMeshNetworkManager.sendAcknowledgedMeshMessageToModel({ message, model }).catch(reject);
        break;
      }
      case hasMixin(message, UnacknowledgedMeshMessage): {
        coreMeshNetworkManager
          .sendUnacknowledgedMeshMessageToModel({ message, model })
          .catch(reject);
        break;
      }
    }
  });
};
