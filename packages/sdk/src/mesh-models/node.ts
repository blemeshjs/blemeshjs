import {
  ConfigAppKeyGet,
  NetworkKey,
  Node as $Node,
  ConfigNodeReset,
  ConfigAppKeyStatus,
  ConfigAppKeyList,
  ConfigAppKeyDelete,
  ConfigAppKeyAdd,
  ConfigNodeResetStatus,
  ApplicationKeys,
  ConfigDefaultTtlGet,
  ConfigCompositionDataGet,
  ConfigDefaultTtlStatus,
  ConfigCompositionDataStatus,
  ConfigNetKeyDelete,
  ConfigNetKeyStatus,
  NetworkKeys,
  ConfigNetKeyAdd,
  ApplicationKey,
} from "@mesh-link-js/core";
import { hasMixin } from "ts-mixer";
import { BindableTinyEmitter, ConfigMessageStatus, ConfigMessage } from "@mesh-link-js/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { MeshNetworkManager } from "../mesh-network";
import { InternalElement } from "./element.js";
import { NodeError } from "../types";
import { createProxy, keysOf } from "../types";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export type NodeEvents = {
  "node:reset": () => void;
};

export type Node = ReturnType<typeof InternalNode.toProxy>;

export class InternalNode extends BindableTinyEmitter<NodeEvents> {
  public get elements() {
    return this.$node.elements.map((element) =>
      InternalElement.toProxy(element, this.$coreMeshNetworkManager),
    );
  }

  public get availableApplicationKeys() {
    return ApplicationKeys.notKnownTo(
      this.$coreMeshNetworkManager.meshNetwork?.applicationKeys ?? [],
      this.$node,
    );
  }

  public get availableNetworkKeys() {
    return NetworkKeys.notKnownTo(
      this.$coreMeshNetworkManager.meshNetwork?.networkKeys ?? [],
      this.$node,
    );
  }

  /**
   * Keys that have Network Keys known to the Node.
   */
  public get applicationKeysWithKnownToNetworkKeys() {
    return this.availableApplicationKeys.filter((appKey) =>
      this.$node.knowsNetworkKey(appKey.boundNetworkKey),
    );
  }

  /**
   * Keys which bound Network Keys are not known to the Node.
   */
  public get applicationKeysWithUnknownNetworkKeys() {
    return this.availableApplicationKeys.filter(
      (appKey) => !this.$node.knowsNetworkKey(appKey.boundNetworkKey),
    );
  }

  public static toProxy(node: $Node, coreMeshNetworkManager: CoreMeshNetworkManager) {
    return createProxy(
      node,
      new InternalNode(node, coreMeshNetworkManager),
      keysOf<$Node>()([]),
      keysOf<$Node>()([
        "elementsCount",
        "companyIdentifier",
        "deviceKey",
        "isProvisioner",
        "isLocalProvisioner",
        "isConfigComplete",
        "uuid",
        "name",
        "applicationKeys",
        "defaultTtl",
        "isCompositionDataReceived",
        "networkKeys",
        "primaryUnicastAddress",
      ]),
    );
  }

  private constructor(
    private $node: $Node,
    private $coreMeshNetworkManager: CoreMeshNetworkManager,
  ) {
    super();

    makeObservable<InternalNode, "$node">(this, {
      $node: observable.ref,

      // computed
      elements: computed,
      applicationKeysWithKnownToNetworkKeys: computed,
      applicationKeysWithUnknownNetworkKeys: computed,
      availableApplicationKeys: computed,
      availableNetworkKeys: computed,

      // actions
      removeApplicationKey: action,
    });

    this.$coreMeshNetworkManager.on(
      "meshNetworkManagerDidReceiveMessage",
      (_manager, message, source, destination) => {
        // Has the Node been reset remotely.
        if (hasMixin(message, ConfigNodeReset) && !source.equal(destination.address)) {
          MeshNetworkManager.instance.meshNetworkDidChange();
          this.emit("node:reset");
          return;
        }
      },
    );
  }

  public readAppKeys = () => {
    return this.readApplicationKeysBoundToNetworkKey(this.$node.networkKeys[0]);
  };

