import { MeshNetworkManager } from "@mesh-link-js/sdk";
import { WebCBCentralManager } from "./transport/index.js";
import { BrowserStorage } from "./storage.js";

export async function createBrowserMesh<T extends MeshNetworkManager>(
  meshNetworkManager: T,
): Promise<T> {
  meshNetworkManager.init(WebCBCentralManager.instance, new BrowserStorage());
  await meshNetworkManager.setup();
  return meshNetworkManager;
}

export * from "@mesh-link-js/sdk";
export * from "@mesh-link-js/crypto";
