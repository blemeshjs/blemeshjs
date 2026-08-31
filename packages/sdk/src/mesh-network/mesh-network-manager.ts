import {
  AddressRange,
  MeshNetwork,
  NetworkParameters,
  Provisioner,
  SceneRange,
  Element as $Element,
  Model as $Model,
} from "@blemeshjs/core";
import { NetworkConnection } from "./network-connection.js";
import Long from "long";
import {
  Address,
  ClosedRange,
  KeyIndex,
  LogCategory,
  LogLevel,
  MeshNetworkError,
  Location,
  SigModelId,
  Key,
  Data,
  CBCentralManager,
  SceneNumber,
  Storage,
} from "@blemeshjs/utils";
import { ProvisioningManager } from "./provision.js";
import { ClassInstance, logger } from "../types";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager.js";
import { computed, makeObservable } from "mobx";
import { Crypto } from "@blemeshjs/crypto";
import { InternalModel } from "../mesh-models";
import { GenericOnOffClientHandler } from "../mesh-model-handlers/generic-on-off-client-handler.js";
import { GenericOnOffServerHandler } from "../mesh-model-handlers/generic-on-off-server-handler.js";
import { NewKey } from "../types";
import { Element, InternalElement } from "../mesh-models";

export class MeshNetworkManager {
  protected $connection!: NetworkConnection;
  protected $centralManager!: CBCentralManager;
  protected $coreMeshNetworkManager!: CoreMeshNetworkManager;
  protected static $instance: unknown;
  public provision: ProvisioningManager;

  static getInstance<T extends typeof MeshNetworkManager>(this: T): ClassInstance<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    if (!(this as any).$instance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (this as any).$instance = new this();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return (this as any).$instance;
  }

  public static get instance(): MeshNetworkManager {
    return this.getInstance();
  }

  public get meshNetwork() {
    return this.$coreMeshNetworkManager.meshNetwork;
  }

  public get applicationKeys() {
    return this.$coreMeshNetworkManager.meshNetwork?.applicationKeys ?? [];
  }

  public get connection() {
    return this.$connection;
  }

  public get isNetworkCreated() {
    return this.$coreMeshNetworkManager.isNetworkCreated;
  }

  public get logger() {
    return logger;
  }

  public get networkKeys() {
    return this.$coreMeshNetworkManager.meshNetwork?.networkKeys ?? [];
  }

  public get allNodes() {
    return this.$coreMeshNetworkManager.nodes ?? [];
  }

  public get groups() {
    return this.$coreMeshNetworkManager.meshNetwork?.groups ?? [];
  }

  public get notConfiguredNodes() {
    return this.$coreMeshNetworkManager.nodes?.filter(
      (node) => !node.isConfigComplete && !node.isProvisioner,
    );
  }

  public get configuredNodes() {
    return this.$coreMeshNetworkManager.nodes?.filter(
      (node) => node.isConfigComplete && !node.isProvisioner,
    );
  }

  public get provisionersNodes() {
    return this.$coreMeshNetworkManager.nodes?.filter(
      (node) => node.isProvisioner && !node.isLocalProvisioner,
    );
  }

  public get provisioners() {
    return this.$coreMeshNetworkManager.meshNetwork?.provisioners;
  }

  public get provisionerNode() {
    return this.$coreMeshNetworkManager.localProvisionerNode;
  }

  public get networkKeyExists(): boolean {
    const network = this.$coreMeshNetworkManager.meshNetwork!;
    return network.networkKeys.length !== 0;
  }

  public get nextAvailableNetworkKeyIndex() {
    return this.meshNetwork?.nextAvailableNetworkKeyIndex ?? new KeyIndex(0xfff);
  }

  public get nextAvailableGroupAddress() {
    return this.meshNetwork?.localProvisioner
      ? this.meshNetwork?.nextAvailableGroupAddress(this.meshNetwork.localProvisioner)
      : undefined;
  }

  public get nextAvailableApplicationKeyIndex() {
    return this.meshNetwork?.nextAvailableApplicationKeyIndex ?? new KeyIndex(0xfff);
  }