  public readApplicationKeysBoundToNetworkKey = (networkKey: NetworkKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigAppKeyGet.fromNetworkKey(networkKey);
      this.addMessageListeners(resolve, reject);
      // TODO: handle can be used to cancel the message if needed, but for now we will just ignore it.
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public addApplicationKey = (applicationKey: ApplicationKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigAppKeyAdd.fromApplicationKey(applicationKey);
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public removeApplicationKey = (applicationKey: ApplicationKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigAppKeyDelete.fromApplicationKey(applicationKey);
      this.addMessageListeners(resolve, reject);
      // TODO: handle can be used to cancel the message if needed, but for now we will just ignore it.
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public addNetworkKey = (networkKey: NetworkKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigNetKeyAdd.fromNetworkKey(networkKey);
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public removeNetworkKey = (networkKey: NetworkKey) => {
    return new Promise<void>((resolve, reject) => {
      const message = ConfigNetKeyDelete.fromNetworkKey(networkKey);
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  /**
   * Makes sure the Composition Data Page 0 is obtained.
   *
   * This requires the Proxy Filter setup to be complete. If not ready, this method does nothing.
   */
  public discover = async (): Promise<void> => {
    // A message can only be sent if the GATT Proxy Node is ready.
    if (!this.$coreMeshNetworkManager.proxyFilter.proxy) {
      return;
    }
    if (!this.$node.isCompositionDataReceived) {
      // This will request Composition Data when the bearer is open.
      return this.getCompositionData();
    } else if (this.$node.defaultTtl === undefined) {
      return this.getTtl();
    }
  };

  public getCompositionData = () => {
    return new Promise<void>((resolve, reject) => {
      const message = new ConfigCompositionDataGet();
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public getTtl = () => {
    return new Promise<void>((resolve, reject) => {
      const message = new ConfigDefaultTtlGet();
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  public reset = async () => {
    return new Promise<void>((resolve, reject) => {
      const message = new ConfigNodeReset();
      this.addMessageListeners(resolve, reject);
      this.$coreMeshNetworkManager
        .sendAcknowledgedConfigMessageToNode({ message, node: this.$node })
        .catch((error: Error) => reject(error));
    });
  };

  private addMessageListeners = (resolve: () => void, reject: (error: Error) => void) => {
    const remove = this.$coreMeshNetworkManager.bindAllEvents({
      meshNetworkManagerDidReceiveMessage: (_manager, message, source, destination) => {
        // Has the Node been reset remotely.
        if (hasMixin(message, ConfigNodeReset) && !source.equal(destination.address)) {
          remove();
          reject(NodeError.NodeReset);
          return;
        }
        // Is the message targeting the current Node?
        if (!this.$node.primaryUnicastAddress.equal(source)) {
          return;
        }

        // Handle the message based on its type.
        switch (true) {
          case hasMixin(message, ConfigNetKeyStatus):
          case hasMixin(message, ConfigAppKeyStatus):
            remove();
            if (message.isSuccess) {
              resolve();
            } else {
              reject(new Error(`${ConfigMessageStatus.toString(message.status)}`));
            }
            break;

          // Response to Config App Key Get.
          case hasMixin(message, ConfigAppKeyList):
            if (message.isSuccess) {
              const index = this.$node.networkKeys.findIndex((key) =>
                key.index.equal(message.networkKeyIndex),
              );
              if (index !== -1 && index + 1 < this.$node.networkKeys.length) {
                const networkKey = this.$node.networkKeys[index + 1];
                this.readApplicationKeysBoundToNetworkKey(networkKey).catch((error: Error) =>
                  reject(error),
                );
              } else {
                remove();
                resolve();
              }
            } else {
              remove();
              reject(new Error(`${ConfigMessageStatus.toString(message.status)}`));
            }
            break;

          case hasMixin(message, ConfigCompositionDataStatus):
          case hasMixin(message, ConfigDefaultTtlStatus):
          case hasMixin(message, ConfigNodeResetStatus):
            remove();
            resolve();
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
}
