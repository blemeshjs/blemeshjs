import { MeshNetworkManager } from "@blemeshjs/sdk";
import { WebCBCentralManager } from "./transport/index.js";
import { BrowserStorage } from "./storage.js";

export async function createMesh<T extends MeshNetworkManager = MeshNetworkManager>({
  meshNetworkManager = MeshNetworkManager.instance as T,
}: {
  meshNetworkManager?: T;
} = {}): Promise<T> {
  meshNetworkManager.init(WebCBCentralManager.instance, new BrowserStorage());
  await meshNetworkManager.setup();
  return meshNetworkManager;
}

export * from "@blemeshjs/sdk";
export * from "@blemeshjs/crypto";