  public init(centralManager: CBCentralManager, storage: Storage) {
    this.$centralManager = centralManager;
    CoreMeshNetworkManager.initialize(storage);
    this.$coreMeshNetworkManager = CoreMeshNetworkManager.instance;
  }

  public setup = async () => {
    this.provision.centralManager = this.$centralManager;

    // Create the main MeshNetworkManager instance and customize
    // configuration values.

    this.$coreMeshNetworkManager.networkParameters = NetworkParameters.basic((parameters) => {
      parameters.setDefaultTtl(5);
      // Configure SAR Receiver properties
      parameters.discardIncompleteSegmentedMessages(10.0);
      parameters.transmitSegmentAcknowledgmentMessage(0.06, 2.5);
      parameters.retransmitSegmentAcknowledgmentMessages(1, 3);
      // Configure SAR Transmitter properties
      parameters.transmitSegments(0.06);
      parameters.retransmitUnacknowledgedSegmentsToUnicastAddress(2, 2, 0.2, 2.5);
      parameters.retransmitAllSegmentsToGroupAddress(Long.fromNumber(3), 0.25);

      // Note: The values below are different from the default ones.

      // Configure message configuration
      parameters.retransmitAcknowledgedMessage(4.2);
      // As the interval has been increased, the timeout can be adjusted.
      // The acknowledged message will be repeated after 4.2 seconds,
      // 12.6 seconds (4.2 + 4.2 * 2), and 29.4 seconds (4.2 + 4.2 * 2 + 4.2 * 4).
      // Then, leave 10 seconds for until the incomplete message times out.
      parameters.discardAcknowledgedMessages(40.0);
    });
    this.$coreMeshNetworkManager.logger = logger;

    await this.$coreMeshNetworkManager
      .load()
      .catch((error: Error) =>
        this.logger?.log(error.message, LogCategory.network, LogLevel.application),
      );
    this.meshNetworkDidChange();
  };

  protected constructor() {
    this.provision = new ProvisioningManager();
    makeObservable<MeshNetworkManager>(this, {
      // computed
      connection: computed,
      isNetworkCreated: computed,
      allNodes: computed,
      groups: computed,
      networkKeyExists: computed,
      networkKeys: computed,
      applicationKeys: computed,
      nextAvailableNetworkKeyIndex: computed,
      nextAvailableGroupAddress: computed,
    });
  }

  public getNode = (uuid: string) => {
    return this.$coreMeshNetworkManager.nodes?.find((node) => node.uuid.uuidString === uuid);
  };

  public getElement = (nodeUuid: string, elementIndex: number): Element | undefined => {
    const element = this.$coreMeshNetworkManager.meshNetwork?.nodes
      .find((node) => node.uuid.uuidString === nodeUuid)
      ?.elements.find((el) => el.index === elementIndex);
    return element ? InternalElement.toProxy(element, this.$coreMeshNetworkManager) : undefined;
  };

  public updateMeshNetwork = ({ meshName }: { meshName?: string }) => {
    if (this.meshNetwork) {
      this.meshNetwork.meshName = meshName ?? this.meshNetwork.meshName;
    }
    return this.$coreMeshNetworkManager.save();
  };

  public getModel = (nodeUuid: string, elementIndex: number, modelId: number) => {
    const model = this.$coreMeshNetworkManager.meshNetwork?.nodes
      .find((node) => node.uuid.uuidString === nodeUuid)
      ?.elements.find((el) => el.index === elementIndex)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      ?.models.find((model) => model.modelId === modelId);
    return model ? InternalModel.toProxy(model, this.$coreMeshNetworkManager) : undefined;
  };

