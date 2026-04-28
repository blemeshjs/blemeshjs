import {
  MeshNetworkManager as $MeshNetworkManager,
  MeshData,
  MeshDataCtor,
  MeshNetwork,
  MeshNetworkCtor,
} from "@blemeshjs/core";
import { Storage } from "@blemeshjs/utils";
import { InternalNode } from "../mesh-models/node.js";
import { computed, makeObservable } from "mobx";
import { ClassInstance } from "../types/index.js";

export class CoreMeshNetworkManager extends $MeshNetworkManager {
  protected static $instance?: ClassInstance<typeof CoreMeshNetworkManager>;

  protected constructor(
    storage: Storage,
    MeshDataClass: MeshDataCtor<MeshData>,
    MeshNetworkClass: MeshNetworkCtor<MeshNetwork>,
  ) {
    super(storage, MeshDataClass, MeshNetworkClass);
    makeObservable(this, {
      nodes: computed,
    });
  }

  /**
   * Initializes the shared instance with the given storage.
   * Must be called once before accessing `instance`.
   */
  public static initialize(storage: Storage): typeof CoreMeshNetworkManager.instance {
    this.$instance = new this(storage, MeshData, MeshNetwork);
    return this.$instance;
  }

  public get nodes() {
    return this.meshNetwork?.nodes.map((node) => InternalNode.toProxy(node, this));
  }

  public get localProvisionerNode() {
    const provisionerNode = this.meshNetwork?.localProvisioner?.node;
    return provisionerNode ? InternalNode.toProxy(provisionerNode, this) : undefined;
  }

  public static get instance() {
    if (!this.$instance) {
      throw new Error(
        "CoreMeshNetworkManager has not been initialized. Call CoreMeshNetworkManager.initialize(storage) first.",
      );
    }
    return this.$instance;
  }
}
