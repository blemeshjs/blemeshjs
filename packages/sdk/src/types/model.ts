import { Model } from "@blemeshjs/core";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export type ModelExtension<T> = ((
  model: Model,
  coreMeshNetworkManager: CoreMeshNetworkManager,
) => T) & {
  key: string;
};
