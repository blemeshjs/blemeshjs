import { MeshNetworkManager } from "@blemeshjs/sdk";
import { RNCBCentralManager } from "./transport/central-manager.js";
import { RNAsyncStorage } from "./storage.js";

export async function createRNMesh<T extends MeshNetworkManager = MeshNetworkManager>({
  meshNetworkManager = MeshNetworkManager.instance as T,
}: {
  meshNetworkManager?: T;
} = {}): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-get-random-values");
  meshNetworkManager.init(RNCBCentralManager.instance, new RNAsyncStorage());
  await meshNetworkManager.setup();
  return meshNetworkManager;
}

export * from "@blemeshjs/sdk";