  /**
   * Sets up the local Elements and reinitializes the `NetworkConnection`
   * so that it starts scanning for devices advertising the new Network ID.
   */
  public meshNetworkDidChange = () => {
    this.$connection?.close().catch((error: Error) =>
      this.logger?.log(error.message, LogCategory.network, LogLevel.application),
    );

    const meshNetwork = this.$coreMeshNetworkManager.meshNetwork!;

    // Set up local Elements on the phone.
    const element0 = new $Element("Primary Element", Location.first, [
      // 4 generic models defined by Bluetooth SIG:
      $Model.fromSigModelIdAndHandler(
        SigModelId.genericOnOffServerModelId,
        new GenericOnOffServerHandler(),
      ),
      $Model.fromSigModelIdAndHandler(
        SigModelId.genericOnOffClientModelId,
        new GenericOnOffClientHandler(this.$coreMeshNetworkManager),
      ),
    ]);
    this.$coreMeshNetworkManager.localElements = [element0];

    this.$connection = NetworkConnection.to(
      meshNetwork,
      this.$centralManager,
      this.$coreMeshNetworkManager,
    );
    this.$connection.on("bearerDidDeliverData", this.$coreMeshNetworkManager.bearerDidDeliverData);
    this.$connection.logger = logger;
    this.$coreMeshNetworkManager.transmitter = this.$connection;
    this.$connection.open().catch((error: Error) =>
      this.logger?.log(error.message, LogCategory.network, LogLevel.application),
    );
  };

  public createNewMeshNetwork = async (): Promise<MeshNetwork> => {
    const provisioner = Provisioner.fromNameWithRanges(
      "BLEMeshJS",
      [new AddressRange(new ClosedRange(new Address(0x0001), new Address(0x199a)))],
      [new AddressRange(new ClosedRange(new Address(0xc000), new Address(0xcc9a)))],
      [new SceneRange(new ClosedRange(new SceneNumber(0x0001), new SceneNumber(0x3333)))],
    );
    const network = this.$coreMeshNetworkManager.createNewMeshNetworkWithNameAndProvisioner(
      "BLEMeshJS Network",
      provisioner,
    );

    if (network instanceof MeshNetworkError) throw network;

    await this.$coreMeshNetworkManager.save();

    this.meshNetworkDidChange();
    return network;
  };

  public addApplicationKeys = async (numberOfKeys: number) => {
    for (let i = 0; i < numberOfKeys; i++) {
      const key = Crypto.generateRandom(128);
      const err = this.$coreMeshNetworkManager.meshNetwork?.addApplicationKeyWithProperties(
        key,
        `App Key ${i + 1}`,
      );
      if (err instanceof MeshNetworkError) {
        await this.$coreMeshNetworkManager.save();
        throw err;
      }
    }
    await this.$coreMeshNetworkManager.save();
  };

  public addApplicationKey = async (key: NewKey) => {
    const err = this.$coreMeshNetworkManager.meshNetwork?.addApplicationKeyWithProperties(
      key.key,
      key.name,
      key.index,
    );
    if (err instanceof MeshNetworkError) throw err;
    await this.$coreMeshNetworkManager.save();
  };

  public removeApplicationKey = async (key: Key) => {
    const err = this.$coreMeshNetworkManager.meshNetwork?.removeApplicationKeyWithKeyIndex(
      key.index,
    );
    if (err instanceof MeshNetworkError) throw err;
    await this.$coreMeshNetworkManager.save();
  };

  public addNetworkKey = async (key: NewKey) => {
    const err = this.$coreMeshNetworkManager.meshNetwork?.addNetworkKeyWithName(
      key.key,
      key.name,
      key.index,
    );
    if (err instanceof MeshNetworkError) throw err;
    await this.$coreMeshNetworkManager.save();
  };

  public removeNetworkKey = async (key: Key) => {
    const err = this.$coreMeshNetworkManager.meshNetwork?.removeNetworkKeyWithKeyIndex(key.index);
    if (err instanceof MeshNetworkError) throw err;
    await this.$coreMeshNetworkManager.save();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getGroup = (_groupAddress: string): any => {
    throw new Error("Groups are only supported in the pro version of the sdk");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addGroup = (_args: any): Promise<void> => {
    return Promise.reject(new Error("Groups are only supported in the pro version of the sdk"));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeGroup = (_group: any): Promise<void> => {
    return Promise.reject(new Error("Groups are only supported in the pro version of the sdk"));
  };

  public reset = async (): Promise<void> => {
    await this.$coreMeshNetworkManager.clear();
  };

  public export = (): Promise<Data> => {
    return this.$coreMeshNetworkManager.export();
  };
}
