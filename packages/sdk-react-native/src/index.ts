import { MeshNetworkManager, SharedMeshNetworkManager } from "@mesh-link-js/sdk";
import { RNCBCentralManager } from "./transport/central-manager.js";
import { RNAsyncStorage } from "./storage.js";

export async function createRNMesh(): Promise<MeshNetworkManager> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-get-random-values");
  SharedMeshNetworkManager.initialize(new RNAsyncStorage());
  const meshNetworkManager = MeshNetworkManager.instance;
  await meshNetworkManager.initialize(RNCBCentralManager.instance);
  return meshNetworkManager;
}
